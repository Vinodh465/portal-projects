import { Component } from '@angular/core';
import { LOGIN_FEATURES } from './login.features';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: ReturnType<FormBuilder['group']>;
  loading = false;
  features = LOGIN_FEATURES;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private snackbar: SnackbarService,
    private router: Router
  ) {
    this.form = this.fb.group({
      vendorId: ['', [Validators.required, Validators.minLength(1)]],
      password: ['', [Validators.required, Validators.minLength(1)]],
      remember: [false]
    });
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { vendorId, password } = this.form.value;
    this.loading = true;

    this.api.login(vendorId!, password!).subscribe({
      next: (results) => {
        this.loading = false;
        if (results && results.length > 0) {
          const result = results[0];
          console.log('Login result:', result);
          // SAP returns Type='S' for success, Type='E' for error
          if (result.Type === 'S') {
            this.auth.login(result);
            this.snackbar.success(result.Msg || `Welcome! Vendor ${result.Lifnr}`);
            this.router.navigate(['/dashboard']);
          } else {
            this.snackbar.error(result.Msg || 'Invalid credentials. Please try again.');
          }
        } else {
          this.snackbar.error('Invalid Vendor ID or Password.');
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackbar.error(err.message || 'Login failed. Please try again.');
      }
    });
  }
}
