import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../shared/reusable-table/reusable-table.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, MatIconModule],
  templateUrl: './goods-receipt.component.html',
  styleUrl: './goods-receipt.component.scss'
})
export class GoodsReceiptComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error: string | null = null;

  columns: TableColumn[] = [
    { key: 'MatDoc',        label: 'GR Number' },
    { key: 'PoNumber',      label: 'PO Number' },
    { key: 'MatNo',         label: 'Material' },
    { key: 'Description',   label: 'Description' },
    { key: 'GrQty',         label: 'Quantity' },
    { key: 'Unit',          label: 'Unit' },
    { key: 'PostDate',      label: 'Posting Date',  type: 'date' },
    { key: 'Plant',         label: 'Plant' },
    { key: 'MoveType',      label: 'Mvmt Type' }
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    const vid = this.auth.getVendorId();
    const rawVid = vid.replace(/^0+/, '') || vid;
    
    this.api.getGoodsReceipts(vid).subscribe({
      next: (d) => { 
        console.log('Fetched GRs:', d);
        // If VendorId is empty in backend, show all for now so data 'comes'
        this.data = d.filter(item => !item.VendorId || item.VendorId.replace(/^0+/, '') === rawVid || item.VendorId === '');
        this.loading = false; 
      },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }
}
