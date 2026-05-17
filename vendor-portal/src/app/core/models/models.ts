// ===== SAP OData wrapper =====
export interface SapResponse<T> {
  d: {
    results: T[];
  };
}

export interface SapSingleResponse<T> {
  d: T;
}

// ===== Login =====
export interface LoginResult {
  Lifnr: string;    // SAP: Vendor ID (padded, e.g. '0000100000')
  Type: string;     // SAP: 'S' = Success, 'E' = Error
  Msg: string;      // SAP: Message text (e.g. 'Login Successful')
  Password: string; // SAP: Password (returned empty for security)
}

// ===== Vendor Profile =====
export interface VendorProfile {
  VendorId: string;
  Name: string;
  Sortl: string;
  CountryKey: string;
  City: string;
  Postal: string;
  Region: string;
  AccGrp: string;
}

// ===== RFQ =====
export interface Rfq {
  PurDoc: string;
  DocDate: string;
  MatNo: string;
  Description: string;
  OrderQty: string;
  Unit: string;
  NetPrice: string;
  Currency: string;
  VendorId: string;
  DocType: string;
  Item: string;
}

// ===== Purchase Order =====
export interface PurchaseOrder {
  PurDoc: string;
  DocType: string;
  VendorId: string;
  DocDate: string;
  Item: string;
  MatNo: string;
  Description: string;
  OrderQty: string;
  Unit: string;
  NetPrice: string;
  Currency: string;
  Plant: string;
}

// ===== Goods Receipt =====
export interface GoodsReceipt {
  MatDoc: string;
  DocYear: string;
  PoNumber: string;
  PoItem: string;
  VendorId: string;
  MatNo: string;
  Description: string;
  GrQty: string;
  Unit: string;
  Plant: string;
  MoveType: string;
  PostDate: string;
}

// ===== Invoice =====
export interface Invoice {
  InvDoc: string;        // SAP: Invoice Document Number
  FiscYear: string;      // SAP: Fiscal Year
  PoNumber: string;      // SAP: PO Number
  PoItem?: string;       // SAP: PO Item
  MatNo: string;         // SAP: Material Number
  Description?: string;  // SAP: Material Description
  Qty: string;           // SAP: Quantity
  Unit?: string;         // SAP: Unit
  InvAmount: string;     // SAP: Invoice Amount
  Currency: string;      // SAP: Currency
  PostDate: any;         // SAP: Posting Date
  VendorId: string;      // SAP: Vendor ID
  Status?: string;       // SAP: Status (if present)
  Belnr?: string;        // Used for PDF lookup
}

// ===== Payment Aging =====
export interface PaymentAging {
  CompanyCode: string;
  VendorId: string;
  AccDoc: string;
  FiscYear: string;
  DocDate: string;
  PostDate: string;
  DueDate: string;
  Amount: string;
  Currency: string;
  Status: string;
  AgingDays: string;
}

// ===== Credit / Debit Memo =====
export interface CreditDebitMemo {
  CompanyCode: string;
  AccDoc: string;
  FiscYear: string;
  DocType: string;
  VendorId: string;
  DocDate: string;
  PostDate: string;
  Amount: string;
  Currency: string;
  HeaderText: string;
}

// ===== Dashboard KPIs =====
export interface DashboardKpi {
  totalRfq: number;
  totalPo: number;
  totalGr: number;
  totalInvoice: number;
  pendingPayments: number;
  agingAmount: number;
  currency: string;
}
