import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  parseXmlResponse,
  extractResponseData,
  extractTableItems,
  autoExtractTable,
  normalizeToArray
} from '../utils/xml-parser.util';
import {
  LoginResponse,
  CustomerProfile,
  InquiryItem,
  SalesItem,
  DeliveryItem,
  FinanceItem,
  AgingItem
} from '../models/sap.models';

// ── SOAP Endpoints ──────────────────────────────────────────────────────────
// Confirmed from SAP SE80: ZSD_CUST_PORTAL_093 Enterprise Services
const SOAP_ENDPOINTS = {
  login: '/sap/bc/srt/scs/sap/zsd_cust_login_srv_093?sap-client=100',
  profile: '/sap/bc/srt/scs/sap/zsd_cust_profile_srv_093?sap-client=100',
  inquiry: '/sap/bc/srt/scs/sap/zsd_inquiry_srv_2193?sap-client=100',
  sales: '/sap/bc/srt/scs/sap/zsd_sales_srv_2193?sap-client=100',
  delivery: '/sap/bc/srt/scs/sap/zsd_delivery_srv_2193?sap-client=100',
  finance: '/sap/bc/srt/scs/sap/zsd_cust_finance_srv_0093?sap-client=100',
  pdf: '/sap/bc/srt/scs/sap/zsd_finance_pdf_srv_0093?sap-client=100'
};

// ── SAP RFC Function Module Names ───────────────────────────────────────────
// Confirmed from SAP SE80 screenshot: all use _093 suffix (NOT _0093)
const FM = {
  login: 'ZFM_SD_CUST_LOGIN_093',
  profile: 'ZFM_SD_CUST_PROFILE_093',
  inquiry: 'ZFM_SD_INQUIRY_FINAL_093',
  sales: 'ZFM_SD_SALES_FINAL_093',
  delivery: 'ZFM_SD_DELIVERY_FINAL_093',
  finance: 'ZFM_SD_FINANCE_093',
  pdf: 'ZFM_SD_FINANCE_PDF_093'
};

