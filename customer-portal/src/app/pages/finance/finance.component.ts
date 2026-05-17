import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ReusableTableComponent } from '../../components/reusable-table/reusable-table.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TableColumn, FinanceItem, AgingItem } from '../../models/sap.models';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, ReusableTableComponent],
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css']
})
export class FinanceComponent implements OnInit {
  invoices: FinanceItem[] = [];
  agingItems: AgingItem[] = [];
  creditMemos: FinanceItem[] = [];
  
  loading = true;
  error = '';
  activeTab = 'invoices'; // 'invoices', 'aging', 'memos'

  // PDF State
  pdfLoading = false;
  pdfError = '';
  pdfSuccess = '';

  pdfActionConfig = {
    label: 'View Statement',
    icon: 'bi-file-earmark-pdf-fill',
    showLabel: false
  };

  invoiceColumns: TableColumn[] = [
    { key: 'INVOICE_NO',    label: 'Invoice No',    sortable: true  },
    { key: 'CUSTOMER_ID',   label: 'Customer ID',   sortable: true  },
    { key: 'INVOICE_DATE',  label: 'Invoice Date',  sortable: true  },
    { key: 'CURRENCY',      label: 'Currency',      sortable: false },
    { key: 'CUSTOMER_NAME', label: 'Customer Name', sortable: true  },
    { key: 'MATERIAL_NAME', label: 'Material Name', sortable: true  },
  ];

  agingColumns: TableColumn[] = [
    { key: 'DOC_NO',        label: 'Doc No',        sortable: true  },
    { key: 'POSTING_DATE',  label: 'Posting Date',  sortable: true  },
    { key: 'AMOUNT',        label: 'Amount',        sortable: true  },
    { key: 'CURRENCY',      label: 'Currency',      sortable: false },
    { key: 'DUE_DATE',      label: 'Due Date',      sortable: true  },
    { key: 'AGING_DAYS',    label: 'Aging Days',    sortable: true  },
  ];

  memoColumns: TableColumn[] = [
    { key: 'DOC_NO',        label: 'Doc No',        sortable: true  },
    { key: 'DOC_CATEGORY',  label: 'Doc Category',  sortable: true  },
    { key: 'BILLING_TYPE',  label: 'Billing Type',  sortable: true  },
    { key: 'CUSTOMER_ID',   label: 'Customer ID',   sortable: true  },
    { key: 'AMOUNT',        label: 'Amount',        sortable: true  },
    { key: 'BILLING_DATE',  label: 'Billing Date',  sortable: true  }
  ];

  selectedInvoice: FinanceItem | null = null;
  showForm = false;



  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.fetchFinance(this.auth.getCustId());
  }

  fetchFinance(custId: string): void {
    if (!custId) return;
    
    this.loading = true;
    this.error = '';
    this.invoices = [];

    this.api.getFinance(custId).subscribe({
      next: (data) => {
        // Map Billing Types to human-readable names for all data sets
        const typeMap: { [key: string]: string } = {
          'F2': 'Invoice (Standard delivery-related billing)',
          'FV': 'Invoice Cancellation',
          'G2': 'Credit Memo',
          'L2': 'Debit Memo',
          'RE': 'Returns Credit Memo',
          'S1': 'Cancellation Invoice'
        };

        const mapBillingType = (item: any) => {
          if (item.BILLING_TYPE && typeMap[item.BILLING_TYPE]) {
            item.BILLING_TYPE = typeMap[item.BILLING_TYPE];
          }
          return item;
        };

        this.invoices = (data.invoices ?? []).map(inv => {
          // User Formula: Aging = Billing Date – Due Date
          const billDateStr = inv.INVOICE_DATE || inv.POSTING_DATE;
          if (billDateStr && inv.DUE_DATE) {
            const billDate = new Date(billDateStr);
            const dueDate = new Date(inv.DUE_DATE);
            const diffTime = billDate.getTime() - dueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            inv.AGING_DAYS = String(diffDays);
          }
          return mapBillingType(inv);
        });

        this.agingItems = (data.aging ?? []).map(item => mapBillingType(item));
        this.creditMemos = (data.payments ?? []).map(item => mapBillingType(item));

        this.loading = false;
      },
      error: (err) => {
        console.error('[Finance] API error:', err);
        this.error = 'Failed to load finance data. Please try again.';
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }



  /** Called when the action button in the table is clicked (per row) */
  onInvoiceAction(row: any): void {
    this.selectedInvoice = row;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedInvoice = null;
  }

  /** Open the SAP-generated Customer Account Statement PDF in a new browser tab */
  openStatement(invoice?: any): void {
    const custId = this.auth.getCustId();
    if (!custId) return;

    this.pdfLoading = true;
    this.pdfError = '';
    this.pdfSuccess = '';

    // Notice we pass custId and the specific invoice object. 
    // This allows SAP to render only this exact row in the Adobe Form.
    this.api.getPdfStatement(custId, invoice).subscribe({
      next: (base64String) => {
        this.pdfLoading = false;
        
        if (!base64String) {
          this.pdfError = 'SAP returned an empty PDF document.';
          return;
        }

        try {
          // Decode Base64 to binary string safely
          // SAP base64 strings often contain line breaks, spaces, or XML entities like &#xA;
          // Step 1: Remove all XML entities (e.g. &#xA;) so they don't leave behind garbage letters like 'xA'
          let cleanBase64 = base64String.replace(/&#[a-zA-Z0-9]+;/g, '');
          
          // Step 2: Strip EVERYTHING except valid Base64 characters (A-Z, a-z, 0-9, +, /, =)
          cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');
          
          const byteCharacters = atob(cleanBase64);
          const byteNumbers = new Array(byteCharacters.length);
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(pdfBlob);
          
          // Try to open in a new tab
          const tab = window.open(url, '_blank');
          
          if (!tab) {
            // Popup blocked — fall back to forced download
            const a = document.createElement('a');
            a.href = url;
            a.download = `SAP_Finance_Statement_${custId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
          this.pdfSuccess = 'SAP PDF downloaded successfully.';
          setTimeout(() => this.pdfSuccess = '', 5000);

        } catch (decodeErr) {
          console.error('[PDF] Base64 decode failed:', decodeErr);
          this.pdfError = 'Failed to decode the PDF from SAP. The file might be corrupted.';
        }
      },
      error: (err) => {
        this.pdfLoading = false;
        this.pdfError = `Failed to fetch PDF from SAP: ${err?.message || err?.statusText || 'Unknown error'}`;
      }
    });
  }
}
