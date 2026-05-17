import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="portal-navbar">
      <div class="navbar-brand">
        <button class="toggle-btn" (click)="ui.toggleSidebar()">
          <i class="bi bi-list"></i>
        </button>
        <i class="bi bi-hexagon-fill brand-icon"></i>
        <span class="brand-name">KaarTech <span class="brand-accent">Portal</span></span>
      </div>
      <div class="navbar-right">
        <div class="user-badge">
          <div class="user-avatar">{{ initials }}</div>
          <span class="user-name">{{ auth.getCustName() }}</span>
        </div>
        <button class="logout-btn" (click)="auth.logout()">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .portal-navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 0 1.5rem;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .brand-icon {
      font-size: 1.5rem;
      color: #990000;
    }
    .brand-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: 0.02em;
    }
    .brand-accent { color: #990000; font-weight: 400; }
    .toggle-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #1a1a1a;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background 0.2s;
      margin-right: 0.5rem;
    }
    .toggle-btn:hover {
      background: #f1f5f9;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.05em;
    }
    .user-name {
      color: #475569;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #990000;
      border: none;
      color: #ffffff;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(153, 0, 0, 0.2);
    }
    .logout-btn:hover {
      background: #b30000;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(153, 0, 0, 0.3);
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, public ui: UiService) {}
  get initials(): string {
    const name = this.auth.getCustName();
    return name.substring(0, 2).toUpperCase();
  }
}
