import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pdf-viewer-page">
      <div class="pdf-toolbar">
        <button class="toolbar-btn back-btn" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Payslip
        </button>
        <div class="toolbar-title">
          <span class="title-icon">📄</span>
          <span>Payslip PDF — Employee {{ formatEmpId(empId) }}</span>
        </div>
        <div class="toolbar-actions">
          <button class="toolbar-btn" (click)="downloadPdf()" [disabled]="loading()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          <button class="toolbar-btn" (click)="printPdf()" [disabled]="loading()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="pdf-loading" *ngIf="loading()">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring ring-2"></div>
        </div>
        <p class="loading-text">Loading PDF from SAP...</p>
        <p class="loading-sub">Fetching secure document stream</p>
      </div>

      <!-- Error State -->
      <div class="pdf-error" *ngIf="error() && !loading()">
        <div class="error-icon">⚠️</div>
        <h3>Unable to Load PDF</h3>
        <p>{{ errorMsg() }}</p>
        <button class="retry-btn" (click)="loadPdf()">Retry</button>
      </div>

      <!-- PDF Viewer -->
      <div class="pdf-frame-container" *ngIf="pdfUrl() && !loading() && !error()">
        <iframe
          [src]="pdfUrl()!"
          class="pdf-frame"
          title="Payslip PDF"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `,
  styles: [`
    .pdf-viewer-page {
      height: calc(100vh - 64px - 48px);
      display: flex;
      flex-direction: column;
      background: var(--bg-primary, #f9fafb);
    }
    .pdf-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      background: var(--card-bg, #fff);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      flex-shrink: 0;
    }
    .back-btn { color: #0078d4 !important; }
    .toolbar-title {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary, #111827);
    }
    .title-icon { font-size: 18px; }
    .toolbar-actions { display: flex; gap: 8px; }
    .toolbar-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      background: var(--card-bg, #fff);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #374151);
      cursor: pointer;
      transition: all 0.2s;
    }
    .toolbar-btn:hover:not(:disabled) {
      background: #0078d4;
      color: #fff;
      border-color: #0078d4;
    }
    .toolbar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pdf-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .loading-spinner {
      position: relative;
      width: 64px;
      height: 64px;
    }
    .spinner-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #0078d4;
      animation: spin 1s linear infinite;
    }
    .ring-2 {
      inset: 8px;
      border-top-color: #50e6ff;
      animation-direction: reverse;
      animation-duration: 0.7s;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 16px; font-weight: 600; color: var(--text-primary, #111827); margin: 0; }
    .loading-sub { font-size: 13px; color: var(--text-secondary, #6b7280); margin: 0; }
    .pdf-error {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--text-secondary, #6b7280);
    }
    .error-icon { font-size: 56px; }
    .pdf-error h3 { font-size: 20px; color: var(--text-primary, #111827); margin: 0; }
    .pdf-error p { font-size: 14px; margin: 0; }
    .retry-btn {
      padding: 10px 24px;
      background: #0078d4;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
    }
    .retry-btn:hover { background: #106ebe; }
    .pdf-frame-container { flex: 1; overflow: hidden; }
    .pdf-frame { width: 100%; height: 100%; border: none; }
  `]
})
export class PdfViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);

  loading = signal(true);
  error = signal(false);
  errorMsg = signal('');
  pdfUrl = signal<SafeResourceUrl | null>(null);
  empId = '';
  private pdfBlob: Blob | null = null;

  ngOnInit(): void {
    this.empId = this.route.snapshot.params['empId'] || this.auth.currentUser()?.empId || '';
    this.loadPdf();
  }

  loadPdf(): void {
    this.loading.set(true);
    this.error.set(false);
    const month = this.route.snapshot.queryParams['month'] || '';
    const year = this.route.snapshot.queryParams['year'] || '';
    this.api.getPayslipPdf(this.empId, month, year).subscribe({
      next: (blob) => {
        this.pdfBlob = blob;
        const url = URL.createObjectURL(blob);
        this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      },
      error: (err) => {
        this.error.set(true);
        this.errorMsg.set(err?.error?.message || 'Failed to fetch PDF from SAP backend.');
        this.loading.set(false);
        this.toast.error('Failed to load payslip PDF');
      },
      complete: () => this.loading.set(false),
    });
  }

  downloadPdf(): void {
    if (!this.pdfBlob) return;
    const url = URL.createObjectURL(this.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${this.empId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('PDF downloaded successfully!');
  }

  printPdf(): void {
    const iframe = document.querySelector('.pdf-frame') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  }

  formatEmpId(empId?: string): string {
    if (!empId) return '';
    return empId.replace(/^0+/, '');
  }

  goBack(): void { this.router.navigate(['/portal/payslip']); }
}
