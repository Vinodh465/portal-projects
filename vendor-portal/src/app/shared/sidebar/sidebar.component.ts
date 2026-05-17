import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard',         route: '/dashboard',        icon: 'dashboard' },
    { label: 'Profile',           route: '/profile',          icon: 'person' },
    { label: 'RFQ',               route: '/rfq',              icon: 'request_quote' },
    { label: 'Purchase Orders',   route: '/purchase-order',   icon: 'shopping_cart' },
    { label: 'Goods Receipt',     route: '/goods-receipt',    icon: 'local_shipping' },
    { label: 'Invoice',           route: '/invoice',          icon: 'receipt_long' },
    { label: 'Payments & Aging',  route: '/payments',         icon: 'payments' },
    { label: 'Credit/Debit Memo', route: '/credit-debit-memo',icon: 'note_alt' },
  ];

  constructor(public auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }
}
