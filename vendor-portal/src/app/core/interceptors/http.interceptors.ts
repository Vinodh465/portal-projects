import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';
import { SnackbarService } from '../services/snackbar.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderService);
  loader.show();
  return next(req).pipe(finalize(() => loader.hide()));
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(SnackbarService);
  return next(req).pipe(
    catchError(error => {
      let msg = 'Network or server error. Please try again.';
      if (error?.error?.error?.message?.value) {
        msg = error.error.error.message.value;
      } else if (error?.status === 401) {
        msg = 'Unauthorized. Please log in again.';
      } else if (error?.status === 404) {
        msg = 'Resource not found.';
      } else if (error?.status === 500) {
        msg = 'SAP server error. Please contact support.';
      } else if (error?.message) {
        msg = error.message;
      }
      snackbar.error(msg);
      return throwError(() => error);
    })
  );
};
