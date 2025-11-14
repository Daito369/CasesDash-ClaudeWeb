/**
 * IRT (Internal Resolution Time) Service
 *
 * Handles IRT calculation, ReOpen tracking, and IRT RAW data sheet management.
 * IRT = Total time - Solution Offered periods
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 2.7
 */

/**
 * IRT Data class for IRT RAW data sheet
 */
class IRTData {
  constructor(data) {
    this.caseId = data.caseId || '';
    this.sourceSheet = data.sourceSheet || '';
    this.caseOpenDateTime = data.caseOpenDateTime || null;
    this.firstSODateTime = data.firstSODateTime || null;
    this.statusHistoryJSON = data.statusHistoryJSON || '{"history":[]}';
    this.reopenHistoryJSON = data.reopenHistoryJSON || '{"reopens":[],"totalReopens":0,"totalSOPeriodHours":0}';
    this.currentStatus = data.currentStatus || CaseStatus.ASSIGNED;
    this.reopenCount = data.reopenCount || 0;
    this.totalSOPeriodHours = data.totalSOPeriodHours || 0;
    this.irtHours = data.irtHours || 0;
    this.irtRemainingHours = data.irtRemainingHours || 72;
    this.lastUpdated = data.lastUpdated || new Date();
    this.updatedBy = data.updatedBy || '';
  }

  /**
   * Parse status history from JSON
   * @return {Array<Object>}
   */
  getStatusHistory() {
    try {
      const parsed = JSON.parse(this.statusHistoryJSON);
      return parsed.history || [];
    } catch (error) {
      Logger.log(`Error parsing status history: ${error.message}`);
      return [];
    }
  }

  /**
   * Parse reopen history from JSON
   * @return {Object}
   */
  getReopenHistory() {
    try {
      const parsed = JSON.parse(this.reopenHistoryJSON);
      return {
        reopens: parsed.reopens || [],
        totalReopens: parsed.totalReopens || 0,
        totalSOPeriodHours: parsed.totalSOPeriodHours || 0
      };
    } catch (error) {
      Logger.log(`Error parsing reopen history: ${error.message}`);
      return { reopens: [], totalReopens: 0, totalSOPeriodHours: 0 };
    }
  }

  /**
   * Add status change to history
   * @param {string} status - New status
   * @param {string} changedBy - User email
   */
  addStatusChange(status, changedBy) {
    const history = this.getStatusHistory();
    history.push({
      datetime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: status,
      changedBy: changedBy
    });

    this.statusHistoryJSON = JSON.stringify({ history: history });
    this.currentStatus = status;

    // Record first SO datetime
    if (status === CaseStatus.SOLUTION_OFFERED && !this.firstSODateTime) {
      this.firstSODateTime = new Date();
    }
  }

  /**
   * Add reopen event to history
   * @param {Date} soDateTime - Solution Offered datetime
   * @param {Date} reopenDateTime - ReOpen datetime
   * @param {string} reopenedBy - User email
   */
  addReopen(soDateTime, reopenDateTime, reopenedBy) {
    const reopenHistory = this.getReopenHistory();

    // Calculate SO period hours
    const soPeriodMs = reopenDateTime.getTime() - soDateTime.getTime();
    const soPeriodHours = soPeriodMs / (1000 * 60 * 60);

    reopenHistory.reopens.push({
      reopenNumber: reopenHistory.totalReopens + 1,
      soDateTime: formatDateTime(soDateTime),
      reopenDateTime: formatDateTime(reopenDateTime),
      soPeriodHours: parseFloat(soPeriodHours.toFixed(2)),
      reopenedBy: reopenedBy
    });

    reopenHistory.totalReopens += 1;
    reopenHistory.totalSOPeriodHours += soPeriodHours;

    this.reopenHistoryJSON = JSON.stringify(reopenHistory);
    this.reopenCount = reopenHistory.totalReopens;
    this.totalSOPeriodHours = parseFloat(reopenHistory.totalSOPeriodHours.toFixed(2));
  }

