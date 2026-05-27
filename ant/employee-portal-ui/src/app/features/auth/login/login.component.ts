import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  template: `
    <div class="login-page">
      <!-- Animated background -->
      <div class="bg-animation">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="login-container">
        <!-- Left Panel -->
        <div class="left-panel">
          <div class="brand">
            <div class="brand-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="14" fill="url(#brandGrad)"/>
                <text x="9" y="34" font-size="22" fill="white" font-weight="800">EP</text>
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stop-color="#0078d4"/>
                    <stop offset="100%" stop-color="#005a9e"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="brand-info">
              <h1 class="brand-name">Employee Portal</h1>
              <p class="brand-tagline">Enterprise HR Management System</p>
            </div>
          </div>

          <div class="illustration">
            <div class="illus-card card-1">
              <div class="illus-icon">📊</div>
              <div class="illus-text">
                <div class="illus-title">Real-time Analytics</div>
                <div class="illus-sub">Live SAP data integration</div>
              </div>
            </div>
            <div class="illus-card card-2">
              <div class="illus-icon">🗓️</div>
              <div class="illus-text">
                <div class="illus-title">Leave Management</div>
                <div class="illus-sub">Track & manage all leave</div>
              </div>
            </div>
            <div class="illus-card card-3">
              <div class="illus-icon">💰</div>
              <div class="illus-text">
                <div class="illus-title">Payslip Access</div>
                <div class="illus-sub">Download PDF payslips</div>
              </div>
            </div>
          </div>

          <div class="left-footer">
            <span class="powered-by">Powered by SAP OData</span>
            <span class="version">v1.0.0</span>
          </div>
        </div>

        <!-- Right Panel - Login Form -->
        <div class="right-panel">
          <div class="login-card">
            <div class="login-header">
              <h2 class="login-title">Welcome Back</h2>
              <p class="login-subtitle">Sign in to access your employee portal</p>
            </div>

            <!-- Error Alert -->
            <div class="error-alert" *ngIf="errorMsg()">
              <span class="error-icon">⚠️</span>
              {{ errorMsg() }}
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" autocomplete="off">
              <!-- Employee ID -->
              <div class="form-group">
                <label class="form-label" for="empId">Employee ID</label>
                <div class="input-wrapper" [class.focused]="empIdFocused" [class.has-error]="isFieldInvalid('empId')">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    id="empId"
                    type="text"
                    class="form-input"
                    placeholder="Enter your Employee ID"
                    formControlName="empId"
                    (focus)="empIdFocused = true"
                    (blur)="empIdFocused = false"
                    autocomplete="username"
                  />
                </div>
                <span class="field-error" *ngIf="isFieldInvalid('empId')">Employee ID is required</span>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label class="form-label" for="password">Password</label>
                <div class="input-wrapper" [class.focused]="pwdFocused" [class.has-error]="isFieldInvalid('password')">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Enter your password"
                    formControlName="password"
                    (focus)="pwdFocused = true"
                    (blur)="pwdFocused = false"
                    autocomplete="current-password"
                  />
                  <button type="button" class="toggle-pwd" (click)="togglePassword()">
                    {{ showPassword() ? '🙈' : '👁️' }}
                  </button>
                </div>
                <span class="field-error" *ngIf="isFieldInvalid('password')">Password is required</span>
              </div>

              <!-- Remember Me -->
              <div class="form-extras">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="rememberMe" class="checkbox"/>
                  <span>Remember me</span>
                </label>
                <a class="forgot-link" href="#">Forgot Password?</a>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="login-btn" [class.loading]="loading()" [disabled]="loading()">
                <mat-spinner diameter="20" *ngIf="loading()" class="btn-spinner"></mat-spinner>
                <span *ngIf="!loading()">Sign In to Portal</span>
                <span *ngIf="loading()">Authenticating...</span>
              </button>
            </form>

            <div class="login-footer">
              <p class="footer-text">🔒 Secured by Enterprise JWT Authentication</p>
              <p class="footer-sub">SAP OData Integration · HRMS Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }
    .bg-animation {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 40%, #0a1628 100%);
      z-index: 0;
    }
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 8s ease-in-out infinite;
    }
    .orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #0078d4, transparent);
      top: -150px; left: -100px;
    }
    .orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #50e6ff, transparent);
      bottom: -100px; right: -100px;
      animation-delay: 3s;
    }
    .orb-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, #4c1d95, transparent);
      top: 50%; left: 50%;
      animation-delay: 5s;
    }
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(0,120,212,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,120,212,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }
    .login-container {
      position: relative;
      z-index: 1;
      display: flex;
      min-height: 100vh;
    }
    /* Left Panel */
    .left-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 48px;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-name {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      margin: 0;
      line-height: 1.2;
    }
    .brand-tagline {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      margin: 2px 0 0;
    }
    .illustration {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 380px;
    }
    .illus-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      animation: slideIn 0.6s ease-out forwards;
      opacity: 0;
      transform: translateX(-30px);
    }
    .card-1 { animation-delay: 0.2s; }
    .card-2 { animation-delay: 0.4s; }
    .card-3 { animation-delay: 0.6s; }
    @keyframes slideIn {
      to { opacity: 1; transform: translateX(0); }
    }
    .illus-icon { font-size: 28px; }
    .illus-title { font-size: 15px; font-weight: 600; color: #fff; }
    .illus-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }
    .left-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
    }
    /* Right Panel */
    .right-panel {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(20px);
      border-left: 1px solid rgba(255,255,255,0.08);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    .login-header { margin-bottom: 32px; }
    .login-title {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px;
    }
    .login-subtitle {
      font-size: 14px;
      color: rgba(255,255,255,0.55);
      margin: 0;
    }
    .error-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: rgba(220,38,38,0.15);
      border: 1px solid rgba(220,38,38,0.3);
      border-radius: 10px;
      color: #fca5a5;
      font-size: 14px;
      margin-bottom: 24px;
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
    .login-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,0.8);
    }
    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.07);
      border: 1.5px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 0 14px;
      transition: all 0.2s;
    }
    .input-wrapper.focused {
      border-color: #0078d4;
      background: rgba(0,120,212,0.08);
      box-shadow: 0 0 0 3px rgba(0,120,212,0.15);
    }
    .input-wrapper.has-error { border-color: #dc2626; }
    .input-icon { color: rgba(255,255,255,0.4); display: flex; }
    .form-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      padding: 14px 0;
      font-size: 14px;
      color: #fff;
    }
    .form-input::placeholder { color: rgba(255,255,255,0.3); }
    .toggle-pwd {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      border-radius: 4px;
    }
    .field-error { font-size: 12px; color: #f87171; }
    .form-extras {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
    }
    .checkbox { accent-color: #0078d4; }
    .forgot-link {
      font-size: 13px;
      color: #50e6ff;
      text-decoration: none;
    }
    .forgot-link:hover { text-decoration: underline; }
    .login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #0078d4, #106ebe);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(0,120,212,0.4);
      letter-spacing: 0.3px;
      margin-top: 8px;
    }
    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,120,212,0.5);
      background: linear-gradient(135deg, #106ebe, #0078d4);
    }
    .login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .btn-spinner { display: inline-block; }
    ::ng-deep .btn-spinner circle { stroke: #fff !important; }
    .login-footer {
      margin-top: 32px;
      text-align: center;
    }
    .footer-text { font-size: 12px; color: rgba(255,255,255,0.35); margin: 0; }
    .footer-sub { font-size: 11px; color: rgba(255,255,255,0.2); margin: 4px 0 0; }
    @media (max-width: 900px) {
      .left-panel { display: none; }
      .right-panel { width: 100%; border-left: none; }
    }
    @media (max-width: 480px) {
      .right-panel { padding: 32px 24px; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loginForm: FormGroup = this.fb.group({
    empId: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  loading = signal(false);
  showPassword = signal(false);
  errorMsg = signal('');
  empIdFocused = false;
  pwdFocused = false;

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { empId, password } = this.loginForm.value;
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(empId, password).subscribe({
      next: () => {
        this.toast.success('Welcome back! Login successful.');
        this.router.navigate(['/portal/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Login failed. Please check your credentials.';
        this.errorMsg.set(msg);
        this.toast.error(msg);
      },
      complete: () => this.loading.set(false),
    });
  }
}
