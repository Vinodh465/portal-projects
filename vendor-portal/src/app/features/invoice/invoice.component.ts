import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReusableTableComponent, TableColumn } from '../../shared/reusable-table/reusable-table.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PdfViewerDialogComponent } from '../../shared/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as XLSX from 'xlsx';
import { Invoice } from '../../core/models/models';
import { SapDatePipe } from '../../shared/pipes/sap-date.pipe';


@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatDialogModule, MatButtonModule,
    MatTableModule, MatPaginatorModule, MatSortModule, FormsModule,
    MatInputModule, MatFormFieldModule, MatTooltipModule, SapDatePipe
  ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit, AfterViewInit {
  allData: Invoice[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Invoice>([]);

  displayedColumns = [
    'FiscYear', 'PoNumber', 'MatNo', 'Qty', 'InvAmount', 'Currency', 'PostDate', 'Age', 'Status', 'Actions'
  ];

  summaryCards = [
    { label: 'Total Invoices', value: 0, icon: 'receipt_long',    color: '#3949ab' },
    { label: 'Total Amount',   value: '0', icon: 'currency_rupee', color: '#10b981' },
    { label: 'Pending/Open',   value: 0, icon: 'pending_actions',  color: '#f59e0b' },
  ];

  constructor(private api: ApiService, private auth: AuthService, private dialog: MatDialog) {}

  ngOnInit(): void {
    const vid = this.auth.getVendorId();
    const rawVid = vid.replace(/^0+/, '') || vid;
    this.loading = true;

    forkJoin({
      invoices: this.api.getInvoices(vid).pipe(catchError(() => of([]))),
      aging: this.api.getPaymentAging(vid).pipe(catchError(() => of([]))),
      grs: this.api.getGoodsReceipts(vid).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ invoices, aging, grs }) => {
        console.log('Fetched Invoices:', invoices);
        console.log('Fetched Aging:', aging);
        console.log('Fetched GRs:', grs);

        const filteredGrs = grs.filter(g => !g.VendorId || (g.VendorId || '').replace(/^0+/, '') === rawVid || g.VendorId === '');
        const filteredInvoices = invoices.filter(i => !i.VendorId || (i.VendorId || '').replace(/^0+/, '') === rawVid || i.VendorId === '');
        const filteredAging = aging.filter(a => (a.VendorId || '').replace(/^0+/, '') === rawVid);

        // Step 1: Map primary invoices and enrich with Age/Status from Aging
        let merged: any[] = filteredInvoices.map(inv => {
          const ageRec = filteredAging.find(a => a.AccDoc === inv.InvDoc);
          
          let po = inv.PoNumber;
          let mat = inv.MatNo;

          // Enrichment: If PO or Material is missing, search in GR records
          if (!po || po.trim() === '' || po === '0000000000' || !mat || mat.trim() === '') {
            const match = filteredGrs.find(g => 
              (g.PoNumber && g.PoNumber !== '') && 
              (Math.abs(+g.GrQty - +inv.Qty) < 0.01 || Math.abs(+g.GrQty - (+inv.InvAmount / 10)) < 1) // Heuristic
            );
            if (match) {
              po = po || match.PoNumber;
              mat = mat || match.MatNo;
            }
          }

          return { 
            ...inv, 
            PoNumber: po || '—', 
            MatNo: mat || '—',
            Age: ageRec?.AgingDays || 0,
            Status: ageRec?.Status || inv.Status || 'Open',
            Belnr: inv.InvDoc // Ensure Belnr is available for PDF
          };
        });

        // Step 2: If InvoiceSet is empty but Aging has records, create synthetic records
        if (merged.length === 0 && filteredAging.length > 0) {
          merged = filteredAging.map(a => {
            const matchedGr = filteredGrs.find(g => Math.abs(+g.GrQty - +a.Amount) < 1) || 
                             filteredGrs.find(g => g.PoNumber && g.PoNumber !== '') || 
                             filteredGrs[0];

            return {
              InvDoc: a.AccDoc,
              FiscYear: a.FiscYear,
              PoNumber: matchedGr?.PoNumber || '—',
              MatNo: matchedGr?.MatNo || '—',
              Qty: matchedGr?.GrQty || '1.000',
              InvAmount: a.Amount,
              Currency: a.Currency,
              PostDate: a.PostDate,
              Age: a.AgingDays,
              Status: a.Status,
              Belnr: a.AccDoc
            };
          });
        }

        this.allData = merged;
        this.dataSource.data = merged;
        this.updateSummary(merged);
        this.loading = false;
      },
      error: (e) => {
        this.error = e.message || 'Failed to fetch data';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applySearch(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  updateSummary(data: Invoice[]): void {
    this.summaryCards[0].value = data.length;
    const total = data.reduce((s, i) => s + (+i.InvAmount || 0), 0);
    this.summaryCards[1].value = total.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    this.summaryCards[2].value = data.filter(i => {
      const s = (i.Status || '').toLowerCase();
      return s === 'pending' || s === 'overdue' || s === 'open';
    }).length;
  }

  openPdf(invoice: any): void {
    const belnr = invoice.Belnr || invoice.InvDoc;
    this.dialog.open(PdfViewerDialogComponent, {
      data: { belnr, title: `Invoice ${belnr}` },
      width: '90vw', maxWidth: '1000px', height: '90vh'
    });
  }

  getStatusClass(val: string): string {
    const v = (val||'').toLowerCase();
    if (['paid','posted','completed'].includes(v)) return 'chip chip-success';
    if (['pending','open'].includes(v)) return 'chip chip-warning';
    if (['overdue','blocked'].includes(v)) return 'chip chip-error';
    return 'chip chip-info';
  }

  exportExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, 'invoices.xlsx');
  }
}
