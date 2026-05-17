import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loader.loading()) {
      <div class="loading-overlay">
        <div class="spinner-wrapper">
          <mat-spinner diameter="48" color="primary"></mat-spinner>
          <p>Loading...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(3px);
      display: flex; align-items: center; justify-content: center;
    }
    .spinner-wrapper {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      background: #fff; padding: 28px 40px; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      p { font-size: 13px; color: #5c6780; font-weight: 500; }
    }
  `]
})
export class LoaderComponent {
  constructor(public loader: LoaderService) {}
}