  /**
   * Calculate IRT based on status history
   * IRT = Total time from case open to now - Total SO period hours
   *
   * IMPORTANT: When status is Solution Offered, the timer is PAUSED.
   * We need to calculate total SO period including current SO period.
   */
  calculateIRT() {
    if (!this.caseOpenDateTime) {
      this.irtHours = 0;
      this.irtRemainingHours = 72;
      return;
    }

    const now = new Date();
    const caseOpenDate = new Date(this.caseOpenDateTime);
    let totalSOPeriodHours = this.totalSOPeriodHours;

    // If currently in Solution Offered status, add current SO period
    if (this.currentStatus === CaseStatus.SOLUTION_OFFERED && this.firstSODateTime) {
      const statusHistory = this.getStatusHistory();

      // Find the most recent SO datetime
      let lastSODateTime = null;
      for (let i = statusHistory.length - 1; i >= 0; i--) {
        if (statusHistory[i].status === CaseStatus.SOLUTION_OFFERED) {
          lastSODateTime = new Date(statusHistory[i].datetime);
          break;
        }
      }

      if (lastSODateTime) {
        const currentSOPeriodMs = now.getTime() - lastSODateTime.getTime();
        const currentSOPeriodHours = currentSOPeriodMs / (1000 * 60 * 60);
        totalSOPeriodHours += currentSOPeriodHours;
      }
    }

    const totalMs = now.getTime() - caseOpenDate.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);

    // IRT = Total hours - SO period hours
    const irtHours = totalHours - totalSOPeriodHours;

    this.irtHours = parseFloat(irtHours.toFixed(2));
    this.irtRemainingHours = parseFloat((72 - irtHours).toFixed(2));
  }

  /**
   * Convert to sheet row array
   * @return {Array}
   */
  toSheetRow() {
    return [
      this.caseId,
      this.sourceSheet,
      formatDateTime(this.caseOpenDateTime),
      this.firstSODateTime ? formatDateTime(this.firstSODateTime) : '',
      this.statusHistoryJSON,
      this.reopenHistoryJSON,
      this.currentStatus,
      this.reopenCount,
      this.totalSOPeriodHours,
      this.irtHours,
      this.irtRemainingHours,
      formatDateTime(this.lastUpdated),
      this.updatedBy
    ];
  }

  /**
   * Create IRTData from sheet row
   * @param {Array} row - Sheet row
   * @return {IRTData}
   */
  static fromSheetRow(row) {
    return new IRTData({
      caseId: row[0] || '',
      sourceSheet: row[1] || '',
      caseOpenDateTime: row[2] || null,
      firstSODateTime: row[3] || null,
      statusHistoryJSON: row[4] || '{"history":[]}',
      reopenHistoryJSON: row[5] || '{"reopens":[],"totalReopens":0,"totalSOPeriodHours":0}',
      currentStatus: row[6] || CaseStatus.ASSIGNED,
      reopenCount: row[7] || 0,
      totalSOPeriodHours: row[8] || 0,
      irtHours: row[9] || 0,
      irtRemainingHours: row[10] || 72,
      lastUpdated: row[11] || new Date(),
      updatedBy: row[12] || ''
    });
  }
}

/**
 * Get or create IRT data for a case
 * @param {string} caseId - Case ID
 * @return {IRTData|null}
 */
function getOrCreateIRTData(caseId) {
  try {
    const sheet = getSheet(SheetNames.IRT_RAW_DATA);
    const data = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === caseId) {
        // Found existing IRT data
        return IRTData.fromSheetRow(row);
      }
    }

    // Not found, return null
    return null;

  } catch (error) {
    Logger.log(`Error getting IRT data for ${caseId}: ${error.message}`);
    return null;
  }
}

/**
 * Create IRT data entry for a new case
 * @param {Case} caseObj - Case object
 * @param {string} createdBy - User email
 * @return {Object} Result { success: boolean }
 */
