import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { VendorProfile } from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profile: VendorProfile | null = null;
  loading = true;
  error: string | null = null;

  infoSections = [
    { label: 'Company Name',    key: 'Name',         icon: 'business' },
    { label: 'Vendor ID',       key: 'VendorId',     icon: 'badge' },
    { label: 'Account Group',   key: 'AccGrp',       icon: 'group' },
    { label: 'Search Term',     key: 'Sortl',        icon: 'search' },
  ];

  addressFields = [
    { label: 'City',      key: 'City' },
    { label: 'Region',    key: 'Region' },
    { label: 'Postal',    key: 'Postal' },
    { label: 'Country',   key: 'CountryKey' },
  ];

  contactFields = [
    { label: 'Email',  key: 'SmtpAddr', icon: 'email' },
    { label: 'Phone',  key: 'Telf1',    icon: 'phone' }
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.getProfile(this.auth.getVendorId()).subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  getField(key: string): string {
    return (this.profile as any)?.[key] || '—';
  }

  getInitial(): string {
    return (this.profile?.Name || this.auth.vendorName() || 'V')[0].toUpperCase();
  }
}
