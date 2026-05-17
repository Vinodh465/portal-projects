import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';

export interface PdfDialogData {
  belnr: string;
  title?: string;
}

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrl: './pdf-viewer-dialog.component.scss'
})
export class PdfViewerDialogComponent implements OnInit {
  pdfUrl: SafeResourceUrl | null = null;
  blobUrl: string | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PdfDialogData,
    private dialogRef: MatDialogRef<PdfViewerDialogComponent>,
    private api: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchPdf();
  }

  fetchPdf(): void {
    this.loading = true;
    this.error = null;
    this.api.getInvoicePdf(this.data.belnr).subscribe({
      next: (blob) => {
        this.blobUrl = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load PDF.';
        this.loading = false;
      }
    });
  }

  download(): void {
    if (!this.blobUrl) return;
    const a = document.createElement('a');
    a.href = this.blobUrl;
    a.download = `Invoice_${this.data.belnr}.pdf`;
    a.click();
  }

  print(): void {
    const iframe = document.getElementById('pdf-frame') as HTMLIFrameElement;
    iframe?.contentWindow?.print();
  }

  close(): void {
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    this.dialogRef.close();
  }
}
