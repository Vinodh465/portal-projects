import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const credentials = btoa(`${environment.sapCredentials.username}:${environment.sapCredentials.password}`);
  const soapReq = req.clone({
    setHeaders: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'Authorization': `Basic ${credentials}`
    }
  });
  return next(soapReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[SAP API Error]', error.status, error.message);
      return throwError(() => error);
    })
  );
};
