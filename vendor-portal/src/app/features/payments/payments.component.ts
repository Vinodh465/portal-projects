import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../shared/reusable-table/reusable-table.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { PaymentAging } from '../../core/models/models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, MatIconModule, BaseChartDirective],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit {
  data: PaymentAging[] = [];
  loading = true;
  error: string | null = null;

  columns: TableColumn[] = [
    { key: 'CompanyCode',         label: 'Company Code' },
    { key: 'VendorId',            label: 'Vendor ID' },
    { key: 'AccDoc',              label: 'Accounting Doc' },
    { key: 'FiscYear',            label: 'Fiscal Year' },
    { key: 'DocDate',             label: 'Doc Date',     type: 'date' },
    { key: 'PostDate',            label: 'Posting Date', type: 'date' },
    { key: 'DueDate',             label: 'Due Date',     type: 'date' },
    { key: 'Amount',              label: 'Amount',       type: 'amount' },
    { key: 'Currency',            label: 'Currency' },
    { key: 'AgingDays',           label: 'Aging Days' },
    { key: 'Status',              label: 'Status',       type: 'status' },
  ];

  agingBuckets = [
    { label: 'Current (0-30d)',   count: 0, amount: 0, color: '#2e7d32' },
    { label: '31-60 Days',        count: 0, amount: 0, color: '#F9A825' },
    { label: '61-90 Days',        count: 0, amount: 0, color: '#e65100' },
    { label: '>90 Days (Overdue)',count: 0, amount: 0, color: '#c62828' },
  ];

  barChartData: ChartData<'bar'> = {
    labels: ['Current (0-30)', '31-60 Days', '61-90 Days', '>90 Days'],
    datasets: [{ label: 'Amount', data: [0,0,0,0], backgroundColor: ['#2e7d32','#F9A825','#e65100','#c62828'], borderRadius: 6 }]
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.getPaymentAging(this.auth.getVendorId()).subscribe({
      next: (d) => {
        this.data = d;
        this.computeBuckets(d);
        this.loading = false;
      },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  computeBuckets(data: PaymentAging[]): void {
    data.forEach(p => {
      const days = +p.AgingDays || 0;
      const amt = +p.Amount || 0;
      if (days <= 30)      { this.agingBuckets[0].count++; this.agingBuckets[0].amount += amt; }
      else if (days <= 60) { this.agingBuckets[1].count++; this.agingBuckets[1].amount += amt; }
      else if (days <= 90) { this.agingBuckets[2].count++; this.agingBuckets[2].amount += amt; }
      else                 { this.agingBuckets[3].count++; this.agingBuckets[3].amount += amt; }
    });
    this.barChartData = {
      ...this.barChartData,
      datasets: [{ ...this.barChartData.datasets[0], data: this.agingBuckets.map(b => b.amount) }]
    };
  }
}