function createIRTDataEntry(caseObj, createdBy) {
  try {
    Logger.log(`[createIRTDataEntry] Starting for case ${caseObj.caseId}`);
    Logger.log(`[createIRTDataEntry] Source sheet: ${caseObj.sourceSheet}`);
    Logger.log(`[createIRTDataEntry] Created by: ${createdBy}`);

    const sheet = getSheet(SheetNames.IRT_RAW_DATA);
    Logger.log(`[createIRTDataEntry] IRT RAW data sheet retrieved successfully`);

    const caseOpenDateTime = caseObj.getCaseOpenDateTime();
    Logger.log(`[createIRTDataEntry] Case open datetime: ${caseOpenDateTime}`);

    const irtData = new IRTData({
      caseId: caseObj.caseId,
      sourceSheet: caseObj.sourceSheet,
      caseOpenDateTime: caseOpenDateTime,
      currentStatus: CaseStatus.ASSIGNED,
      updatedBy: createdBy
    });
    Logger.log(`[createIRTDataEntry] IRTData object created`);

    // Add initial status to history
    irtData.addStatusChange(CaseStatus.ASSIGNED, createdBy);
    Logger.log(`[createIRTDataEntry] Initial status added to history`);

    // Calculate initial IRT
    irtData.calculateIRT();
    Logger.log(`[createIRTDataEntry] IRT calculated: ${irtData.irtHours} hours, remaining: ${irtData.irtRemainingHours} hours`);

    // Append to sheet
    const rowData = irtData.toSheetRow();
    Logger.log(`[createIRTDataEntry] Row data prepared, length: ${rowData.length}`);

    sheet.appendRow(rowData);
    Logger.log(`[createIRTDataEntry] Row appended to sheet successfully`);

    Logger.log(`Created IRT data entry for case ${caseObj.caseId}`);

    return {
      success: true,
      message: 'IRT data entry created'
    };

  } catch (error) {
    Logger.log(`[createIRTDataEntry] ERROR: ${error.message}`);
    Logger.log(`[createIRTDataEntry] Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Update case status and track IRT
 * @param {string} caseId - Case ID
 * @param {string} newStatus - New case status
 * @param {string} updatedBy - User email
 * @return {Object} Result { success: boolean }
 */
function updateCaseStatus(caseId, newStatus, updatedBy) {
  try {
    const irtData = getOrCreateIRTData(caseId);

    if (!irtData) {
      return {
        success: false,
        error: `IRT data not found for case ${caseId}`
      };
    }

    const previousStatus = irtData.currentStatus;

    // Check for ReOpen (Solution Offered -> Assigned)
    if (previousStatus === CaseStatus.SOLUTION_OFFERED && newStatus === CaseStatus.ASSIGNED) {
      // This is a ReOpen event
      const statusHistory = irtData.getStatusHistory();

      // Find the most recent SO datetime
      let lastSODateTime = null;
      for (let i = statusHistory.length - 1; i >= 0; i--) {
        if (statusHistory[i].status === CaseStatus.SOLUTION_OFFERED) {
          lastSODateTime = new Date(statusHistory[i].datetime);
          break;
        }
      }

      if (lastSODateTime) {
        irtData.addReopen(lastSODateTime, new Date(), updatedBy);
      }
    }

    // Add status change
    irtData.addStatusChange(newStatus, updatedBy);

    // Recalculate IRT
    irtData.calculateIRT();

    // Update last modified
    irtData.lastUpdated = new Date();
    irtData.updatedBy = updatedBy;

    // Update sheet
    updateIRTDataInSheet(irtData);

    Logger.log(`Updated status for case ${caseId}: ${previousStatus} -> ${newStatus}`);

    return {
      success: true,
      message: 'Case status updated',
      irtData: irtData
    };

  } catch (error) {
    Logger.log(`Error updating case status: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update IRT data in sheet
 * @param {IRTData} irtData - IRT data object
 */
function updateIRTDataInSheet(irtData) {
  try {
    const sheet = getSheet(SheetNames.IRT_RAW_DATA);
    const data = sheet.getDataRange().getValues();

    // Find row by case ID
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === irtData.caseId) {
        // Update this row
        const rowIndex = i + 1; // 1-based
        const rowData = irtData.toSheetRow();
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        Logger.log(`Updated IRT data for case ${irtData.caseId} at row ${rowIndex}`);
        return;
      }
    }

    Logger.log(`Case ${irtData.caseId} not found in IRT RAW data sheet`);

  } catch (error) {
    Logger.log(`Error updating IRT data in sheet: ${error.message}`);
    throw error;
  }
}

/**
 * Get all cases with IRT below threshold (for alerts)
 * @param {number} thresholdHours - IRT threshold in hours (default: 2)
 * @return {Array<IRTData>}
 */
function getCasesWithLowIRT(thresholdHours = 2) {
  try {
    const sheet = getSheet(SheetNames.IRT_RAW_DATA);
    const data = sheet.getDataRange().getValues();
    const results = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const irtData = IRTData.fromSheetRow(row);

      // Only check active cases (not Finished)
      if (irtData.currentStatus !== CaseStatus.FINISHED) {
        if (irtData.irtRemainingHours <= thresholdHours && irtData.irtRemainingHours > 0) {
          results.push(irtData);
        }
      }
    }

    // Sort by IRT remaining (most urgent first)
    results.sort((a, b) => a.irtRemainingHours - b.irtRemainingHours);

    return results;

  } catch (error) {
    Logger.log(`Error getting cases with low IRT: ${error.message}`);
    return [];
  }
}

/**
 * Sync all cases from 6 sheets to IRT RAW data (OPTIMIZED)
 * Creates missing entries and updates existing ones
 * Uses batch operations to minimize SpreadsheetApp calls
 * @return {Object} Sync result { success: boolean, created: number, updated: number }
 */
