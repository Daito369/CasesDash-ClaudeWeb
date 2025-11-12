/**
 * Case Service
 *
 * Handles CRUD operations for cases across all 6 sheets.
 * Integrates with IRTService for IRT tracking.
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 4.3
 */

/**
 * Create a new case
 * @param {Object} caseData - Case data object
 * @param {string} sheetName - Target sheet name
 * @param {string} createdBy - User email
 * @return {Object} Result { success: boolean, caseId?: string, rowIndex?: number }
 */
function createCase(caseData, sheetName, createdBy) {
  try {
    // Validate sheet name
    const validSheets = SheetNames.getAllCaseSheets();
    if (!validSheets.includes(sheetName)) {
      return {
        success: false,
        error: `Invalid sheet name: ${sheetName}`
      };
    }

    // Validate required fields
    const validation = validateCaseData(caseData, sheetName);
    if (!validation.success) {
      return validation;
    }

    // Generate Case ID if not provided
    if (!caseData.caseId) {
      caseData.caseId = generateCaseId();
    }

    // Convert date and time formats to match specification
    const now = new Date();

    // Case Open Date: Convert "YYYY-MM-DD" to "YYYY/MM/DD"
    if (caseData.caseOpenDate && typeof caseData.caseOpenDate === 'string') {
      caseData.caseOpenDate = caseData.caseOpenDate.replace(/-/g, '/');
    } else {
      // Default to today in YYYY/MM/DD format
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      caseData.caseOpenDate = `${year}/${month}/${day}`;
    }

    // Case Open Time: Convert "HH:MM" to "HH:MM:SS" or use current time
    if (caseData.caseOpenTime && typeof caseData.caseOpenTime === 'string') {
      // If only HH:MM provided, add :00 for seconds
      if (caseData.caseOpenTime.length === 5) {
        caseData.caseOpenTime = `${caseData.caseOpenTime}:00`;
      }
    } else {
      // Default to current time in HH:MM:SS format
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      caseData.caseOpenTime = `${hours}:${minutes}:${seconds}`;
    }

    // Set metadata timestamps (these are Date objects for backend use only)
    caseData.createdAt = now;
    caseData.updatedAt = now;
    caseData.createdBy = createdBy;
    caseData.updatedBy = '';

    // Set default values per specification
    caseData.caseStatus = caseData.caseStatus || CaseStatus.ASSIGNED;

    // 1st Assignee: Default to user's LDAP (without @google.com)
    caseData.firstAssignee = caseData.firstAssignee || createdBy.split('@')[0];

    // Final Assignee: Default to 1st Assignee
    caseData.finalAssignee = caseData.finalAssignee || caseData.firstAssignee;

    // Incoming Segment: Default to "Gold" per specification
    caseData.incomingSegment = caseData.incomingSegment || 'Gold';

    // Final Segment: Default to reflect Incoming Segment per specification
    caseData.finalSegment = caseData.finalSegment || caseData.incomingSegment;

    // Create Case object
    const caseObj = new Case(caseData);
    caseObj.sourceSheet = sheetName;

    // Convert to sheet row
    const rowData = caseObj.toSheetRow(sheetName);

    // Append to sheet
    const result = appendCase(sheetName, rowData);

    if (!result.success) {
      return result;
    }

    Logger.log(`Case created: ${caseObj.caseId} in ${sheetName} at row ${result.rowIndex}`);

    // Create IRT data entry
    const irtResult = createIRTDataEntry(caseObj, createdBy);

    if (!irtResult.success) {
      Logger.log(`Warning: Failed to create IRT data entry: ${irtResult.error}`);
    }

    return {
      success: true,
      message: 'Case created successfully',
      caseId: caseObj.caseId,
      rowIndex: result.rowIndex,
      case: caseObj
    };

  } catch (error) {
    Logger.log(`Error creating case: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update a case
 * @param {string} caseId - Case ID
 * @param {Object} updates - Fields to update
 * @param {string} updatedBy - User email
 * @param {string} sheetName - Optional: specific sheet name to update
 * @param {number} rowIndex - Optional: specific row index to update (most accurate)
 * @return {Object} Result { success: boolean }
 */
function updateCase(caseId, updates, updatedBy, sheetName, rowIndex) {
  try {
    // If rowIndex and sheetName are provided, use them directly (most accurate)
    let caseData;
    if (rowIndex && sheetName) {
      Logger.log(`updateCase: Using rowIndex ${rowIndex} in ${sheetName} to update case ${caseId}`);
      caseData = getCaseByRowIndex(sheetName, rowIndex);
    } else {
      // Fallback to Case ID search
      Logger.log(`updateCase: Searching for case ${caseId} in sheet ${sheetName || 'all sheets'}`);
      caseData = findCaseById(caseId, sheetName);
    }

    if (!caseData) {
      return {
        success: false,
        error: `Case not found: ${caseId}`
      };
    }

    // Create Case object from current data
    const caseObj = Case.fromSheetRow(caseData.data, caseData.sheetName, caseData.rowIndex);

    // Track status change for IRT
    const oldStatus = caseObj.caseStatus;
    const newStatus = updates.caseStatus;

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (caseObj.hasOwnProperty(key)) {
        caseObj[key] = updates[key];
      }
    });

    caseObj.updatedAt = new Date();
    caseObj.updatedBy = updatedBy;

    // Convert back to sheet row
    const rowData = caseObj.toSheetRow(caseData.sheetName);

    // Update sheet
    const updateResult = updateCaseRow(caseData.sheetName, caseData.rowIndex, rowData);

    if (!updateResult.success) {
      return updateResult;
    }

    Logger.log(`Case updated: ${caseId} in ${caseData.sheetName}`);

    // Update IRT data if status changed
    if (newStatus && newStatus !== oldStatus) {
      const irtResult = updateCaseStatus(caseId, newStatus, updatedBy);

      if (!irtResult.success) {
        Logger.log(`Warning: Failed to update IRT data: ${irtResult.error}`);
      }
    }

    return {
      success: true,
      message: 'Case updated successfully',
      case: caseObj
    };

  } catch (error) {
    Logger.log(`Error updating case: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reopen a closed case
 * @param {string} caseId - Case ID to reopen
 * @param {string} reopenDate - ReOpen date (YYYY/MM/DD)
 * @param {string} reopenTime - ReOpen time (HH:MM:SS)
 * @param {string} reopenedBy - User email
 * @param {string} sheetName - Sheet name (optional)
 * @param {number} rowIndex - Row index (optional, most accurate)
 * @return {Object} Result { success: boolean, case?: Object, irtData?: Object }
 */
function reopenCase(caseId, reopenDate, reopenTime, reopenedBy, sheetName, rowIndex) {
  try {
    // 1. Get current case data
    let caseData;
    if (rowIndex && sheetName) {
      Logger.log(`reopenCase: Using rowIndex ${rowIndex} in ${sheetName}`);
      caseData = getCaseByRowIndex(sheetName, rowIndex);
    } else {
      Logger.log(`reopenCase: Searching for case ${caseId}`);
      caseData = findCaseById(caseId, sheetName);
    }

    if (!caseData) {
      return {
        success: false,
        error: `Case not found: ${caseId}`
      };
    }

    // Create Case object
    const caseObj = Case.fromSheetRow(caseData.data, caseData.sheetName, caseData.rowIndex);

    // 2. Verify case is in Solution Offered or Finished status
    if (caseObj.caseStatus !== CaseStatus.SOLUTION_OFFERED &&
        caseObj.caseStatus !== CaseStatus.FINISHED) {
      return {
        success: false,
        error: `Cannot reopen case with status: ${caseObj.caseStatus}. Must be Solution Offered or Finished.`
      };
    }

    // 3. Get the last SO datetime from case
    const soDateTime = caseObj.getFirstCloseDateTime();
    if (!soDateTime) {
      return {
        success: false,
        error: 'Cannot determine Solution Offered datetime. First Close Date/Time not found.'
      };
    }

    // 4. Combine reopenDate + reopenTime to create reopenDateTime
    const reopenDateTime = combineDateAndTime(reopenDate, reopenTime);

    // 5. Update case status to "Assigned"
    caseObj.caseStatus = CaseStatus.ASSIGNED;
    caseObj.updatedAt = new Date();
    caseObj.updatedBy = reopenedBy;

    // 6. Get IRT data
    const irtData = getOrCreateIRTData(caseId);

    // 7. Add reopen event to IRT history
    irtData.addReopen(soDateTime, reopenDateTime, reopenedBy);

    // 8. Update IRT current status to Assigned
    irtData.addStatusChange(CaseStatus.ASSIGNED, reopenedBy);

    // 9. Recalculate IRT
    irtData.calculateIRT();

    // 10. Save IRT data
    updateIRTDataInSheet(irtData);

    // 11. Update source sheet
    const rowData = caseObj.toSheetRow(caseData.sheetName);
    const updateResult = updateCaseRow(caseData.sheetName, caseData.rowIndex, rowData);

    if (!updateResult.success) {
      return updateResult;
    }

    Logger.log(`Case reopened: ${caseId} in ${caseData.sheetName}`);

    return {
      success: true,
      message: 'Case reopened successfully',
      case: caseObj,
      irtData: irtData
    };

  } catch (error) {
    Logger.log(`Error reopening case: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get a single case by ID (optionally from specific sheet)
 * @param {string} caseId - Case ID
 * @param {string} sheetName - Optional: specific sheet name to search
 * @return {Object|null} Case data or null
 */
function getCase(caseId, sheetName) {
  try {
    const caseData = findCaseById(caseId, sheetName);

    if (!caseData) {
      return null;
    }

    const caseObj = Case.fromSheetRow(caseData.data, caseData.sheetName, caseData.rowIndex);

    // Get IRT data
    const irtData = getOrCreateIRTData(caseId);

    return {
      case: caseObj,
      irtData: irtData,
      sheetName: caseData.sheetName,
      rowIndex: caseData.rowIndex
    };

  } catch (error) {
    Logger.log(`Error getting case ${caseId}: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return null;
  }
}

/**
 * Get all cases from a specific sheet
 * @param {string} sheetName - Sheet name
 * @param {Object} filters - Filter options { status, assignee, segment }
 * @return {Array<Object>} Array of cases
 */
function getCases(sheetName, filters = {}) {
  try {
    const rows = getCasesFromSheet(sheetName);
    const cases = [];

    for (let i = 0; i < rows.length; i++) {
      const caseObj = Case.fromSheetRow(rows[i], sheetName, i + 2);

      // Apply filters
      if (filters.status && caseObj.caseStatus !== filters.status) {
        continue;
      }

      if (filters.assignee && caseObj.finalAssignee !== filters.assignee) {
        continue;
      }

      if (filters.segment && caseObj.finalSegment !== filters.segment) {
        continue;
      }

      // Get IRT data
      const irtData = getOrCreateIRTData(caseObj.caseId);

      cases.push({
        case: caseObj,
        irtData: irtData
      });
    }

    return cases;

  } catch (error) {
    Logger.log(`Error getting cases from ${sheetName}: ${error.message}`);
    return [];
  }
}

/**
 * Get cases for current user
 * @param {string} userEmail - User email
 * @param {Object} filters - Filter options
 * @return {Array<Object>} Array of cases
 */
function getMyCases(userEmail, filters = {}) {
  try {
    const ldap = userEmail.split('@')[0];
    const allCases = [];
    const sheets = SheetNames.getAllCaseSheets();

    for (const sheetName of sheets) {
      const cases = getCases(sheetName, filters);

      // Filter by assignee
      const myCases = cases.filter(item =>
        item.case.firstAssignee === ldap || item.case.finalAssignee === ldap
      );

      allCases.push(...myCases);
    }

    // Sort by IRT remaining (most urgent first)
    allCases.sort((a, b) => {
      if (!a.irtData || !b.irtData) return 0;
      return a.irtData.irtRemainingHours - b.irtData.irtRemainingHours;
    });

    return allCases;

  } catch (error) {
    Logger.log(`Error getting cases for ${userEmail}: ${error.message}`);
    return [];
  }
}

/**
 * Delete a case
 * @param {string} caseId - Case ID
 * @param {string} deletedBy - User email
 * @return {Object} Result { success: boolean }
 */
function deleteCase(caseId, deletedBy) {
  try {
    // Find case
    const caseData = findCaseById(caseId);

    if (!caseData) {
      return {
        success: false,
        error: `Case not found: ${caseId}`
      };
    }

    // Delete from sheet
    const sheet = getSheet(caseData.sheetName);
    sheet.deleteRow(caseData.rowIndex);

    Logger.log(`Case deleted: ${caseId} from ${caseData.sheetName} by ${deletedBy}`);

    // Note: IRT data is kept for historical records

    return {
      success: true,
      message: 'Case deleted successfully'
    };

  } catch (error) {
    Logger.log(`Error deleting case: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate case data before creation
 * @param {Object} caseData - Case data
 * @param {string} sheetName - Sheet name
 * @return {Object} Validation result { success: boolean, error?: string }
 */
function validateCaseData(caseData, sheetName) {
  // Required fields for all sheets
  if (!caseData.incomingSegment) {
    return { success: false, error: 'Incoming Segment is required' };
  }

  if (!caseData.productCategory) {
    return { success: false, error: 'Product Category is required' };
  }

  // Sheet-specific validations
  if (sheetName.includes('OT') && !sheetName.includes('3PO')) {
    // OT sheets require subCategory and issueCategory
    if (!caseData.subCategory) {
      return { success: false, error: 'Sub Category is required for OT sheets' };
    }
    if (!caseData.issueCategory) {
      return { success: false, error: 'Issue Category is required' };
    }
  }

  if (sheetName.includes('3PO')) {
    // 3PO sheets require issueCategory (and optionally details)
    if (!caseData.issueCategory) {
      return { success: false, error: 'Issue Category is required for 3PO sheets' };
    }
  }

  return { success: true };
}

/**
 * Generate unique Case ID per specification
 * Format: X-XXXXXXXXXXXXX (1 digit - 13 digits)
 * Example: 3-1234567890123
 * @return {string}
 */
function generateCaseId() {
  // First digit: random 0-9
  const firstDigit = Math.floor(Math.random() * 10);

  // Next 13 digits: current timestamp in milliseconds
  // Date.now() returns milliseconds since Jan 1, 1970
  // Current timestamps are 13 digits (e.g., 1730927340123)
  const timestamp = Date.now().toString();

  // Ensure we have exactly 13 digits
  const digits13 = timestamp.length >= 13
    ? timestamp.slice(-13)  // Take last 13 if longer
    : timestamp.padStart(13, '0');  // Pad with zeros if shorter

  return `${firstDigit}-${digits13}`;
}

/**
 * Search cases across all sheets
 * @param {Object} searchCriteria - Search criteria { caseId, assignee, segment, status, productCategory }
 * @return {Array<Object>} Array of matching cases
 */
function searchCases(searchCriteria) {
  try {
    const results = [];
    const sheets = SheetNames.getAllCaseSheets();

    for (const sheetName of sheets) {
      const cases = getCases(sheetName);

      for (const item of cases) {
        let matches = true;

        if (searchCriteria.caseId && !item.case.caseId.includes(searchCriteria.caseId)) {
          matches = false;
        }

        if (searchCriteria.assignee) {
          const ldap = searchCriteria.assignee.split('@')[0];
          if (item.case.firstAssignee !== ldap && item.case.finalAssignee !== ldap) {
            matches = false;
          }
        }

        if (searchCriteria.segment && item.case.finalSegment !== searchCriteria.segment) {
          matches = false;
        }

        if (searchCriteria.status && item.case.caseStatus !== searchCriteria.status) {
          matches = false;
        }

        if (searchCriteria.productCategory && item.case.productCategory !== searchCriteria.productCategory) {
          matches = false;
        }

        if (matches) {
          results.push(item);
        }
      }
    }

    return results;

  } catch (error) {
    Logger.log(`Error searching cases: ${error.message}`);
    return [];
  }
}
