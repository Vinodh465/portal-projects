import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back, <strong>{{ auth.currentUser()?.name }}</strong> · {{ today }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" (click)="loadDashboard()" [disabled]="loading()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spin]="loading()">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading Skeletons -->
      <ng-container *ngIf="loading()">
        <div class="kpi-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
        </div>
        <div class="content-grid">
          <div class="skeleton-card tall"></div>
          <div class="skeleton-card tall"></div>
        </div>
      </ng-container>

      <!-- KPI Cards -->
      <ng-container *ngIf="!loading() && dashData().length > 0">
        <div class="kpi-grid">
          <div class="kpi-card" *ngFor="let item of getSummaryCards(); let i = index"
               [style.animation-delay]="i * 0.1 + 's'">
            <div class="kpi-header">
              <div class="kpi-icon" [class]="'icon-' + item.color">{{ item.icon }}</div>
              <div class="kpi-trend" [class.up]="item.trend > 0" [class.down]="item.trend < 0">
                {{ item.trend > 0 ? '↑' : '↓' }} {{ item.trendLabel }}
              </div>
            </div>
            <div class="kpi-value">{{ item.value }}</div>
            <div class="kpi-label">{{ item.label }}</div>
            <div class="kpi-bar">
              <div class="kpi-bar-fill" [class]="'bar-' + item.color" [style.width]="item.pct + '%'"></div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Employee Info Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">👤</span> Employee Overview
              </h3>
              <a routerLink="/portal/profile" class="card-link">View Profile →</a>
            </div>
            <div class="emp-info-grid" *ngFor="let item of dashData().slice(0,1)">
              <div class="emp-avatar">
                {{ getInitials(item.EmpName || item.Name || '') }}
              </div>
              <div class="emp-details">
                <h2 class="emp-name">{{ item.EmpName || item.Name || auth.currentUser()?.name }}</h2>
              </div>
              <div class="emp-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ item.LeaveBalance || item.AvailableLeave || '—' }}</span>
                  <span class="stat-label">Leave Balance</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Leave Summary Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title"><span class="card-icon">🗓️</span> Leave Summary</h3>
              <a routerLink="/portal/leave" class="card-link">Manage Leave →</a>
            </div>
            <div class="leave-summary" *ngFor="let item of dashData().slice(0,1)">
              <div class="leave-type-row" *ngFor="let lt of getLeaveTypes(item)">
                <div class="leave-type-info">
                  <span class="leave-dot" [style.background]="lt.color"></span>
                  <span class="leave-type-name">{{ lt.name }}</span>
                </div>
                <div class="leave-progress-wrap">
                  <div class="leave-progress-bar">
                    <div class="leave-progress-fill" [style.width]="lt.pct + '%'" [style.background]="lt.color"></div>
                  </div>
                  <span class="leave-count">{{ lt.used }}/{{ lt.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Salary Overview -->
        <div class="salary-card" *ngFor="let item of dashData().slice(0,1)">
          <div class="card-header">
            <h3 class="card-title"><span class="card-icon">💰</span> Salary Overview</h3>
            <a routerLink="/portal/payslip" class="card-link">View Payslip →</a>
          </div>
          <div class="salary-grid">
            <div class="salary-item gross">
              <div class="salary-label">Gross Salary</div>
              <div class="salary-value">₹{{ formatCurrency(item.GrossSalary || item.Gross || 0) }}</div>
            </div>
            <div class="salary-item deductions">
              <div class="salary-label">Total Deductions</div>
              <div class="salary-value deduct">- ₹{{ formatCurrency(item.TotalDeductions || item.Deductions || 0) }}</div>
            </div>
            <div class="salary-item net">
              <div class="salary-label">Net Pay</div>
              <div class="salary-value net-pay">₹{{ formatCurrency(item.NetPay || item.NetSalary || 0) }}</div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- No Data -->
      <div class="no-data" *ngIf="!loading() && dashData().length === 0">
        <div class="no-data-icon">📭</div>
        <h3>No Dashboard Data</h3>
        <p>Could not fetch data for Employee ID: {{ formatEmpId(auth.currentUser()?.empId) }}</p>
        <button class="btn-refresh" (click)="loadDashboard()">Try Again</button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1400px; margin: 0 auto; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }
    .page-title {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary, #111827);
      margin: 0;
    }
    .page-subtitle {
      font-size: 14px;
      color: var(--text-secondary, #6b7280);
      margin: 4px 0 0;
    }
    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #374151);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-refresh:hover { background: var(--bg-secondary, #f9fafb); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    /* Skeletons */
    .skeleton-card {
      height: 140px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 16px;
    }
    .skeleton-card.tall { height: 280px; }
    @keyframes shimmer { to { background-position: -200% 0; } }
    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--card-bg, #fff);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      animation: fadeUp 0.5s ease-out both;
      transition: all 0.2s;
    }
    .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .kpi-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .icon-blue { background: rgba(0,120,212,0.12); }
    .icon-green { background: rgba(16,185,129,0.12); }
    .icon-purple { background: rgba(139,92,246,0.12); }
    .icon-orange { background: rgba(245,158,11,0.12); }
    .kpi-trend { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
    .kpi-trend.up { background: rgba(16,185,129,0.12); color: #059669; }
    .kpi-trend.down { background: rgba(220,38,38,0.12); color: #dc2626; }
    .kpi-value { font-size: 28px; font-weight: 800; color: var(--text-primary, #111827); }
    .kpi-label { font-size: 13px; color: var(--text-secondary, #6b7280); margin-top: 4px; }
    .kpi-bar { height: 4px; background: var(--bg-secondary, #f3f4f6); border-radius: 2px; margin-top: 12px; }
    .kpi-bar-fill { height: 100%; border-radius: 2px; transition: width 1s ease; }
    .bar-blue { background: #0078d4; }
    .bar-green { background: #10b981; }
    .bar-purple { background: #8b5cf6; }
    .bar-orange { background: #f59e0b; }
    /* Content Grid */
    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .info-card, .salary-card {
      background: var(--card-bg, #fff);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color, #f3f4f6);
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary, #111827);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-icon { font-size: 18px; }
    .card-link { font-size: 12px; color: #0078d4; text-decoration: none; font-weight: 600; }
    .card-link:hover { text-decoration: underline; }
    /* Employee Info */
    .emp-info-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .emp-avatar {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0078d4, #50e6ff);
      color: #fff;
      font-size: 22px;
      font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      align-self: center;
    }
    .emp-name { font-size: 18px; font-weight: 700; color: var(--text-primary, #111827); margin: 0 0 4px; text-align: center; }
    .emp-meta { font-size: 13px; color: var(--text-secondary, #6b7280); margin: 2px 0; text-align: center; }
    .emp-details { text-align: center; }
    .emp-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color, #f3f4f6);
    }
    .stat-item { text-align: center; }
    .stat-value { display: block; font-size: 20px; font-weight: 800; color: #0078d4; }
    .stat-label { font-size: 11px; color: var(--text-secondary, #6b7280); }
    /* Leave Summary */
    .leave-summary { display: flex; flex-direction: column; gap: 14px; }
    .leave-type-row { display: flex; flex-direction: column; gap: 6px; }
    .leave-type-info { display: flex; align-items: center; gap: 8px; }
    .leave-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .leave-type-name { font-size: 13px; font-weight: 600; color: var(--text-primary, #111827); }
    .leave-progress-wrap { display: flex; align-items: center; gap: 10px; }
    .leave-progress-bar {
      flex: 1; height: 6px;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 3px; overflow: hidden;
    }
    .leave-progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
    .leave-count { font-size: 12px; color: var(--text-secondary, #6b7280); white-space: nowrap; }
    /* Salary */
    .salary-card { margin-bottom: 24px; }
    .salary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .salary-item { text-align: center; padding: 20px; border-radius: 12px; }
    .salary-item.gross { background: rgba(0,120,212,0.06); }
    .salary-item.deductions { background: rgba(220,38,38,0.06); }
    .salary-item.net { background: rgba(16,185,129,0.06); }
    .salary-label { font-size: 12px; color: var(--text-secondary, #6b7280); margin-bottom: 8px; }
    .salary-value { font-size: 22px; font-weight: 800; color: var(--text-primary, #111827); }
    .salary-value.deduct { color: #dc2626; }
    .salary-value.net-pay { color: #059669; }
    /* No Data */
    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary, #6b7280);
    }
    .no-data-icon { font-size: 60px; margin-bottom: 16px; }
    /* Responsive */
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .content-grid { grid-template-columns: 1fr; }
      .salary-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(true);
  dashData = signal<any[]>([]);
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit(): void { this.loadDashboard(); }

  loadDashboard(): void {
    const empId = this.auth.currentUser()?.empId;
    if (!empId) return;
    this.loading.set(true);
    this.api.getDashboard(empId).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        this.dashData.set(data.filter(Boolean));
      },
      error: (err) => {
        this.toast.error('Failed to load dashboard data');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  getSummaryCards() {
    const d = this.dashData()[0] || {};
    return [
      { label: 'Leave Balance', value: d.LeaveBalance || d.AvailableLeave || '—', icon: '🗓️', color: 'blue', trend: 1, trendLabel: 'days', pct: 70 },
      { label: 'Net Salary', value: '₹' + this.formatCurrency(d.NetPay || d.NetSalary || 0), icon: '💰', color: 'purple', trend: 1, trendLabel: 'vs last month', pct: 85 },
    ];
  }

  getLeaveTypes(item: any) {
    const annualUsed = item.AnnualLeaveUsed !== undefined && item.AnnualLeaveUsed !== null ? item.AnnualLeaveUsed : 0;
    const sickUsed = item.SickLeaveUsed !== undefined && item.SickLeaveUsed !== null ? item.SickLeaveUsed : 0;
    const casualUsed = item.CasualLeaveUsed !== undefined && item.CasualLeaveUsed !== null ? item.CasualLeaveUsed : 0;

    const annualTotal = item.AnnualLeaveTotal || 0;
    const sickTotal = item.SickLeaveTotal || 0;
    const casualTotal = item.CasualLeaveTotal || 0;

    return [
      { name: 'Annual Leave', used: annualUsed, total: annualTotal, color: '#0078d4', pct: annualTotal ? (annualUsed / annualTotal) * 100 : 0 },
      { name: 'Sick Leave', used: sickUsed, total: sickTotal, color: '#10b981', pct: sickTotal ? (sickUsed / sickTotal) * 100 : 0 },
      { name: 'Casual Leave', used: casualUsed, total: casualTotal, color: '#f59e0b', pct: casualTotal ? (casualUsed / casualTotal) * 100 : 0 },
    ];
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'EP';
  }

  formatEmpId(empId?: string): string {
    if (!empId) return '';
    return empId.replace(/^0+/, '');
  }

  formatCurrency(val: number | string): string {
    const n = parseFloat(String(val).replace(/,/g, ''));
    if (isNaN(n)) return '0';
    return n.toLocaleString('en-IN');
  }
}
