import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerProfile } from '../../models/sap.models';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: CustomerProfile = {};
  loading = true;
  error = '';


  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const custId = this.auth.getCustId();
    if (!custId) {
      this.error = 'No customer ID found. Please login again.';
      this.loading = false;
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.api.getProfile(custId).subscribe({
      next: (data) => { 
        this.profile = data; 
        this.loading = false; 
      },
      error: (err) => { 
        this.error = 'Failed to load profile. Please try again.'; 
        this.loading = false; 
      }
    });
  }

  get initials(): string {
    const name = this.profile['NAME'] || this.profile['NAME1'] || this.auth.getCustName() || '??';
    return name.substring(0, 2).toUpperCase();
  }

  profileFields = [
    { key: 'CUST_ID',   label: 'Customer ID',   icon: 'bi-person-badge' },
    { key: 'NAME',      label: 'Name',           icon: 'bi-person' },
    { key: 'CITY',      label: 'City',           icon: 'bi-building' },
    { key: 'PHONE',     label: 'Phone',          icon: 'bi-telephone' },
    { key: 'EMAIL',     label: 'Email',          icon: 'bi-envelope' }
  ];
}
