import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ReusableTableComponent } from '../../components/reusable-table/reusable-table.component';

interface SummaryCard {
  title: string;
  value: string;
  icon: string;
  colorClass: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, ReusableTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  custId = '';
  custName = '';
  loading = true;
  activeTab: string | null = null;

  cards: SummaryCard[] = [
    { title: 'Total Sales', value: '—', icon: 'bi-cart-check-fill', colorClass: 'card-blue', route: '/sales' },
    { title: 'Open Deliveries', value: '—', icon: 'bi-truck', colorClass: 'card-purple', route: '/delivery' },
    { title: 'Pending Payments', value: '—', icon: 'bi-cash-coin', colorClass: 'card-amber', route: '/finance' },
    { title: 'Inquiries', value: '—', icon: 'bi-search', colorClass: 'card-teal', route: '/inquiry' },
  ];
  currentTime = '';

  // Data Arrays
  salesData: any[] = [];
  deliveryData: any[] = [];
  financeData: any[] = [];
  inquiryData: any[] = [];
  profileData: any = null;

  // Columns
  salesColumns = [
    { key: 'DOC_NO',    label: 'Order No',    sortable: true },
    { key: 'DOC_DATE',  label: 'Order Date',  sortable: true },
    { key: 'DOC_TYPE',  label: 'Order Type',  sortable: true },
    { key: 'AMOUNT',    label: 'Net Value',   sortable: true },
    { key: 'SALES_ORG', label: 'Sales Org',   sortable: true },
  ];

  inquiryColumns = [
    { key: 'DOC_NO',          label: 'Doc No',     sortable: true },
    { key: 'DOC_DATE',        label: 'Date',       sortable: true },
    { key: 'DOC_TYPE',        label: 'Type',       sortable: true },
    { key: 'STATUS_INQUIRY',  label: 'Status',     sortable: true },
    { key: 'SALES_ORG',       label: 'Sales Org',  sortable: true },
  ];

  deliveryColumns = [
    { key: 'DELIVERY_NO',      label: 'Delivery No',      sortable: true },
    { key: 'CREATED_DATE',     label: 'Created Date',     sortable: true },
    { key: 'DELIVERY_TYPE',    label: 'Type',             sortable: true },
    { key: 'DELIVERY_STATUS',  label: 'Status',           sortable: false },
    { key: 'GOODS_ISSUE_DATE', label: 'Goods Issue Date', sortable: true },
  ];

  financeColumns = [
    { key: 'INVOICE_NO',    label: 'Invoice No',    sortable: true  },
    { key: 'CUSTOMER_ID',   label: 'Customer ID',   sortable: true  },
    { key: 'INVOICE_DATE',  label: 'Invoice Date',  sortable: true  },
    { key: 'CURRENCY',      label: 'Currency',      sortable: false },
    { key: 'CUSTOMER_NAME', label: 'Customer Name', sortable: true  },
    { key: 'MATERIAL_NAME', label: 'Material Name', sortable: true  },
  ];

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.custId = this.auth.getCustId();
    this.custName = this.auth.getCustName();
    this.currentTime = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.loadSummary();
    this.loadProfile();
  }

  setActiveTab(tab: string): void {
    this.activeTab = this.activeTab === tab ? null : tab;
  }

  loadProfile(): void {
    this.api.getProfile(this.custId).subscribe({
      next: (data) => { this.profileData = data; }
    });
  }

  loadSummary(): void {
    // Load Sales count
    this.api.getSales(this.custId).subscribe({
      next: (data) => { 
        this.salesData = data;
        this.cards[0].value = data.length > 0 ? `${data.length} Orders` : 'No Orders'; 
      },
      error: () => { this.cards[0].value = 'Unavailable'; this.cards[0].colorClass = 'card-error'; }
    });
    // Load Deliveries
    this.api.getDeliveries(this.custId).subscribe({
      next: (data) => { 
        this.deliveryData = data;
        this.cards[1].value = data.length > 0 ? `${data.length} Active` : 'None Active'; 
      },
      error: () => { this.cards[1].value = 'Unavailable'; this.cards[1].colorClass = 'card-error'; }
    });
    // Load Finance
    this.api.getFinance(this.custId).subscribe({
      next: (data) => { 
        this.financeData = data.invoices ?? [];
        this.cards[2].value = data.invoices.length > 0 ? `${data.invoices.length} Invoices` : 'No Invoices'; 
      },
      error: () => { this.cards[2].value = 'Unavailable'; this.cards[2].colorClass = 'card-error'; }
    });
    // Load Inquiries
    this.api.getInquiries(this.custId).subscribe({
      next: (data) => { 
        this.inquiryData = (data ?? []).map(item => {
          const typeMap: { [key: string]: string } = { 
            'AF': 'Inquiry', 'AG': 'Quotation', 'TA': 'Standard Order',
            'OR1': 'Standard Order', 'ZCQ': 'Quotation', 'ZMIL': 'Milestone Order',
            'G2': 'Credit Memo', 'L2': 'Debit Memo', 'RE': 'Returns', 'S1': 'Cancellation'
          };
          if (item.DOC_TYPE && typeMap[item.DOC_TYPE]) item.DOC_TYPE = typeMap[item.DOC_TYPE];
          
          const statusMap: { [key: string]: string } = { 'C': 'Completed', 'B': 'In Process', 'A': 'Open' };
          const rawStatus = String(item.STATUS_INQUIRY || '').toUpperCase().trim();
          if (statusMap[rawStatus]) item.STATUS_INQUIRY = statusMap[rawStatus];
          else if (rawStatus === 'OPEN' || rawStatus === 'PENDING') item.STATUS_INQUIRY = 'Open';
          else if (rawStatus === 'COMPLETED' || rawStatus === 'CLOSED') item.STATUS_INQUIRY = 'Completed';
          else if (!rawStatus || rawStatus === '') item.STATUS_INQUIRY = 'Not Processed';
          
          return item;
        });
        this.cards[3].value = this.inquiryData.length > 0 ? `${this.inquiryData.length} Items` : 'No Items'; 
      },
      error: () => { this.cards[3].value = 'Unavailable'; this.cards[3].colorClass = 'card-error'; },
      complete: () => { this.loading = false; }
    });
  }
}
