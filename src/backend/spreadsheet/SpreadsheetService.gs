/**
 * Spreadsheet Service
 *
 * Handles all interactions with Google Spreadsheet (6 case sheets + IRT RAW data).
 * Provides CRUD operations for cases and IRT tracking.
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 4, 5
 */

/**
 * Get the configured spreadsheet
 * @return {Spreadsheet} Spreadsheet object
 * @throws {Error} If spreadsheet ID not configured or invalid
 */
function getSpreadsheet() {
  const spreadsheetId = getConfig(SpreadsheetConfigKeys.SPREADSHEET_ID);

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not configured. Please configure in Settings.');
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    return spreadsheet;
  } catch (error) {
    Logger.log(`Error opening spreadsheet: ${error.message}`);
    throw new Error(`Failed to open spreadsheet: ${error.message}`);
  }
}

/**
 * Validate spreadsheet structure
 * Checks if all required sheets exist
 * @return {Object} Validation result { success: boolean, missingSheets?: string[] }
 */
function validateSpreadsheetStructure() {
  try {
    const spreadsheet = getSpreadsheet();
    const sheets = spreadsheet.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());

    const requiredSheets = SheetNames.getAllCaseSheets();
    requiredSheets.push(SheetNames.IRT_RAW_DATA);

    const missingSheets = requiredSheets.filter(name => !sheetNames.includes(name));

    if (missingSheets.length > 0) {
      return {
        success: false,
        missingSheets: missingSheets,
        error: `Missing required sheets: ${missingSheets.join(', ')}`
      };
    }

    return {
      success: true,
      message: 'All required sheets found',
      foundSheets: sheetNames
    };

  } catch (error) {
    Logger.log(`Spreadsheet validation error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get a specific sheet by name
 * @param {string} sheetName - Sheet name from SheetNames
 * @return {Sheet} Sheet object
 * @throws {Error} If sheet not found
 */
function getSheet(sheetName) {
  try {
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    return sheet;
  } catch (error) {
    Logger.log(`Error getting sheet ${sheetName}: ${error.message}`);
    throw error;
  }
}

/**
 * Get all cases from a specific sheet
 * @param {string} sheetName - Sheet name from SheetNames
 * @param {Object} options - Options { includeHeaders: boolean, startRow: number, maxRows: number }
 * @return {Array<Array>} 2D array of case data
 */
function getCasesFromSheet(sheetName, options = {}) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      // No data rows (only header row or empty)
      return [];
    }

    const startRow = options.startRow || 2; // Skip header row by default
    const numRows = options.maxRows || (lastRow - startRow + 1);
    const numCols = sheet.getLastColumn();

    if (numRows <= 0) {
      return [];
    }

    const data = sheet.getRange(startRow, 1, numRows, numCols).getValues();

    // Filter out empty rows (rows where Case ID is empty)
    const columnMap = getColumnMapping(sheetName);
    const caseIdColumn = columnMap.CASE_ID;

    const filteredData = data.filter(row => {
      const caseId = row[caseIdColumn];
      return caseId && caseId.toString().trim() !== '';
    });

    return filteredData;

  } catch (error) {
    Logger.log(`Error getting cases from ${sheetName}: ${error.message}`);
    throw error;
  }
}

/**
 * Get a single case by Case ID from a specific sheet
 * @param {string} sheetName - Sheet name
 * @param {string} caseId - Case ID to find
 * @return {Object|null} Case object or null if not found
 */
function getCaseByCaseId(sheetName, caseId) {
  try {
    const sheet = getSheet(sheetName);
    const data = getCasesFromSheet(sheetName);
    const columnMap = getColumnMapping(sheetName);
    const caseIdColumn = columnMap.CASE_ID;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[caseIdColumn] && row[caseIdColumn].toString() === caseId.toString()) {
        return {
          rowIndex: i + 2, // +2 because: 1 for header, 1 for 0-based to 1-based
          data: row,
          sheetName: sheetName
        };
      }
    }

    return null;

  } catch (error) {
    Logger.log(`Error getting case ${caseId} from ${sheetName}: ${error.message}`);
    throw error;
  }
}

/**
 * Search for a case across all 6 sheets
 * @param {string} caseId - Case ID to find
 * @return {Object|null} { sheetName, rowIndex, data } or null if not found
 */
function findCaseById(caseId) {
  Logger.log(`findCaseById: Searching for case ID: ${caseId}`);

  const sheets = SheetNames.getAllCaseSheets();

  Logger.log(`findCaseById: Searching in ${sheets.length} sheets: ${sheets.join(', ')}`);

  for (const sheetName of sheets) {
    try {
      Logger.log(`findCaseById: Checking sheet: ${sheetName}`);
      const result = getCaseByCaseId(sheetName, caseId);
      if (result) {
        Logger.log(`findCaseById: Found in ${sheetName} at row ${result.rowIndex}`);
        return result;
      }
    } catch (error) {
      Logger.log(`Error searching ${sheetName} for case ${caseId}: ${error.message}`);
      // Continue searching other sheets
    }
  }

  Logger.log(`findCaseById: Case not found in any sheet: ${caseId}`);
  return null;
}

/**
 * Update a case row
 * @param {string} sheetName - Sheet name
 * @param {number} rowIndex - Row index (1-based)
 * @param {Array} rowData - Complete row data array
 * @return {Object} Update result { success: boolean }
 */
function updateCaseRow(sheetName, rowIndex, rowData) {
  try {
    const sheet = getSheet(sheetName);
    const numCols = rowData.length;

    sheet.getRange(rowIndex, 1, 1, numCols).setValues([rowData]);

    Logger.log(`Updated case in ${sheetName} row ${rowIndex}`);

    return {
      success: true,
      message: 'Case updated successfully'
    };

  } catch (error) {
    Logger.log(`Error updating case in ${sheetName} row ${rowIndex}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Append a new case to a sheet
 * @param {string} sheetName - Sheet name
 * @param {Array} rowData - Case data array
 * @return {Object} Insert result { success: boolean, rowIndex?: number }
 */
function appendCase(sheetName, rowData) {
  try {
    const sheet = getSheet(sheetName);
    sheet.appendRow(rowData);

    const lastRow = sheet.getLastRow();

    Logger.log(`Appended case to ${sheetName} at row ${lastRow}`);

    return {
      success: true,
      rowIndex: lastRow,
      message: 'Case added successfully'
    };

  } catch (error) {
    Logger.log(`Error appending case to ${sheetName}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get cases with IRT <= threshold (for alerts)
 * @param {number} threshold - IRT threshold in hours (default: 2)
 * @return {Array<Object>} Array of cases with low IRT
 */
function getCasesWithLowIRT(threshold = 2) {
  const results = [];
  const sheets = SheetNames.getAllCaseSheets();

  for (const sheetName of sheets) {
    try {
      const data = getCasesFromSheet(sheetName);
      const columnMap = getColumnMapping(sheetName);

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const caseStatus = row[columnMap.CASE_STATUS];
        const irtTimer = row[columnMap.IRT_TIMER];

        // Only check cases that are not Finished
        if (caseStatus !== CaseStatus.FINISHED && irtTimer && !isNaN(irtTimer)) {
          const irtHours = parseFloat(irtTimer);

          if (irtHours <= threshold && irtHours > 0) {
            results.push({
              sheetName: sheetName,
              rowIndex: i + 2,
              caseId: row[columnMap.CASE_ID],
              irtTimer: irtHours,
              assignee: row[columnMap.FINAL_ASSIGNEE] || row[columnMap.FIRST_ASSIGNEE],
              segment: row[columnMap.FINAL_SEGMENT] || row[columnMap.INCOMING_SEGMENT],
              status: caseStatus
            });
          }
        }
      }
    } catch (error) {
      Logger.log(`Error checking IRT in ${sheetName}: ${error.message}`);
    }
  }

  // Sort by IRT ascending (most critical first)
  results.sort((a, b) => a.irtTimer - b.irtTimer);

  return results;
}

/**
 * Get spreadsheet connection status
 * @return {Object} Connection status and info
 */
function getSpreadsheetStatus() {
  try {
    const spreadsheetId = getConfig(SpreadsheetConfigKeys.SPREADSHEET_ID);

    if (!spreadsheetId) {
      return {
        connected: false,
        message: 'Spreadsheet not configured'
      };
    }

    const spreadsheet = getSpreadsheet();
    const validation = validateSpreadsheetStructure();

    return {
      connected: true,
      valid: validation.success,
      spreadsheetId: spreadsheetId,
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl(),
      validation: validation
    };

  } catch (error) {
    Logger.log(`Error getting spreadsheet status: ${error.message}`);
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Configure spreadsheet connection (exposed to frontend)
 * @param {string} spreadsheetId - Spreadsheet ID
 * @return {Object} Configuration result
 */
function configureSpreadsheet(spreadsheetId) {
  try {
    if (!spreadsheetId || spreadsheetId.trim() === '') {
      return {
        success: false,
        error: 'Spreadsheet ID is required'
      };
    }

    // Test connection
    try {
      const testSpreadsheet = SpreadsheetApp.openById(spreadsheetId);
      Logger.log(`Successfully opened spreadsheet: ${testSpreadsheet.getName()}`);
    } catch (error) {
      return {
        success: false,
        error: `Invalid spreadsheet ID or no access: ${error.message}`
      };
    }

    // Save configuration
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(SpreadsheetConfigKeys.SPREADSHEET_ID, spreadsheetId);

    // Validate structure
    const validation = validateSpreadsheetStructure();

    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        missingSheets: validation.missingSheets
      };
    }

    return {
      success: true,
      message: 'Spreadsheet configured successfully',
      validation: validation
    };

  } catch (error) {
    Logger.log(`Error configuring spreadsheet: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Setup missing sheets automatically
 * Creates IRT RAW data sheet and Configuration sheet if they don't exist
 * @return {Object} Setup result { success: boolean, createdSheets: string[] }
 */
function setupMissingSheets() {
  try {
    const spreadsheet = getSpreadsheet();
    const sheets = spreadsheet.getSheets();
    const existingSheetNames = sheets.map(sheet => sheet.getName());

    const requiredSheets = [SheetNames.IRT_RAW_DATA, SheetNames.CONFIGURATION];
    const missingSheets = requiredSheets.filter(name => !existingSheetNames.includes(name));

    if (missingSheets.length === 0) {
      return {
        success: true,
        message: 'All required sheets already exist',
        createdSheets: []
      };
    }

    const createdSheets = [];

    // Create each missing sheet
    for (const sheetName of missingSheets) {
      if (sheetName === SheetNames.IRT_RAW_DATA) {
        createIRTRawDataSheet(spreadsheet);
        createdSheets.push(sheetName);
        Logger.log(`Created sheet: ${sheetName}`);
      } else if (sheetName === SheetNames.CONFIGURATION) {
        createConfigurationSheet(spreadsheet);
        createdSheets.push(sheetName);
        Logger.log(`Created sheet: ${sheetName}`);
      }
    }

    return {
      success: true,
      message: `Successfully created ${createdSheets.length} sheet(s)`,
      createdSheets: createdSheets
    };

  } catch (error) {
    Logger.log(`Error setting up missing sheets: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create IRT RAW data sheet with proper headers
 * @param {Spreadsheet} spreadsheet - Spreadsheet object
 */
function createIRTRawDataSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(SheetNames.IRT_RAW_DATA);

  // Set headers
  const headers = [
    'Case ID',
    'Source Sheet',
    'Case Open DateTime',
    'First SO DateTime',
    'Status History JSON',
    'ReOpen History JSON',
    'Current Status',
    'ReOpen Count',
    'Total SO Period Hours',
    'IRT Hours',
    'IRT Remaining Hours',
    'Last Updated',
    'Updated By'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Case ID
  sheet.setColumnWidth(2, 120); // Source Sheet
  sheet.setColumnWidth(3, 180); // Case Open DateTime
  sheet.setColumnWidth(4, 180); // First SO DateTime
  sheet.setColumnWidth(5, 200); // Status History JSON
  sheet.setColumnWidth(6, 200); // ReOpen History JSON
  sheet.setColumnWidth(7, 130); // Current Status
  sheet.setColumnWidth(8, 100); // ReOpen Count
  sheet.setColumnWidth(9, 150); // Total SO Period Hours
  sheet.setColumnWidth(10, 100); // IRT Hours
  sheet.setColumnWidth(11, 150); // IRT Remaining Hours
  sheet.setColumnWidth(12, 180); // Last Updated
  sheet.setColumnWidth(13, 120); // Updated By

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log('IRT RAW data sheet created successfully');
}

/**
 * Create Configuration sheet with proper structure
 * @param {Spreadsheet} spreadsheet - Spreadsheet object
 */
function createConfigurationSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(SheetNames.CONFIGURATION);

  // Set headers and initial data
  const headers = [
    'Setting Key',
    'Setting Value',
    'Description',
    'Last Updated'
  ];

  const initialData = [
    headers,
    ['IRT_START_DATE', '2025/11/01', 'IRT tracking start date (YYYY/MM/DD format)', new Date().toISOString()],
    ['QUARTER', 'Q4 2025', 'Current quarter', new Date().toISOString()],
    ['PREVIOUS_QUARTER_SPREADSHEET_ID', '', 'Previous quarter spreadsheet ID for reference', ''],
    ['ALERT_EMAIL', '', 'Email address for IRT alerts (comma-separated for multiple)', ''],
    ['AUTO_SYNC_ENABLED', 'TRUE', 'Enable automatic IRT sync (TRUE/FALSE)', new Date().toISOString()],
    ['SYNC_INTERVAL_HOURS', '1', 'IRT sync interval in hours', new Date().toISOString()]
  ];

  sheet.getRange(1, 1, initialData.length, headers.length).setValues(initialData);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 250); // Setting Key
  sheet.setColumnWidth(2, 300); // Setting Value
  sheet.setColumnWidth(3, 400); // Description
  sheet.setColumnWidth(4, 180); // Last Updated

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log('Configuration sheet created successfully');
}

