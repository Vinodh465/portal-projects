import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page">
      <!-- Loading Skeleton -->
      <div class="skeleton-profile" *ngIf="loading()">
        <div class="skeleton-header"></div>
        <div class="skeleton-body">
          <div class="skeleton-line" *ngFor="let i of [1,2,3,4,5,6]"></div>
        </div>
      </div>

      <ng-container *ngIf="!loading() && profile()">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-banner"></div>
          <div class="profile-header-content">
            <div class="profile-avatar-wrap">
              <div class="profile-avatar">{{ getInitials() }}</div>
              <div class="avatar-status"></div>
            </div>
            <div class="profile-identity">
              <h1 class="profile-name">{{ profile().EmpName || profile().Name || auth.currentUser()?.name }}</h1>
              <p class="profile-designation">{{ profile().Designation || profile().DesignationText || auth.currentUser()?.designation }}</p>
              <div class="profile-badges">
                <span class="badge badge-dept">{{ profile().Department || profile().DeptText || auth.currentUser()?.department }}</span>
                <span class="badge badge-id">ID: {{ formatEmpId(profile().EmpId || auth.currentUser()?.empId) }}</span>
                <span class="badge badge-active">● Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Cards Grid -->
        <div class="profile-grid">

          <!-- Personal Information -->
          <div class="profile-card">
            <div class="profile-card-header">
              <span class="section-icon">👤</span>
              <h2 class="section-title">Personal Information</h2>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Full Name</span>
                <span class="info-value">{{ profile().EmpName || profile().Name || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Employee ID</span>
                <span class="info-value mono">{{ formatEmpId(profile().EmpId || auth.currentUser()?.empId) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">{{ formatDate(profile().DateOfBirth || profile().DOB) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Gender</span>
                <span class="info-value">{{ profile().Gender || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Marital Status</span>
                <span class="info-value">{{ profile().MaritalStatus || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Blood Group</span>
                <span class="info-value">{{ profile().BloodGroup || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="profile-card">
            <div class="profile-card-header">
              <span class="section-icon">📞</span>
              <h2 class="section-title">Contact Information</h2>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Email Address</span>
                <span class="info-value">{{ profile().Email || profile().EmailId || auth.currentUser()?.email || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mobile Number</span>
                <span class="info-value">{{ profile().MobileNo || profile().Mobile || profile().Phone || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Alternate Phone</span>
                <span class="info-value">{{ profile().AlternatePhone || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address</span>
                <span class="info-value">{{ profile().Address || profile().PermanentAddress || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">City</span>
                <span class="info-value">{{ profile().City || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">State</span>
                <span class="info-value">{{ profile().State || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Employment Details -->
          <div class="profile-card">
            <div class="profile-card-header">
              <span class="section-icon">🏢</span>
              <h2 class="section-title">Employment Details</h2>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Department</span>
                <span class="info-value">{{ profile().Department || profile().DeptText || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Designation</span>
                <span class="info-value">{{ profile().Designation || profile().DesignationText || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Company Code</span>
                <span class="info-value mono">{{ profile().CompanyCode || profile().Company || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Join Date</span>
                <span class="info-value">{{ formatDate(profile().JoinDate || profile().DateOfJoining || profile().HireDate) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Employee Type</span>
                <span class="info-value">{{ profile().EmployeeType || profile().EmpType || 'Permanent' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cost Center</span>
                <span class="info-value mono">{{ profile().CostCenter || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Bank & Payroll -->
          <div class="profile-card">
            <div class="profile-card-header">
              <span class="section-icon">🏦</span>
              <h2 class="section-title">Bank & Payroll</h2>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Bank Name</span>
                <span class="info-value">{{ profile().BankName || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Account Number</span>
                <span class="info-value mono">{{ maskAccount(profile().AccountNo || profile().BankAccount) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">IFSC Code</span>
                <span class="info-value mono">{{ profile().IFSCCode || profile().IFSC || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">PAN Number</span>
                <span class="info-value mono">{{ maskPAN(profile().PAN || profile().PANNo) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">PF Number</span>
                <span class="info-value mono">{{ profile().PFNo || profile().PFNumber || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ESI Number</span>
                <span class="info-value mono">{{ profile().ESINo || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- No Profile Data -->
      <div class="no-data" *ngIf="!loading() && !profile()">
        <div class="no-data-icon">👤</div>
        <h3>Profile Not Found</h3>
        <p>Could not load profile for Employee ID: {{ formatEmpId(auth.currentUser()?.empId) }}</p>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 1200px; margin: 0 auto; }
    /* Skeletons */
    .skeleton-profile { display: flex; flex-direction: column; gap: 20px; }
    .skeleton-header { height: 200px; border-radius: 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skeleton-body { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .skeleton-line { height: 40px; border-radius: 8px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { to { background-position: -200% 0; } }
    /* Profile Header */
    .profile-header {
      background: var(--card-bg, #fff);
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 2px 20px rgba(0,0,0,0.05);
    }
    .profile-banner {
      height: 140px;
      background: linear-gradient(135deg, #0078d4 0%, #106ebe 40%, #50e6ff 100%);
      position: relative;
    }
    .profile-banner::after {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .profile-header-content {
      display: flex;
      align-items: flex-end;
      gap: 24px;
      padding: 0 32px 28px;
      margin-top: -50px;
    }
    .profile-avatar-wrap { position: relative; }
    .profile-avatar {
      width: 100px; height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0078d4, #50e6ff);
      color: #fff;
      font-size: 32px;
      font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 4px solid var(--card-bg, #fff);
      box-shadow: 0 4px 20px rgba(0,120,212,0.3);
    }
    .avatar-status {
      position: absolute;
      bottom: 6px; right: 6px;
      width: 18px; height: 18px;
      background: #10b981;
      border-radius: 50%;
      border: 3px solid var(--card-bg, #fff);
    }
    .profile-identity { flex: 1; padding-bottom: 4px; }
    .profile-name {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary, #111827);
      margin: 0 0 4px;
    }
    .profile-designation { font-size: 14px; color: var(--text-secondary, #6b7280); margin: 0 0 12px; }
    .profile-badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .badge {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .badge-dept { background: rgba(0,120,212,0.1); color: #0078d4; }
    .badge-id { background: rgba(107,114,128,0.1); color: #6b7280; font-family: monospace; }
    .badge-active { background: rgba(16,185,129,0.1); color: #059669; }
    /* Profile Grid */
    .profile-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .profile-card {
      background: var(--card-bg, #fff);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      animation: fadeUp 0.4s ease-out;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .profile-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color, #f3f4f6);
    }
    .section-icon { font-size: 20px; }
    .section-title { font-size: 15px; font-weight: 700; color: var(--text-primary, #111827); margin: 0; }
    .info-list { display: flex; flex-direction: column; gap: 12px; }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color, #f9fafb);
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: var(--text-secondary, #6b7280); font-weight: 500; }
    .info-value { font-size: 13px; font-weight: 600; color: var(--text-primary, #111827); text-align: right; max-width: 60%; }
    .info-value.mono { font-family: 'Courier New', monospace; font-size: 12px; }
    .no-data { text-align: center; padding: 60px 20px; color: var(--text-secondary, #6b7280); }
    .no-data-icon { font-size: 60px; margin-bottom: 16px; }
    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
      .profile-header-content { flex-direction: column; align-items: center; text-align: center; }
      .profile-badges { justify-content: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(true);
  profile = signal<any>(null);

  ngOnInit(): void {
    const empId = this.auth.currentUser()?.empId;
    if (!empId) return;
    this.api.getProfile(empId).subscribe({
      next: (res) => this.profile.set(res.data),
      error: () => { this.toast.error('Failed to load profile'); this.loading.set(false); },
      complete: () => this.loading.set(false),
    });
  }

  getInitials(): string {
    const name = this.profile()?.EmpName || this.profile()?.Name || this.auth.currentUser()?.name || 'EP';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(val: string): string {
    if (!val) return '—';
    try {
      // Handle SAP date format /Date(timestamp)/
      const match = val.match(/\/Date\((\d+)\)\//);
      if (match) return new Date(parseInt(match[1])).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return val; }
  }

  maskAccount(val: string): string {
    if (!val) return '—';
    return '****' + val.slice(-4);
  }

  maskPAN(val: string): string {
    if (!val) return '—';
    return val.substring(0, 5) + '****' + val.slice(-1);
  }

  formatEmpId(empId?: string): string {
    if (!empId) return '';
    return empId.replace(/^0+/, '');
  }
}
