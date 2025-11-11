/**
 * NotificationService.gs
 *
 * Gmail notification system for IRT alerts
 * Sends email alerts to team leaders when IRT timer falls below 2 hours
 *
 * Specification: Section 7 - Gmail通知システム
 *
 * @author CasesDash v3.0.0
 */

/**
 * Send IRT alert email to team leader
 * @param {Object} caseData - Case data object
 * @param {string} teamLeaderEmail - Team leader's email address
 * @return {Object} Result object { success: boolean, error?: string }
 */
function sendIRTAlertEmail(caseData, teamLeaderEmail) {
  try {
    Logger.log(`Sending IRT alert email for case ${caseData.caseId} to ${teamLeaderEmail}`);

    // Validate inputs
    if (!caseData || !caseData.caseId) {
      throw new Error('Invalid case data: missing caseId');
    }

    if (!teamLeaderEmail || !teamLeaderEmail.includes('@')) {
      throw new Error('Invalid team leader email address');
    }

    // Get APP_URL from script properties
    const appUrl = PropertiesService.getScriptProperties().getProperty('APP_URL') ||
                   'https://script.google.com/your-app-url';

    // Format IRT timer display
    const irtTimerDisplay = formatIRTTimer(caseData.irtRemainingHours);

    // Email subject
    const subject = `⚠️ IRT Alert: ${caseData.caseId} - Immediate Action Required`;

    // HTML email body
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Google Sans', Roboto, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #ea4335;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .header h2 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .info-row {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 4px;
          }
          .label {
            font-weight: bold;
            color: #5f6368;
            display: inline-block;
            min-width: 150px;
          }
          .value {
            color: #202124;
            margin-left: 10px;
          }
          .warning {
            background-color: #fef7e0;
            border-left: 4px solid #f9ab00;
            padding: 12px;
            margin: 15px 0;
            border-radius: 4px;
          }
          .action-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1a73e8;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
            font-weight: 500;
          }
          .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #dadce0;
            font-size: 12px;
            color: #5f6368;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ IRT Timer Warning</h2>
            <p>Immediate attention required</p>
          </div>
          <div class="content">
            <div class="warning">
              <strong>⚠️ Alert:</strong> IRT timer has fallen below 2 hours. Immediate action required to avoid SLA miss.
            </div>

            <div class="info-row">
              <span class="label">Assignee (LDAP):</span>
              <span class="value">${caseData.finalAssignee || caseData.firstAssignee || 'N/A'}</span>
            </div>

            <div class="info-row">
              <span class="label">Case ID:</span>
              <span class="value">${caseData.caseId}</span>
            </div>

            <div class="info-row">
              <span class="label">Sheet:</span>
              <span class="value">${caseData.sourceSheet || caseData.sheetName || 'N/A'}</span>
            </div>

            <div class="info-row">
              <span class="label">Segment:</span>
              <span class="value">${caseData.finalSegment || caseData.incomingSegment || 'N/A'}</span>
            </div>

            <div class="info-row">
              <span class="label">IRT Remaining Time:</span>
              <span class="value" style="color: #ea4335; font-weight: bold;">${irtTimerDisplay}</span>
            </div>

            <div class="info-row">
              <span class="label">Case Status:</span>
              <span class="value">${caseData.caseStatus || 'N/A'}</span>
            </div>

            <div class="info-row">
              <span class="label">Product Category:</span>
              <span class="value">${caseData.productCategory || 'N/A'}</span>
            </div>

            <div class="info-row">
              <span class="label">Case Opened:</span>
              <span class="value">${formatDateForDisplay(caseData.caseOpenDate)} ${formatTimeForDisplay(caseData.caseOpenTime)}</span>
            </div>

            <a href="${appUrl}" class="action-button">Open CasesDash</a>

            <div class="footer">
              <p>This is an automated notification from CasesDash IRT Alert System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text email body (fallback)
    const plainTextBody = `
⚠️ IRT ALERT - Immediate Action Required

Assignee: ${caseData.finalAssignee || caseData.firstAssignee || 'N/A'}
Case ID: ${caseData.caseId}
Sheet: ${caseData.sourceSheet || caseData.sheetName || 'N/A'}
Segment: ${caseData.finalSegment || caseData.incomingSegment || 'N/A'}
IRT Remaining: ${irtTimerDisplay}
Status: ${caseData.caseStatus || 'N/A'}
Product Category: ${caseData.productCategory || 'N/A'}
Case Opened: ${formatDateForDisplay(caseData.caseOpenDate)} ${formatTimeForDisplay(caseData.caseOpenTime)}

⚠️ IRT timer has fallen below 2 hours. Please take immediate action to avoid SLA miss.

Open CasesDash: ${appUrl}

---
This is an automated notification from CasesDash IRT Alert System.
    `;

    // Send email using GmailApp
    GmailApp.sendEmail(
      teamLeaderEmail,
      subject,
      plainTextBody,
      {
        htmlBody: htmlBody,
        name: 'CasesDash IRT Alert System'
      }
    );

    // Log successful notification
    logNotification(caseData.caseId, teamLeaderEmail, 'IRT_ALERT_2H', 'SUCCESS');

    Logger.log(`IRT alert email sent successfully to ${teamLeaderEmail}`);

    return { success: true };

  } catch (error) {
    Logger.log(`Error sending IRT alert email: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);

    // Log failed notification
    logNotification(
      caseData ? caseData.caseId : 'UNKNOWN',
      teamLeaderEmail,
      'IRT_ALERT_2H',
      'FAILED',
      error.message
    );

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get team leader email address for an assignee
 * @param {string} assigneeLdap - Assignee's LDAP
 * @return {string} Team leader's email address
 */
function getTeamLeaderEmail(assigneeLdap) {
  try {
    Logger.log(`Getting team leader email for assignee: ${assigneeLdap}`);

    // Get spreadsheet ID from Config
    const spreadsheetId = getConfig('SPREADSHEET_ID');
    if (!spreadsheetId) {
      Logger.log('WARNING: Spreadsheet ID not configured, using default TL email');
      return getDefaultTeamLeaderEmail();
    }

    // Open spreadsheet by ID
    const ss = SpreadsheetApp.openById(spreadsheetId);

    // Try to get from Configuration sheet first
    let settingsSheet = ss.getSheetByName('Configuration');

    // Fallback to Settings sheet if Configuration doesn't exist
    if (!settingsSheet) {
      settingsSheet = ss.getSheetByName('Settings');
    }

    if (!settingsSheet) {
      Logger.log('No Configuration or Settings sheet found, using default TL email');
      return getDefaultTeamLeaderEmail();
    }

    // Get all data from settings sheet
    const data = settingsSheet.getDataRange().getValues();

    // Look for team structure mapping
    // Expected format: Column A: Assignee LDAP, Column B: Team Leader Email
    for (let i = 1; i < data.length; i++) {
      const rowAssignee = String(data[i][0]).trim().toLowerCase();
      const targetAssignee = String(assigneeLdap).trim().toLowerCase();

      // Remove @google.com if present for comparison
      const cleanRowAssignee = rowAssignee.replace('@google.com', '');
      const cleanTargetAssignee = targetAssignee.replace('@google.com', '');

      if (cleanRowAssignee === cleanTargetAssignee) {
        const tlEmail = data[i][1];
        if (tlEmail && tlEmail.includes('@')) {
          Logger.log(`Found team leader email: ${tlEmail}`);
          return tlEmail;
        }
      }
    }

    // If not found in sheet, use default
    Logger.log(`Team leader not found for ${assigneeLdap}, using default`);
    return getDefaultTeamLeaderEmail();

  } catch (error) {
    Logger.log(`Error getting team leader email: ${error.message}`);
    return getDefaultTeamLeaderEmail();
  }
}

/**
 * Get default team leader email from script properties
 * @return {string} Default team leader email
 */
function getDefaultTeamLeaderEmail() {
  const defaultEmail = PropertiesService.getScriptProperties().getProperty('DEFAULT_TL_EMAIL');

  if (!defaultEmail) {
    Logger.log('WARNING: DEFAULT_TL_EMAIL not set in script properties');
    // Return a placeholder - should be configured by admin
    return 'teamlead@google.com';
  }

  return defaultEmail;
}

/**
 * Log notification to spreadsheet
 * @param {string} caseId - Case ID
 * @param {string} recipient - Recipient email address
 * @param {string} notificationType - Type of notification
 * @param {string} status - Status (SUCCESS/FAILED)
 * @param {string} errorMsg - Error message if failed
 */
function logNotification(caseId, recipient, notificationType, status, errorMsg = '') {
  try {
    // Get spreadsheet ID from Config
    const spreadsheetId = getConfig('SPREADSHEET_ID');
    if (!spreadsheetId) {
      Logger.log('WARNING: Cannot log notification - Spreadsheet ID not configured');
      return;
    }

    // Open spreadsheet by ID
    const ss = SpreadsheetApp.openById(spreadsheetId);
    let logSheet = ss.getSheetByName('Notification Log');

    // Create Notification Log sheet if it doesn't exist
    if (!logSheet) {
      Logger.log('Creating Notification Log sheet');
      logSheet = ss.insertSheet('Notification Log');

      // Add headers
      logSheet.appendRow([
        'Timestamp',
        'Case ID',
        'Recipient',
        'Type',
        'Status',
        'Error'
      ]);

      // Format headers
      const headerRange = logSheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }

    // Append log entry
    logSheet.appendRow([
      new Date(),
      caseId,
      recipient,
      notificationType,
      status,
      errorMsg
    ]);

    Logger.log(`Notification logged: ${caseId} -> ${recipient} (${status})`);

  } catch (error) {
    // If logging fails, at least log to console
    Logger.log(`Failed to log notification to sheet: ${error.message}`);
  }
}

/**
 * Check IRT timers and send alerts for cases below 2 hours
 * This function is called by a time-based trigger (hourly)
 *
 * Specification: Section 7.5
 */
function checkAndSendIRTAlerts() {
  try {
    Logger.log('=== Starting IRT Alert Check ===');

    // Get spreadsheet ID from Config
    const spreadsheetId = getConfig('SPREADSHEET_ID');
    if (!spreadsheetId) {
      Logger.log('ERROR: Spreadsheet ID not configured');
      return { success: false, error: 'Spreadsheet ID not configured' };
    }

    // Open spreadsheet by ID (required for trigger-based execution)
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const irtSheet = ss.getSheetByName('IRT RAW data');

    if (!irtSheet) {
      Logger.log('ERROR: IRT RAW data sheet not found');
      return { success: false, error: 'IRT RAW data sheet not found' };
    }

    const data = irtSheet.getDataRange().getValues();
    let alertsSent = 0;
    let alertsSkipped = 0;

    // Skip header row (i=0)
    for (let i = 1; i < data.length; i++) {
      const caseId = data[i][0]; // A: Case ID

      // Skip empty rows
      if (!caseId) continue;

      const sourceSheet = data[i][1]; // B: Source Sheet
      const currentStatus = data[i][6]; // G: Current Status
      const irtHours = data[i][9]; // J: IRT Hours
      const irtRemainingHours = data[i][10]; // K: IRT Remaining Hours
      const lastNotified = data[i][14]; // O: Last Notified (column 15)

      Logger.log(`Checking case ${caseId}: Status=${currentStatus}, IRT Remaining=${irtRemainingHours}h`);

      // Check notification conditions
      if (shouldSendAlert(currentStatus, irtRemainingHours, lastNotified)) {
        Logger.log(`Case ${caseId} meets alert conditions, sending notification`);

        // Get full case details
        const caseData = getCaseDetailsByCaseId(caseId, sourceSheet);

        if (!caseData) {
          Logger.log(`WARNING: Could not retrieve case details for ${caseId}`);
          alertsSkipped++;
          continue;
        }

        // Add IRT information to case data
        caseData.irtRemainingHours = irtRemainingHours;
        caseData.sourceSheet = sourceSheet;

        // Get team leader email
        const tlEmail = getTeamLeaderEmail(caseData.finalAssignee || caseData.firstAssignee);

        // Send alert email
        const result = sendIRTAlertEmail(caseData, tlEmail);

        if (result.success) {
          // Update last notified timestamp in IRT RAW data sheet
          irtSheet.getRange(i + 1, 15).setValue(new Date()); // O column (index 14, range 15)
          alertsSent++;
          Logger.log(`Alert sent successfully for case ${caseId}`);
        } else {
          Logger.log(`Failed to send alert for case ${caseId}: ${result.error}`);
          alertsSkipped++;
        }

      } else {
        alertsSkipped++;
      }
    }

    Logger.log(`=== IRT Alert Check Complete: ${alertsSent} sent, ${alertsSkipped} skipped ===`);

    return {
      success: true,
      alertsSent: alertsSent,
      alertsSkipped: alertsSkipped
    };

  } catch (error) {
    Logger.log(`ERROR in checkAndSendIRTAlerts: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return { success: false, error: error.message };
  }
}

