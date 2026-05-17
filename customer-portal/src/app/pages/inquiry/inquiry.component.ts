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
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, ReusableTableComponent],
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.css']
})
export class InquiryComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error = '';

  columns: TableColumn[] = [
    { key: 'DOC_NO',          label: 'Doc No',     sortable: true },
    { key: 'DOC_DATE',        label: 'Date',       sortable: true },
    { key: 'DOC_TYPE',        label: 'Type',       sortable: true },
    { key: 'STATUS_INQUIRY',  label: 'Status',     sortable: true },
    { key: 'SALES_ORG',       label: 'Sales Org',  sortable: true },
  ];



  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.fetchInquiries(this.auth.getCustId());
  }

  fetchInquiries(custId: string): void {
    if (!custId) return;
    this.loading = true;
    this.error = '';
    this.data = [];
    
    this.api.getInquiries(custId).subscribe({
      next: (data) => { 
        this.data = (data ?? []).map(item => {
          // Map Document Types
          const typeMap: { [key: string]: string } = {
            'AF': 'Inquiry',
            'AG': 'Quotation',
            'TA': 'Standard Order',
            'OR1': 'Standard Order',
            'ZCQ': 'Quotation',
            'ZMIL': 'Milestone Order',
            'G2': 'Credit Memo',
            'L2': 'Debit Memo',
            'RE': 'Returns',
            'S1': 'Cancellation'
          };
          if (item.DOC_TYPE && typeMap[item.DOC_TYPE]) {
            item.DOC_TYPE = typeMap[item.DOC_TYPE];
          }

          // Map Overall Status (Prioritizing Billing/Delivery completeness)
          const statusMap: { [key: string]: string } = {
            'C': 'Completed',
            'B': 'In Process',
            'A': 'Open',
            ' ': 'Not Processed'
          };
          
          const rawStatus = String(item.STATUS_INQUIRY || '').toUpperCase().trim();
          if (statusMap[rawStatus]) {
            item.STATUS_INQUIRY = statusMap[rawStatus];
          } else if (rawStatus === 'OPEN' || rawStatus === 'PENDING') {
            item.STATUS_INQUIRY = 'Open';
          } else if (rawStatus === 'COMPLETED' || rawStatus === 'CLOSED') {
            item.STATUS_INQUIRY = 'Completed';
          } else if (!rawStatus || rawStatus === '') {
            item.STATUS_INQUIRY = 'Not Processed';
          }

          return item;
        });
        this.loading = false; 
      },
      error: (err) => { 
        this.error = err?.status === 500
          ? 'SAP service not configured on the server side (SOAMANAGER). Please contact your SAP BASIS team.'
          : 'Failed to load inquiries. Please try again.';
        this.loading = false;
      }
    });
  }


}
