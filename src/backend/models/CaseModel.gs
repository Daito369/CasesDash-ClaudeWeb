/**
 * Case Data Model
 *
 * Defines the structure and validation for case data.
 * Provides factory methods for creating case objects from sheet rows.
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 2
 */

/**
 * Case class representing a case from any of the 6 sheets
 */
class Case {
  constructor(data) {
    // Basic Info
    this.date = data.date || null;                    // Column A (Email sheets only)
    this.caseId = data.caseId || '';
    this.sourceSheet = data.sourceSheet || '';
    this.caseOpenDate = data.caseOpenDate || null;
    this.caseOpenTime = data.caseOpenTime || null;
    this.caseOpenDateTime = data.caseOpenDateTime || null;

    // Segment & Category
    this.incomingSegment = data.incomingSegment || '';
    this.productCategory = data.productCategory || '';
    this.subCategory = data.subCategory || '';          // OT only
    this.issueCategory = data.issueCategory || '';
    this.details = data.details || '';                  // 3PO only

    // Flags
    this.triage = data.triage || false;
    this.amInitiated = data.amInitiated || false;       // Email only
    this.is30 = data.is30 || false;
    this.mcc = data.mcc || false;
    this.changeToChild = data.changeToChild || false;
    this.bugL2 = data.bugL2 || false;

    // Assignee
    this.firstAssignee = data.firstAssignee || '';
    this.finalAssignee = data.finalAssignee || '';
    this.finalSegment = data.finalSegment || '';
    this.salesChannel = data.salesChannel || '';

    // Status
    this.caseStatus = data.caseStatus || CaseStatus.ASSIGNED;
    this.amTransfer = data.amTransfer || '';
    this.nonNCC = data.nonNCC || '';

    // Timers (read from sheet formulas)
    this.trtTimer = data.trtTimer || null;
    this.irtTimer = data.irtTimer || null;

    // Close Info
    this.firstCloseDate = data.firstCloseDate || null;
    this.firstCloseTime = data.firstCloseTime || null;
    this.firstCloseDateTime = data.firstCloseDateTime || null;
    this.reopenCloseDate = data.reopenCloseDate || null;
    this.reopenCloseTime = data.reopenCloseTime || null;
    this.reopenCloseDateTime = data.reopenCloseDateTime || null;

    // Metadata
    this.rowIndex = data.rowIndex || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  /**
   * Get case open datetime as Date object
   * @return {Date|null}
   */
  getCaseOpenDateTime() {
    if (this.caseOpenDateTime) {
      return new Date(this.caseOpenDateTime);
    }
    if (this.caseOpenDate && this.caseOpenTime) {
      return combineDateAndTime(this.caseOpenDate, this.caseOpenTime);
    }
    return null;
  }

  /**
   * Get first close datetime as Date object
   * @return {Date|null}
   */
  getFirstCloseDateTime() {
    if (this.firstCloseDateTime) {
      return new Date(this.firstCloseDateTime);
    }
    if (this.firstCloseDate && this.firstCloseTime) {
      return combineDateAndTime(this.firstCloseDate, this.firstCloseTime);
    }
    return null;
  }

  /**
   * Get reopen close datetime as Date object
   * @return {Date|null}
   */
  getReopenCloseDateTime() {
    if (this.reopenCloseDateTime) {
      return new Date(this.reopenCloseDateTime);
    }
    if (this.reopenCloseDate && this.reopenCloseTime) {
      return combineDateAndTime(this.reopenCloseDate, this.reopenCloseTime);
    }
    return null;
  }

  /**
   * Check if case should be excluded from IRT tracking
   * @return {boolean}
   */
  shouldExclude() {
    return shouldExcludeCase({
      bugL2: this.bugL2,
      amTransfer: this.amTransfer,
      nonNCC: this.nonNCC
    });
  }

  /**
   * Convert case to array for sheet row
   * @param {string} sheetName - Target sheet name
   * @return {Array} Row data array
   */
  toSheetRow(sheetName) {
    const columnMap = getColumnMapping(sheetName);
    const row = [];

    // Initialize array with empty values
    const maxColumn = Math.max(...Object.values(columnMap));
    for (let i = 0; i <= maxColumn; i++) {
      row.push('');
    }

    // Fill in values based on column mapping
    if (sheetName.includes('Email')) {
      // Column A (DATE): Use existing date or today's date for new cases
      if (this.date) {
        // Existing case: preserve original date
        Logger.log(`[toSheetRow] Preserving existing DATE for ${this.caseId}: ${JSON.stringify(this.date)} (type: ${typeof this.date})`);
        row[columnMap.DATE] = this.date;
      } else {
        // New case: use today's date
        Logger.log(`[toSheetRow] Setting new DATE for ${this.caseId}: this.date is empty/null`);
        const today = new Date();
        const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        row[columnMap.DATE] = todayStr;
      }

      // Column B (CASES): Leave empty - sheet has default formula
      row[columnMap.CASES] = '';

      row[columnMap.CASE_ID] = this.caseId;
      row[columnMap.CASE_OPEN_DATE] = this.caseOpenDate;
      row[columnMap.CASE_OPEN_TIME] = this.caseOpenTime;
      row[columnMap.INCOMING_SEGMENT] = this.incomingSegment;
      row[columnMap.PRODUCT_CATEGORY] = this.productCategory;

      if (sheetName.includes('OT')) {
        row[columnMap.SUB_CATEGORY] = this.subCategory;
        row[columnMap.ISSUE_CATEGORY] = this.issueCategory;
        row[columnMap.TRIAGE] = this.triage ? 1 : 0;
        row[columnMap.AM_INITIATED] = this.amInitiated ? 1 : 0;
      } else {
        // 3PO Email
        row[columnMap.TRIAGE] = this.triage ? 1 : 0;
        row[columnMap.AM_INITIATED] = this.amInitiated ? 1 : 0;
        row[columnMap.ISSUE_CATEGORY] = this.issueCategory;
        row[columnMap.DETAILS] = this.details;
      }
    } else {
      // Chat or Phone (no DATE column, starts with CASES at Column A)
      // Column A (CASES): Leave empty - sheet has default formula
      row[columnMap.CASES] = '';

      row[columnMap.CASE_ID] = this.caseId;
      row[columnMap.CASE_OPEN_DATE] = this.caseOpenDate;
      row[columnMap.CASE_OPEN_TIME] = this.caseOpenTime;
      row[columnMap.INCOMING_SEGMENT] = this.incomingSegment;
      row[columnMap.PRODUCT_CATEGORY] = this.productCategory;

      if (sheetName.includes('OT')) {
        row[columnMap.SUB_CATEGORY] = this.subCategory;
        row[columnMap.ISSUE_CATEGORY] = this.issueCategory;
        row[columnMap.TRIAGE] = this.triage ? 1 : 0;
      } else {
        // 3PO Chat/Phone
        row[columnMap.TRIAGE] = this.triage ? 1 : 0;
        row[columnMap.ISSUE_CATEGORY] = this.issueCategory;
        row[columnMap.DETAILS] = this.details;
      }
    }

    // Common fields
    row[columnMap.IS_3_0] = this.is30 ? 1 : 0;
    row[columnMap.FIRST_ASSIGNEE] = this.firstAssignee;
    // TRT_TIMER and IRT_TIMER are formula-calculated
    row[columnMap.MCC] = this.mcc ? 1 : 0;
    row[columnMap.CHANGE_TO_CHILD] = this.changeToChild ? 1 : 0;
    row[columnMap.FINAL_ASSIGNEE] = this.finalAssignee;
    row[columnMap.FINAL_SEGMENT] = this.finalSegment;

    // SALES_CHANNEL (column T): Leave empty - sheet has default formula
    row[columnMap.SALES_CHANNEL] = '';

    row[columnMap.CASE_STATUS] = this.caseStatus;
    row[columnMap.AM_TRANSFER] = this.amTransfer;
    row[columnMap.NON_NCC] = this.nonNCC;

    // Bug/L2 column name varies
    if (columnMap.BUG_L2 !== undefined) {
      row[columnMap.BUG_L2] = this.bugL2 ? 1 : 0;
    } else if (columnMap.BUG_L2_TS_PAYREQ !== undefined) {
      row[columnMap.BUG_L2_TS_PAYREQ] = this.bugL2 ? 1 : 0;
    }

    row[columnMap.FIRST_CLOSE_DATE] = this.firstCloseDate || '';
    row[columnMap.FIRST_CLOSE_TIME] = this.firstCloseTime || '';
    row[columnMap.REOPEN_CLOSE_DATE] = this.reopenCloseDate || '';
    row[columnMap.REOPEN_CLOSE_TIME] = this.reopenCloseTime || '';

    return row;
  }

  /**
   * Create Case from sheet row
   * @param {Array} row - Sheet row data
   * @param {string} sheetName - Sheet name
   * @param {number} rowIndex - Row index (1-based)
   * @return {Case}
   */
  static fromSheetRow(row, sheetName, rowIndex) {
    const columnMap = getColumnMapping(sheetName);
    const data = {};

    data.sourceSheet = sheetName;
    data.rowIndex = rowIndex;

    // Read DATE column (Email sheets only, column A)
    if (columnMap.DATE !== undefined) {
      data.date = row[columnMap.DATE] || null;
      Logger.log(`[fromSheetRow] Reading DATE from ${sheetName} row ${rowIndex}: ${JSON.stringify(row[columnMap.DATE])} (type: ${typeof row[columnMap.DATE]})`);
    }

    data.caseId = row[columnMap.CASE_ID] || '';
    data.caseOpenDate = row[columnMap.CASE_OPEN_DATE] || null;
    data.caseOpenTime = row[columnMap.CASE_OPEN_TIME] || null;
    data.incomingSegment = row[columnMap.INCOMING_SEGMENT] || '';
    data.productCategory = row[columnMap.PRODUCT_CATEGORY] || '';

    if (columnMap.SUB_CATEGORY !== undefined) {
      data.subCategory = row[columnMap.SUB_CATEGORY] || '';
    }

    data.issueCategory = row[columnMap.ISSUE_CATEGORY] || '';

    if (columnMap.DETAILS !== undefined) {
      data.details = row[columnMap.DETAILS] || '';
    }

    data.triage = row[columnMap.TRIAGE] === 1 || row[columnMap.TRIAGE] === true;

    if (columnMap.AM_INITIATED !== undefined) {
      data.amInitiated = row[columnMap.AM_INITIATED] === 1 || row[columnMap.AM_INITIATED] === true;
    }

    data.is30 = row[columnMap.IS_3_0] === 1 || row[columnMap.IS_3_0] === true;
    data.firstAssignee = row[columnMap.FIRST_ASSIGNEE] || '';
    data.trtTimer = row[columnMap.TRT_TIMER] || null;
    data.irtTimer = row[columnMap.IRT_TIMER] || null;
    data.mcc = row[columnMap.MCC] === 1 || row[columnMap.MCC] === true;
    data.changeToChild = row[columnMap.CHANGE_TO_CHILD] === 1 || row[columnMap.CHANGE_TO_CHILD] === true;
    data.finalAssignee = row[columnMap.FINAL_ASSIGNEE] || '';
    data.finalSegment = row[columnMap.FINAL_SEGMENT] || '';
    data.salesChannel = row[columnMap.SALES_CHANNEL] || '';
    data.caseStatus = row[columnMap.CASE_STATUS] || CaseStatus.ASSIGNED;
    data.amTransfer = row[columnMap.AM_TRANSFER] || '';
    data.nonNCC = row[columnMap.NON_NCC] || '';

    // Bug/L2 column name varies
    if (columnMap.BUG_L2 !== undefined) {
      data.bugL2 = row[columnMap.BUG_L2] === 1 || row[columnMap.BUG_L2] === true;
    } else if (columnMap.BUG_L2_TS_PAYREQ !== undefined) {
      data.bugL2 = row[columnMap.BUG_L2_TS_PAYREQ] === 1 || row[columnMap.BUG_L2_TS_PAYREQ] === true;
    }

    data.firstCloseDate = row[columnMap.FIRST_CLOSE_DATE] || null;
    data.firstCloseTime = row[columnMap.FIRST_CLOSE_TIME] || null;
    data.reopenCloseDate = row[columnMap.REOPEN_CLOSE_DATE] || null;
    data.reopenCloseTime = row[columnMap.REOPEN_CLOSE_TIME] || null;

    // Combine date and time
    if (data.caseOpenDate && data.caseOpenTime) {
      data.caseOpenDateTime = combineDateAndTime(data.caseOpenDate, data.caseOpenTime);
    }
    if (data.firstCloseDate && data.firstCloseTime) {
      data.firstCloseDateTime = combineDateAndTime(data.firstCloseDate, data.firstCloseTime);
    }
    if (data.reopenCloseDate && data.reopenCloseTime) {
      data.reopenCloseDateTime = combineDateAndTime(data.reopenCloseDate, data.reopenCloseTime);
    }

    return new Case(data);
  }
}

/**
 * Combine date and time into Date object
 * @param {Date|string} date - Date
 * @param {string|Date} time - Time (HH:MM:SS or Date object)
 * @return {Date}
 */
function combineDateAndTime(date, time) {
  let dateObj = date instanceof Date ? date : new Date(date);

  if (time instanceof Date) {
    // Time is a Date object, extract time components
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    dateObj.setHours(hours, minutes, seconds, 0);
  } else if (typeof time === 'string') {
    // Time is a string like "HH:MM:SS"
    const timeParts = time.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
      dateObj.setHours(hours, minutes, seconds, 0);
    }
  }

  return dateObj;
}