/**
 * Determine if an alert should be sent for a case
 * @param {string} currentStatus - Current case status
 * @param {number} irtRemainingHours - IRT remaining hours
 * @param {Date|string} lastNotified - Last notification timestamp
 * @return {boolean} True if alert should be sent
 */
function shouldSendAlert(currentStatus, irtRemainingHours, lastNotified) {
  // Must be in Assigned status
  if (currentStatus !== 'Assigned') {
    return false;
  }

  // IRT remaining must be <= 2 hours and > 0
  if (irtRemainingHours > 2 || irtRemainingHours <= 0) {
    return false;
  }

  // Check if recently notified (within last 6 hours)
  if (isRecentlyNotified(lastNotified)) {
    return false;
  }

  return true;
}

/**
 * Check if case was recently notified (within 6 hours)
 * Prevents spam notifications
 * @param {Date|string} lastNotifiedDate - Last notification timestamp
 * @return {boolean} True if recently notified
 */
function isRecentlyNotified(lastNotifiedDate) {
  if (!lastNotifiedDate) {
    return false;
  }

  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const lastNotifiedTime = new Date(lastNotifiedDate);

    return lastNotifiedTime > sixHoursAgo;
  } catch (error) {
    Logger.log(`Error checking last notified time: ${error.message}`);
    return false;
  }
}

