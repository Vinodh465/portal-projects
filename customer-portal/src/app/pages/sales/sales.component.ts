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
      next: (data) => { 
        this.data = (data ?? []).map((item: any) => {
          const typeMap: { [key: string]: string } = {
            'Y111': 'Rental Contract',
            'Y1CS': 'Cash Sale for zt',
            'Y1DP': 'down payment',
            'Y1RE': 'Returns',
            'Y1RO': 'Rush Order',
            'Y2CS': 'Cash Sale',
            'Y2OR': 'Standard order',
            'Y2RE': 'Returns',
            'Y2VC': 'Value Contract- Gen.',
            'YIIN': 'Inquiry',
            'YIN':  'SDL Inquiry',
            'YOOR': 'order',
            'YOPV': 'Item Proposal',
            'YOR':  'SDL Standard Order',
            'YQT':  'SDL Quotation',
            'DLRE': 'Ord.Type Returns Del',
            'LZM':  'SchedAgrt w/Dly Ord.',
            'RX2':  'ARM Ext. Repair Ord.',
            '01':   'orst.Independent Req',
            'RTTR': 'SPE Return Over.',
            'AEBQ': 'Offer',
            'ZAOR': 'Standard Order',
            'AA':   'Promotion Order',
            'AD9':  'RRB Order',
            'AEBO': 'Standard order',
            'AK4':  'Standard order',
            'CBIC': 'Intercompany Order',
            'CMDM': 'Standard Order',
            'CMR':  'Standard Order',
            'CMRC': 'Standard Order',
            'CMRP': 'Standard Order',
            'DMRB': 'Standard Order',
            'DMRP': 'Standard Order',
            'DMRR': 'Standard Order',
            'GCTA': 'Standard Order',
            'HBOR': 'Standard order',
            'JOR':  'Standard order',
            'JRF':  'Standard order',
            'JRE':  'Standard order',
            'JREW': 'Standard order',
            'POOL': 'Pooling order',
            'SO':   'Rush Order',
            'OR':   'Standard Order',
            'OBOS': 'order unit',
            'TAM':  'Delivery Order',
            'VSH1': 'Version Order',
            'ZMIL': 'MILESTONE ORDER',
            'ZYBO': 'Standard order',
            'BSVO': 'Service Order eBDR',
            'DJIT': 'Order Type JIT',
            'GOR':  'GG Standard Order',
            'MAKO': 'Dely Order Correctn',
            'RM':   'Delvy Order Returns',
            'SRVO': 'Sales Order (Srvce)',
            'TAF':  'Standard Order (FPI)',
            'OBLS': 'order lump sum',
            'TAV':  'Standard Order (VMI)',
            'ZLOR': 'LA Standard Order',
            'ZOOR': 'Standard Order - PB',
            'ZORD': 'Standard order copy',
            'ZSOR': 'SALE ORDER CONFIRM',
            'AE':   'Qtn from Serv. Order',
            'DL':   'Order Type Sched.Ag.',
            'DZL':  'Dec. Dely Order Type',
            'SRVP': 'Order in Soln Qtan',
            'AD1':  'A&D Contract',
            'AD2':  'A&D Deb. Memo Req',
            'AD3':  'A&D Retroactive Bill',
            'IN':   'Inquiry',
            'IBOS': 'Inquiry',
            'QT':   'Quotation',
            'QBLS': 'Quotation lumpsum',
            'QBOS': 'Quotation unit BOS',
            'AP':   'Project Quotation',
            'AR':   'Repair Quotation',
            'AS':   'Service Quotation',
            'SI':   'Sales Information',
            'AV':   'Quotation f.Contract',
            'SD2':  'ARM SDF',
            'LZJ':  'JIT Scheduling Agt',
            'WV':   'Service and Maint.',
            'MV':   'Rental Contract',
            'JGL':  'Cred.M.Req.Ret.Good',
            'JLL':  'Deb.M.Requ.Ret.Good',
            'J3G6': 'CEM mat. sales int.',
            'J3G7': 'CEM mat. repur. int.',
            'J3G8': 'CEM mat. sales ext.',
            'J3G9': 'CEM mat. repur. ext.',
            'B4':   'Reb.Req.f.Man.Accrls',
            'CR':   'Credit Memo Request',
            'CQ':   'Quantity Contract',
            'KM':   'Quantity Contract',
            'OR1':  'Standard Order 1',
            'ZAR':  'Repair Quot(COPY)',
            'ZWV':  'Service COPY',
            'ZCQ':  'Quantity Contract',
            'ZRAS': 'Repairs/Service(COPY)',
            // Standard fallbacks commonly used
            'TA': 'Standard Order',
            'RE': 'Returns',
            'AF': 'Inquiry',
            'AG': 'Quotation'
          };

          const rawTypeUpper = String(item.DOC_TYPE || '').toUpperCase().trim();
          const rawTypeLower = rawTypeUpper.toLowerCase();
          
          if (typeMap[rawTypeUpper]) {
            item.DOC_TYPE = typeMap[rawTypeUpper];
          } else if (rawTypeLower === 'stan' || rawTypeLower.includes('stan')) {
            item.DOC_TYPE = 'Standard Order';
          } else if (rawTypeLower === 'retu' || rawTypeLower.includes('retu')) {
            item.DOC_TYPE = 'Returns';
          } else if (rawTypeLower === 'inq' || rawTypeLower.includes('inq')) {
            item.DOC_TYPE = 'Inquiry';
          } else if (rawTypeLower === 'quot' || rawTypeLower.includes('quot')) {
            item.DOC_TYPE = 'Quotation';
          } else if (rawTypeLower === 'g2') {
            item.DOC_TYPE = 'Credit Memo';
          } else if (rawTypeLower === 'l2') {
            item.DOC_TYPE = 'Debit Memo';
          }

          return item;
        });
        this.loading = false; 
      },
      error: (err) => { 
        this.error = err?.status === 500
          ? 'SAP service not configured on the server side (SOAMANAGER). Please contact your SAP BASIS team.'
          : 'Failed to load sales data. Please try again.';
        this.loading = false;
      }
    });
  }


}
