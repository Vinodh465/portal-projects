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

  login(result: LoginResult): void {
    sessionStorage.setItem(VENDOR_ID_KEY, result.Lifnr);
    sessionStorage.setItem(VENDOR_NAME_KEY, result.Lifnr); // SAP doesn't return Name in LOGINSet
    this._vendorId.set(result.Lifnr);
    this._vendorName.set(result.Lifnr);
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
