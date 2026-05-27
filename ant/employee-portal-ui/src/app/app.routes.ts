import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'portal',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'leave',
        loadComponent: () =>
          import('./features/leave/leave.component').then(m => m.LeaveComponent),
      },
      {
        path: 'payslip',
        loadComponent: () =>
          import('./features/payslip/payslip.component').then(m => m.PayslipComponent),
      },
      {
        path: 'payslip/pdf/:empId',
        loadComponent: () =>
          import('./features/pdf-viewer/pdf-viewer.component').then(m => m.PdfViewerComponent),
      },


    ],
  },
  { path: '**', redirectTo: '/login' },
];
