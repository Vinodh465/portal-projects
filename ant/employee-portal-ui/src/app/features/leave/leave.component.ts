import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="leave-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Leave Management</h1>
          <p class="page-subtitle">View and track your leave history</p>
        </div>
        <button class="btn-refresh" (click)="loadLeave()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spin]="loading()">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      <!-- Leave Balance Cards -->
      <div class="balance-grid" *ngIf="!loading()">
        <div class="balance-card" *ngFor="let b of leaveBalances(); let i = index" [style.animation-delay]="i*0.1+'s'">
          <div class="balance-icon" [class]="b.cls">{{ b.icon }}</div>
          <div class="balance-info">
            <div class="balance-type">{{ b.type }}</div>
            <div class="balance-count">
              <span class="avail">{{ b.available }}</span>
              <span class="total"> / {{ b.total }} days</span>
            </div>
          </div>
          <div class="balance-ring">
            <svg viewBox="0 0 36 36" width="54" height="54">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" stroke-width="3.2"/>
              <circle cx="18" cy="18" r="15.9" fill="none" [attr.stroke]="b.ringColor"
                stroke-width="3.2" stroke-dasharray="100" [attr.stroke-dashoffset]="100 - b.pct"
                stroke-linecap="round" transform="rotate(-90 18 18)" style="transition:stroke-dashoffset 1s ease"/>
            </svg>
            <span class="ring-pct" [style.color]="b.ringColor">{{ b.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="table-controls" *ngIf="!loading()">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search leave records..." [(ngModel)]="searchTerm" class="search-input" (input)="onSearch()"/>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="applyFilter()" class="filter-select">
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select [(ngModel)]="typeFilter" (change)="applyFilter()" class="filter-select">
            <option value="">All Types</option>
            <option value="Annual">Annual Leave</option>
            <option value="Sick">Sick Leave</option>
            <option value="Casual">Casual Leave</option>
          </select>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div class="skeleton-table" *ngIf="loading()">
        <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>

      <!-- Leave Table -->
      <div class="table-container" *ngIf="!loading() && filtered().length > 0">
        <table class="leave-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Leave Type</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let leave of paginated(); let i = index" class="table-row">
              <td class="td-num">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>
                <div class="leave-type-cell">
                  <span class="type-dot" [style.background]="getTypeColor(getLeaveTypeName(leave))"></span>
                  {{ getLeaveTypeName(leave) }}
                </div>
              </td>
              <td>{{ formatDate(leave.FromDate || leave.StartDate) }}</td>
              <td>{{ formatDate(leave.ToDate || leave.EndDate) }}</td>
              <td><strong>{{ leave.LeaveDays || leave.Days || leave.NoOfDays || '—' }}</strong></td>
              <td>
                <span class="status-chip" [class]="getStatusClass(leave.Status || leave.ApprovalStatus)">
                  {{ leave.Status || leave.ApprovalStatus || '—' }}
                </span>
              </td>
              <td class="td-reason">{{ leave.Reason || leave.ApplyReason || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages() > 1">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">‹ Prev</button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages() }}</span>
          <button class="page-btn" [disabled]="currentPage === totalPages()" (click)="currentPage = currentPage + 1">Next ›</button>
        </div>
      </div>

      <!-- No Data -->
      <div class="no-data" *ngIf="!loading() && filtered().length === 0">
        <div class="no-data-icon">🗓️</div>
        <h3>No Leave Records Found</h3>
        <p>No leave records match your search criteria</p>
      </div>
    </div>
  `,
  styles: [`
    .leave-page { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .page-title { font-size: 26px; font-weight: 800; color: var(--text-primary, #111827); margin: 0; }
    .page-subtitle { font-size: 14px; color: var(--text-secondary, #6b7280); margin: 4px 0 0; }
    .btn-refresh {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px;
      background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px; font-size: 13px; font-weight: 600;
      color: var(--text-primary, #374151); cursor: pointer; transition: all 0.2s;
    }
    .btn-refresh:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    /* Balance Cards */
    .balance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .balance-card {
      background: var(--card-bg, #fff);
      border-radius: 14px; padding: 20px;
      border: 1px solid var(--border-color, #e5e7eb);
      display: flex; align-items: center; gap: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      animation: fadeUp 0.4s ease-out both;
      transition: all 0.2s;
    }
    .balance-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .balance-icon { font-size: 28px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .icon-blue { background: rgba(0,120,212,0.1); }
    .icon-green { background: rgba(16,185,129,0.1); }
    .icon-orange { background: rgba(245,158,11,0.1); }
    .icon-purple { background: rgba(139,92,246,0.1); }
    .balance-type { font-size: 12px; color: var(--text-secondary, #6b7280); font-weight: 500; }
    .balance-count { font-size: 15px; font-weight: 700; color: var(--text-primary, #111827); margin-top: 4px; }
    .avail { font-size: 22px; color: #0078d4; }
    .total { font-size: 12px; color: var(--text-secondary, #6b7280); }
    .balance-ring { position: relative; display: flex; align-items: center; justify-content: center; margin-left: auto; flex-shrink: 0; }
    .ring-pct { position: absolute; font-size: 10px; font-weight: 700; }
    /* Controls */
    .table-controls {
      display: flex; gap: 12px; align-items: center;
      margin-bottom: 16px; flex-wrap: wrap;
    }
    .search-box {
      display: flex; align-items: center; gap: 8px;
      background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px; padding: 8px 14px; flex: 1; min-width: 220px;
    }
    .search-input { background: none; border: none; outline: none; font-size: 13px; color: var(--text-primary, #111827); width: 100%; }
    .filter-group { display: flex; gap: 10px; }
    .filter-select {
      padding: 9px 14px; border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px; font-size: 13px; background: var(--card-bg, #fff);
      color: var(--text-primary, #374151); cursor: pointer; outline: none;
    }
    /* Skeleton */
    .skeleton-table { display: flex; flex-direction: column; gap: 10px; }
    .skeleton-row { height: 52px; border-radius: 8px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { to { background-position: -200% 0; } }
    /* Table */
    .table-container {
      background: var(--card-bg, #fff);
      border-radius: 14px;
      border: 1px solid var(--border-color, #e5e7eb);
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .leave-table { width: 100%; border-collapse: collapse; }
    .leave-table thead tr { background: linear-gradient(135deg, #0078d4, #106ebe); }
    .leave-table th {
      padding: 14px 16px; text-align: left;
      font-size: 12px; font-weight: 700;
      color: rgba(255,255,255,0.9);
      letter-spacing: 0.5px; text-transform: uppercase;
    }
    .leave-table td {
      padding: 14px 16px; font-size: 13px;
      color: var(--text-primary, #374151);
      border-bottom: 1px solid var(--border-color, #f3f4f6);
    }
    .table-row { transition: background 0.15s; }
    .table-row:hover { background: var(--bg-secondary, #f9fafb); }
    .table-row:last-child td { border-bottom: none; }
    .td-num { color: var(--text-secondary, #9ca3af); font-weight: 600; }
    .td-reason { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary, #6b7280); }
    .leave-type-cell { display: flex; align-items: center; gap: 8px; }
    .type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-chip {
      padding: 4px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
    }
    .status-approved { background: rgba(16,185,129,0.1); color: #059669; }
    .status-pending { background: rgba(245,158,11,0.1); color: #d97706; }
    .status-rejected { background: rgba(220,38,38,0.1); color: #dc2626; }
    .status-default { background: rgba(107,114,128,0.1); color: #6b7280; }
    /* Pagination */
    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; padding: 16px;
      border-top: 1px solid var(--border-color, #f3f4f6);
    }
    .page-btn {
      padding: 7px 16px; border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 6px; background: var(--card-bg, #fff);
      font-size: 13px; cursor: pointer; transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) { background: #0078d4; color: #fff; border-color: #0078d4; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 13px; color: var(--text-secondary, #6b7280); }
    .no-data { text-align: center; padding: 60px 20px; color: var(--text-secondary, #6b7280); }
    .no-data-icon { font-size: 60px; margin-bottom: 16px; }
    @media (max-width: 900px) { .balance-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) {
      .balance-grid { grid-template-columns: 1fr; }
      .filter-group { flex-wrap: wrap; }
    }
  `]
})
export class LeaveComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(true);
  leaveData = signal<any[]>([]);
  filteredData = signal<any[]>([]);
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  currentPage = 1;
  pageSize = 10;

  leaveBalances = computed(() => {
    const data = this.leaveData();
    const realLeaves = data.filter(l => l.Remarks !== 'NO LEAVE RECORDS');

    let usedAnnual = 0;
    let usedSick = 0;
    let usedCasual = 0;
    let usedComp = 0;

    realLeaves.forEach(l => {
      const typeName = this.getLeaveTypeName(l);
      const days = parseFloat(l.LeaveDays || l.Days || l.NoOfDays) || 0;
      
      if (typeName === 'Annual Leave') {
        usedAnnual += days;
      } else if (typeName === 'Sick Leave') {
        usedSick += days;
      } else if (typeName === 'Casual Leave') {
        usedCasual += days;
      } else if (typeName === 'Comp Off') {
        usedComp += days;
      }
    });

    const totalAnnual = 21;
    const totalSick = 10;
    const totalCasual = 7;
    const totalComp = 5;

    let annualAvail = totalAnnual - usedAnnual;
    let sickAvail = totalSick - usedSick;
    let casualAvail = totalCasual - usedCasual;
    let compAvail = totalComp - usedComp;

    // Use OData balances directly if they are non-zero
    const odataPl = data.length > 0 && data[0].AnnualBalance !== undefined ? parseFloat(data[0].AnnualBalance) : 0;
    const odataSl = data.length > 0 && data[0].SickBalance !== undefined ? parseFloat(data[0].SickBalance) : 0;
    const odataCl = data.length > 0 && data[0].CasualBalance !== undefined ? parseFloat(data[0].CasualBalance) : 0;

    if (odataPl > 0) annualAvail = odataPl;
    if (odataSl > 0) sickAvail = odataSl;
    if (odataCl > 0) casualAvail = odataCl;

    const finalAnnual = Math.max(0, annualAvail);
    const finalSick = Math.max(0, sickAvail);
    const finalCasual = Math.max(0, casualAvail);
    const finalComp = Math.max(0, compAvail);

    return [
      { type: 'Annual Leave', available: finalAnnual, total: totalAnnual, icon: '🌴', cls: 'icon-blue', ringColor: '#0078d4', pct: Math.round((finalAnnual / totalAnnual) * 100) },
      { type: 'Sick Leave', available: finalSick, total: totalSick, icon: '🏥', cls: 'icon-green', ringColor: '#10b981', pct: Math.round((finalSick / totalSick) * 100) },
      { type: 'Casual Leave', available: finalCasual, total: totalCasual, icon: '☀️', cls: 'icon-orange', ringColor: '#f59e0b', pct: Math.round((finalCasual / totalCasual) * 100) },
      { type: 'Comp Off', available: finalComp, total: totalComp, icon: '🔄', cls: 'icon-purple', ringColor: '#8b5cf6', pct: Math.round((finalComp / totalComp) * 100) },
    ];
  });

  filtered = computed(() => this.filteredData());
  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize));
  paginated = computed(() => this.filtered().slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize));

  ngOnInit(): void { this.loadLeave(); }

  loadLeave(): void {
    const empId = this.auth.currentUser()?.empId;
    if (!empId) return;
    this.loading.set(true);
    this.api.getLeave(empId).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean);
        this.leaveData.set(data);
        this.applyFilter();
      },
      error: () => { this.toast.error('Failed to load leave data'); this.loading.set(false); },
      complete: () => this.loading.set(false),
    });
  }

  onSearch(): void { this.applyFilter(); }

  applyFilter(): void {
    let data = this.leaveData();
    // Exclude placeholder records from display
    data = data.filter(l => l.Remarks !== 'NO LEAVE RECORDS');

    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      data = data.filter(l =>
        this.getLeaveTypeName(l).toLowerCase().includes(s) ||
        (l.Reason || l.ApplyReason || '').toLowerCase().includes(s) ||
        (l.LeaveDesc || '').toLowerCase().includes(s)
      );
    }
    if (this.statusFilter) {
      const s = this.statusFilter.toLowerCase();
      data = data.filter(l => (l.Status || l.ApprovalStatus || l.LeaveStatus || '').toLowerCase().includes(s));
    }
    if (this.typeFilter) {
      const t = this.typeFilter.toLowerCase();
      data = data.filter(l => this.getLeaveTypeName(l).toLowerCase().includes(t));
    }
    this.filteredData.set(data);
    this.currentPage = 1;
  }
  getLeaveTypeName(leave: any): string {
    if (!leave) return '—';
    const type = (leave.LeaveType || leave.Type || '').trim();
    const desc = (leave.LeaveDesc || leave.Reason || leave.Remarks || '').trim();

    // Map by LeaveType code/string first
    if (type === '0300') return 'Annual Leave';
    if (type === '0200') return 'Sick Leave';
    if (type === '0100') return 'Casual Leave';
    if (type.toUpperCase() === 'SL') return 'Sick Leave';
    if (type.toUpperCase() === 'CL') return 'Casual Leave';
    if (type.toUpperCase() === 'AL' || type.toUpperCase() === 'PL') return 'Annual Leave';
    if (type.toUpperCase() === 'LWP') return 'Leave Without Pay';
    if (type === '0720') return 'Unpaid Absence';
    if (type.toLowerCase().includes('comp')) return 'Comp Off';

    // If type is empty or unmapped, fall back to desc
    if (desc) {
      const descLower = desc.toLowerCase();
      if (descLower.includes('sick')) return 'Sick Leave';
      if (descLower.includes('casual')) return 'Casual Leave';
      if (descLower.includes('annual') || descLower.includes('privilege') || descLower.includes('vacation')) return 'Annual Leave';
      if (descLower.includes('comp') || descLower.includes('compensatory')) return 'Comp Off';
      if (descLower.includes('without pay') || descLower.includes('lwp')) return 'Leave Without Pay';
      return desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    return type || '—';
  }


  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('approv')) return 'status-chip status-approved';
    if (s.includes('pend')) return 'status-chip status-pending';
    if (s.includes('reject')) return 'status-chip status-rejected';
    return 'status-chip status-default';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      Annual: '#0078d4', annual: '#0078d4',
      Sick: '#10b981', sick: '#10b981',
      Casual: '#f59e0b', casual: '#f59e0b',
      Comp: '#8b5cf6', comp: '#8b5cf6',
    };
    for (const key of Object.keys(colors)) {
      if ((type || '').toLowerCase().includes(key.toLowerCase())) return colors[key];
    }
    return '#6b7280';
  }

  formatDate(val: string): string {
    if (!val) return '—';
    try {
      const match = val.match(/\/Date\((\d+)\)\//);
      if (match) return new Date(parseInt(match[1])).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return val; }
  }

  private sumField(data: any[], field: string, fallback: number): number {
    if (data.length === 0) return 0;
    const val = data[0][field];
    if (val === undefined || val === null) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }
}
