import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ReusableTableComponent } from '../../components/reusable-table/reusable-table.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TableColumn } from '../../models/sap.models';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, ReusableTableComponent],
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error = '';

  columns: TableColumn[] = [
    { key: 'DELIVERY_NO',      label: 'Delivery No',      sortable: true },
    { key: 'CREATED_DATE',     label: 'Created Date',     sortable: true },
    { key: 'DELIVERY_TYPE',    label: 'Type',             sortable: true },
    { key: 'DELIVERY_STATUS',  label: 'Status',           sortable: false },
    { key: 'GOODS_ISSUE_DATE', label: 'Goods Issue Date', sortable: true },
    { key: 'SHIP_TO_PARTY',    label: 'Ship-To Party',    sortable: false }
  ];



  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.fetchDeliveries(this.auth.getCustId());
  }

  fetchDeliveries(custId: string): void {
    if (!custId) return;
    this.loading = true;
    this.error = '';
    this.data = [];
    
    this.api.getDeliveries(custId).subscribe({
      next: (data) => { this.data = data; this.loading = false; },
      error: (err) => { 
        this.error = err?.status === 500
          ? 'SAP service not configured on the server side (SOAMANAGER). Please contact your SAP BASIS team.'
          : 'Failed to load delivery data. Please try again.';
        this.loading = false;
      }
    });
  }


}
