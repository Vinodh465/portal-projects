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
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, ReusableTableComponent],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error = '';

  columns: TableColumn[] = [
    { key: 'DOC_NO',    label: 'Order No',    sortable: true },
    { key: 'DOC_DATE',  label: 'Order Date',  sortable: true },
    { key: 'DOC_TYPE',  label: 'Order Type',  sortable: true },
    { key: 'AMOUNT',    label: 'Net Value',   sortable: true },
    { key: 'SALES_ORG', label: 'Sales Org',   sortable: true },
  ];



  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.fetchSales(this.auth.getCustId());
  }

  fetchSales(custId: string): void {
    if (!custId) return;
    this.loading = true;
    this.error = '';
    this.data = [];
    
    this.api.getSales(custId).subscribe({
      next: (data) => { this.data = data; this.loading = false; },
      error: (err) => { 
        this.error = err?.status === 500
          ? 'SAP service not configured on the server side (SOAMANAGER). Please contact your SAP BASIS team.'
          : 'Failed to load sales data. Please try again.';
        this.loading = false;
      }
    });
  }


}
