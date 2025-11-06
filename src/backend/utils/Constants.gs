/**
 * Constants and Configuration
 *
 * Defines sheet names, column mappings, and enumerations for CasesDash.
 * This file centralizes all hardcoded values to ensure consistency.
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 2
 */

/**
 * Sheet Names
 * The 6 case management sheets + 1 IRT tracking sheet
 */
const SheetNames = {
  // Case Management Sheets (6 sheets)
  OT_EMAIL: 'OT Email',
  TPO_EMAIL: '3PO Email',
  OT_CHAT: 'OT Chat',
  TPO_CHAT: '3PO Chat',
  OT_PHONE: 'OT Phone',
  TPO_PHONE: '3PO Phone',

  // IRT Tracking Sheet
  IRT_RAW_DATA: 'IRT RAW data',

  // Configuration Sheet
  CONFIGURATION: 'Configuration',

  // Helper: Get all case sheet names as array
  getAllCaseSheets: function() {
    return [
      this.OT_EMAIL,
      this.TPO_EMAIL,
      this.OT_CHAT,
      this.TPO_CHAT,
      this.OT_PHONE,
      this.TPO_PHONE
    ];
  }
};

/**
 * Column Indices (0-based)
 * Maps column names to their index for each sheet type
 */

// OT Email Columns (Case ID starts at C = column 2)
const OTEmailColumns = {
  DATE: 0,                    // A
  CASES: 1,                   // B (auto-generated)
  CASE_ID: 2,                 // C
  CASE_OPEN_DATE: 3,          // D
  CASE_OPEN_TIME: 4,          // E
  INCOMING_SEGMENT: 5,        // F
  PRODUCT_CATEGORY: 6,        // G
  SUB_CATEGORY: 7,            // H
  ISSUE_CATEGORY: 8,          // I
  TRIAGE: 9,                  // J
  AM_INITIATED: 10,           // K
  IS_3_0: 11,                 // L
  FIRST_ASSIGNEE: 12,         // M
  TRT_TIMER: 13,              // N
  IRT_TIMER: 14,              // O
  MCC: 15,                    // P
  CHANGE_TO_CHILD: 16,        // Q
  FINAL_ASSIGNEE: 17,         // R
  FINAL_SEGMENT: 18,          // S
  SALES_CHANNEL: 19,          // T
  CASE_STATUS: 20,            // U
  AM_TRANSFER: 21,            // V
  NON_NCC: 22,                // W
  BUG_L2: 23,                 // X
  FIRST_CLOSE_DATE: 24,       // Y
  FIRST_CLOSE_TIME: 25,       // Z
  REOPEN_CLOSE_DATE: 26,      // AA
  REOPEN_CLOSE_TIME: 27       // AB
};

// 3PO Email Columns (Case ID starts at C = column 2)
const TPOEmailColumns = {
  DATE: 0,                    // A
  CASES: 1,                   // B (auto-generated)
  CASE_ID: 2,                 // C
  CASE_OPEN_DATE: 3,          // D
  CASE_OPEN_TIME: 4,          // E
  INCOMING_SEGMENT: 5,        // F
  PRODUCT_CATEGORY: 6,        // G
  TRIAGE: 7,                  // H
  AM_INITIATED: 8,            // I
  IS_3_0: 9,                  // J
  ISSUE_CATEGORY: 10,         // K (3PO specific)
  DETAILS: 11,                // L (3PO specific)
  FIRST_ASSIGNEE: 12,         // M
  TRT_TIMER: 13,              // N
  IRT_TIMER: 14,              // O
  MCC: 15,                    // P
  CHANGE_TO_CHILD: 16,        // Q
  FINAL_ASSIGNEE: 17,         // R
  FINAL_SEGMENT: 18,          // S
  SALES_CHANNEL: 19,          // T
  CASE_STATUS: 20,            // U
  AM_TRANSFER: 21,            // V
  NON_NCC: 22,                // W
  BUG_L2_TS_PAYREQ: 23,       // X
  FIRST_CLOSE_DATE: 24,       // Y
  FIRST_CLOSE_TIME: 25,       // Z
  REOPEN_CLOSE_DATE: 26,      // AA
  REOPEN_CLOSE_TIME: 27       // AB
};

