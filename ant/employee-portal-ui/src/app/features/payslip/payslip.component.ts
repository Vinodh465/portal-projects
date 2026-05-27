import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payslip-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Payslip</h1>
          <p class="page-subtitle">View and download your salary statements</p>
        </div>
        <button class="btn-refresh" (click)="loadPayslip()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spin]="loading()">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div class="skeleton-grid" *ngIf="loading()">
        <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
      </div>

      <ng-container *ngIf="!loading() && payslipData().length > 0">
        <!-- Month & Year Selectors Header -->
        <div class="list-header filter-header">
          <h3 class="list-title">Salary Details Selection</h3>
          <div class="filter-row">
            <div class="selector-wrapper">
              <span class="sel-label">Month</span>
              <select [ngModel]="monthVal" (ngModelChange)="onMonthChange($event)" class="filter-sel">
                <option *ngFor="let m of selectableMonths" [value]="m.value">{{ m.name }}</option>
              </select>
            </div>
            <div class="selector-wrapper">
              <span class="sel-label">Year</span>
              <select [ngModel]="yearVal" (ngModelChange)="onYearChange($event)" class="filter-sel">
                <option *ngFor="let y of selectableYears" [value]="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Before Joining Date Warning -->
        <div class="before-join-box" *ngIf="isBeforeJoin()">
          <div class="before-join-icon">🔒</div>
          <div class="before-join-content">
            <h4>Access Restricted</h4>
            <p>The selected period (<strong>{{ getSelectedMonthName() }} {{ selectedYear() }}</strong>) is prior to the employee's joining date (<strong>{{ formatDate(joinDate()) }}</strong>). Salary details are not available.</p>
          </div>
        </div>

        <!-- No Records Box (After joining date but no data found) -->
        <div class="no-records-box" *ngIf="!isBeforeJoin() && !currentPayslip()">
          <div class="no-records-icon">📭</div>
          <div class="no-records-content">
            <h4>No Record for Selected Period</h4>
            <p>No payslip record was found for the period <strong>{{ getSelectedMonthName() }} {{ selectedYear() }}</strong>.</p>
          </div>
        </div>

        <!-- Salary Summary Cards (Only shown if a payslip matches and it is not before join date) -->
        <div class="summary-grid" *ngIf="!isBeforeJoin() && currentPayslip()">
          <div class="summary-card gross-card">
            <div class="sum-label">Gross Salary</div>
            <div class="sum-value">₹{{ formatCurrency(currentPayslip().GrossSalary || currentPayslip().Gross || 0) }}</div>
            <div class="sum-sub">Earnings for {{ getSelectedMonthName() }} {{ selectedYear() }}</div>
            <div class="sum-icon">💼</div>
          </div>
          <div class="summary-card deduct-card">
            <div class="sum-label">Deductions</div>
            <div class="sum-value">₹{{ formatCurrency(currentPayslip().TotalDeductions || currentPayslip().Deductions || 0) }}</div>
            <div class="sum-sub">Tax, PF & other deductions</div>
            <div class="sum-icon">📉</div>
          </div>
          <div class="summary-card net-card">
            <div class="sum-label">Net Pay</div>
            <div class="sum-value">₹{{ formatCurrency(currentPayslip().NetPay || currentPayslip().NetSalary || 0) }}</div>
            <div class="sum-sub">Amount credited to bank</div>
            <div class="sum-icon">✅</div>
          </div>
        </div>

        <!-- Payslip List -->
        <div class="payslip-list">
          <div class="list-header">
            <h3 class="list-title">Statement for {{ getSelectedMonthName() }} {{ selectedYear() }}</h3>
          </div>

          <div *ngIf="filteredPayslipData().length === 0 && !isBeforeJoin()" class="no-records-box">
            <div class="no-records-icon">📭</div>
            <div class="no-records-content">
              <h4>No Statement Found</h4>
              <p>No payslip statement found for <strong>{{ getSelectedMonthName() }} {{ selectedYear() }}</strong>.</p>
            </div>
          </div>

          <div class="payslip-card" *ngFor="let item of filteredPayslipData(); let i = index" 
               [class.active]="isCurrentPayslip(item)"
               (click)="selectPayslip(item)"
               [style.animation-delay]="i*0.08+'s'">
            <div class="ps-left">
              <div class="ps-month-icon">📄</div>
              <div class="ps-info">
                <div class="ps-period">{{ item.PayPeriod || item.Month || item.Period || formatDate(item.PayDate) }}</div>
                <div class="ps-year">{{ item.PayYear || item.Year || '' }}</div>
              </div>
            </div>
            <div class="ps-mid">
              <div class="ps-stat">
                <span class="ps-stat-label">Gross</span>
                <span class="ps-stat-val">₹{{ formatCurrency(item.GrossSalary || item.Gross || 0) }}</span>
              </div>
              <div class="ps-divider"></div>
              <div class="ps-stat">
                <span class="ps-stat-label">Deductions</span>
                <span class="ps-stat-val deduct">- ₹{{ formatCurrency(item.TotalDeductions || item.Deductions || 0) }}</span>
              </div>
              <div class="ps-divider"></div>
              <div class="ps-stat">
                <span class="ps-stat-label">Net Pay</span>
                <span class="ps-stat-val net">₹{{ formatCurrency(item.NetPay || item.NetSalary || 0) }}</span>
              </div>
            </div>
            <div class="ps-right">
              <span class="ps-badge paid">Paid</span>
              <button class="btn-download" (click)="downloadPdf(item); $event.stopPropagation()" [disabled]="pdfLoading()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spin]="pdfLoading()">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ pdfLoading() ? 'Loading...' : 'Download PDF' }}
              </button>
              <button class="btn-view" (click)="viewPdf(); $event.stopPropagation()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View PDF
              </button>
              <button class="btn-email" (click)="openEmailModal(item); $event.stopPropagation()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email
              </button>
            </div>
          </div>
        </div>

        <!-- Earnings & Deductions Breakdown (Only shown if a payslip matches and it is not before join date) -->
        <div class="breakdown-grid" *ngIf="!isBeforeJoin() && currentPayslip()">
          <div class="breakdown-card earnings">
            <div class="bd-header">
              <h3 class="bd-title">💹 Earnings Breakdown</h3>
              <span class="bd-total">₹{{ formatCurrency(currentPayslip().GrossSalary || currentPayslip().Gross || 0) }}</span>
            </div>
            <div class="bd-rows">
              <div class="bd-row" *ngFor="let e of getEarnings(currentPayslip())">
                <span class="bd-label">{{ e.label }}</span>
                <span class="bd-amount">₹{{ formatCurrency(e.amount) }}</span>
              </div>
            </div>
          </div>
          <div class="breakdown-card deductions">
            <div class="bd-header">
              <h3 class="bd-title">📊 Deductions Breakdown</h3>
              <span class="bd-total deduct">₹{{ formatCurrency(currentPayslip().TotalDeductions || currentPayslip().Deductions || 0) }}</span>
            </div>
            <div class="bd-rows">
              <div class="bd-row" *ngFor="let d of getDeductions(currentPayslip())">
                <span class="bd-label">{{ d.label }}</span>
                <span class="bd-amount deduct">₹{{ formatCurrency(d.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <div class="no-data" *ngIf="!loading() && payslipData().length === 0">
        <div class="no-data-icon">💰</div>
        <h3>No Payslip Data Found</h3>
        <p>No payslip records found for Employee ID: {{ formatEmpId(auth.currentUser()?.empId) }}</p>
      </div>

      <!-- Email Modal Overlay -->
      <div class="modal-overlay" *ngIf="showEmailModal()" (click)="closeEmailModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">📧 Email Payslip</h3>
            <button class="close-btn" (click)="closeEmailModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="modal-tabs">
              <button class="tab-btn" [class.active]="activeTab === 'portal'" (click)="activeTab = 'portal'">Send via Portal</button>
              <button class="tab-btn" [class.active]="activeTab === 'client'" (click)="activeTab = 'client'">Open in Laptop Mail App</button>
            </div>

            <div class="tab-content" *ngIf="activeTab === 'portal'">
              <p class="modal-desc">
                Send the payslip PDF for <strong>{{ emailTargetMonthName() }} {{ emailTargetYear() }}</strong> using the portal's mail system.
              </p>
              
              <div class="form-group">
                <label for="modal-email" class="input-label">Recipient's Email Address</label>
                <input
                  type="email"
                  id="modal-email"
                  [(ngModel)]="emailAddressInput"
                  placeholder="Enter email address"
                  class="email-input"
                  [disabled]="sendingEmail()"
                />
              </div>

              <!-- Status Alert -->
              <div class="modal-alert" [class]="emailAlertClass()" *ngIf="emailAlertMessage()">
                {{ emailAlertMessage() }}
              </div>
            </div>

            <div class="tab-content" *ngIf="activeTab === 'client'">
              <p class="modal-desc">
                Open your mail client or compose a new email in your web browser.
              </p>
              
              <button class="btn-open-client" (click)="sendEmailNative()">
                🚀 Launch Laptop Mail App
              </button>
              
              <div class="webmail-links" style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                <p class="client-help-text" style="text-align: left; margin-bottom: 4px; font-weight: 600; color: var(--text-secondary, #4b5563);">
                  Or use Webmail:
                </p>
                <div style="display: flex; gap: 10px;">
                  <button class="btn-webmail gmail-btn" (click)="openGmailWeb()" style="flex: 1; padding: 10px; background: #ea4335; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    ✉️ Gmail Web
                  </button>
                  <button class="btn-webmail outlook-btn" (click)="openOutlookWeb()" style="flex: 1; padding: 10px; background: #0078d4; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    ✉️ Outlook Web
                  </button>
                </div>
              </div>
              
              <p class="client-help-text" style="margin-top: 14px;">
                Note: Don't forget to attach your downloaded payslip PDF!
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeEmailModal()" [disabled]="sendingEmail()">Cancel</button>
            <button class="btn-send" *ngIf="activeTab === 'portal'" (click)="sendEmail()" [disabled]="sendingEmail() || !isValidEmail(emailAddressInput)">
              <span class="spinner" *ngIf="sendingEmail()"></span>
              {{ sendingEmail() ? 'Sending...' : 'Send Email' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payslip-page { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .page-title { font-size: 26px; font-weight: 800; color: var(--text-primary, #111827); margin: 0; }
    .page-subtitle { font-size: 14px; color: var(--text-secondary, #6b7280); margin: 4px 0 0; }
    .btn-refresh {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px; font-size: 13px; font-weight: 600;
      color: var(--text-primary, #374151); cursor: pointer;
    }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Skeleton */
    .skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .skeleton-card { height: 120px; border-radius: 14px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { to { background-position: -200% 0; } }
    
    /* Summary Cards */
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .summary-card {
      border-radius: 16px; padding: 24px;
      position: relative; overflow: hidden;
      animation: fadeUp 0.4s ease-out both;
    }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .gross-card { background: linear-gradient(135deg, #0078d4, #106ebe); color: #fff; }
    .deduct-card { background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; }
    .net-card { background: linear-gradient(135deg, #059669, #047857); color: #fff; }
    .sum-label { font-size: 13px; opacity: 0.8; margin-bottom: 8px; }
    .sum-value { font-size: 30px; font-weight: 800; margin-bottom: 4px; }
    .sum-sub { font-size: 12px; opacity: 0.7; }
    .sum-icon { position: absolute; right: 20px; top: 20px; font-size: 36px; opacity: 0.2; }
    
    /* Filters */
    .filter-header { margin-bottom: 20px !important; }
    .filter-row { display: flex; gap: 16px; align-items: center; }
    .selector-wrapper { display: flex; align-items: center; gap: 8px; }
    .sel-label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #6b7280); text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-sel { padding: 8px 12px; border: 1px solid var(--border-color, #e5e7eb); border-radius: 7px; font-size: 13px; background: var(--card-bg, #fff); color: var(--text-primary, #374151); outline: none; transition: border-color 0.2s; }
    .filter-sel:focus { border-color: #0078d4; }
    
    /* Access restrictions & Info alerts */
    .before-join-box, .no-records-box {
      display: flex; align-items: center; gap: 20px;
      background: rgba(245, 158, 11, 0.05);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 16px; padding: 24px; margin-bottom: 24px;
      backdrop-filter: blur(8px); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.03);
      animation: fadeUp 0.4s ease-out;
    }
    .no-records-box {
      background: rgba(107, 114, 128, 0.05);
      border-color: rgba(107, 114, 128, 0.2);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    }
    .before-join-icon, .no-records-icon {
      font-size: 30px; display: flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
      background: rgba(245, 158, 11, 0.1);
    }
    .no-records-icon { background: rgba(107, 114, 128, 0.1); }
    .before-join-content h4, .no-records-content h4 { margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: var(--text-primary, #111827); }
    .before-join-content p, .no-records-content p { margin: 0; font-size: 14px; color: var(--text-secondary, #6b7280); line-height: 1.5; }
    
    /* Payslip List */
    .payslip-list { margin-bottom: 24px; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .list-title { font-size: 17px; font-weight: 700; color: var(--text-primary, #111827); margin: 0; }
    .payslip-card {
      background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 12px; padding: 20px 24px;
      display: flex; align-items: center; gap: 20px;
      margin-bottom: 12px; cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      animation: fadeUp 0.4s ease-out both;
      transition: all 0.2s;
    }
    .payslip-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .payslip-card.active { border-color: #0078d4; background: rgba(0, 120, 212, 0.02); box-shadow: 0 4px 15px rgba(0, 120, 212, 0.05); }
    .ps-left { display: flex; align-items: center; gap: 14px; min-width: 160px; }
    .ps-month-icon { font-size: 28px; }
    .ps-period { font-size: 15px; font-weight: 700; color: var(--text-primary, #111827); }
    .ps-year { font-size: 12px; color: var(--text-secondary, #6b7280); }
    .ps-mid { flex: 1; display: flex; align-items: center; gap: 16px; justify-content: center; }
    .ps-divider { width: 1px; height: 36px; background: var(--border-color, #e5e7eb); }
    .ps-stat { text-align: center; }
    .ps-stat-label { display: block; font-size: 11px; color: var(--text-secondary, #6b7280); margin-bottom: 4px; }
    .ps-stat-val { font-size: 15px; font-weight: 700; color: var(--text-primary, #111827); }
    .ps-stat-val.deduct { color: #dc2626; }
    .ps-stat-val.net { color: #059669; }
    
    .ps-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .ps-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .ps-badge.paid { background: rgba(16,185,129,0.1); color: #059669; }
    .btn-download, .btn-view, .btn-email {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 7px;
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      border: 1px solid var(--border-color, #e5e7eb);
    }
    .btn-download { background: #0078d4; color: #fff; border-color: #0078d4; }
    .btn-download:hover:not(:disabled) { background: #106ebe; }
    .btn-download:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-view { background: var(--card-bg, #fff); color: var(--text-primary, #374151); }
    .btn-view:hover { background: var(--bg-secondary, #f3f4f6); }
    .btn-email { border-color: rgba(139, 92, 246, 0.2); background: rgba(139, 92, 246, 0.08); color: #7c3aed; }
    .btn-email:hover { background: #7c3aed; color: #fff; border-color: #7c3aed; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2); }
    
    /* Breakdown */
    .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .breakdown-card {
      background: var(--card-bg, #fff);
      border-radius: 14px; padding: 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }
    .bd-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border-color, #f3f4f6); }
    .bd-title { font-size: 15px; font-weight: 700; color: var(--text-primary, #111827); margin: 0; }
    .bd-total { font-size: 18px; font-weight: 800; color: #059669; }
    .bd-total.deduct { color: #dc2626; }
    .bd-rows { display: flex; flex-direction: column; gap: 10px; }
    .bd-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--border-color, #f3f4f6); }
    .bd-row:last-child { border-bottom: none; }
    .bd-label { font-size: 13px; color: var(--text-secondary, #6b7280); }
    .bd-amount { font-size: 13px; font-weight: 700; color: #059669; }
    .bd-amount.deduct { color: #dc2626; }
    .no-data { text-align: center; padding: 60px 20px; color: var(--text-secondary, #6b7280); }
    .no-data-icon { font-size: 60px; margin-bottom: 16px; }
    
    /* Email Modal overlay */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px); display: flex; align-items: center;
      justify-content: center; z-index: 1000; animation: fadeIn 0.25s ease-out;
    }
    .modal-card {
      background: var(--card-bg, #fff); border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 20px; width: 90%; max-width: 485px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden; animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color, #f3f4f6); display: flex; justify-content: space-between; align-items: center; }
    .modal-title { margin: 0; font-size: 17px; font-weight: 800; color: var(--text-primary, #111827); }
    .close-btn { background: none; border: none; font-size: 24px; line-height: 1; cursor: pointer; color: var(--text-secondary, #9ca3af); }
    .close-btn:hover { color: var(--text-primary, #111827); }
    .modal-body { padding: 24px; }
    .modal-desc { margin: 0 0 20px; font-size: 14px; color: var(--text-secondary, #4b5563); line-height: 1.5; }
    .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .input-label { font-size: 12px; font-weight: 700; color: var(--text-secondary, #4b5563); }
    .email-input { padding: 12px 16px; border: 1.5px solid var(--border-color, #e5e7eb); border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); }
    .email-input:focus { border-color: #0078d4; box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.1); }
    .modal-alert { padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; line-height: 1.4; margin-top: 12px; }
    .alert-success { background: rgba(16, 185, 129, 0.08); color: #059669; border: 1px solid rgba(16, 185, 129, 0.15); }
    .alert-error { background: rgba(239, 68, 68, 0.08); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.15); }
    .modal-footer { padding: 16px 24px; background: var(--bg-secondary, #f9fafb); border-top: 1px solid var(--border-color, #f3f4f6); display: flex; justify-content: flex-end; gap: 12px; }
    .btn-cancel, .btn-send { padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-cancel { border: 1px solid var(--border-color, #e5e7eb); background: var(--card-bg, #fff); color: var(--text-secondary, #4b5563); }
    .btn-cancel:hover:not(:disabled) { background: var(--bg-secondary, #f3f4f6); }
    .btn-send { border: none; background: #0078d4; color: #fff; display: flex; align-items: center; gap: 8px; }
    .btn-send:hover:not(:disabled) { background: #106ebe; }
    .btn-send:disabled { opacity: 0.55; cursor: not-allowed; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    
    /* Modal Tabs & Open Client Button */
    .modal-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border-color, #e5e7eb); margin-bottom: 20px; }
    .tab-btn { background: none; border: none; padding: 10px 16px; font-size: 13px; font-weight: 600; color: var(--text-secondary, #6b7280); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
    .tab-btn:hover { color: var(--text-primary, #111827); }
    .tab-btn.active { color: #0078d4; border-bottom-color: #0078d4; }
    
    .btn-open-client { width: 100%; padding: 12px; background: #0078d4; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-open-client:hover { background: #106ebe; }
    .client-help-text { font-size: 11px; color: var(--text-secondary, #9ca3af); margin-top: 10px; text-align: center; }
    
    @media (max-width: 900px) {
      .summary-grid { grid-template-columns: 1fr; }
      .breakdown-grid { grid-template-columns: 1fr; }
      .payslip-card { flex-direction: column; align-items: flex-start; }
      .ps-mid { flex-wrap: wrap; justify-content: flex-start; width: 100%; }
      .ps-right { width: 100%; justify-content: flex-end; }
    }
  `]
})
export class PayslipComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  pdfLoading = signal(false);
  payslipData = signal<any[]>([]);

  // Selection states
  monthVal = new Date().getMonth() + 1;
  yearVal = new Date().getFullYear();
  selectedMonth = signal<number>(this.monthVal);
  selectedYear = signal<number>(this.yearVal);

  joinDate = signal<string>('');
  emailAddress = signal<string>('');

  // Email modal states
  showEmailModal = signal(false);
  sendingEmail = signal(false);
  emailAddressInput = '';
  emailTargetItem: any = null;
  emailAlertMessage = signal('');
  emailAlertClass = signal('');
  activeTab = 'portal';



  selectableMonths = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  selectableYears = [2023, 2024, 2025, 2026, 2027];

  // Filtered payslip data based on selected month and year
  filteredPayslipData = computed(() => {
    const mStr = String(this.selectedMonth()).padStart(2, '0');
    const yStr = String(this.selectedYear());
    
    return this.payslipData().filter(p => {
      const pm = String(p.PayMonth || p.Month || '').padStart(2, '0');
      const py = String(p.PayYear || p.Year || '');
      return pm === mStr && py === yStr;
    });
  });

  // Selected active payslip
  currentPayslip = computed(() => {
    const filtered = this.filteredPayslipData();
    return filtered.length > 0 ? filtered[0] : undefined;
  });

  // Access restrictions check
  isBeforeJoin = computed(() => {
    return this.isBeforeJoinDate(this.selectedMonth(), this.selectedYear());
  });

  ngOnInit(): void {
    this.loadPayslip();
    this.loadEmployeeDetails();
  }

  loadEmployeeDetails(): void {
    const empId = this.auth.currentUser()?.empId;
    if (!empId) return;
    this.api.getDashboard(empId).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          this.joinDate.set(data.JoinDate || '');
          this.emailAddress.set(data.EmailId || '');
        }
      },
      error: () => {}
    });
  }

  loadPayslip(): void {
    const empId = this.auth.currentUser()?.empId;
    if (!empId) return;
    this.loading.set(true);
    this.api.getPayslip(empId).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean);
        this.payslipData.set(data);
        if (data.length > 0) {
          // Default to the first (latest) payslip month and year
          const latest = data[0];
          const m = parseInt(latest.PayMonth || latest.Month, 10);
          const y = parseInt(latest.PayYear || latest.Year, 10);
          if (!isNaN(m)) {
            this.monthVal = m;
            this.selectedMonth.set(m);
          }
          if (!isNaN(y)) {
            this.yearVal = y;
            this.selectedYear.set(y);
          }
        }
      },
      error: () => { this.toast.error('Failed to load payslip data'); this.loading.set(false); },
      complete: () => this.loading.set(false),
    });
  }

  onMonthChange(m: number): void {
    this.monthVal = m;
    this.selectedMonth.set(m);
  }

  onYearChange(y: number): void {
    this.yearVal = y;
    this.selectedYear.set(y);
  }

  selectPayslip(item: any): void {
    const m = parseInt(item.PayMonth || item.Month, 10);
    const y = parseInt(item.PayYear || item.Year, 10);
    if (!isNaN(m)) {
      this.monthVal = m;
      this.selectedMonth.set(m);
    }
    if (!isNaN(y)) {
      this.yearVal = y;
      this.selectedYear.set(y);
    }
  }

  isCurrentPayslip(item: any): boolean {
    const m = parseInt(item.PayMonth || item.Month, 10);
    const y = parseInt(item.PayYear || item.Year, 10);
    return m === this.selectedMonth() && y === this.selectedYear();
  }

  downloadPdf(item: any): void {
    const empId = this.auth.currentUser()?.empId;
    if (!empId) return;
    this.pdfLoading.set(true);
    const m = String(item.PayMonth || item.Month || '').padStart(2, '0');
    const y = String(item.PayYear || item.Year || '');
    this.api.getPayslipPdf(empId, m, y).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filenameMonth = String(item.PayMonth || item.Month || 'payslip').padStart(2, '0');
        const filenameYear = item.PayYear || item.Year || '';
        a.download = `payslip_${empId}_${filenameYear}_${filenameMonth}.pdf`;
        a.click(); URL.revokeObjectURL(url);
        this.toast.success('Payslip downloaded successfully');
      },
      error: () => { this.toast.error('Failed to download PDF'); this.pdfLoading.set(false); },
      complete: () => this.pdfLoading.set(false),
    });
  }

  viewPdf(): void {
    const empId = this.auth.currentUser()?.empId;
    this.router.navigate(['/portal/payslip/pdf', empId], {
      queryParams: {
        month: String(this.selectedMonth()).padStart(2, '0'),
        year: String(this.selectedYear())
      }
    });
  }

  // Email Modal operations
  openEmailModal(item: any): void {
    this.emailTargetItem = item;
    this.emailAddressInput = this.emailAddress() || this.auth.currentUser()?.email || '';
    this.emailAlertMessage.set('');
    this.emailAlertClass.set('');
    this.activeTab = 'portal';
    this.showEmailModal.set(true);
  }

  closeEmailModal(): void {
    if (this.sendingEmail()) return;
    this.showEmailModal.set(false);
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  sendEmail(): void {
    if (!this.isValidEmail(this.emailAddressInput) || !this.emailTargetItem) return;
    this.sendingEmail.set(true);
    this.emailAlertMessage.set('');
    
    const empId = this.auth.currentUser()?.empId;
    if (!empId) return;

    const m = this.emailTargetItem.PayMonth || this.emailTargetItem.Month;
    const y = this.emailTargetItem.PayYear || this.emailTargetItem.Year;

    this.api.sendPayslipEmail(empId, this.emailAddressInput, m, y).subscribe({
      next: (res) => {
        this.sendingEmail.set(false);
        if (res.data?.fallback) {
          this.emailAlertClass.set('alert-error');
          this.emailAlertMessage.set(`SMTP connection failed (${res.data.smtpError || 'Timeout'}). Email saved locally in sent_emails/ directory. Please use "Open in Laptop Mail App" to send.`);
          this.toast.warning('SMTP Failed: Payslip saved locally');
        } else if (res.data?.mock) {
          this.emailAlertClass.set('alert-success');
          this.emailAlertMessage.set('Email saved locally in Mock Mode! (PDF saved in backend sent_emails/ directory)');
          this.toast.success('Saved in backend sent_emails/ (Mock Mode)');
          setTimeout(() => this.closeEmailModal(), 3000);
        } else {
          this.emailAlertClass.set('alert-success');
          this.emailAlertMessage.set('Payslip email sent successfully via SMTP!');
          this.toast.success('Email sent successfully!');
          setTimeout(() => this.closeEmailModal(), 3000);
        }
      },
      error: (err) => {
        this.sendingEmail.set(false);
        this.emailAlertClass.set('alert-error');
        this.emailAlertMessage.set(err?.error?.message || 'Failed to send payslip email.');
        this.toast.error('Failed to send email');
      }
    });
  }

  sendEmailNative(): void {
    if (!this.emailTargetItem) return;
    const m = parseInt(this.emailTargetItem.PayMonth || this.emailTargetItem.Month, 10);
    const year = this.emailTargetItem.PayYear || this.emailTargetItem.Year || '';
    const monthName = this.selectableMonths.find(sm => sm.value === m)?.name || `Month ${m}`;

    // Random bodies list
    const bodies = [
      `Hi,\n\nPlease find my salary statement details for ${monthName} ${year} as requested.\n\nThanks and regards.`,
      `Hello,\n\nI am sharing the payslip summary for the month of ${monthName} ${year} with you.\n\nBest regards.`,
      `Dear team,\n\nHere is my salary payslip record for ${monthName} ${year}.\n\nThank you.`,
      `Hello there,\n\nSharing the salary slip document info for the period of ${monthName} ${year}.\n\nSincerely.`
    ];

    const randomBody = bodies[Math.floor(Math.random() * bodies.length)];
    const subject = encodeURIComponent(`Salary Payslip - ${monthName} ${year}`);
    const body = encodeURIComponent(randomBody);

    // Launch native client with blank To, prefilled subject & random body
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  openGmailWeb(): void {
    if (!this.emailTargetItem) return;
    const m = parseInt(this.emailTargetItem.PayMonth || this.emailTargetItem.Month, 10);
    const year = this.emailTargetItem.PayYear || this.emailTargetItem.Year || '';
    const monthName = this.selectableMonths.find(sm => sm.value === m)?.name || `Month ${m}`;

    const subject = encodeURIComponent(`Salary Payslip - ${monthName} ${year}`);
    const body = encodeURIComponent(`Hi,\n\nPlease find my salary statement details for ${monthName} ${year} as requested.\n\nThanks and regards.`);
    
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  }

  openOutlookWeb(): void {
    if (!this.emailTargetItem) return;
    const m = parseInt(this.emailTargetItem.PayMonth || this.emailTargetItem.Month, 10);
    const year = this.emailTargetItem.PayYear || this.emailTargetItem.Year || '';
    const monthName = this.selectableMonths.find(sm => sm.value === m)?.name || `Month ${m}`;

    const subject = encodeURIComponent(`Salary Payslip - ${monthName} ${year}`);
    const body = encodeURIComponent(`Hi,\n\nPlease find my salary statement details for ${monthName} ${year} as requested.\n\nThanks and regards.`);
    
    window.open(`https://outlook.live.com/owa/?path=/mail/action/compose&subject=${subject}&body=${body}`, '_blank');
  }

  emailTargetMonthName(): string {
    if (!this.emailTargetItem) return '';
    const m = parseInt(this.emailTargetItem.PayMonth || this.emailTargetItem.Month, 10);
    const found = this.selectableMonths.find(sm => sm.value === m);
    return found ? found.name : '';
  }

  emailTargetYear(): string {
    if (!this.emailTargetItem) return '';
    return this.emailTargetItem.PayYear || this.emailTargetItem.Year || '';
  }

  getJoinDateParts(): { month: number; year: number } | null {
    const dateStr = this.joinDate();
    if (!dateStr) return null;

    try {
      const match = dateStr.match(/\/Date\((\d+)\)\//);
      if (match) {
        const d = new Date(parseInt(match[1]));
        return { month: d.getMonth() + 1, year: d.getFullYear() };
      }

      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          if (month <= 12) {
            return { month, year };
          } else if (day <= 12) {
            return { month: day, year };
          }
        }
      }

      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return { month: d.getMonth() + 1, year: d.getFullYear() };
      }
    } catch (e) {}
    return null;
  }

  isBeforeJoinDate(selectedMonth: number, selectedYear: number): boolean {
    const joinParts = this.getJoinDateParts();
    if (!joinParts) return false;

    if (selectedYear < joinParts.year) return true;
    if (selectedYear === joinParts.year && selectedMonth < joinParts.month) return true;
    return false;
  }

  getSelectedMonthName(): string {
    const found = this.selectableMonths.find(m => m.value === this.selectedMonth());
    return found ? found.name : '';
  }


  getEarnings(item: any) {
    return [
      { label: 'Basic Salary', amount: item.BasicSalary || item.Basic || 0 },
      { label: 'HRA', amount: item.HRA || 0 },
      { label: 'Conveyance Allowance', amount: item.Conveyance || item.ConvAllowance || 0 },
      { label: 'Medical Allowance', amount: item.MedicalAllowance || item.Medical || 0 },
      { label: 'Special Allowance', amount: item.SpecialAllowance || item.Special || 0 },
      { label: 'Other Allowances', amount: item.OtherAllowances || item.Others || 0 },
    ].filter(e => parseFloat(e.amount) > 0);
  }

  getDeductions(item: any) {
    return [
      { label: 'Professional Tax', amount: item.ProfTax || item.ProfessionalTax || 0 },
      { label: 'Provident Fund (PF)', amount: item.PF || item.ProvidentFund || 0 },
      { label: 'ESI', amount: item.ESI || 0 },
      { label: 'TDS / Income Tax', amount: item.TDS || item.IncomeTax || 0 },
      { label: 'Loan Deduction', amount: item.LoanDeduction || item.Loan || 0 },
      { label: 'Other Deductions', amount: item.OtherDeductions || item.OtherDeduct || 0 },
    ].filter(d => parseFloat(d.amount) > 0);
  }

  formatCurrency(val: number | string): string {
    const n = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(n) ? '0' : n.toLocaleString('en-IN');
  }

  formatDate(val: string): string {
    if (!val) return '—';
    try {
      const match = val.match(/\/Date\((\d+)\)\//);
      if (match) return new Date(parseInt(match[1])).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return val; }
  }

  formatEmpId(empId?: string): string {
    if (!empId) return '';
    return empId.replace(/^0+/, '');
  }
}
