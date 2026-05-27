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
    { key: 'DOC_NO',        label: 'Order No',    sortable: true },
    { key: 'ITEM_NO',       label: 'Item No',     sortable: true },
    { key: 'DOC_DATE',      label: 'Order Date',  sortable: true },
    { key: 'DOC_TYPE',      label: 'Type',        sortable: true },
    { key: 'SALES_ORG',     label: 'Sales Org',   sortable: true },
    { key: 'DIST_CHANNEL',  label: 'Dist Ch',     sortable: true },
    { key: 'DIVISION',      label: 'Division',    sortable: true },
    { key: 'MATERIAL_NO',   label: 'Material No', sortable: true },
    { key: 'MATERIAL_NAME', label: 'Material',    sortable: true },
    { key: 'QUANTITY',      label: 'Qty',         sortable: true },
    { key: 'UNIT',          label: 'Unit',        sortable: true },
    { key: 'AMOUNT',        label: 'Net Value',   sortable: true },
    { key: 'CURRENCY',      label: 'Curr',        sortable: true }
  ];

  inquiryColumns = [
    { key: 'DOC_NO',          label: 'Doc No',     sortable: true },
    { key: 'DOC_DATE',        label: 'Date',       sortable: true },
    { key: 'CREATED_BY',      label: 'Created By', sortable: true },
    { key: 'DOC_TYPE',        label: 'Type',       sortable: true },
    { key: 'CUSTOMER_REF',    label: 'Cust Ref',   sortable: true },
    { key: 'SALES_ORG',       label: 'Sales Org',  sortable: true },
    { key: 'DIST_CHANNEL',    label: 'Dist Ch',    sortable: true },
    { key: 'DIVISION',        label: 'Division',   sortable: true },
    { key: 'MATERIAL_NAME',   label: 'Material',   sortable: true },
    { key: 'NET_VALUE',       label: 'Net Value',  sortable: true },
    { key: 'CURRENCY',        label: 'Curr',       sortable: true }
  ];

  deliveryColumns = [
    { key: 'DELIVERY_NO',      label: 'Delivery No',      sortable: true },
    { key: 'ITEM_NO',          label: 'Item No',          sortable: true },
    { key: 'CREATED_DATE',     label: 'Date',             sortable: true },
    { key: 'DELIVERY_TYPE',    label: 'Type',             sortable: true },
    { key: 'GOODS_ISSUE_DATE', label: 'Planned Date',     sortable: true },
    { key: 'SHIP_TO_PARTY',    label: 'Ship Point',       sortable: true },
    { key: 'MATERIAL_NO',      label: 'Material No',      sortable: true },
    { key: 'MATERIAL_NAME',    label: 'Material',         sortable: true },
    { key: 'QUANTITY',         label: 'Qty',              sortable: true },
    { key: 'UNIT',             label: 'Unit',             sortable: true },
    { key: 'REF_DOC',          label: 'Ref Doc',          sortable: true },
    { key: 'REF_ITEM',         label: 'Ref Item',         sortable: true }
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
    const docTypeMap: { [key: string]: string } = {
      'Y111': 'Rental Contract', 'Y1CS': 'Cash Sale for zt', 'Y1DP': 'down payment', 'Y1RE': 'Returns',
      'Y1RO': 'Rush Order', 'Y2CS': 'Cash Sale', 'Y2OR': 'Standard order', 'Y2RE': 'Returns',
      'Y2VC': 'Value Contract- Gen.', 'YIIN': 'Inquiry', 'YIN':  'SDL Inquiry', 'YOOR': 'order',
      'YOPV': 'Item Proposal', 'YOR':  'SDL Standard Order', 'YQT':  'SDL Quotation', 'DLRE': 'Ord.Type Returns Del',
      'LZM':  'SchedAgrt w/Dly Ord.', 'RX2':  'ARM Ext. Repair Ord.', '01':   'orst.Independent Req',
      'RTTR': 'SPE Return Over.', 'AEBQ': 'Offer', 'ZAOR': 'Standard Order', 'AA':   'Promotion Order',
      'AD9':  'RRB Order', 'AEBO': 'Standard order', 'AK4':  'Standard order', 'CBIC': 'Intercompany Order',
      'CMDM': 'Standard Order', 'CMR':  'Standard Order', 'CMRC': 'Standard Order', 'CMRP': 'Standard Order',
      'DMRB': 'Standard Order', 'DMRP': 'Standard Order', 'DMRR': 'Standard Order', 'GCTA': 'Standard Order',
      'HBOR': 'Standard order', 'JOR':  'Standard order', 'JRF':  'Standard order', 'JRE':  'Standard order',
      'JREW': 'Standard order', 'POOL': 'Pooling order', 'SO':   'Rush Order', 'OR':   'Standard Order',
      'OBOS': 'order unit', 'TAM':  'Delivery Order', 'VSH1': 'Version Order', 'ZMIL': 'MILESTONE ORDER',
      'ZYBO': 'Standard order', 'BSVO': 'Service Order eBDR', 'DJIT': 'Order Type JIT', 'GOR':  'GG Standard Order',
      'MAKO': 'Dely Order Correctn', 'RM':   'Delvy Order Returns', 'SRVO': 'Sales Order (Srvce)',
      'TAF':  'Standard Order (FPI)', 'OBLS': 'order lump sum', 'TAV':  'Standard Order (VMI)',
      'ZLOR': 'LA Standard Order', 'ZOOR': 'Standard Order - PB', 'ZORD': 'Standard Order copy',
      'ZSOR': 'SALE ORDER CONFIRM', 'AE':   'Qtn from Serv. Order', 'DL':   'Order Type Sched.Ag.',
      'DZL':  'Dec. Dely Order Type', 'SRVP': 'Order in Soln Qtan', 'AD1':  'A&D Contract',
      'AD2':  'A&D Deb. Memo Req', 'AD3':  'A&D Retroactive Bill', 'IN':   'Inquiry', 'IBOS': 'Inquiry',
      'QT':   'Quotation', 'QBLS': 'Quotation lumpsum', 'QBOS': 'Quotation unit BOS', 'AP':   'Project Quotation',
      'AR':   'Repair Quotation', 'AS':   'Service Quotation', 'SI':   'Sales Information',
      'AV':   'Quotation f.Contract', 'SD2':  'ARM SDF', 'LZJ':  'JIT Scheduling Agt', 'WV':   'Service and Maint.',
      'MV':   'Rental Contract', 'JGL':  'Cred.M.Req.Ret.Good', 'JLL':  'Deb.M.Requ.Ret.Good',
      'J3G6': 'CEM mat. sales int.', 'J3G7': 'CEM mat. repur. int.', 'J3G8': 'CEM mat. sales ext.',
      'J3G9': 'CEM mat. repur. ext.', 'B4':   'Reb.Req.f.Man.Accrls', 'CR':   'Credit Memo Request',
      'CQ':   'Quantity Contract', 'KM':   'Quantity Contract', 'OR1':  'Standard Order 1',
      'ZAR':  'Repair Quot(COPY)', 'ZWV':  'Service COPY', 'ZCQ':  'Quantity Contract', 'ZRAS': 'Repairs/Service(COPY)',
      'TA': 'Standard Order', 'RE': 'Returns', 'AF': 'Inquiry', 'AG': 'Quotation'
    };

    const mapDocType = (item: any) => {
      const rawTypeUpper = String(item.DOC_TYPE || '').toUpperCase().trim();
      const rawTypeLower = rawTypeUpper.toLowerCase();
      if (docTypeMap[rawTypeUpper]) item.DOC_TYPE = docTypeMap[rawTypeUpper];
      else if (rawTypeLower.includes('stan')) item.DOC_TYPE = 'Standard Order';
      else if (rawTypeLower.includes('retu')) item.DOC_TYPE = 'Returns';
      else if (rawTypeLower.includes('inq')) item.DOC_TYPE = 'Inquiry';
      else if (rawTypeLower.includes('quot')) item.DOC_TYPE = 'Quotation';
      else if (rawTypeLower === 'g2') item.DOC_TYPE = 'Credit Memo';
      else if (rawTypeLower === 'l2') item.DOC_TYPE = 'Debit Memo';
      return item;
    };

    // Load Sales count
    this.api.getSales(this.custId).subscribe({
      next: (data) => { 
        this.salesData = (data ?? []).map(mapDocType);
        this.cards[0].value = this.salesData.length > 0 ? `${this.salesData.length} Orders` : 'No Orders'; 
      },
      error: () => { this.cards[0].value = 'Unavailable'; this.cards[0].colorClass = 'card-error'; }
    });
    // Load Deliveries
    this.api.getDeliveries(this.custId).subscribe({
      next: (data) => { 
        const delTypeMap: { [key: string]: string } = {
          'LF': 'Outbound delivery', 'LO': 'Outbound delivery without reference', 'LR': 'Returns delivery',
          'NL': 'Replenishment delivery', 'LP': 'Outbound deliveries from projects', 'LB': 'Outbound delivery for subcontractor',
          'EL': 'Inbound delivery', 'WOD': 'WMS outbound delivery', 'WID': 'WMS inbound delivery',
          'WNL': 'Replenishment WMS', 'WRD': 'Customer returns WMS', 'UL': 'Delivery for stock transfer',
          'LD': 'R/2-R/3 Link', 'Y1CS': 'Cash Sales', 'Y1RE': 'Returns Delivery', 'Y1OR': 'Outbound Delivery',
          'LR2': 'Adv.Returns Delivery', 'LRX': 'XLO Ret. In.Delivery', 'ZLLF': 'L Outbound Delivery'
        };
        this.deliveryData = (data ?? []).map((item: any) => {
          const rawTypeUpper = String(item.DELIVERY_TYPE || '').toUpperCase().trim();
          const rawTypeLower = rawTypeUpper.toLowerCase();
          
          if (delTypeMap[rawTypeUpper]) {
            item.DELIVERY_TYPE = delTypeMap[rawTypeUpper];
          } else if (rawTypeLower === 'outb' || rawTypeLower.includes('outb')) {
            item.DELIVERY_TYPE = 'Outbound Delivery';
          } else if (rawTypeLower === 'retu' || rawTypeLower.includes('retu')) {
            item.DELIVERY_TYPE = 'Returns Delivery';
          } else if (rawTypeLower === 'inbo' || rawTypeLower.includes('inbo')) {
            item.DELIVERY_TYPE = 'Inbound Delivery';
          } else if (rawTypeLower === 'repl' || rawTypeLower.includes('repl')) {
            item.DELIVERY_TYPE = 'Replenishment Delivery';
          }

          const rawStatus = String(item.DELIVERY_STATUS || '').toUpperCase().trim();
          if (rawStatus === 'C') item.DELIVERY_STATUS = 'Completed';
          else if (rawStatus === 'B') item.DELIVERY_STATUS = 'In Process';
          else if (rawStatus === 'A') item.DELIVERY_STATUS = 'Open';

          return item;
        });
        this.cards[1].value = this.deliveryData.length > 0 ? `${this.deliveryData.length} Active` : 'None Active'; 
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
          item = mapDocType(item);
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
