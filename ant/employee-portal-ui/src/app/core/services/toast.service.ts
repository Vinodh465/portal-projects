import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const panelClass = [`toast-${type}`];
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass,
    };
    this.snackBar.open(message, '✕', config);
  }

  success(msg: string): void { this.show(msg, 'success'); }
  error(msg: string): void { this.show(msg, 'error', 6000); }
  info(msg: string): void { this.show(msg, 'info'); }
  warning(msg: string): void { this.show(msg, 'warning'); }
}
