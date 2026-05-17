import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'inquiry',
    loadComponent: () => import('./pages/inquiry/inquiry.component').then(m => m.InquiryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sales',
    loadComponent: () => import('./pages/sales/sales.component').then(m => m.SalesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'delivery',
    loadComponent: () => import('./pages/delivery/delivery.component').then(m => m.DeliveryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'finance',
    loadComponent: () => import('./pages/finance/finance.component').then(m => m.FinanceComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
