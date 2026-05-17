import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SapResponse, SapSingleResponse, LoginResult, VendorProfile,
  Rfq, PurchaseOrder, GoodsReceipt, Invoice, PaymentAging, CreditDebitMemo
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;
  private sapClient = environment.sapClient;

  /**
   * Strip leading zeros to get the raw SAP vendor ID (e.g. '0000100000' → '100000').
   * The ZMM_VENDOR_SRV_093_SRV OData service stores/filters by the raw unpadded ID.
   */
  private rawVendorId(id: string): string {
    if (!id) return '';
    return id.replace(/^0+/, '') || id; // strip leading zeros; keep '0' if all zeros
  }

  private get headers(): HttpHeaders {
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
    if ((environment as any).sapUsername && (environment as any).sapPassword) {
      const basicAuth = btoa(`${(environment as any).sapUsername}:${(environment as any).sapPassword}`);
      headers = headers.set('Authorization', `Basic ${basicAuth}`);
    }
    return headers;
  }

  constructor(private http: HttpClient) {}

  // -------- LOGIN --------
  // SAP Gateway confirmed: $filter approach works for login verification.
  // Entity-key URL (LOGINSet('...')) returns 500 'Method not implemented'.
  login(vendorId: string, password: string): Observable<LoginResult[]> {
    const padded = vendorId.trim().padStart(10, '0');
    // Pass password in the filter so SAP can validate it server-side
    const params = new HttpParams()
      .set('$filter', `Lifnr eq '${padded}' and Password eq '${password}'`)
      .set('sap-client', this.sapClient);
    
    const url = `${this.base}/LOGINSet`;
    console.log('LOGIN URL:', url, 'with params:', params.toString());
    
    return this.http
      .get<SapResponse<LoginResult>>(url, { headers: this.headers, params })
      .pipe(
        map(r => r.d.results), // results is an array for $filter queries
        catchError(this.handleError)
      );
  }

  // -------- PROFILE --------
  getProfile(vendorId: string): Observable<VendorProfile> {
    const vid = this.rawVendorId(vendorId);
    const params = new HttpParams().set('sap-client', this.sapClient);
    return this.http
      .get<SapSingleResponse<VendorProfile>>(`${this.base}/ProfileSet(VendorId='${vid}')`, { headers: this.headers, params })
      .pipe(
        map(r => r.d),
        catchError(this.handleError)
      );
  }

  // -------- RFQ --------
  getRfqs(vendorId: string): Observable<Rfq[]> {
    const vid = this.rawVendorId(vendorId);
    const params = new HttpParams()
      .set('$filter', `VendorId eq '${vid}'`)
      .set('sap-client', this.sapClient);
    return this.http
      .get<SapResponse<Rfq>>(`${this.base}/RfqSet`, { headers: this.headers, params })
      .pipe(map(r => r.d.results), catchError(this.handleError));
  }

  // -------- PURCHASE ORDERS --------
  getPurchaseOrders(vendorId: string): Observable<PurchaseOrder[]> {
    const vid = this.rawVendorId(vendorId);
    const params = new HttpParams()
      .set('$filter', `VendorId eq '${vid}'`)
      .set('sap-client', this.sapClient);
    return this.http
      .get<SapResponse<PurchaseOrder>>(`${this.base}/PoSet`, { headers: this.headers, params })
      .pipe(map(r => r.d.results), catchError(this.handleError));
  }

  // -------- GOODS RECEIPT --------
  getGoodsReceipts(vendorId: string): Observable<GoodsReceipt[]> {
    const vid = this.rawVendorId(vendorId);
    const params = new HttpParams()
      .set('$filter', `VendorId eq '${vid}'`)
      .set('sap-client', this.sapClient);
    return this.http
      .get<SapResponse<GoodsReceipt>>(`${this.base}/GrSet`, { headers: this.headers, params })
      .pipe(map(r => r.d.results), catchError(this.handleError));
  }

  // -------- INVOICES --------
  getInvoices(vendorId: string): Observable<Invoice[]> {
    const vid = this.rawVendorId(vendorId);
    const params = new HttpParams()
      .set('$filter', `VendorId eq '${vid}'`)
      .set('sap-client', this.sapClient);
    const url = `${this.base}/InvoiceSet`;
    console.log('Fetching Invoices from:', url, 'with params:', params.toString());
    return this.http
      .get<SapResponse<Invoice>>(url, { headers: this.headers, params })
      .pipe(
        map(r => {
          console.log('SAP Response for Invoices:', r);
          return r.d.results;
        }),
        catchError(this.handleError)
      );
  }

  // -------- INVOICE PDF --------
  getInvoicePdf(belnr: string): Observable<Blob> {
    let headers = new HttpHeaders({ 'Accept': 'application/pdf' });
    if ((environment as any).sapUsername && (environment as any).sapPassword) {
      const basicAuth = btoa(`${(environment as any).sapUsername}:${(environment as any).sapPassword}`);
      headers = headers.set('Authorization', `Basic ${basicAuth}`);
    }
    return this.http
      .get(`${this.base}/InvoicePdfSet(Belnr='${belnr}')/$value?sap-client=${environment.sapClient}`, {
        headers,
        responseType: 'blob'
      })
      .pipe(catchError(this.handleError));
  }

  // -------- PAYMENTS AGING --------
  getPaymentAging(vendorId: string): Observable<PaymentAging[]> {
    const vid = this.rawVendorId(vendorId);
    const params = new HttpParams()
      .set('$filter', `VendorId eq '${vid}'`)
      .set('sap-client', this.sapClient);
    return this.http
      .get<SapResponse<PaymentAging>>(`${this.base}/PaymentAgingSet`, { headers: this.headers, params })
      .pipe(map(r => r.d.results), catchError(this.handleError));
  }

  // -------- CREDIT / DEBIT MEMO --------
  getCreditMemos(vendorId: string): Observable<CreditDebitMemo[]> {
    const vid = this.rawVendorId(vendorId);
    const params = new HttpParams()
      .set('$filter', `VendorId eq '${vid}'`)
      .set('sap-client', this.sapClient);
    return this.http
      .get<SapResponse<CreditDebitMemo>>(`${this.base}/CreditSet`, { headers: this.headers, params })
      .pipe(map(r => r.d.results), catchError(this.handleError));
  }

  // -------- ERROR HANDLER --------
  private handleError(error: any): Observable<never> {
    let msg = 'An unexpected error occurred.';
    if (error?.error?.error?.message?.value) {
      msg = error.error.error.message.value;
    } else if (error?.message) {
      msg = error.message;
    }
    console.error('SAP API Error:', error);
    return throwError(() => new Error(msg));
  }
}