// OT Chat Columns (Case ID starts at B = column 1)
const OTChatColumns = {
  CASES: 0,                   // A (auto-generated)
  CASE_ID: 1,                 // B
  CASE_OPEN_DATE: 2,          // C
  CASE_OPEN_TIME: 3,          // D
  INCOMING_SEGMENT: 4,        // E
  PRODUCT_CATEGORY: 5,        // F
  SUB_CATEGORY: 6,            // G
  ISSUE_CATEGORY: 7,          // H
  TRIAGE: 8,                  // I
  IS_3_0: 9,                  // J
  FIRST_ASSIGNEE: 10,         // K
  TRT_TIMER: 11,              // L
  IRT_TIMER: 12,              // M
  MCC: 13,                    // N
  CHANGE_TO_CHILD: 14,        // O
  FINAL_ASSIGNEE: 15,         // P
  FINAL_SEGMENT: 16,          // Q
  SALES_CHANNEL: 17,          // R
  CASE_STATUS: 18,            // S
  AM_TRANSFER: 19,            // T
  NON_NCC: 20,                // U
  BUG_L2: 21,                 // V
  FIRST_CLOSE_DATE: 22,       // W
  FIRST_CLOSE_TIME: 23,       // X
  REOPEN_CLOSE_DATE: 24,      // Y
  REOPEN_CLOSE_TIME: 25       // Z
};

// 3PO Chat Columns (Case ID starts at B = column 1)
const TPOChatColumns = {
  CASES: 0,                   // A (auto-generated)
  CASE_ID: 1,                 // B
  CASE_OPEN_DATE: 2,          // C
  CASE_OPEN_TIME: 3,          // D
  INCOMING_SEGMENT: 4,        // E
  PRODUCT_CATEGORY: 5,        // F
  TRIAGE: 6,                  // G
  IS_3_0: 7,                  // H
  ISSUE_CATEGORY: 8,          // I (3PO specific)
  DETAILS: 9,                 // J (3PO specific)
  FIRST_ASSIGNEE: 10,         // K
  TRT_TIMER: 11,              // L
  IRT_TIMER: 12,              // M
  MCC: 13,                    // N
  CHANGE_TO_CHILD: 14,        // O
  FINAL_ASSIGNEE: 15,         // P
  FINAL_SEGMENT: 16,          // Q
  SALES_CHANNEL: 17,          // R
  CASE_STATUS: 18,            // S
  AM_TRANSFER: 19,            // T
  NON_NCC: 20,                // U
  BUG_L2_TS_PAYREQ: 21,       // V
  FIRST_CLOSE_DATE: 22,       // W
  FIRST_CLOSE_TIME: 23,       // X
  REOPEN_CLOSE_DATE: 24,      // Y
  REOPEN_CLOSE_TIME: 25       // Z
};

// OT Phone Columns (Case ID starts at B = column 1)
const OTPhoneColumns = {
  CASES: 0,                   // A (auto-generated)
  CASE_ID: 1,                 // B
  CASE_OPEN_DATE: 2,          // C
  CASE_OPEN_TIME: 3,          // D
  INCOMING_SEGMENT: 4,        // E
  PRODUCT_CATEGORY: 5,        // F
  SUB_CATEGORY: 6,            // G
  ISSUE_CATEGORY: 7,          // H
  TRIAGE: 8,                  // I
  IS_3_0: 9,                  // J
  FIRST_ASSIGNEE: 10,         // K
  TRT_TIMER: 11,              // L
  IRT_TIMER: 12,              // M
  MCC: 13,                    // N
  CHANGE_TO_CHILD: 14,        // O
  FINAL_ASSIGNEE: 15,         // P
  FINAL_SEGMENT: 16,          // Q
  SALES_CHANNEL: 17,          // R
  CASE_STATUS: 18,            // S
  AM_TRANSFER: 19,            // T
  NON_NCC: 20,                // U
  BUG_L2: 21,                 // V
  FIRST_CLOSE_DATE: 22,       // W
  FIRST_CLOSE_TIME: 23,       // X
  REOPEN_CLOSE_DATE: 24,      // Y
  REOPEN_CLOSE_TIME: 25       // Z
};

// 3PO Phone Columns (Case ID starts at B = column 1)
const TPOPhoneColumns = {
  CASES: 0,                   // A (auto-generated)
  CASE_ID: 1,                 // B
  CASE_OPEN_DATE: 2,          // C
  CASE_OPEN_TIME: 3,          // D
  INCOMING_SEGMENT: 4,        // E
  PRODUCT_CATEGORY: 5,        // F
  TRIAGE: 6,                  // G
  IS_3_0: 7,                  // H
  ISSUE_CATEGORY: 8,          // I (3PO specific)
  DETAILS: 9,                 // J (3PO specific)
  FIRST_ASSIGNEE: 10,         // K
  TRT_TIMER: 11,              // L
  IRT_TIMER: 12,              // M
  MCC: 13,                    // N
  CHANGE_TO_CHILD: 14,        // O
  FINAL_ASSIGNEE: 15,         // P
  FINAL_SEGMENT: 16,          // Q
  SALES_CHANNEL: 17,          // R
  CASE_STATUS: 18,            // S
  AM_TRANSFER: 19,            // T
  NON_NCC: 20,                // U
  BUG_L2_TS_PAYREQ: 21,       // V
  FIRST_CLOSE_DATE: 22,       // W
  FIRST_CLOSE_TIME: 23,       // X
  REOPEN_CLOSE_DATE: 24,      // Y
  REOPEN_CLOSE_TIME: 25       // Z
};

