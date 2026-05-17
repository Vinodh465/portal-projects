import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../shared/reusable-table/reusable-table.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, MatIconModule],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss'
})
export class PurchaseOrderComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error: string | null = null;

  columns: TableColumn[] = [
    { key: 'PurDoc',        label: 'PO Number' },
    { key: 'DocDate',       label: 'PO Date',         type: 'date' },
    { key: 'MatNo',         label: 'Material' },
    { key: 'Description',   label: 'Description' },
    { key: 'OrderQty',      label: 'Quantity' },
    { key: 'Unit',          label: 'Unit' },
    { key: 'NetPrice',      label: 'Net Price',       type: 'amount' },
    { key: 'Currency',      label: 'Currency' },
    { key: 'Plant',         label: 'Plant' }
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    const vid = this.auth.getVendorId();
    const rawVid = vid.replace(/^0+/, '') || vid;
    
    this.api.getPurchaseOrders(vid).subscribe({
      next: (d) => { 
        console.log('Fetched POs:', d);
        // If VendorId is empty in backend, show all for now so data 'comes'
        this.data = d.filter(item => !item.VendorId || item.VendorId.replace(/^0+/, '') === rawVid || item.VendorId === '');
        this.loading = false; 
      },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }
}
