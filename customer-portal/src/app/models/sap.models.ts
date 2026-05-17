// SAP Customer Portal — Data Models

export interface LoginResponse {
  success: boolean;
  message: string;
  custName?: string;
}

export interface CustomerProfile {
  KUNNR?: string;
  NAME1?: string;
  NAME2?: string;
  STRAS?: string;
  ORT01?: string;
  PSTLZ?: string;
  LAND1?: string;
  TELF1?: string;
  SMTP_ADDR?: string;
  KDGRP?: string;
  VKBUR?: string;
  KNRZE?: string;
  KREDITLIMIT?: string;
  WAERS?: string;
  [key: string]: any;
}

export interface InquiryItem {
  DOC_NO?: string;
  DOC_DATE?: string;
  DOC_TYPE?: string;
  STATUS_INQUIRY?: string;
  SALES_ORG?: string;
  NET_VALUE?: string;
  CURRENCY?: string;
  [key: string]: any;
}

export interface SalesItem {
  DOC_NO?: string;
  DOC_DATE?: string;
  DOC_TYPE?: string;
  SALES_ORG?: string;
  AMOUNT?: string;
  CURRENCY?: string;
  ORDER_NO?: string;
  VBELN?: string;
  ORDER_DATE?: string;
  ERDAT?: string;
  NET_VALUE?: string;
  NETWR?: string;
  WAERK?: string;
  STATUS?: string;
  FKSTK?: string;
  [key: string]: any;
}

export interface DeliveryItem {
  DELIVERY_NO?: string;
  CREATED_DATE?: string;
  DELIVERY_TYPE?: string;
  DELIVERY_STATUS?: string;
  GOODS_ISSUE_DATE?: string;
  SHIP_TO_PARTY?: string;
  VBELN?: string;
  LFDAT?: string;
  STATUS?: string;
  WBSTK?: string;
  TRACKING?: string;
  [key: string]: any;
}

export interface FinanceItem {
  // Common / Invoice fields
  INVOICE_NO?: string; // VBELN_VF
  CUSTOMER_ID?: string; // KUNNR / KUNAG
  INVOICE_DATE?: string; // FKDAT
  CURRENCY?: string; // WAERK / WAERS
  CUSTOMER_NAME?: string; // NAME1_GP
  MATERIAL_NAME?: string; // MAKTX
  
  // Payment & Aging fields
  DOC_NO?: string; // VBELN / VBELN_VF
  POSTING_DATE?: string; // FKDAT
  AMOUNT?: string; // NETWR / DMBTR
  DUE_DATE?: string; // DATS / FAEDT
  AGING_DAYS?: string; // INT4
  
  // Credit & Debit Memo fields
  DOC_CATEGORY?: string; // VBTYP
  BILLING_TYPE?: string; // FKART
  BILLING_DATE?: string; // FKDAT
  
  // Fallbacks/Internal
  DOC_TYPE?: string;
  STATUS?: string;
  AGING?: string;
  [key: string]: any;
}

export interface AgingItem {
  BUCKET?: string;
  AMOUNT?: string;
  CURRENCY?: string;
  [key: string]: any;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface ApiState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  empty: boolean;
}
