import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  custId: string;
  custName?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly CUST_ID_KEY = 'sap_cust_id';
  private readonly CUST_NAME_KEY = 'sap_cust_name';

  constructor(private router: Router) {}

  login(custId: string, custName?: string): void {
    localStorage.setItem(this.CUST_ID_KEY, custId);
    if (custName) {
      localStorage.setItem(this.CUST_NAME_KEY, custName);
    }
  }

  setCustId(newCustId: string): void {
    localStorage.setItem(this.CUST_ID_KEY, newCustId);
  }

  logout(): void {
    localStorage.removeItem(this.CUST_ID_KEY);
    localStorage.removeItem(this.CUST_NAME_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.CUST_ID_KEY);
  }

  getCustId(): string {
    return localStorage.getItem(this.CUST_ID_KEY) || '';
  }

  getCustName(): string {
    return localStorage.getItem(this.CUST_NAME_KEY) || this.getCustId();
  }
}
