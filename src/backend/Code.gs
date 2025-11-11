/**
 * CasesDash v3.0.0 - Main Entry Point
 *
 * This is the main entry point for the Google Apps Script web application.
 * Handles HTTP requests (doGet/doPost) and serves the frontend.
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md
 */

/**
 * Handle GET requests (serves frontend)
 * @param {Object} e - Event object
 * @return {HtmlOutput} HTML page
 */
function doGet(e) {
  try {
    Logger.log('doGet called');

    // Check authentication
    const authStatus = checkAuthStatus();

    if (!authStatus.authenticated) {
      // Not authenticated - serve login page
      return serveLoginPage();
    }

    // Authenticated - serve main app
    return serveMainApp();

  } catch (error) {
    Logger.log(`doGet error: ${error.message}`);
    return HtmlService
      .createHtmlOutput('<h1>Error</h1><p>Failed to load application. Please try again.</p>')
      .setTitle('Error - CasesDash');
  }
}

/**
 * Handle POST requests (API endpoints)
 * @param {Object} e - Event object
 * @return {ContentService} JSON response
 */
function doPost(e) {
  try {
    Logger.log('doPost called');

    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    // Route to appropriate handler
    switch (action) {
      case 'authenticate':
        return createJsonResponse(authenticate());

      case 'logout':
        return createJsonResponse(logout());

      case 'checkAuth':
        return createJsonResponse(checkAuthStatus());

      default:
        return createJsonResponse({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

  } catch (error) {
    Logger.log(`doPost error: ${error.message}`);
    return createJsonResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Serve login page
 * @return {HtmlOutput} Login page HTML
 */
function serveLoginPage() {
  try {
    const template = HtmlService.createTemplateFromFile('frontend/index');
    template.mode = 'login';
    template.user = null;

    return template.evaluate()
      .setTitle('Login - CasesDash v3.0.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  } catch (error) {
    Logger.log(`Error serving login page: ${error.message}`);

    // Fallback: inline login page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login - CasesDash</title>
          <style>
            body {
              font-family: 'Google Sans', Roboto, Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .login-container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #1a73e8; margin-bottom: 10px; }
            p { color: #5f6368; margin-bottom: 30px; }
            button {
              background: #1a73e8;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 16px;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover { background: #1557b0; }
          </style>
        </head>
        <body>
          <div class="login-container">
            <h1>CasesDash v3.0.0</h1>
            <p>Please login with your Google account</p>
            <button onclick="login()">Login with Google</button>
          </div>
          <script>
            function login() {
              google.script.run
                .withSuccessHandler(onLoginSuccess)
                .withFailureHandler(onLoginFailure)
                .authenticate();
            }

            function onLoginSuccess(result) {
              if (result.success) {
                window.location.reload();
              } else {
                alert('Login failed: ' + result.error);
              }
            }

            function onLoginFailure(error) {
              alert('Login error: ' + error.message);
            }
          </script>
        </body>
      </html>
    `;

    return HtmlService.createHtmlOutput(html)
      .setTitle('Login - CasesDash v3.0.0');
  }
}

/**
 * Serve main application
 * @return {HtmlOutput} Main app HTML
 */
function serveMainApp() {
  try {
    const user = getCurrentUser();
    const template = HtmlService.createTemplateFromFile('frontend/index');
    template.mode = 'app';
    template.user = user;

    return template.evaluate()
      .setTitle('CasesDash v3.0.0 - Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  } catch (error) {
    Logger.log(`Error serving main app: ${error.message}`);

    // Fallback
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CasesDash</title>
        </head>
        <body>
          <h1>Welcome to CasesDash</h1>
          <p>Main application will load here.</p>
        </body>
      </html>
    `;

    return HtmlService.createHtmlOutput(html)
      .setTitle('CasesDash v3.0.0');
  }
}

/**
 * Include external file in HTML template
 * @param {string} filename - File name (e.g., 'frontend/css/main')
 * @return {string} File contents
 */
function include(filename) {
  try {
    const content = HtmlService.createHtmlOutputFromFile(filename).getContent();
    Logger.log(`Successfully included file: ${filename} (${content.length} bytes)`);
    return content;
  } catch (error) {
    const errorMsg = `Error including file ${filename}: ${error.message}`;
    Logger.log(errorMsg);
    // Return error as HTML comment for debugging
    return `/* ERROR: ${errorMsg} */\n`;
  }
}

/**
 * Create JSON response
 * @param {Object} data - Response data
 * @return {ContentService} JSON response
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get application configuration (exposed to frontend)
 * @return {Object} Configuration object
 */
function getAppConfig() {
  try {
    const authStatus = checkAuthStatus();

    return {
      appVersion: '3.0.0',
      authenticated: authStatus.authenticated,
      user: authStatus.user || null,
      config: {
        allowedDomain: getConfig(ConfigKeys.ALLOWED_DOMAIN, 'google.com'),
        theme: getConfig(ConfigKeys.THEME, 'light'),
        language: getConfig(ConfigKeys.LANGUAGE, 'ja')
      }
    };

  } catch (error) {
    Logger.log(`Error getting app config: ${error.message}`);
    return {
      appVersion: '3.0.0',
      authenticated: false,
      error: error.message
    };
  }
}

/**
 * Test function for development
 * @return {Object} Test result
 */
function testAuthentication() {
  Logger.log('=== Authentication Test ===');

  // Test 1: Get current user from Google Session
  const user = Session.getActiveUser();
  const email = user.getEmail();
  Logger.log(`Current user: ${email}`);

  // Test 2: Authenticate
  const authResult = authenticate();
  Logger.log(`Auth result: ${JSON.stringify(authResult)}`);

  // Test 3: Check session
  const session = getActiveSession();
  Logger.log(`Session: ${JSON.stringify(session)}`);

  // Test 4: Check auth status
  const status = checkAuthStatus();
  Logger.log(`Auth status: ${JSON.stringify(status)}`);

  return {
    user: email,
    authResult: authResult,
    session: session,
    status: status
  };
}

/**
 * Get current user information
 * @return {Object} User object { email, name }
 */
function getCurrentUser() {
  try {
    const user = Session.getActiveUser();
    const email = user.getEmail();

    return {
      success: true,
      email: email,
      name: email.split('@')[0] // Extract name from email
    };

  } catch (error) {
    Logger.log(`getCurrentUser error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Details options from Index sheet R column (Detailed category)
 * @return {Object} { success: boolean, details: Array<string> }
 */
function getDetailsOptions() {
  try {
    Logger.log('getDetailsOptions called');

    // Use getSpreadsheet() which reads from configuration (like other functions)
    const spreadsheet = getSpreadsheet();
    Logger.log('Successfully got spreadsheet: ' + spreadsheet.getName());

    // Try to find Index sheet (case-insensitive)
    let indexSheet = spreadsheet.getSheetByName('Index');
    if (!indexSheet) {
      indexSheet = spreadsheet.getSheetByName('index');
    }
    if (!indexSheet) {
      indexSheet = spreadsheet.getSheetByName('INDEX');
    }

    if (!indexSheet) {
      const availableSheets = spreadsheet.getSheets().map(s => s.getName()).join(', ');
      Logger.log('Index sheet not found. Available sheets: ' + availableSheets);
      return {
        success: false,
        error: 'Index sheet not found. Available sheets: ' + availableSheets
      };
    }

    Logger.log('Found Index sheet: ' + indexSheet.getName());

    // Get R column (Detailed category) - assuming data starts from row 2
    const lastRow = indexSheet.getLastRow();
    Logger.log('Last row in Index sheet: ' + lastRow);

    if (lastRow < 2) {
      return {
        success: true,
        details: []
      };
    }

    // Get R2:R{lastRow}
    const range = indexSheet.getRange(2, 18, lastRow - 1, 1); // Column R = 18
    const values = range.getValues();

    // Flatten and filter out empty values
    const details = values
      .map(row => row[0])
      .filter(value => value && value.toString().trim() !== '')
      .map(value => value.toString().trim());

    // Remove duplicates and sort
    const uniqueDetails = [...new Set(details)].sort();

    Logger.log(`Found ${uniqueDetails.length} unique details`);

    return {
      success: true,
      details: uniqueDetails
    };

  } catch (error) {
    Logger.log(`getDetailsOptions error: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Case Management Functions (exposed to frontend)
 */

/**
 * Create a new case
 * @param {Object} caseData - Case data
 * @param {string} sheetName - Target sheet name
 * @return {Object} Creation result
 */
function frontendCreateCase(caseData, sheetName) {
  try {
    Logger.log('frontendCreateCase called');
    Logger.log(`Sheet: ${sheetName}`);
    Logger.log(`Case data: ${JSON.stringify(caseData)}`);

    // Check authentication
    const authCheck = requireAuth();
    if (!authCheck.success) {
      Logger.log('Authentication failed');
      return authCheck;
    }

    const user = authCheck.data;
    Logger.log(`Authenticated user: ${user.email}`);

    const result = createCase(caseData, sheetName, user.email);

    Logger.log(`Case creation result: ${JSON.stringify(result)}`);

    // Ensure we always return an object
    if (!result) {
      Logger.log('ERROR: createCase returned null or undefined');
      return {
        success: false,
        error: 'Internal error: createCase returned null'
      };
    }

    // Return minimal data to avoid serialization issues with Date objects
    // google.script.run has issues with complex objects containing Dates
    const response = {
      success: result.success,
      message: result.message || 'Case created',
      caseId: result.caseId,
      rowIndex: result.rowIndex,
      error: result.error || null
    };

    Logger.log(`Returning response: ${JSON.stringify(response)}`);
    return response;

  } catch (error) {
    Logger.log(`Error in frontendCreateCase: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}


/**
 * Update a case
 * @param {string} caseId - Case ID
 * @param {Object} updates - Updates to apply
 * @return {Object} Update result
 */
function frontendUpdateCase(caseId, updates) {
  try {
    // Check authentication
    const authCheck = requireAuth();
    if (!authCheck.success) {
      return authCheck;
    }

    const user = authCheck.data;
    const result = updateCase(caseId, updates, user.email);

    if (result.success) {
      result.case = serializeCase(result.case);
    }

    Logger.log(`Case ${caseId} updated by ${user.email}`);

    return result;

  } catch (error) {
    Logger.log(`Error in frontendUpdateCase: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get a single case
 * @param {string} caseId - Case ID
 * @return {Object} Case data
 */
function frontendGetCase(caseId) {
  try {
    Logger.log(`frontendGetCase called for: ${caseId}`);

    // Check authentication
    const authCheck = requireAuth();
    if (!authCheck.success) {
      Logger.log('Auth check failed');
      return authCheck;
    }

    Logger.log('Auth check passed, calling getCase()');

    const caseData = getCase(caseId);

    Logger.log(`getCase returned: ${caseData ? 'data' : 'null'}`);

    if (!caseData) {
      Logger.log(`Case not found: ${caseId}`);
      return {
        success: false,
        error: 'Case not found'
      };
    }

    Logger.log(`Serializing case: ${caseData.case.caseId}`);

    const response = {
      success: true,
      case: serializeCase(caseData.case),
      irtData: caseData.irtData,
      sheetName: caseData.sheetName
    };

    Logger.log(`Response prepared, returning`);

    return response;

  } catch (error) {
    Logger.log(`Error in frontendGetCase: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search cases
 * @param {Object} searchCriteria - Search criteria
 * @return {Object} Search results
 */
function frontendSearchCases(searchCriteria) {
  try {
    // Check authentication
    const authCheck = requireAuth();
    if (!authCheck.success) {
      return authCheck;
    }

    const results = searchCases(searchCriteria);

    return {
      success: true,
      results: results.map(item => ({
        case: serializeCase(item.case),
        irtData: item.irtData
      }))
    };

  } catch (error) {
    Logger.log(`Error in frontendSearchCases: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get cases with low IRT (for alerts)
 * @param {number} thresholdHours - Threshold in hours
 * @return {Object} Result with low IRT cases
 */
function frontendGetLowIRTCases(thresholdHours) {
  try {
    // Check authentication
    const authCheck = requireAuth();
    if (!authCheck.success) {
      return authCheck;
    }

    const cases = getCasesWithLowIRT(thresholdHours || 2);

    return {
      success: true,
      cases: cases
    };

  } catch (error) {
    Logger.log(`Error in frontendGetLowIRTCases: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get My Active Cases (OPTIMIZED for performance)
 * Returns all Assigned cases for the current user
 * Uses batch reads and in-memory filtering to minimize service calls
 * @return {Object} Result with user's active cases
 */
function frontendGetMyCases() {
  try {
    Logger.log('frontendGetMyCases called');

    // Check authentication
    const authCheck = requireAuth();
    if (!authCheck.success) {
      return authCheck;
    }

    const user = authCheck.data;
    const ldap = user.email.split('@')[0];

    Logger.log(`Fetching cases for LDAP: ${ldap}`);

    // OPTIMIZATION 1: Read IRT data ONCE and create a Map for O(1) lookup
    const irtDataMap = loadAllIRTDataIntoMap();
    Logger.log(`Loaded ${irtDataMap.size} IRT entries into memory`);

    const allCases = [];
    const sheets = SheetNames.getAllCaseSheets();

    // OPTIMIZATION 2: Read all sheets using batch operations
    for (const sheetName of sheets) {
      try {
        const sheet = getSheet(sheetName);
        const lastRow = sheet.getLastRow();

        if (lastRow < 2) {
          // No data rows (only header or empty)
          continue;
        }

        // Get column mapping for this sheet
        const columnMap = getColumnMapping(sheetName);
        const numCols = sheet.getLastColumn();

        // Read all data at once (batch operation)
        const data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();

        // OPTIMIZATION 3: Filter in memory (JavaScript is fast)
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const caseId = row[columnMap.CASE_ID];
          const caseStatus = row[columnMap.CASE_STATUS];
          const finalAssignee = row[columnMap.FINAL_ASSIGNEE];

          // Skip empty rows
          if (!caseId || caseId.toString().trim() === '') {
            continue;
          }

          // Filter: Final Assignee = current user AND Case Status = Assigned
          if (finalAssignee === ldap && caseStatus === CaseStatus.ASSIGNED) {
            // Create Case object
            const caseObj = Case.fromSheetRow(row, sheetName, i + 2);

            // OPTIMIZATION 4: O(1) lookup from Map instead of reading sheet again
            const irtData = irtDataMap.get(caseId);

            // Calculate current IRT if IRT data exists
            if (irtData) {
              irtData.calculateIRT();
            }

            // Serialize IRT data to ensure clean transfer
            const serializedIRTData = irtData ? {
              caseId: String(irtData.caseId || ''),
              sourceSheet: String(irtData.sourceSheet || ''),
              caseOpenDateTime: irtData.caseOpenDateTime ?
                (irtData.caseOpenDateTime instanceof Date ?
                  irtData.caseOpenDateTime.toISOString() :
                  String(irtData.caseOpenDateTime)) : null,
              currentStatus: String(irtData.currentStatus || ''),
              reopenCount: Number(irtData.reopenCount || 0),
              totalSOPeriodHours: Number(irtData.totalSOPeriodHours || 0),
              irtHours: Number(irtData.irtHours || 0),
              irtRemainingHours: Number(irtData.irtRemainingHours || 0),
              lastUpdated: irtData.lastUpdated ?
                (irtData.lastUpdated instanceof Date ?
                  irtData.lastUpdated.toISOString() :
                  String(irtData.lastUpdated)) : null
            } : null;

            allCases.push({
              case: serializeCase(caseObj),
              irtData: serializedIRTData,
              sheetName: String(sheetName)
            });
          }
        }
      } catch (error) {
        Logger.log(`Error processing sheet ${sheetName}: ${error.message}`);
        // Continue to next sheet
      }
    }

    // Sort by IRT remaining (most urgent first)
    allCases.sort((a, b) => {
      const aRemaining = a.irtData ? a.irtData.irtRemainingHours : 999;
      const bRemaining = b.irtData ? b.irtData.irtRemainingHours : 999;
      return aRemaining - bRemaining;
    });

    Logger.log(`Found ${allCases.length} active cases for ${ldap}`);

    // Prepare response
    const response = {
      success: true,
      cases: allCases,
      totalCases: allCases.length
    };

    // Log response size for debugging
    try {
      const jsonString = JSON.stringify(response);
      Logger.log(`Response size: ${jsonString.length} characters`);
      Logger.log(`Response size: ${(jsonString.length / 1024).toFixed(2)} KB`);
    } catch (e) {
      Logger.log(`Warning: Could not stringify response for size check: ${e.message}`);
    }

    return response;

  } catch (error) {
    Logger.log(`Error in frontendGetMyCases: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Load all IRT data into a Map for fast O(1) lookup
 * This is a key performance optimization - read once, lookup many times
 * @return {Map<string, IRTData>} Map of caseId -> IRTData
 */
function loadAllIRTDataIntoMap() {
  try {
    const sheet = getSheet(SheetNames.IRT_RAW_DATA);
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      // No data rows
      return new Map();
    }

    // Read all IRT data at once (batch operation)
    const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();

    // Build Map for O(1) lookup
    const irtMap = new Map();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const caseId = row[0]; // Case ID is in column A (index 0)

      if (caseId && caseId.toString().trim() !== '') {
        const irtData = IRTData.fromSheetRow(row);
        irtMap.set(caseId.toString(), irtData);
      }
    }

    Logger.log(`Built IRT Map with ${irtMap.size} entries`);
    return irtMap;

  } catch (error) {
    Logger.log(`Error loading IRT data into map: ${error.message}`);
    // Return empty map to allow function to continue
    return new Map();
  }
}

/**
 * Serialize Case object for frontend (OPTIMIZED for google.script.run)
 * Creates a clean, minimal object with only necessary data
 * Converts all Date objects to ISO strings
 * Removes all methods and complex objects
 * @param {Case} caseObj - Case object
 * @return {Object} Serialized case - plain object with primitives only
 */
function serializeCase(caseObj) {
  // Helper function to safely convert Date to string
  const dateToString = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') return value;
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (e) {
      return null;
    }
  };

  // Return ALL the data needed by frontend, with explicit type conversion
  return {
    // Basic Info
    caseId: String(caseObj.caseId || ''),
    sourceSheet: String(caseObj.sourceSheet || ''),
    caseOpenDate: caseObj.caseOpenDate ? String(caseObj.caseOpenDate) : null,
    caseOpenTime: caseObj.caseOpenTime ? String(caseObj.caseOpenTime) : null,

    // Segment & Category
    incomingSegment: String(caseObj.incomingSegment || ''),
    productCategory: String(caseObj.productCategory || ''),
    subCategory: caseObj.subCategory ? String(caseObj.subCategory) : null,
    issueCategory: String(caseObj.issueCategory || ''),
    details: caseObj.details ? String(caseObj.details) : null,

    // Flags (convert to boolean)
    triage: Boolean(caseObj.triage),
    amInitiated: Boolean(caseObj.amInitiated),
    is30: Boolean(caseObj.is30),
    mcc: Boolean(caseObj.mcc),
    changeToChild: Boolean(caseObj.changeToChild),
    bugL2: Boolean(caseObj.bugL2),

    // Assignee
    firstAssignee: String(caseObj.firstAssignee || ''),
    finalAssignee: String(caseObj.finalAssignee || ''),
    finalSegment: String(caseObj.finalSegment || ''),
    salesChannel: caseObj.salesChannel ? String(caseObj.salesChannel) : null,

    // Status and Transfer
    caseStatus: String(caseObj.caseStatus || 'Assigned'),
    amTransfer: caseObj.amTransfer ? String(caseObj.amTransfer) : null,
    nonNCC: caseObj.nonNCC ? String(caseObj.nonNCC) : null,

    // Close dates
    firstCloseDate: caseObj.firstCloseDate ? String(caseObj.firstCloseDate) : null,
    firstCloseTime: caseObj.firstCloseTime ? String(caseObj.firstCloseTime) : null,
    reopenCloseDate: caseObj.reopenCloseDate ? String(caseObj.reopenCloseDate) : null,
    reopenCloseTime: caseObj.reopenCloseTime ? String(caseObj.reopenCloseTime) : null,

    // Timers (read-only from sheet)
    trtTimer: caseObj.trtTimer ? String(caseObj.trtTimer) : null,
    irtTimer: caseObj.irtTimer ? String(caseObj.irtTimer) : null,

    // Row index for reference
    rowIndex: caseObj.rowIndex ? Number(caseObj.rowIndex) : null
  };
}

