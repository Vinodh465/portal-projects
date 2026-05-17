import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { UiService } from '../../services/ui.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.open]="ui.sidebarOpen$ | async">
      <nav class="sidebar-nav">
        <a *ngFor="let item of navItems"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item"
           [attr.title]="item.label">
          <i class="bi {{ item.icon }} nav-icon"></i>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 60px;
      left: 0;
      width: 260px;
      height: calc(100vh - 60px);
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.2rem 0;
      z-index: 900;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 4px 0 10px rgba(0,0,0,0.05);
    }
    .sidebar.open {
      transform: translateX(0);
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0 0.75rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.9rem;
      border-radius: 8px;
      color: #4a4a4a;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      letter-spacing: 0.01em;
    }
    .nav-item:hover {
      background: #f4f5f7;
      color: #1a1a1a;
    }
    .nav-item.active {
      background: #990000;
      color: #ffffff;
      border-left: 3px solid #660000;
      padding-left: calc(0.9rem - 3px);
      box-shadow: 0 2px 4px rgba(153, 0, 0, 0.15);
    }
    .nav-item.active .nav-icon {
      filter: none;
    }
    .nav-icon {
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    .sidebar-footer {
      padding: 0 1.5rem;
    }
    .sidebar-version {
      font-size: 0.7rem;
      color: #334155;
      text-align: center;
    }
  `]
})
export class SidebarComponent {
  constructor(public ui: UiService) {}
  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'bi-speedometer2', route: '/dashboard' },
    { label: 'Profile',    icon: 'bi-person-circle', route: '/profile' },
    { label: 'Inquiry',    icon: 'bi-search',        route: '/inquiry' },
    { label: 'Sales',      icon: 'bi-cart3',         route: '/sales' },
    { label: 'Delivery',   icon: 'bi-truck',         route: '/delivery' },
    { label: 'Finance',    icon: 'bi-cash-stack',    route: '/finance' },
  ];
}