/**
 * Get column mapping for a sheet
 * @param {string} sheetName - Sheet name
 * @return {Object} Column mapping object
 */
function getColumnMapping(sheetName) {
  switch (sheetName) {
    case SheetNames.OT_EMAIL:
      return OTEmailColumns;
    case SheetNames.TPO_EMAIL:
      return TPOEmailColumns;
    case SheetNames.OT_CHAT:
      return OTChatColumns;
    case SheetNames.TPO_CHAT:
      return TPOChatColumns;
    case SheetNames.OT_PHONE:
      return OTPhoneColumns;
    case SheetNames.TPO_PHONE:
      return TPOPhoneColumns;
    default:
      throw new Error(`Unknown sheet name: ${sheetName}`);
  }
}

/**
 * Case Status Values
 */
const CaseStatus = {
  ASSIGNED: 'Assigned',
  SOLUTION_OFFERED: 'Solution Offered',
  FINISHED: 'Finished'
};

/**
 * Segment Values
 */
const Segment = {
  PLATINUM: 'Platinum',
  TITANIUM: 'Titanium',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BRONZE_LOW: 'Bronze - Low',
  BRONZE_HIGH: 'Bronze - High'
};

/**
 * Product Categories
 */
const ProductCategory = {
  SEARCH: 'Search',
  DISPLAY: 'Display',
  VIDEO: 'Video',
  COMMERCE: 'Commerce',
  APPS: 'Apps',
  MA: 'M&A',
  POLICY: 'Policy',
  BILLING: 'Billing',
  OTHER: 'Other'
};

/**
 * IRT Timer Thresholds (in hours)
 * Used for alerts and status indicators
 */
const IRTThresholds = {
  CRITICAL: 2,      // Alert when IRT <= 2 hours
  WARNING: 4,       // Warning when IRT <= 4 hours
  NORMAL: 24        // Normal SLA is 24 hours
};

/**
 * Excluded Case Types
 * Cases that should not count towards IRT metrics
 */
const ExcludedCaseTypes = {
  BUG_CASE: 'Bug Case',
  L2_CONSULT: 'L2 Consult',
  PAYREQ: 'PayReq',
  INVOICE_DISPUTE: 'Invoice Dispute',
  WORKDRIVER: 'Workdriver',
  TS_TEAM: 'T&S Team'
};

/**
 * Check if a case should be excluded from IRT tracking
 * @param {Object} caseData - Case data object
 * @return {boolean} True if case should be excluded
 */
function shouldExcludeCase(caseData) {
  // Bug / L2 checkbox is checked
  if (caseData.bugL2 === true || caseData.bugL2 === 1) {
    return true;
  }

  // AM Transfer contains certain keywords
  const excludedAMTransfers = ['T&S Team', 'Tag team'];
  if (caseData.amTransfer && excludedAMTransfers.some(keyword =>
    caseData.amTransfer.includes(keyword))) {
    return true;
  }

  // non NCC contains PayReq, Invoice
  const excludedNonNCC = ['PayReq', 'Invoice'];
  if (caseData.nonNCC && excludedNonNCC.some(keyword =>
    caseData.nonNCC.includes(keyword))) {
    return true;
  }

  return false;
}

/**
 * Date/Time Format Constants
 */
const DateFormats = {
  DATE: 'YYYY/MM/DD',
  TIME: 'HH:MM:SS',
  DATETIME: 'YYYY/MM/DD HH:MM:SS',
  ISO8601: 'YYYY-MM-DDTHH:mm:ss.sssZ'
};

/**
 * Configuration Keys (used in Script Properties)
 * Extends ConfigKeys from Config.gs
 */
const SpreadsheetConfigKeys = {
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  IRT_START_DATE: 'IRT_START_DATE',
  ALERT_ENABLED: 'IRT_ALERT_ENABLED',
  ALERT_THRESHOLD: 'IRT_ALERT_THRESHOLD',
  AUTO_SYNC_ENABLED: 'AUTO_SYNC_ENABLED',
  SYNC_INTERVAL_HOURS: 'SYNC_INTERVAL_HOURS'
};

/**
 * Default Configuration Values
 */
const SpreadsheetConfigDefaults = {
  IRT_START_DATE: '2025/11/01',
  ALERT_ENABLED: true,
  ALERT_THRESHOLD: 2,           // 2 hours
  AUTO_SYNC_ENABLED: true,
  SYNC_INTERVAL_HOURS: 1        // Sync every 1 hour
};
