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
      next: (data) => { 
        this.data = (data ?? []).map((item: any) => {
          const typeMap: { [key: string]: string } = {
            'LF': 'Outbound delivery',
            'LO': 'Outbound delivery without reference',
            'LR': 'Returns delivery',
            'NL': 'Replenishment delivery',
            'LP': 'Outbound deliveries from projects',
            'LB': 'Outbound delivery for subcontractor',
            'EL': 'Inbound delivery',
            'WOD': 'WMS outbound delivery',
            'WID': 'WMS inbound delivery',
            'WNL': 'Replenishment WMS',
            'WRD': 'Customer returns WMS',
            'UL': 'Delivery for stock transfer',
            'LD': 'R/2-R/3 Link',
            'Y1CS': 'Cash Sales',
            'Y1RE': 'Returns Delivery',
            'Y1OR': 'Outbound Delivery',
            'LR2': 'Adv.Returns Delivery',
            'LRX': 'XLO Ret. In.Delivery',
            'ZLLF': 'L Outbound Delivery'
          };

          const rawTypeUpper = String(item.DELIVERY_TYPE || '').toUpperCase().trim();
          const rawTypeLower = rawTypeUpper.toLowerCase();
          
          if (typeMap[rawTypeUpper]) {
            item.DELIVERY_TYPE = typeMap[rawTypeUpper];
          } else if (rawTypeLower === 'outb' || rawTypeLower.includes('outb')) {
            item.DELIVERY_TYPE = 'Outbound Delivery';
          } else if (rawTypeLower === 'retu' || rawTypeLower.includes('retu')) {
            item.DELIVERY_TYPE = 'Returns Delivery';
          } else if (rawTypeLower === 'inbo' || rawTypeLower.includes('inbo')) {
            item.DELIVERY_TYPE = 'Inbound Delivery';
          } else if (rawTypeLower === 'repl' || rawTypeLower.includes('repl')) {
            item.DELIVERY_TYPE = 'Replenishment Delivery';
          }

          // Optional status mapping for standard SAP statuses
          const rawStatus = String(item.DELIVERY_STATUS || '').toUpperCase().trim();
          if (rawStatus === 'C') item.DELIVERY_STATUS = 'Completed';
          else if (rawStatus === 'B') item.DELIVERY_STATUS = 'In Process';
          else if (rawStatus === 'A') item.DELIVERY_STATUS = 'Open';

          return item;
        });
        this.loading = false; 
      },
      error: (err) => { 
        this.error = err?.status === 500
          ? 'SAP service not configured on the server side (SOAMANAGER). Please contact your SAP BASIS team.'
          : 'Failed to load delivery data. Please try again.';
        this.loading = false;
      }
    });
  }


}
