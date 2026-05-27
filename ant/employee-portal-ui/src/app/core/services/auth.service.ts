import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  empId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
}

export interface LoginResponse {
  success: boolean;
  data: { token: string; user: User; expiresIn: string };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly USER_KEY = environment.userKey;

  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser());
  constructor(private http: HttpClient, private router: Router) {}
  refreshUserProfile(): void {
    const user = this.currentUser();
    if (user && user.empId) {
      this.http.get<any>(`${environment.apiBaseUrl}/profile/${user.empId}`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const updatedUser: User = {
              empId: user.empId,
              name: res.data.FullName || res.data.Name || res.data.EmpName || user.name,
              email: res.data.EmailId || res.data.Email || user.email,
              department: res.data.Department || res.data.DeptText || user.department,
              designation: res.data.Designation || res.data.DesignationText || user.designation
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
            this.currentUser.set(updatedUser);
          }
        },
        error: (err) => console.error('Failed to auto-refresh user profile:', err)
      });
    }
  }

  login(empId: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/login`, { empId, password }).pipe(
      tap(res => {
        if (res.success && res.data?.token) {
          localStorage.setItem(this.TOKEN_KEY, res.data.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }
}