/**
 * Get case details by Case ID
 * @param {string} caseId - Case ID
 * @param {string} sourceSheet - Source sheet name
 * @return {Object|null} Case data object
 */
function getCaseDetailsByCaseId(caseId, sourceSheet) {
  try {
    // Use existing CaseService function
    const caseData = getCase(caseId, sourceSheet);

    if (caseData && caseData.case) {
      return caseData.case;
    }

    return null;
  } catch (error) {
    Logger.log(`Error getting case details: ${error.message}`);
    return null;
  }
}

/**
 * Format date for display (YYYY/MM/DD)
 * @param {Date|string} dateValue - Date value (Date object or string)
 * @return {string} Formatted date string
 */
function formatDateForDisplay(dateValue) {
  if (!dateValue) return 'N/A';

  // If already a string in correct format, return as is
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
    return dateValue;
  }

  // Convert to Date object if needed
  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else {
    return 'N/A';
  }

  // Check for invalid date or 1899 issue
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
    return 'N/A';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
}

/**
 * Format time for display (HH:MM:SS)
 * @param {Date|string} timeValue - Time value (Date object or string)
 * @return {string} Formatted time string
 */
function formatTimeForDisplay(timeValue) {
  if (!timeValue) return '';

  // If already a string in correct format, return as is
  if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return timeValue;
  }

  // Convert to Date object if needed
  let date;
  if (timeValue instanceof Date) {
    date = timeValue;
  } else if (typeof timeValue === 'string') {
    date = new Date(timeValue);
  } else {
    return '';
  }

  // Check for invalid date or 1899 issue
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format IRT timer for display (HH:MM:SS)
 * @param {number} irtRemainingHours - IRT remaining hours
 * @return {string} Formatted timer string
 */
function formatIRTTimer(irtRemainingHours) {
  if (irtRemainingHours === null || irtRemainingHours === undefined) {
    return '--:--:--';
  }

  if (irtRemainingHours <= 0) {
    return 'MISSED';
  }

  const totalSeconds = Math.floor(irtRemainingHours * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Test function to send a sample IRT alert
 * For manual testing only
 */
function testSendIRTAlert() {
  const testCaseData = {
    caseId: '1-1234567890123',
    finalAssignee: 'testuser',
    sourceSheet: 'OT Email',
    finalSegment: 'Gold',
    incomingSegment: 'Gold',
    irtRemainingHours: 1.5,
    caseStatus: 'Assigned',
    productCategory: 'Search',
    caseOpenDate: '2025/11/11',
    caseOpenTime: '09:00:00'
  };

  const testTLEmail = 'daito@google.com'; // Replace with actual test email

  const result = sendIRTAlertEmail(testCaseData, testTLEmail);

  Logger.log(`Test notification result: ${JSON.stringify(result)}`);

  return result;
}
