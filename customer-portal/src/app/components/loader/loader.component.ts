import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../core/services/loader.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="loading$ | async">
      <div class="loader-box">
        <div class="spinner-ring">
          <div></div><div></div><div></div><div></div>
        </div>
        <p class="loader-text">Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 15, 30, 0.72);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .loader-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .spinner-ring {
      display: inline-block;
      position: relative;
      width: 64px;
      height: 64px;
    }
    .spinner-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 52px;
      height: 52px;
      margin: 6px;
      border: 5px solid transparent;
      border-top-color: #4f8ef7;
      border-radius: 50%;
      animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .spinner-ring div:nth-child(1) { animation-delay: -0.3s; border-top-color: #4f8ef7; }
    .spinner-ring div:nth-child(2) { animation-delay: -0.2s; border-top-color: #7b5ea7; }
    .spinner-ring div:nth-child(3) { animation-delay: -0.1s; border-top-color: #3dcfcf; }
    .spinner-ring div:nth-child(4) { border-top-color: #f76b4f; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .loader-text {
      color: #b0c4de;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
      margin: 0;
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class LoaderComponent implements OnInit {
  loading$!: Observable<boolean>;
  constructor(private loaderService: LoaderService) {}
  ngOnInit(): void {
    this.loading$ = this.loaderService.loading$;
  }
}
