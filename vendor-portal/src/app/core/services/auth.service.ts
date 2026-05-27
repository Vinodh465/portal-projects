import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResult } from '../models/models';

const VENDOR_ID_KEY = 'vp_vendor_id';
const VENDOR_NAME_KEY = 'vp_vendor_name';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _vendorId = signal<string | null>(sessionStorage.getItem(VENDOR_ID_KEY));
  private _vendorName = signal<string | null>(sessionStorage.getItem(VENDOR_NAME_KEY));

  vendorId = computed(() => this._vendorId());
  vendorName = computed(() => this._vendorName());
  isLoggedIn = computed(() => !!this._vendorId());

  constructor(private router: Router) {}

  private stripLeadingZeros(value: string): string {
    return value.replace(/^0+/, '') || '0';
  }

  login(result: LoginResult): void {
    const displayId = this.stripLeadingZeros(result.Lifnr);
    sessionStorage.setItem(VENDOR_ID_KEY, displayId);
    sessionStorage.setItem(VENDOR_NAME_KEY, displayId); // SAP doesn't return Name in LOGINSet
    this._vendorId.set(displayId);
    this._vendorName.set(displayId);
  }

  logout(): void {
    sessionStorage.removeItem(VENDOR_ID_KEY);
    sessionStorage.removeItem(VENDOR_NAME_KEY);
    this._vendorId.set(null);
    this._vendorName.set(null);
    this.router.navigate(['/login']);
  }

  getVendorId(): string {
    return this._vendorId() ?? '';
  }
}