/** Zero-pad a customer ID to 10 digits as SAP expects */
function padCustId(custId: string): string {
  const stripped = custId.replace(/^0+/, '') || custId;
  return stripped.padStart(10, '0');
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) { }

  private soapHeaders(): HttpHeaders {
    const credentials = btoa('K902093:Vinodh@5284456');
    return new HttpHeaders({
      'Content-Type': 'text/xml;charset=UTF-8',
      'Authorization': `Basic ${credentials}`
    });
  }

  private post(url: string, body: string): Observable<string> {
    console.log('[SAP SOAP] POST →', url);
    return this.http.post(url, body, {
      headers: this.soapHeaders(),
      responseType: 'text'
    });
  }

  /** Build a SOAP envelope wrapping the given inner XML */
  private envelope(functionModule: string, innerXml: string): string {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
<urn:${functionModule}>
${innerXml}
</urn:${functionModule}>
</soapenv:Body>
</soapenv:Envelope>`;
  }

  // ── Helper: extract raw table rows from a SOAP XML response ───────────────
  private extractRows(xmlStr: string, fm: string, ...tableKeys: string[]): any[] {
    const parsed = parseXmlResponse(xmlStr);
    const data = extractResponseData(parsed, fm);
    if (!data) return [];
    console.log(`[${fm}] Response top-level keys:`, Object.keys(data));
    const rows = extractTableItems(data, ...tableKeys) ?? autoExtractTable(data);
    console.log(`[${fm}] Extracted`, rows.length, 'rows');
    if (rows.length > 0) console.log(`[${fm}] First row keys:`, Object.keys(rows[0]));
    return rows;
  }

  // ── Helper: map SAP unit codes to full names ──────────────────────────────
  private mapUnit(code: string): string {
    const raw = String(code || '').trim().toUpperCase();
    const unitMap: { [key: string]: string } = {
      'EA': 'Each',
      'BAG': 'Bag',
      'ST': 'Set / Piece',
      'MGL': 'Milligram/Liter',
      'KG': 'Kilogram',
      'L': 'Liter'
    };
    return unitMap[raw] || raw;
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  login(custId: string, password: string): Observable<LoginResponse> {
    // SAP KUNNR is always 10-digit — try both raw and padded
    const paddedId = padCustId(custId);

    const body = this.envelope(FM.login,
      `<P_CUST_ID>${paddedId}</P_CUST_ID>\n<P_PASSWORD>${password}</P_PASSWORD>`
    );

    return this.post(SOAP_ENDPOINTS.login, body).pipe(
      map(xmlStr => {
        console.log('[Login] Raw XML length:', xmlStr?.length);
        const parsed = parseXmlResponse(xmlStr);
        const data = extractResponseData(parsed, FM.login);

        console.log('[Login] Parsed data keys:', data ? Object.keys(data) : 'null');
        if (!data) throw new Error('Empty or malformed response from login service');

        // Try every known SAP field name for status, message, customer name
        const rawStatus = data['WG_STATUS']
          ?? data['E_RETURN_CODE']
          ?? data['E_STATUS']
          ?? data['STATUS']
          ?? data['WA_STATUS']
          ?? '';
        const status = String(Array.isArray(rawStatus) ? rawStatus[0] : rawStatus).toUpperCase();

        const rawMsg = data['WG_MESSAGE']
          ?? data['E_MESSAGE']
          ?? data['MESSAGE']
          ?? data['WA_MESSAGE']
          ?? '';
        const message = String(Array.isArray(rawMsg) ? rawMsg[0] : rawMsg);

        const rawName = data['E_CUST_NAME']
          ?? data['WG_CUST_NAME']
          ?? data['CUST_NAME']
          ?? data['NAME1']
          ?? data['NAME']
          ?? '';
        const custName = String(Array.isArray(rawName) ? rawName[0] : rawName);

        const success = status === 'S' || status === 'SUCCESS' || status === '1' || status === 'TRUE';

        console.log('[Login] Status:', status, '| Message:', message, '| Name:', custName, '| Success:', success);

        return {
          success,
          message: message || (success ? 'Login successful' : 'Invalid credentials. Please check your Customer ID and password.'),
          custName
        } as LoginResponse;
      }),
      catchError(err => {
        console.error('[Login] HTTP/SOAP error:', err?.status, err?.statusText, err?.message);
        const httpStatus = err?.status;
        let friendlyMsg = 'Login failed. Please try again.';
        if (httpStatus === 0) friendlyMsg = 'Cannot reach SAP server. Check your network connection.';
        if (httpStatus === 401) friendlyMsg = 'SAP Gateway authentication failed (401). Check proxy credentials.';
        if (httpStatus === 403) friendlyMsg = 'Access denied (403). Contact your SAP administrator.';
        if (httpStatus === 404) friendlyMsg = 'SAP Login service not found (404). Check the SOAP endpoint URL.';
        if (httpStatus === 500) friendlyMsg = 'SAP server error (500). The login service may not be activated in SOAMANAGER.';
        if (httpStatus === 503) friendlyMsg = 'SAP server unavailable (503). Please try again later.';
        return throwError(() => ({
          success: false,
          message: friendlyMsg
        }));
      })
    );
  }

  // ── PROFILE ────────────────────────────────────────────────────────────────
  getProfile(custId: string): Observable<CustomerProfile> {
    const paddedId = padCustId(custId);
    const body = this.envelope(FM.profile, `<P_CUST_ID>${paddedId}</P_CUST_ID>`);

    return this.post(SOAP_ENDPOINTS.profile, body).pipe(
      map(xmlStr => {
        const parsed = parseXmlResponse(xmlStr);
        const data = extractResponseData(parsed, FM.profile);
        if (!data) return {} as CustomerProfile;
        const profile = data['WA_PROFILE'] ?? data['ES_PROFILE'] ?? data['ET_PROFILE'] ?? data;
        console.log('[Profile] Raw data keys:', Object.keys(data));
        return profile as CustomerProfile;
      }),
      catchError(err => throwError(() => err))
    );
  }

  // ── INQUIRY ────────────────────────────────────────────────────────────────
  getInquiries(custId: string): Observable<InquiryItem[]> {
    const paddedId = padCustId(custId);
    const body = this.envelope(FM.inquiry,
      `<P_CUST_ID>${paddedId}</P_CUST_ID>`
    );

    return this.post(SOAP_ENDPOINTS.inquiry, body).pipe(
      map(xmlStr => {
        const items = this.extractRows(xmlStr, FM.inquiry,
          'ET_INQUIRY', 'IT_INQUIRY', 'ET_DATA', 'ET_INQUIRIES',
          'ET_VBAK', 'ET_LIST', 'ET_OUTPUT', 'T_INQUIRY'
        );
        return items.map((item: any) => this.mapInquiryRow(item));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Map raw SAP inquiry row → InquiryItem with normalized display keys.
   * SAP field names confirmed from SD module standard:
   *   VBELN = Doc No, ERDAT = Created Date, AUART = Doc Type,
   *   GBSTK = Overall Status, VKORG = Sales Org, NETWR = Net Value, WAERK = Currency
   */
  private mapInquiryRow(item: any): InquiryItem {
    const mapped: any = { ...item };

    mapped.DOC_NO = item.VBELN || item.DOC_NO || item.BELNR || '';
    mapped.DOC_DATE = item.ERDAT || item.DOC_DATE || item.AUDAT || item.BLDAT || '';
    mapped.DOC_TYPE = item.AUART || item.DOC_TYPE || item.BSART || '';
    mapped.STATUS_INQUIRY = item.FKSTK || item.LFSTK || item.GBSTK || item.STATUS_INQUIRY || item.ABGRU || item.STATUS || '';
    mapped.SALES_ORG = item.VKORG || item.SALES_ORG || item.EKORG || '';
    mapped.NET_VALUE = item.NETWR || item.NET_VALUE || item.AMOUNT || '';
    mapped.CURRENCY = item.WAERK || item.CURRENCY || item.WAERS || '';
    mapped.MATERIAL_NAME = item.ARKTX || item.MAT_DES || item.MAKTX || '';

    // Additional fields requested by user
    mapped.CREATED_BY = item.ERNAM || '';
    mapped.DIST_CHANNEL = item.VTWEG || '';
    mapped.DIVISION = item.SPART || '';
    mapped.CUSTOMER_REF = item.BSTNK || '';
    mapped.DOC_CATEGORY = item.VBTYP || '';

    return mapped as InquiryItem;
  }

  // ── SALES ──────────────────────────────────────────────────────────────────
  getSales(custId: string): Observable<SalesItem[]> {
    const body = this.envelope(FM.sales,
      `<P_CUST_ID>${custId}</P_CUST_ID>`
    );

    return this.post(SOAP_ENDPOINTS.sales, body).pipe(
      map(xmlStr => {
        const items = this.extractRows(xmlStr, FM.sales,
          'ET_SALES', 'IT_SALES', 'ET_ORDERS', 'ET_VBAK',
          'ET_DATA', 'ET_LIST', 'ET_OUTPUT', 'ET_SALES_ORDERS', 'T_SALES'
        );
        return items.map((item: any) => this.mapSalesRow(item));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Map raw SAP sales row → SalesItem with normalized display keys.
   * VBELN=Order No, ERDAT=Date, AUART=Type, VKORG=Sales Org, NETWR=Amount, WAERK=Currency
   */
  private mapSalesRow(item: any): SalesItem {
    const mapped: any = { ...item };

    mapped.DOC_NO = item.VBELN || item.DOC_NO || item.ORDER_NO || '';
    mapped.DOC_DATE = item.ERDAT || item.DOC_DATE || item.ORDER_DATE || item.BLDAT || '';
    mapped.DOC_TYPE = item.AUART || item.DOC_TYPE || item.BSART || '';
    mapped.SALES_ORG = item.VKORG || item.SALES_ORG || '';
    
    mapped.AMOUNT = item.NETWR || item.AMOUNT || item.NET_VALUE || '';
    mapped.CURRENCY = item.WAERK || item.CURRENCY || item.WAERS || '';

    mapped.MATERIAL_NAME = item.ARKTX || item.MAKTX || item.MAT_DES || '';
    mapped.QUANTITY = item.KWMENG || item.QUANTITY || '';
    mapped.UNIT = this.mapUnit(item.VRKME || item.UNIT || '');

    // Additional fields requested by user
    mapped.DIST_CHANNEL = item.VTWEG || '';
    mapped.DIVISION = item.SPART || '';
    mapped.ITEM_NO = item.POSNR || '';
    mapped.MATERIAL_NO = item.MATNR || '';

    return mapped as SalesItem;
  }

  // ── DELIVERY ───────────────────────────────────────────────────────────────
  getDeliveries(custId: string): Observable<DeliveryItem[]> {
    const body = this.envelope(FM.delivery,
      `<P_CUST_ID>${custId}</P_CUST_ID>
       <IT_DELIVERY>
         <item></item>
       </IT_DELIVERY>`
    );

    return this.post(SOAP_ENDPOINTS.delivery, body).pipe(
      map(xmlStr => {
        const items = this.extractRows(xmlStr, FM.delivery,
          'ET_DELIVERY', 'IT_DELIVERY', 'ET_LIKP', 'ET_DELIVERIES',
          'ET_DATA', 'ET_LIST', 'ET_OUTPUT', 'T_DELIVERY'
        );
        return items
          .map((item: any) => this.mapDeliveryRow(item))
          .filter((item: any) => {
            const id = item.DELIVERY_NO || '';
            return id && String(id).trim() !== '' && id !== '0000000000' && id !== '000000000';
          });
      }),
      catchError(err => {
        console.warn('[Delivery] SAP service failed:', err?.status);
        return throwError(() => err);
      })
    );
  }

  /**
   * Map raw SAP delivery row → DeliveryItem with normalized display keys.
   * VBELN=Delivery No, ERDAT=Created Date, LFART=Type, WBSTK=Status, WADAT=Goods Issue Date, KUNNR=Ship-To
   */
  private mapDeliveryRow(item: any): DeliveryItem {
    const mapped: any = { ...item };

    mapped.DELIVERY_NO = item.DEL_NO || item.DELIVERY_NO || item.VBELN || item.DOC_NO || '';
    mapped.CREATED_DATE = item.DEL_DATE || item.CREATED_DATE || item.ERDAT || item.BLDAT || '';
    mapped.DELIVERY_TYPE = item.DEL_TYP || item.DELIVERY_TYPE || item.LFART || item.DOC_TYPE || '';
    mapped.DELIVERY_STATUS = item.WBSTK || item.GBSTK || item.STATUS || item.DELIVERY_STATUS || '';
    mapped.GOODS_ISSUE_DATE = item.PLAN_DATE || item.GOODS_ISSUE_DATE || item.WADAT_IST || item.WADAT || item.LFDAT || '';
    mapped.SHIP_TO_PARTY = item.SHIP_PNT || item.SHIP_TO_PARTY || item.KUNNR || item.KUNWE || '';
    mapped.MATERIAL_NAME = item.MAT_DES || item.ARKTX || item.MAKTX || '';
    mapped.QUANTITY = item.DEL_QTY || item.KWMENG || '';
    mapped.UNIT = this.mapUnit(item.S_UNIT || item.VRKME || '');

    // Additional fields requested by user
    mapped.ITEM_NO = item.DEL_ITM || '';
    mapped.MATERIAL_NO = item.MAT_NO || '';
    mapped.REF_DOC = item.REF_DOC || '';
    mapped.REF_ITEM = item.REF_ITEM || '';

    return mapped as DeliveryItem;
  }

  // ── FINANCE ────────────────────────────────────────────────────────────────
  getFinance(custId: string): Observable<{ invoices: FinanceItem[]; aging: AgingItem[]; payments: FinanceItem[] }> {
    const body = this.envelope(FM.finance,
      `<P_CUST_ID>${custId}</P_CUST_ID>
       <IT_INVOICE>
         <item></item>
       </IT_INVOICE>
       <IT_PAYMENT_AGING>
         <item></item>
       </IT_PAYMENT_AGING>
       <IT_CREDIT_DEBIT>
         <item></item>
       </IT_CREDIT_DEBIT>`
    );

    return this.post(SOAP_ENDPOINTS.finance, body).pipe(
      map(xmlStr => this.parseFinanceResponse(xmlStr, FM.finance)),
      catchError(financeErr => {
        console.warn('[Finance] Finance data service failed:', financeErr?.status, '— trying PDF endpoint as data fallback');
        const pdfBody = this.envelope(FM.pdf, `<P_CUST_ID>${custId}</P_CUST_ID>`);
        return this.post(SOAP_ENDPOINTS.pdf, pdfBody).pipe(
          map(xmlStr => {
            const result = this.parseFinanceResponse(xmlStr, FM.pdf);
            if (result.invoices.length === 0) throw financeErr;
            return result;
          }),
          catchError(err => {
            console.error('[Finance] Critical failure in both primary and fallback services:', err);
            return of({ invoices: [], aging: [], payments: [] });
          })
        );
      })
    );
  }

  private parseFinanceResponse(xmlStr: string, fm: string): { invoices: FinanceItem[]; aging: AgingItem[]; payments: FinanceItem[] } {
    const parsed = parseXmlResponse(xmlStr);
    const data = extractResponseData(parsed, fm);
    if (data) console.log(`[Finance][${fm}] Top-level keys:`, Object.keys(data));

    const rawInvoices = extractTableItems(data,
      'IT_INVOICE', 'ET_INVOICE', 'IT_FINANCE', 'ET_FINANCE', 'ET_INVOICES', 'IT_INVOICES',
      'ET_BKPF', 'ET_BSID', 'ET_STATEMENT', 'IT_STATEMENT',
      'ET_DATA', 'ET_LIST', 'ET_OUTPUT', 'T_INVOICES',
      'ET_VBRK', 'IT_VBRK', 'ET_BILLING', 'IT_BILLING'
    ) ?? autoExtractTable(data);

    const rawAging = extractTableItems(data,
      'IT_PAYMENT_AGING', 'ET_PAYMENT_AGING', 'ET_AGING', 'IT_AGING', 'ET_AGING_ANALYSIS',
      'ET_AGING_DATA', 'T_AGING'
    ) ?? [];

    const rawMemos = extractTableItems(data,
      'IT_CREDIT_DEBIT', 'ET_CREDIT_DEBIT', 'ET_MEMO', 'IT_MEMO', 'ET_MEMOS',
      'T_MEMOS'
    ) ?? [];

    return {
      invoices: rawInvoices.map((item: any) => this.mapFinanceRow(item)),
      aging: rawAging.map((item: any) => this.mapFinanceRow(item)),
      payments: rawMemos.map((item: any) => this.mapFinanceRow(item))
    };
  }

  /**
   * Fetch the SAP-generated PDF statement (Base64 encoded string).
   * Passes the specific invoice data to SAP so the Adobe Form only renders that exact row.
   */
  getPdfStatement(custId: string, invoice?: any): Observable<string> {
    let payload = '';
    
    // As per the updated SAP Function Module, the P_CUST_ID parameter is now mapped 
    // to the VBELN type (Document Number). So we pass the invoice number here.
    if (invoice) {
      const docNo = invoice.INVOICE_NO || invoice.DOC_NO || '';
      const paddedDocNo = String(docNo).padStart(10, '0');
      payload = `<P_CUST_ID>${paddedDocNo}</P_CUST_ID>`;
    } else {
      payload = `<P_CUST_ID>${padCustId(custId)}</P_CUST_ID>`;
    }

    const body = this.envelope(FM.pdf, payload);
    return this.post(SOAP_ENDPOINTS.pdf, body).pipe(
      map(xmlStr => {
        const parsed = parseXmlResponse(xmlStr);
        const data = extractResponseData(parsed, FM.pdf);
        if (!data) return '';
        
        // SAP might return the PDF in different fields depending on how the RFC is configured
        const base64 = data['EV_PDF'] 
          ?? data['E_PDF'] 
          ?? data['LV_PDF'] 
          ?? data['E_XSTRING'] 
          ?? data['ET_PDF'] 
          ?? data['E_PDF_CONTENT'] 
          ?? '';
          
        return base64;
      }),
      catchError(err => {
        console.error('[PDF] Failed to fetch PDF from SAP:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Map raw SAP finance row → FinanceItem with normalized display keys.
   * VBELN_VF=Invoice No, KUNNR=Customer ID, FKDAT=Invoice Date, WAERK=Currency,
   * NAME1_GP=Customer Name, MAKTX=Material, NETWR=Amount, FAEDT=Due Date
   */
  private mapFinanceRow(item: any): FinanceItem {
    const mapped: any = { ...item };

    mapped.INVOICE_NO = item.INVOICE_NO
      || item.VBELN_VF
      || item.VBELN
      || item.DOC_NO
      || item.BELNR
      || '';

    mapped.DOC_NO = item.DOC_NO
      || item.VBELN_VF
      || item.VBELN
      || item.BELNR
      || mapped.INVOICE_NO
      || '';

    mapped.CUSTOMER_ID = item.CUSTOMER_ID
      || item.KUNNR
      || item.KUNAG
      || '';

    mapped.INVOICE_DATE = item.INVOICE_DATE
      || item.FKDAT
      || item.BLDAT
      || item.DOC_DATE
      || '';

    mapped.POSTING_DATE = item.POSTING_DATE
      || item.FKDAT
      || item.BLDAT
      || '';

    mapped.CURRENCY = item.CURRENCY
      || item.WAERK
      || item.WAERS
      || '';

    mapped.CUSTOMER_NAME = item.CUSTOMER_NAME
      || item.NAME1_GP
      || item.NAME1
      || '';

    mapped.MATERIAL_NAME = item.MATERIAL_NAME
      || item.MAKTX
      || item.ARKTX
      || '';

    const valKey = Object.keys(item).find(k => /^(NETWR|DMBTR|AMOUNT|WRBTR)/i.test(k));
    mapped.AMOUNT = item.AMOUNT || (valKey ? item[valKey] : '') || '0';

    mapped.DUE_DATE = item.DUE_DATE
      || item.FAEDT
      || item.DATS
      || item.ZFBDT
      || '';

    mapped.AGING_DAYS = item.AGING_DAYS
      || item.INT4
      || item.AGING
      || '0';

    mapped.DOC_CATEGORY = item.DOC_CATEGORY
      || item.VBTYP
      || '';

    mapped.BILLING_TYPE = item.BILLING_TYPE
      || item.FKART
      || '';

    mapped.BILLING_DATE = item.BILLING_DATE
      || item.FKDAT
      || '';

    return mapped as FinanceItem;
  }

  // ── PDF DOWNLOAD ───────────────────────────────────────────────────────────
  downloadPdf(custId: string, docNo?: string | number): Observable<string> {
    let innerXml = '';

    // Pass the document number to P_CUST_ID based on the updated SAP structure
    if (docNo) {
      const paddedDocNo = String(docNo).padStart(10, '0');
      innerXml = `<P_CUST_ID>${paddedDocNo}</P_CUST_ID>`;
    } else {
      const paddedId = padCustId(custId);
      innerXml = `<P_CUST_ID>${paddedId}</P_CUST_ID>`;
    }

    const body = this.envelope(FM.pdf, innerXml);

    return this.post(SOAP_ENDPOINTS.pdf, body).pipe(
      map(xmlStr => {
        const parsed = parseXmlResponse(xmlStr);
        const data = extractResponseData(parsed, FM.pdf);
        console.log('[PDF] SAP response keys:', data ? Object.keys(data) : 'null');

        const base64 = data?.['LV_PDF']
          ?? data?.['EV_PDF']
          ?? data?.['E_PDF']
          ?? data?.['E_PDF_CONTENT']
          ?? data?.['ET_PDF']
          ?? data?.['E_XSTRING']
          ?? '';

        console.log('[PDF] Extracted base64 length:', base64?.length ?? 0);
        return base64;
      }),
      catchError(err => throwError(() => err))
    );
  }
}
