import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../shared/reusable-table/reusable-table.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-credit-debit-memo',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, MatIconModule],
  templateUrl: './credit-debit-memo.component.html',
  styleUrl: './credit-debit-memo.component.scss'
})
export class CreditDebitMemoComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error: string | null = null;

  columns: TableColumn[] = [
    { key: 'CompanyCode',          label: 'Company Code' },
    { key: 'AccDoc',               label: 'Accounting Doc' },
    { key: 'FiscYear',             label: 'Fiscal Year' },
    { key: 'DocType',              label: 'Doc Type',    type: 'status' },
    { key: 'VendorId',             label: 'Vendor ID' },
    { key: 'DocDate',              label: 'Doc Date',    type: 'date' },
    { key: 'PostDate',             label: 'Posting Date',type: 'date' },
    { key: 'Amount',               label: 'Amount',      type: 'amount' },
    { key: 'Currency',             label: 'Currency' },
    { key: 'HeaderText',           label: 'Header Text' },
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.getCreditMemos(this.auth.getVendorId()).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }
}
