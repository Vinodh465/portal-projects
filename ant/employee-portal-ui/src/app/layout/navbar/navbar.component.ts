import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatMenuModule, MatButtonModule, MatIconModule, MatTooltipModule, MatDividerModule],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <div class="page-breadcrumb">
          <span class="breadcrumb-icon">🏠</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ getPageTitle() }}</span>
        </div>
      </div>

      <div class="navbar-right">


        <!-- Theme Toggle -->
        <button class="icon-btn" (click)="themeService.toggleTheme()"
                [matTooltip]="themeService.theme() === 'dark' ? 'Light Mode' : 'Dark Mode'">
          <span *ngIf="themeService.theme() === 'dark'">☀️</span>
          <span *ngIf="themeService.theme() === 'light'">🌙</span>
        </button>



        <!-- User Menu -->
        <button class="user-menu-btn" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar-sm">{{ getInitials() }}</div>
          <div class="user-info-sm">
            <span class="user-name-sm">{{ authService.currentUser()?.name || 'Employee' }}</span>
            <span class="user-dept-sm">{{ authService.currentUser()?.department || '' }}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <mat-menu #userMenu="matMenu" class="user-dropdown">
          <div class="menu-header">
            <div class="menu-avatar">{{ getInitials() }}</div>
            <div>
              <div class="menu-name">{{ authService.currentUser()?.name }}</div>
              <div class="menu-email">{{ authService.currentUser()?.email }}</div>
            </div>
          </div>
          <button mat-menu-item (click)="navigate('/portal/profile')">👤 My Profile</button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="authService.logout()" class="logout-item">🚪 Sign Out</button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 64px;
      background: var(--navbar-bg, rgba(255,255,255,0.95));
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
      box-shadow: 0 1px 8px rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .navbar-left { display: flex; align-items: center; }
    .page-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-secondary, #6b7280);
    }
    .breadcrumb-current {
      font-weight: 600;
      color: var(--text-primary, #111827);
      font-size: 16px;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 8px;
      padding: 8px 12px;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .search-box:focus-within {
      border-color: #0078d4;
      background: var(--bg-primary, #fff);
      box-shadow: 0 0 0 3px rgba(0,120,212,0.1);
    }
    .search-input {
      background: none;
      border: none;
      outline: none;
      font-size: 13px;
      color: var(--text-primary, #111827);
      width: 160px;
    }
    .icon-btn {
      width: 36px; height: 36px;
      border-radius: 8px;
      border: none;
      background: var(--bg-secondary, #f3f4f6);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary, #6b7280);
      transition: all 0.2s;
      font-size: 16px;
      position: relative;
    }
    .icon-btn:hover {
      background: var(--bg-hover, #e5e7eb);
      color: var(--text-primary, #111827);
    }
    .notif-badge {
      position: absolute;
      top: -3px; right: -3px;
      background: #dc2626;
      color: #fff;
      font-size: 9px;
      width: 16px; height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-primary, #fff);
      cursor: pointer;
      transition: all 0.2s;
    }
    .user-menu-btn:hover { background: var(--bg-secondary, #f3f4f6); }
    .user-avatar-sm {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0078d4, #50e6ff);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-name-sm {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #111827);
      display: block;
    }
    .user-dept-sm {
      font-size: 11px;
      color: var(--text-secondary, #6b7280);
      display: block;
    }
    .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 4px;
    }
    .menu-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0078d4, #50e6ff);
      color: #fff;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .menu-name { font-weight: 600; font-size: 14px; }
    .menu-email { font-size: 12px; color: #6b7280; }
    .logout-item { color: #dc2626 !important; }
    @media (max-width: 640px) {
      .search-box { display: none; }
      .user-info-sm { display: none; }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  getInitials(): string {
    const name = this.authService.currentUser()?.name || 'E';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getPageTitle(): string {
    const url = this.router.url;
    const map: Record<string, string> = {
      '/portal/dashboard': 'Dashboard',
      '/portal/profile': 'My Profile',
      '/portal/leave': 'Leave Management',
      '/portal/payslip': 'Payslip',
      '/portal/notifications': 'Notifications',
      '/portal/settings': 'Settings',
    };
    return map[url] || 'Employee Portal';
  }

  navigate(path: string): void { this.router.navigate([path]); }
}
