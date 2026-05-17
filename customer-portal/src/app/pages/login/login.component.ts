import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  custId = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  onSubmit(): void {
    this.error = '';
    if (!this.custId.trim() || !this.password.trim()) {
      this.error = 'Please enter Customer ID and Password.';
      return;
    }
    this.loading = true;
    this.api.login(this.custId.trim(), this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.auth.login(this.custId.trim(), res.custName);
          this.router.navigate(['/dashboard']);
        } else {
          this.error = res.message || 'Invalid credentials. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Connection error. Please check your network.';
      }
    });
  }

  /**
   * Dev bypass: skip SAP auth and log in directly with the entered Customer ID.
   * Shown only after a failed login attempt. For development/testing only.
   */
  devBypass(): void {
    if (!this.custId.trim()) {
      this.error = 'Please enter a Customer ID first.';
      return;
    }
    this.auth.login(this.custId.trim(), `Customer ${this.custId.trim()}`);
    this.router.navigate(['/dashboard']);
  }
}
