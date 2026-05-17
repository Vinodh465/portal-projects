import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../shared/reusable-table/reusable-table.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, MatIconModule],
  templateUrl: './rfq.component.html',
  styleUrl: './rfq.component.scss'
})
export class RfqComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error: string | null = null;

  columns: TableColumn[] = [
    { key: 'PurDoc',        label: 'RFQ Number' },
    { key: 'DocDate',       label: 'RFQ Date',      type: 'date' },
    { key: 'MatNo',         label: 'Material' },
    { key: 'Description',   label: 'Description' },
    { key: 'OrderQty',      label: 'Quantity' },
    { key: 'Unit',          label: 'Unit' },
    { key: 'NetPrice',      label: 'Net Price',     type: 'amount' },
    { key: 'Currency',      label: 'Currency' }
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.getRfqs(this.auth.getVendorId()).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }
}