function syncAllCasesToIRTData() {
  try {
    Logger.log('[syncAllCasesToIRTData] Starting sync...');

    // OPTIMIZATION 1: Load all IRT data into Map for O(1) lookup
    const irtSheet = getSheet(SheetNames.IRT_RAW_DATA);
    const irtLastRow = irtSheet.getLastRow();
    const irtDataMap = new Map();

    if (irtLastRow >= 2) {
      const irtData = irtSheet.getRange(2, 1, irtLastRow - 1, 13).getValues();
      for (let i = 0; i < irtData.length; i++) {
        const caseId = irtData[i][0];
        if (caseId && caseId.toString().trim() !== '') {
          irtDataMap.set(caseId.toString(), IRTData.fromSheetRow(irtData[i]));
        }
      }
    }
    Logger.log(`[syncAllCasesToIRTData] Loaded ${irtDataMap.size} existing IRT entries`);

    const sheets = SheetNames.getAllCaseSheets();
    let created = 0;
    let updated = 0;
    const newIRTEntries = []; // Batch array for new entries
    const updatedIRTEntries = []; // Batch array for updates

    // OPTIMIZATION 2: Process all sheets with batch reads
    for (const sheetName of sheets) {
      try {
        Logger.log(`[syncAllCasesToIRTData] Processing sheet: ${sheetName}`);
        const sheet = getSheet(sheetName);
        const lastRow = sheet.getLastRow();

        if (lastRow < 2) {
          Logger.log(`[syncAllCasesToIRTData] Sheet ${sheetName} is empty, skipping`);
          continue;
        }

        const columnMap = getColumnMapping(sheetName);
        const numCols = sheet.getLastColumn();

        // Batch read all data at once
        const data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();

        // OPTIMIZATION 3: Process in memory (JavaScript is fast)
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const caseId = row[columnMap.CASE_ID];

          if (!caseId || caseId.toString().trim() === '') {
            continue;
          }

          const existingIRTData = irtDataMap.get(caseId.toString());

          if (!existingIRTData) {
            // Create new IRT data entry
            const caseObj = Case.fromSheetRow(row, sheetName, i + 2);
            const irtData = new IRTData({
              caseId: caseObj.caseId,
              sourceSheet: caseObj.sourceSheet,
              caseOpenDateTime: caseObj.getCaseOpenDateTime(),
              currentStatus: CaseStatus.ASSIGNED,
              updatedBy: 'system@sync'
            });

            irtData.addStatusChange(CaseStatus.ASSIGNED, 'system@sync');
            irtData.calculateIRT();

            newIRTEntries.push(irtData.toSheetRow());
            created++;
          } else {
            // Update existing entry if status changed
            const currentStatusInSheet = row[columnMap.CASE_STATUS];

            if (currentStatusInSheet && currentStatusInSheet !== existingIRTData.currentStatus) {
              existingIRTData.addStatusChange(currentStatusInSheet, 'system@sync');
              existingIRTData.calculateIRT();
              existingIRTData.lastUpdated = new Date();
              existingIRTData.updatedBy = 'system@sync';

              updatedIRTEntries.push(existingIRTData);
              updated++;
            }
          }
        }
      } catch (error) {
        Logger.log(`[syncAllCasesToIRTData] Error syncing sheet ${sheetName}: ${error.message}`);
      }
    }

    // OPTIMIZATION 4: Batch write new entries
    if (newIRTEntries.length > 0) {
      Logger.log(`[syncAllCasesToIRTData] Writing ${newIRTEntries.length} new IRT entries in batch...`);
      irtSheet.getRange(irtLastRow + 1, 1, newIRTEntries.length, 13).setValues(newIRTEntries);
    }

    // OPTIMIZATION 5: Batch update existing entries
    if (updatedIRTEntries.length > 0) {
      Logger.log(`[syncAllCasesToIRTData] Updating ${updatedIRTEntries.length} IRT entries...`);
      for (const irtData of updatedIRTEntries) {
        updateIRTDataInSheet(irtData);
      }
    }

    Logger.log(`[syncAllCasesToIRTData] Sync completed: ${created} created, ${updated} updated`);

    return {
      success: true,
      created: created,
      updated: updated
    };

  } catch (error) {
    Logger.log(`[syncAllCasesToIRTData] Error syncing cases to IRT data: ${error.message}`);
    Logger.log(`[syncAllCasesToIRTData] Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Format datetime to YYYY/MM/DD HH:MM:SS
 * @param {Date|string} datetime - Datetime
 * @return {string}
 */
function formatDateTime(datetime) {
  if (!datetime) return '';

  const date = datetime instanceof Date ? datetime : new Date(datetime);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
