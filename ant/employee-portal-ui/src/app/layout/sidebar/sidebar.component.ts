import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatTooltipModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
            <text x="8" y="28" font-size="20" fill="white" font-weight="bold">EP</text>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stop-color="#0078d4"/>
                <stop offset="100%" stop-color="#106ebe"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="logo-text" *ngIf="!collapsed()">Employee Portal</span>
        <button class="collapse-btn" (click)="toggleCollapse()">
          <span class="material-icon">{{ collapsed() ? '›' : '‹' }}</span>
        </button>
      </div>

      <!-- User Info -->
      <div class="sidebar-user" *ngIf="!collapsed()">
        <div class="user-avatar">
          {{ getInitials() }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ authService.currentUser()?.name || 'Employee' }}</div>
          <div class="user-id">ID: {{ formatEmpId(authService.currentUser()?.empId) }}</div>
        </div>
      </div>

      <div class="sidebar-user collapsed-user" *ngIf="collapsed()">
        <div class="user-avatar small">{{ getInitials() }}</div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section-label" *ngIf="!collapsed()">MAIN MENU</div>
        <a *ngFor="let item of navItems"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item"
           [matTooltip]="collapsed() ? item.label : ''"
           matTooltipPosition="right">
          <span class="nav-icon" [innerHTML]="item.icon"></span>
          <span class="nav-label" *ngIf="!collapsed()">{{ item.label }}</span>
          <span class="nav-badge" *ngIf="item.badge && !collapsed()">{{ item.badge }}</span>
        </a>
      </nav>


    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--sidebar-bg, linear-gradient(180deg, #0f172a 0%, #1e293b 100%));
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
      position: relative;
      z-index: 100;
      box-shadow: 4px 0 20px rgba(0,0,0,0.15);
    }
    .sidebar.collapsed { width: 72px; }
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      min-height: 70px;
    }
    .logo-icon { flex-shrink: 0; }
    .logo-text {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      flex: 1;
      letter-spacing: 0.3px;
    }
    .collapse-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      font-size: 18px;
      line-height: 1;
      transition: color 0.2s;
      margin-left: auto;
    }
    .collapse-btn:hover { color: #fff; }
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .collapsed-user { justify-content: center; }
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0078d4, #50e6ff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      font-size: 14px;
      flex-shrink: 0;
    }
    .user-avatar.small { width: 36px; height: 36px; font-size: 12px; }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-id { font-size: 11px; color: rgba(255,255,255,0.5); }
    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      overflow-y: auto;
    }
    .nav-section-label {
      font-size: 10px;
      font-weight: 600;
      color: rgba(255,255,255,0.3);
      padding: 8px 10px 4px;
      letter-spacing: 1px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 2px;
      border: none;
      background: none;
      width: 100%;
      font-size: 13px;
      font-weight: 500;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
      transform: translateX(2px);
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(0,120,212,0.4), rgba(0,120,212,0.2));
      color: #fff;
      border-left: 3px solid #0078d4;
    }
    .nav-icon { display: flex; align-items: center; flex-shrink: 0; }
    .nav-label { white-space: nowrap; flex: 1; }
    .nav-badge {
      background: #0078d4;
      color: #fff;
      font-size: 10px;
      border-radius: 10px;
      padding: 2px 6px;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .sidebar { position: fixed; z-index: 1000; }
      .sidebar.collapsed { width: 0; padding: 0; }
    }
  `]
})
export class SidebarComponent {
  collapsed = signal(false);
  authService = inject(AuthService);

  navItems: NavItem[] = [
    {
      label: 'Dashboard', route: '/portal/dashboard',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
    },
    {
      label: 'My Profile', route: '/portal/profile',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },
    {
      label: 'Leave Management', route: '/portal/leave',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },
    {
      label: 'Payslip', route: '/portal/payslip',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
  ];
  toggleCollapse(): void { this.collapsed.update(v => !v); }

  getInitials(): string {
    const name = this.authService.currentUser()?.name || 'E';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatEmpId(empId?: string): string {
    if (!empId) return '';
    return empId.replace(/^0+/, '');
  }


}
