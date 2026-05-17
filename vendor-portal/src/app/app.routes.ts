import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'rfq',
        loadComponent: () => import('./features/rfq/rfq.component').then(m => m.RfqComponent)
      },
      {
        path: 'purchase-order',
        loadComponent: () => import('./features/purchase-order/purchase-order.component').then(m => m.PurchaseOrderComponent)
      },
      {
        path: 'goods-receipt',
        loadComponent: () => import('./features/goods-receipt/goods-receipt.component').then(m => m.GoodsReceiptComponent)
      },
      {
        path: 'invoice',
        loadComponent: () => import('./features/invoice/invoice.component').then(m => m.InvoiceComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'credit-debit-memo',
        loadComponent: () => import('./features/credit-debit-memo/credit-debit-memo.component').then(m => m.CreditDebitMemoComponent)
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
