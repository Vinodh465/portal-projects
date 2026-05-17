import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000): void {
    this.open(message, 'success-snack', duration);
  }

  error(message: string, duration = 5000): void {
    this.open(message, 'error-snack', duration);
  }

  info(message: string, duration = 3000): void {
    this.open(message, 'info-snack', duration);
  }

  private open(message: string, panelClass: string, duration: number): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass]
    };
    this.snackBar.open(message, '✕', config);
  }
}
