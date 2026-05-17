import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn } from '../../models/sap.models';

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rt-wrapper">
      <!-- Controls -->
      <div class="rt-controls">
        <div class="rt-search">
          <i class="bi bi-search rt-search-icon"></i>
          <input
            type="text"
            class="rt-search-input"
            placeholder="Search..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            id="table-search"
          />
        </div>
        
        <!-- Advanced Filters -->
        <ng-container *ngIf="enableFilters">
          <ng-container *ngIf="dateKey">
            <div class="rt-filter-group">
              <label class="rt-filter-label">From:</label>
              <input type="date" [(ngModel)]="fromDate" (ngModelChange)="applyFilter()" class="rt-date-input" />
            </div>
            <div class="rt-filter-group">
              <label class="rt-filter-label">To:</label>
              <input type="date" [(ngModel)]="toDate" (ngModelChange)="applyFilter()" class="rt-date-input" />
            </div>
          </ng-container>
          
          <div class="rt-filter-group">
            <label class="rt-filter-label">Sort By:</label>
            <select [(ngModel)]="selectedSortKey" (ngModelChange)="onSortDropdownChange()" class="rt-select">
               <option value="">-- Default --</option>
               <ng-container *ngFor="let col of columns">
                 <option *ngIf="col.sortable !== false" [value]="col.key">{{ col.label }}</option>
               </ng-container>
            </select>
          </div>
        </ng-container>

        <div class="rt-page-size">
          <label for="page-size">Rows:</label>
          <select id="page-size" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
            <option [value]="5">5</option>
            <option [value]="10">10</option>
            <option [value]="25">25</option>
            <option [value]="50">50</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="rt-table-container">
        <table class="rt-table" *ngIf="pagedData.length > 0; else emptyState">
          <thead>
            <tr>
              <th *ngFor="let col of columns" (click)="col.sortable !== false ? sort(col.key) : null" 
                  [class.rt-th]="col.sortable !== false" 
                  [class.rt-th-static]="col.sortable === false">
                <span>{{ col.label }}</span>
                <span class="sort-icon" *ngIf="sortKey === col.key && col.sortable !== false">
                  {{ sortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th *ngIf="actionConfig" class="rt-th" style="text-align: center; cursor: default;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of pagedData; let i = index" class="rt-row" [class.rt-row-alt]="i % 2 !== 0">
              <td *ngFor="let col of columns" class="rt-td">
                <span [class]="getStatusClass(col.key, row[col.key])">{{ row[col.key] ?? '—' }}</span>
              </td>
              <td *ngIf="actionConfig" class="rt-td" style="text-align: center;">
                <button class="rt-action-btn" (click)="onAction(row)" [title]="actionConfig.label">
                  <i [class]="'bi ' + actionConfig.icon"></i>
                  <span class="action-label" *ngIf="actionConfig.showLabel">{{ actionConfig.label }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #emptyState>
          <div class="rt-empty">
            <i class="bi bi-inbox rt-empty-icon"></i>
            <p class="rt-empty-title">No records found</p>
            <p class="rt-empty-sub">{{ emptyMessage }}</p>
          </div>
        </ng-template>
      </div>

      <!-- Pagination -->
      <div class="rt-pagination" *ngIf="totalPages > 1">
        <button class="rt-page-btn" (click)="goToPage(1)" [disabled]="currentPage === 1">
          <i class="bi bi-chevron-double-left"></i>
        </button>
        <button class="rt-page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="rt-page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button class="rt-page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
          <i class="bi bi-chevron-right"></i>
        </button>
        <button class="rt-page-btn" (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">
          <i class="bi bi-chevron-double-right"></i>
        </button>
      </div>
      <div class="rt-count" *ngIf="filteredData.length > 0">
        Showing {{ startIndex + 1 }}–{{ endIndex }} of {{ filteredData.length }} records
      </div>
    </div>
  `,
  styles: [`
    .rt-wrapper { display: flex; flex-direction: column; gap: 1rem; }
    .rt-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .rt-search {
      position: relative;
      flex: 1;
      min-width: 200px;
    }
    .rt-search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
      font-size: 0.85rem;
    }
    .rt-search-input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.2rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #1a1a1a;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .rt-search-input:focus { border-color: #990000; }
    .rt-search-input::placeholder { color: #94a3b8; }
    .rt-page-size {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #475569;
      font-size: 0.85rem;
    }
    .rt-page-size select {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: #1a1a1a;
      padding: 0.3rem 0.5rem;
      font-size: 0.85rem;
      outline: none;
    }
    .rt-filter-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .rt-filter-label {
      color: #475569;
      font-size: 0.85rem;
    }
    .rt-date-input, .rt-select {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: #1a1a1a;
      padding: 0.4rem 0.6rem;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .rt-date-input:focus, .rt-select:focus { border-color: #990000; }
    .rt-table-container { overflow-x: auto; border-radius: 10px; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .rt-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .rt-th {
      background: #f8fafc;
      color: #475569;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      border-bottom: 1px solid #e2e8f0;
      position: relative;
    }
    .rt-th:hover { color: #990000; background: #f1f5f9; }
    .rt-th-static {
      background: #f8fafc;
      color: #475569;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
      border-bottom: 1px solid #e2e8f0;
      cursor: default;
    }
    .sort-icon { margin-left: 0.4rem; color: #990000; font-size: 0.65rem; }
    .rt-row { transition: background 0.15s; background: #ffffff; }
    .rt-row:hover { background: #fdf2f2; }
    .rt-row-alt { background: #fbfbfc; }
    .rt-td {
      padding: 0.7rem 1rem;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
      white-space: nowrap;
    }
    .rt-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
      gap: 0.5rem;
      background: #ffffff;
    }
    .rt-empty-icon { font-size: 2.5rem; color: #cbd5e1; }
    .rt-empty-title { color: #475569; font-weight: 600; margin: 0; font-size: 1rem; }
    .rt-empty-sub { color: #64748b; margin: 0; font-size: 0.85rem; }
    .rt-pagination {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      justify-content: center;
    }
    .rt-page-btn {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 0.4rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .rt-page-btn:hover:not(:disabled) { background: #990000; color: #fff; border-color: #990000; }
    .rt-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .rt-page-info { color: #475569; font-size: 0.85rem; padding: 0 0.5rem; }
    .rt-count { text-align: center; color: #64748b; font-size: 0.78rem; }
    .status-success { color: #16a34a; font-weight: 600; }
    .status-pending { color: #d97706; font-weight: 600; }
    .status-danger  { color: #dc2626; font-weight: 600; }
    .status-info    { color: #0284c7; font-weight: 600; }
    .badge-standard { background-color: #eef2ff; color: #4f46e5; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid #e0e7ff; }
    .badge-credit   { background-color: #dcfce7; color: #16a34a; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid #bbf7d0; }
    .badge-debit    { background-color: #e0f2fe; color: #0369a1; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid #bae6fd; }
    .badge-cancel   { background-color: #fee2e2; color: #dc2626; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid #fecaca; }
    .badge-return   { background-color: #ffedd5; color: #c2410c; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid #fed7aa; }
    .badge-invoice-cancel { background-color: #f3e8ff; color: #7e22ce; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid #e9d5ff; }
    .rt-action-btn {
      background: transparent;
      border: 1px solid #990000;
      color: #990000;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .rt-action-btn:hover { background: #990000; color: white; }
    .action-label { font-weight: 500; }
  `]
})
export class ReusableTableComponent implements OnInit, OnChanges {
  ngOnInit(): void {
    this.applyFilter();
  }
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() emptyMessage: string = 'No data available for this customer.';
  @Input() actionConfig?: { label: string; icon: string; showLabel?: boolean };
  @Input() enableFilters: boolean = false;
  @Input() dateKey: string = 'DOC_DATE';
  @Input() numberKey: string = '';
  @Output() actionClicked = new EventEmitter<any>();

  filteredData: any[] = [];
  pagedData: any[] = [];
  searchTerm = '';
  sortKey = '';
  sortAsc = true;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Filter states
  fromDate = '';
  toDate = '';
  minVal = '';
  maxVal = '';
  selectedSortKey = '';

  get startIndex(): number { return (this.currentPage - 1) * this.pageSize; }
  get endIndex(): number { return Math.min(this.startIndex + this.pageSize, this.filteredData.length); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.searchTerm = '';
      this.currentPage = 1;
      this.applyFilter();
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePage();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    let result = [...this.data];

    // Global text search
    if (term) {
      result = result.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(term)));
    }

    if (this.enableFilters) {
      // Date range filter
      if (this.dateKey) {
        if (this.fromDate) {
          const fromTime = new Date(this.fromDate).getTime();
          result = result.filter(row => {
            if (!row[this.dateKey]) return true;
            return new Date(row[this.dateKey]).getTime() >= fromTime;
          });
        }
        if (this.toDate) {
          const toDateObj = new Date(this.toDate);
          toDateObj.setHours(23, 59, 59, 999);
          const toTime = toDateObj.getTime();
          result = result.filter(row => {
            if (!row[this.dateKey]) return true;
            return new Date(row[this.dateKey]).getTime() <= toTime;
          });
        }
      }

      // Number range filter
      if (this.numberKey) {
        if (this.minVal !== null && this.minVal !== '') {
          const min = parseFloat(this.minVal);
          result = result.filter(row => {
            const val = parseFloat(row[this.numberKey]);
            return !isNaN(val) && val >= min;
          });
        }
        if (this.maxVal !== null && this.maxVal !== '') {
          const max = parseFloat(this.maxVal);
          result = result.filter(row => {
            const val = parseFloat(row[this.numberKey]);
            return !isNaN(val) && val <= max;
          });
        }
      }
    }

    this.filteredData = result;
    this.applySortAndPage();
  }

  onSortDropdownChange(): void {
    if (this.selectedSortKey) {
      this.sortKey = this.selectedSortKey;
      this.sortAsc = true;
    } else {
      this.sortKey = '';
    }
    this.applySortAndPage();
  }

  sort(key: string): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
    this.applySortAndPage();
  }

  applySortAndPage(): void {
    if (this.sortKey) {
      this.filteredData.sort((a, b) => {
        const av = a[this.sortKey] ?? '';
        const bv = b[this.sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return this.sortAsc ? cmp : -cmp;
      });
    }
    this.totalPages = Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePage();
  }

  updatePage(): void {
    const start = this.startIndex;
    this.pagedData = this.filteredData.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePage();
    }
  }

  getStatusClass(key: string, value: any): string {
    const v = String(value).toUpperCase();

    // Billing Type Badges (Case-insensitive matching for descriptive names)
    if (v.includes('STANDARD')) return 'badge-standard';
    if (v.includes('DEBIT MEMO')) return 'badge-debit';
    if (v.includes('CREDIT MEMO')) return 'badge-credit';
    if (v.includes('INVOICE CANCELLATION')) return 'badge-cancel';
    if (v.includes('RETURNS CREDIT MEMO')) return 'badge-return';
    if (v.includes('CANCELLATION INVOICE')) return 'badge-invoice-cancel';

    if (!key.toLowerCase().includes('status') && !key.toLowerCase().includes('state')) return '';
    if (['C', 'COMPLETED', 'DELIVERED', 'PAID', 'CLEARED', 'S', 'SUCCESS'].includes(v)) return 'status-success';
    if (['A', 'OPEN', 'PENDING', 'IN TRANSIT', 'ACTIVE'].includes(v)) return 'status-pending';
    if (['E', 'ERROR', 'FAILED', 'OVERDUE', 'BLOCKED'].includes(v)) return 'status-danger';
    return 'status-info';
  }

  onAction(row: any): void {
    this.actionClicked.emit(row);
  }
}
