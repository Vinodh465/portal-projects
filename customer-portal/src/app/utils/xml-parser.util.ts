import { XMLParser } from 'fast-xml-parser';

// Only 'item' is forced as an array — it's SAP's standard repeating row element.
// Forcing ET_*/IT_* as arrays was causing an extra wrapper level:
//   ET_SALES: [{ item: [{row data}] }] instead of ET_SALES: { item: [{row data}] }
// This was making each "row" be {item:[...]} instead of the actual data object.
const parser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,   // strips soapenv:, n0:, urn: etc.
  isArray: (tagName: string) => tagName === 'item'
});

/**
 * Parse SOAP XML string → plain JS object.
 */
export function parseXmlResponse(xml: string): any {
  try {
    const result = parser.parse(xml);
    console.log('[SOAP] Raw parsed XML:', JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    console.error('[SOAP] Parse error:', e);
    return null;
  }
}

/**
 * Extract the response data object from the SOAP Envelope > Body.
 * Tries the function module name first, then falls back to the first key.
 */
export function extractResponseData(parsed: any, _functionName?: string): any {
  if (!parsed) return null;

  const envelope = parsed['Envelope'] ?? parsed;
  const body = envelope['Body'] ?? envelope;

  const bodyKeys = Object.keys(body);
  console.log('[SOAP] Body keys:', bodyKeys);
  if (bodyKeys.length === 0) return null;

  // Try exact function name match first
  if (_functionName) {
    const exact = body[_functionName + 'Response'] ?? body[_functionName];
    if (exact) {
      console.log('[SOAP] Matched by functionName:', _functionName);
      return exact;
    }
  }

  // Fallback to first key in Body
  const firstKey = bodyKeys[0];
  const data = body[firstKey];
  console.log('[SOAP] Using first Body key:', firstKey);
  return data;
}

/**
 * Always returns an array, even if SAP returns a single object.
 */
export function normalizeToArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Unwrap SAP table data from all known structures:
 *
 *   Structure A: { item: [row, row, ...] }          ← most common
 *   Structure B: [row, row, ...]                    ← direct array of rows
 *   Structure C: { item: row }                      ← single row, item not forced array
 *   Structure D: { field1: v, field2: v, ... }      ← single flat row object
 *
 * Returns the array of actual data rows, or [] if nothing found.
 */
function unwrapTableData(table: any): any[] {
  if (table === undefined || table === null || table === '') return [];

  // Structure A & C: object with 'item' key
  if (!Array.isArray(table) && typeof table === 'object') {
    if (table['item'] !== undefined) {
      const rows = normalizeToArray(table['item']);
      if (rows.length > 0) return rows;
    }
    // Structure D: plain flat object with multiple non-object values → treat as 1-row
    const keys = Object.keys(table);
    if (keys.length > 1) {
      return [table];
    }
    return [];
  }

  // Structure B: direct array
  if (Array.isArray(table)) {
    if (table.length === 0) return [];

    // Check if items themselves contain 'item' (i.e., we have [{item:[rows]}])
    // This happens when ET_* tags are parsed as arrays by the XML parser
    const first = table[0];
    if (first && typeof first === 'object' && !Array.isArray(first) && first['item'] !== undefined) {
      // Flatten: collect all items from all elements
      const allRows: any[] = [];
      for (const el of table) {
        const inner = normalizeToArray(el['item']);
        allRows.push(...inner);
      }
      if (allRows.length > 0) return allRows;
    }

    // Plain array of rows
    return table;
  }

  return [];
}

/**
 * Try to extract a table from a response object using the provided key names.
 * Returns null when nothing is found (so ?? fallback chain works correctly).
 */
export function extractTableItems(responseData: any, ...tableKeys: string[]): any[] | null {
  if (!responseData) return null;

  console.log('[SOAP] Response data keys:', Object.keys(responseData));

  for (const key of tableKeys) {
    const table = responseData[key];
    if (table === undefined || table === null || table === '') continue;

    const rows = unwrapTableData(table);
    if (rows.length > 0) {
      console.log(`[SOAP] Found ${rows.length} rows in key "${key}". First row keys:`, Object.keys(rows[0]));
      return rows;
    }
  }
  return null;
}

/**
 * Auto-scan all keys: find ANY key that contains table data.
 * Used as last-resort fallback when the table key name is unknown.
 */
export function autoExtractTable(responseData: any): any[] {
  if (!responseData) return [];

  for (const key of Object.keys(responseData)) {
    const val = responseData[key];
    if (val === null || val === undefined || val === '' || typeof val !== 'object') continue;

    const rows = unwrapTableData(val);
    if (rows.length > 0) {
      console.log(`[SOAP] Auto-found ${rows.length} rows in key "${key}"`);
      return rows;
    }
  }
  return [];
}
