import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getDashboard(empId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/dashboard/${empId}`);
  }

  getProfile(empId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/profile/${empId}`);
  }

  getLeave(empId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/leave/${empId}`);
  }

  getPayslip(empId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/payslip/${empId}`);
  }

  getPayslipPdf(empId: string, month?: string, year?: string): Observable<Blob> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get(`${this.base}/payslip/pdf/${empId}`, { params, responseType: 'blob' });
  }

  sendPayslipEmail(empId: string, email: string, month: string, year: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/payslip/send-email`, { empId, email, month, year });
  }
}
