import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardKpi } from '../../core/models/models';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  kpi: DashboardKpi = {
    totalRfq: 0, totalPo: 0, totalGr: 0,
    totalInvoice: 0, pendingPayments: 0, agingAmount: 0, currency: 'INR'
  };

  loading = true;
  currentDate = new Date();

  kpiCards = [
    { label: 'Total RFQs',         key: 'totalRfq',        icon: 'request_quote',  color: '#3949ab', route: '/rfq' },
    { label: 'Purchase Orders',    key: 'totalPo',         icon: 'shopping_cart',  color: '#1b5e20', route: '/purchase-order' },
    { label: 'Goods Receipts',     key: 'totalGr',         icon: 'local_shipping', color: '#bf360c', route: '/goods-receipt' },
    { label: 'Invoices',           key: 'totalInvoice',    icon: 'receipt_long',   color: '#4a148c', route: '/invoice' },
    { label: 'Pending Payments',   key: 'pendingPayments', icon: 'payments',       color: '#e65100', route: '/payments' },
    { label: 'Aging Amount',       key: 'agingAmount',     icon: 'schedule',       color: '#880e4f', route: '/payments' },
  ];

  // Bar Chart
  barChartData: ChartData<'bar'> = {
    labels: ['RFQ', 'PO', 'GR', 'Invoice'],
    datasets: [{
      label: 'Documents',
      data: [0, 0, 0, 0],
      backgroundColor: ['#3949ab', '#1b5e20', '#bf360c', '#4a148c'],
      borderRadius: 6
    }]
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  // Doughnut Chart
  doughnutData: ChartData<'doughnut'> = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#2e7d32', '#F9A825', '#c62828'], borderWidth: 0 }]
  };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '70%'
  };

  recentActivity = [
    { type: 'PO', doc: 'Loading...', date: '', status: 'pending', icon: 'shopping_cart' }
  ];

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    const vid = this.auth.getVendorId();
    const rawVid = vid.replace(/^0+/, '') || vid;
    
    forkJoin({
      rfqs:     this.api.getRfqs(vid).pipe(catchError(() => of([]))),
      pos:      this.api.getPurchaseOrders(vid).pipe(catchError(() => of([]))),
      grs:      this.api.getGoodsReceipts(vid).pipe(catchError(() => of([]))),
      invoices: this.api.getInvoices(vid).pipe(catchError(() => of([]))),
      payments: this.api.getPaymentAging(vid).pipe(catchError(() => of([]))),
    }).subscribe(({ rfqs, pos, grs, invoices, payments }) => {
      // Client-side filtering: Backend has empty VendorId for GR/PO/INV, so we allow empty values
      const fRfqs = rfqs.filter(r => (r.VendorId || '').replace(/^0+/, '') === rawVid);
      const fPos = pos.filter(p => !p.VendorId || (p.VendorId || '').replace(/^0+/, '') === rawVid || p.VendorId === '');
      const fGrs = grs.filter(g => !g.VendorId || (g.VendorId || '').replace(/^0+/, '') === rawVid || g.VendorId === '');
      const fInvoices = invoices.filter(i => !i.VendorId || (i.VendorId || '').replace(/^0+/, '') === rawVid || i.VendorId === '');
      const fPayments = payments.filter(p => (p.VendorId || '').replace(/^0+/, '') === rawVid);

      this.kpi.totalRfq = fRfqs.length;
      this.kpi.totalPo = fPos.length;
      this.kpi.totalGr = fGrs.length;
      // Fallback to payments if MM invoices are not available
      this.kpi.totalInvoice = fInvoices.length > 0 ? fInvoices.length : fPayments.length;

      const pending = fPayments.filter((p: any) => p.Status !== 'Paid');
      this.kpi.pendingPayments = pending.length;
      this.kpi.agingAmount = fPayments.reduce((sum: number, p: any) => sum + (+p.Amount || 0), 0);

      // Update charts
      this.barChartData = {
        ...this.barChartData,
        datasets: [{ ...this.barChartData.datasets[0], data: [fRfqs.length, fPos.length, fGrs.length, this.kpi.totalInvoice] }]
      };

      const paid = fPayments.filter((p: any) => (p.Status||'').toLowerCase() === 'paid').length;
      const overdue = fPayments.filter((p: any) => +p.AgingDays > 30).length;
      this.doughnutData = {
        ...this.doughnutData,
        datasets: [{ ...this.doughnutData.datasets[0], data: [paid, pending.length - overdue, overdue] }]
      };

      // Recent activity
      const recentInvoices = fInvoices.length > 0 ? fInvoices : fPayments.map(p => ({ InvDoc: p.AccDoc, PostDate: p.PostDate, Status: p.Status }));
      
      this.recentActivity = [
        ...fPos.slice(0, 3).map((p: any) => ({ type: 'PO', doc: p.PurDoc, date: p.DocDate, status: p.Status || 'open', icon: 'shopping_cart' })),
        ...recentInvoices.slice(0, 2).map((i: any) => ({ type: 'INV', doc: i.InvDoc, date: i.PostDate, status: i.Status || 'open', icon: 'receipt_long' })),
      ].slice(0, 5);

      this.loading = false;
    });
  }

  getKpiValue(key: string): number | string {
    const val = (this.kpi as any)[key];
    if (key === 'agingAmount') return val.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    return val;
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (['paid', 'completed', 'approved'].includes(s)) return 'chip chip-success';
    if (['pending', 'open', 'in process'].includes(s)) return 'chip chip-warning';
    if (['overdue', 'rejected'].includes(s)) return 'chip chip-error';
    return 'chip chip-info';
  }
}
