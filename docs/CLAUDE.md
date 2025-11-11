# CasesDash - Claude Developer Guide
## ※回答は日本語で出力してください
**Version**: 3.0.0 (IRT Support - 2025 Q4)
**Last Updated**: 2025-11-06
**Target Audience**: Claude Code, AI Agents, Human Developers

---

## 📋 Project Overview

**CasesDash** is a Google Apps Script (GAS)-based web application for managing support cases across 6 different spreadsheet types (OT Email, 3PO Email, OT Chat, 3PO Chat, OT Phone, 3PO Phone). The system supports the new **IRT (Internal Resolution Time)** metric introduced in 2025 Q4, replacing the legacy P95/TRT metrics.

### Key Characteristics
- **Platform**: Google Apps Script (No GCP access)
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **Backend**: Google Apps Script (server-side JavaScript)
- **Data Storage**: Google Spreadsheets
- **Authentication**: Google OAuth 2.0 (@google.com domain only)
- **Primary Metric**: IRT (TRT - Solution Offered period)

### Critical Constraints
1. ⚠️ **NO GCP**: All infrastructure must run on Google Apps Script
2. ⚠️ **NO external libraries** requiring npm/build step (CDN only)
3. ⚠️ **NO Google Chat webhooks** (policy violation - use Gmail instead)
4. ⚠️ **Domain restriction**: @google.com only (except test accounts in Configuration)

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Google Apps Script                       │
│  ┌────────────────┐              ┌────────────────────────┐ │
│  │   Frontend     │◄────────────►│      Backend          │ │
│  │  (HtmlService) │              │  (.gs files)          │ │
│  │                │              │                        │ │
│  │  - HTML/CSS/JS │              │  - Authentication     │ │
│  │  - Material    │              │  - Services           │ │
│  │    Design      │              │  - Models             │ │
│  │  - Components  │              │  - Utils              │ │
│  └────────────────┘              └───────┬────────────────┘ │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
          ┌─────────▼─────────┐  ┌────────▼────────┐  ┌─────────▼────────┐
          │  6 Case Sheets    │  │ IRT RAW data    │  │  Configuration   │
          │  (OT/3PO x        │  │  (JSON history) │  │  (Quarterly)     │
          │   Email/Chat/     │  │                 │  │                  │
          │   Phone)          │  │                 │  │                  │
          └───────────────────┘  └─────────────────┘  └──────────────────┘
                Google Spreadsheet
```

### Communication Flow
```
Frontend (Client-side JS)
    ↓ google.script.run
Backend (Server-side GAS)
    ↓ SpreadsheetApp
Google Spreadsheet
    ↑ Response
Backend
    ↑ withSuccessHandler / withFailureHandler
Frontend
```

### Directory Structure
```
/
├── docs/                           # Documentation
│   ├── casesdash-specification.md  # Master specification (v3.0.0)
│   ├── IRT.md                      # IRT metric definition
│   ├── SHEET_MAPPING.md            # Actual spreadsheet structure
│   ├── CLAUDE.md                   # This file
│   └── AGENTS.md                   # Automation guide
│
├── src/
│   ├── backend/                    # Google Apps Script (.gs)
│   │   ├── Code.gs                 # Main entry point (doGet/doPost)
│   │   ├── auth/
│   │   │   ├── Authentication.gs   # OAuth, domain restriction
│   │   │   └── SessionManager.gs   # Session persistence
│   │   ├── services/
│   │   │   ├── SpreadsheetService.gs
│   │   │   ├── CaseService.gs
│   │   │   ├── IRTService.gs
│   │   │   └── NotificationService.gs
│   │   ├── models/
│   │   │   └── CaseModel.gs
│   │   └── utils/
│   │       ├── Config.gs           # PropertiesService wrapper
│   │       ├── Logger.gs           # Logging utility
│   │       └── Constants.gs        # Column mappings (Section 3)
│   │
│   └── frontend/                   # HTML/CSS/JS
│       ├── index.html              # Main entry point
│       ├── css/
│       │   ├── main.css
│       │   ├── components.css
│       │   └── material-overrides.css
│       └── js/
│           ├── app.js              # App initialization
│           ├── api.js              # Backend communication layer
│           ├── auth.js             # Authentication flow
│           ├── state.js            # State management
│           └── components/
│               ├── Dashboard.js
│               ├── MyCases.js
│               ├── CreateCase.js
│               └── Analytics.js
│
├── tests/
│   ├── integration/                # Integration test scripts
│   └── manual/                     # Manual test checklists
│
├── .clasp.json                     # clasp configuration
├── appsscript.json                 # GAS manifest
└── README.md
```

---

## 💻 Development Guidelines

### Coding Standards

#### Backend (Google Apps Script)
```javascript
// ✅ GOOD: Use JSDocs for all functions
/**
 * Get case by ID from specified sheet
 * @param {string} caseId - Case ID (format: X-XXXXXXXXXXXXX)
 * @param {string} sheetName - Sheet name (e.g., "OT Email")
 * @return {Object|null} Case data or null if not found
 */
function getCaseById(caseId, sheetName) {
  // Implementation
}

// ✅ GOOD: Use constants from Constants.gs
const COLUMN_MAPPINGS = getColumnMappings();
const caseIdCol = COLUMN_MAPPINGS['OT Email'].caseId; // "C"

// ❌ BAD: Magic strings/numbers
const caseIdCol = "C"; // What sheet? What if it changes?
```

#### Frontend (JavaScript ES6+)
```javascript
// ✅ GOOD: Use async/await with google.script.run
async function loadCases() {
  try {
    const cases = await callBackend('getCases', { status: 'Assigned' });
    renderCases(cases);
  } catch (error) {
    showError('Failed to load cases', error);
  }
}

// ✅ GOOD: Wrap google.script.run in promises
function callBackend(functionName, params = {}) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName](params);
  });
}

// ❌ BAD: Callback hell
google.script.run
  .withSuccessHandler(function(cases) {
    google.script.run
      .withSuccessHandler(function(irt) {
        // Nested callbacks...
      })
      .getIRTData(cases[0].id);
  })
  .getCases();
```

#### CSS (Material Design)
```css
/* ✅ GOOD: Use CSS variables for theming */
:root {
  --primary-color: #1a73e8;
  --error-color: #ea4335;
  --warning-color: #f9ab00;
  --success-color: #34a853;
  --text-primary: #202124;
  --text-secondary: #5f6368;
}

.case-card.critical {
  border-left: 4px solid var(--error-color);
}

/* ❌ BAD: Hardcoded colors */
.case-card.critical {
  border-left: 4px solid #ea4335;
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| GAS Functions | camelCase | `getCaseById()` |
| GAS Constants | UPPER_SNAKE_CASE | `DEFAULT_SEGMENT` |
| JS Classes | PascalCase | `CaseManager` |
| JS Functions | camelCase | `renderDashboard()` |
| CSS Classes | kebab-case | `.case-card-header` |
| File Names | PascalCase (.gs), kebab-case (.js/.css) | `CaseService.gs`, `dashboard.js` |

### Error Handling

#### Backend
```javascript
function getCaseById(caseId, sheetName) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    // Business logic...

    return { success: true, data: caseData };
  } catch (error) {
    Logger.log(`Error in getCaseById: ${error.message}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack // Include for debugging
    };
  }
}
```

#### Frontend
```javascript
async function loadCase(caseId) {
  try {
    const response = await callBackend('getCaseById', { caseId, sheetName: 'OT Email' });

    if (!response.success) {
      throw new Error(response.error);
    }

    renderCase(response.data);
  } catch (error) {
    console.error('Failed to load case:', error);
    showNotification('Error loading case', 'error');
    // Optionally: log to backend for monitoring
    logClientError(error);
  }
}
```

---

## 🔑 Key Implementation Patterns

### Pattern 1: Column Mapping (Section 3)
Always use Constants.gs for column access:

```javascript
// Constants.gs
function getColumnMappings() {
  return {
    "OT Email": {
      caseId: "C",
      caseOpenDate: "D",
      caseOpenTime: "E",
      incomingSegment: "F",
      // ... (complete mapping from Section 3)
      irtTimer: "O",  // CRITICAL: Added in v3.0.0
      caseStatus: "U"
    },
    // ... other sheets
  };
}

// Usage in services
function getCaseData(sheetName, row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const colMap = getColumnMappings()[sheetName];

  return {
    caseId: sheet.getRange(`${colMap.caseId}${row}`).getValue(),
    status: sheet.getRange(`${colMap.caseStatus}${row}`).getValue(),
    // ... other fields
  };
}
```

### Pattern 2: IRT Calculation (Section 4.4.3)
ALWAYS read from IRT RAW data sheet, NOT from 6-sheet columns:

```javascript
// ✅ CORRECT
function calculateIRT(caseId) {
  const irtSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('IRT RAW data');
  const data = irtSheet.getDataRange().getValues();

  // Find case row
  const caseRow = data.find(row => row[0] === caseId); // A: Case ID

  if (!caseRow) return null;

  // Parse ReOpen History JSON (Column F)
  const reopenHistoryJson = caseRow[5]; // F: ReOpen History JSON
  const reopenHistory = JSON.parse(reopenHistoryJson || '{"reopens":[],"totalSOPeriodHours":0}');

  const trtHours = caseRow[9]; // J: IRT Hours (calculated)
  const totalSOPeriodHours = reopenHistory.totalSOPeriodHours;

  const irtHours = trtHours - totalSOPeriodHours;

  return {
    irt: irtHours,
    irtRemaining: 72 - irtHours,
    withinSLA: irtHours <= 72
  };
}

// ❌ WRONG (v2.0.0 legacy - DO NOT USE)
function calculateIRT_LEGACY(caseData) {
  // This only supports 1 ReOpen!
  const firstCloseDate = caseData.firstCloseDate;
  const reopenCloseDate = caseData.reopenCloseDate;
  // ...
}
```

### Pattern 3: ReOpen Workflow (Section 4.1.6)
```javascript
function reopenCase(caseId, reopenDateTime, reopenedBy) {
  // 1. Get case from source sheet
  const caseData = getCaseFromSourceSheet(caseId);

  // 2. Update IRT RAW data with new ReOpen entry
  const irtSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('IRT RAW data');
  const irtRow = findIRTRow(caseId);

  // Parse existing ReOpen History JSON
  const reopenHistoryJson = irtSheet.getRange(irtRow, 6).getValue(); // F: ReOpen History JSON
  const reopenHistory = JSON.parse(reopenHistoryJson || '{"reopens":[],"totalReopens":0,"totalSOPeriodHours":0}');

  // Calculate SO period for this ReOpen
  const soDateTime = new Date(caseData.lastSODateTime);
  const reopenDate = new Date(reopenDateTime);
  const soPeriodHours = (reopenDate - soDateTime) / (1000 * 60 * 60);

  // Add new ReOpen entry
  reopenHistory.reopens.push({
    reopenNumber: reopenHistory.totalReopens + 1,
    soDateTime: caseData.lastSODateTime,
    reopenDateTime: reopenDateTime,
    soPeriodHours: soPeriodHours,
    reopenedBy: reopenedBy
  });

  reopenHistory.totalReopens += 1;
  reopenHistory.totalSOPeriodHours += soPeriodHours;

  // Update IRT RAW data
  irtSheet.getRange(irtRow, 6).setValue(JSON.stringify(reopenHistory)); // F: ReOpen History JSON
  irtSheet.getRange(irtRow, 8).setValue(reopenHistory.totalReopens); // H: ReOpen Count

  // 3. Update source sheet Case Status to "Assigned"
  updateCaseStatus(caseId, caseData.sourceSheet, 'Assigned');

  // 4. Update Status History JSON
  updateStatusHistory(caseId, 'ReOpened', reopenDateTime, reopenedBy);

  return { success: true, message: 'Case reopened successfully' };
}
```

### Pattern 4: Gmail Notification (Section 7)
```javascript
function sendIRTAlertEmail(caseData, teamLeaderEmail) {
  const subject = `⚠️ IRT Alert: ${caseData.caseId} - Immediate Action Required`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Google Sans', Roboto, Arial, sans-serif; }
          .header { background-color: #ea4335; color: white; padding: 20px; }
          /* ... (see Section 7.3.1 for complete template) */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ IRT Timer Warning</h2>
          </div>
          <div class="content">
            <div class="info-row">
              <strong>Assignee:</strong> ${caseData.finalAssignee}
            </div>
            <!-- ... -->
          </div>
        </div>
      </body>
    </html>
  `;

  const plainTextBody = `
⚠️ IRT ALERT - Immediate Action Required
Assignee: ${caseData.finalAssignee}
Case ID: ${caseData.caseId}
...
  `;

  try {
    GmailApp.sendEmail(
      teamLeaderEmail,
      subject,
      plainTextBody,
      {
        htmlBody: htmlBody,
        name: 'CasesDash IRT Alert System'
      }
    );
    logNotification(caseData.caseId, teamLeaderEmail, 'IRT_ALERT_2H', 'SUCCESS');
  } catch (error) {
    Logger.log(`Failed to send IRT alert: ${error}`);
    logNotification(caseData.caseId, teamLeaderEmail, 'IRT_ALERT_2H', 'FAILED', error.toString());
  }
}
```

---

## 🧪 Testing Strategy

### Integration Testing Checklist
For each feature, verify:

- [ ] **Frontend → Backend**: API call succeeds with correct parameters
- [ ] **Backend → Spreadsheet**: Data is written to correct cells
- [ ] **Spreadsheet → Backend**: Data is read correctly (including formulas)
- [ ] **Backend → Frontend**: Response has correct structure
- [ ] **Frontend → UI**: Data displays correctly
- [ ] **Error Handling**: Both sides handle errors gracefully

### Manual Test Template
```markdown
## Test: Create OT Email Case

**Preconditions**:
- User authenticated (@google.com)
- Spreadsheet connected
- "OT Email" sheet exists

**Steps**:
1. Navigate to Create Case
2. Select "OT Email" from dropdown
3. Fill required fields:
   - Case ID: 1-12345678901234
   - Incoming Segment: Gold
   - Product Category: Search
   - Sub Category: Search
   - Issue Category: Search 仕様・機能
4. Click "Create Case"

**Expected Results**:
- ✅ Success notification appears
- ✅ Case added to OT Email sheet (last row)
- ✅ IRT RAW data sheet updated with new entry
- ✅ All column mappings correct (verify irtTimer at column O)
- ✅ Redirect to Dashboard showing new case

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail
```

---

## 📚 Reference Documentation

### Primary References (in order of importance)
1. **docs/casesdash-specification.md** - Master specification (v3.0.0)
   - Section 1: Project Overview
   - Section 2: Spreadsheet Structure
   - Section 3: Column Mappings (CRITICAL - use this for all column access)
   - Section 4: UI Functions
   - Section 7: Gmail Notification System
   - Section 10: Technical Implementation
   - Section 11: Security

2. **docs/IRT.md** - IRT metric definition
   - IRT = TRT - SO period
   - SLA targets: 72 hours for all segments
   - Reward targets by segment

3. **docs/SHEET_MAPPING.md** - Actual spreadsheet structure with formulas

### Quick Reference: Common Queries

**Q: Where are column mappings defined?**
A: Section 3 of casesdash-specification.md. Always use Constants.gs in code.

**Q: How do I calculate IRT?**
A: Read from IRT RAW data sheet (Section 2.7), parse ReOpen History JSON (column F), use formula: IRT = TRT - totalSOPeriodHours. See Section 4.4.3.

**Q: How do I send notifications?**
A: Use GmailApp.sendEmail() with HTML template. See Section 7.3.1. DO NOT use Google Chat webhooks.

**Q: What's the NCC definition?**
A: (Case Status = "Solution Offered" OR "Finished") AND (non NCC column is empty). Bug flag does NOT affect NCC count but excludes from IRT SLA. See Section 6.3.

**Q: How do I handle ReOpen?**
A: Update ReOpen History JSON in IRT RAW data, change Case Status to "Assigned", update Status History JSON. See Pattern 3 above.

---

## 🚨 Common Pitfalls

### ❌ Pitfall 1: Using old P95/TRT columns
**Problem**: Reading firstCloseDate/reopenCloseDate from 6-sheet columns (legacy v2.0.0 approach).
**Solution**: ALWAYS read from IRT RAW data sheet and parse JSON.

### ❌ Pitfall 2: Missing irtTimer column
**Problem**: Column mappings without irtTimer cause all subsequent columns to be off by 1.
**Solution**: Always include irtTimer at column O for all 6 sheets (added in v3.0.0).

### ❌ Pitfall 3: Google Chat webhooks
**Problem**: Using Google Chat webhooks violates policy.
**Solution**: Use GmailApp.sendEmail() as specified in Section 7.

### ❌ Pitfall 4: Hardcoded column letters
**Problem**: Using magic strings like "C" or "U" for columns.
**Solution**: Always use Constants.gs getColumnMappings().

### ❌ Pitfall 5: Not handling multiple ReOpens
**Problem**: IRT calculation only considering 1 ReOpen.
**Solution**: Parse complete ReOpen History JSON array, sum all SO periods.

---

## 🔄 Development Workflow

### 1. Before Starting a Task
- [ ] Read relevant section in casesdash-specification.md
- [ ] Check if similar functionality exists (avoid duplication)
- [ ] Plan Backend + Frontend integration points

### 2. During Implementation
- [ ] Write Backend function with JSDoc
- [ ] Test Backend function in GAS editor
- [ ] Write Frontend function to call Backend
- [ ] Test integration (Frontend → Backend → Spreadsheet)
- [ ] Add error handling on both sides
- [ ] Test error scenarios

### 3. Before Committing
- [ ] Run manual integration test
- [ ] Verify specification compliance
- [ ] Check for hardcoded values (use Constants.gs)
- [ ] Verify Material Design compliance (UI)
- [ ] Update documentation if needed

### 4. Commit Message Format
```
<type>: <short description>

<detailed description>

Integration verified:
- [ ] Frontend → Backend communication
- [ ] Backend → Spreadsheet operations
- [ ] Error handling (both sides)
- [ ] Specification compliance (Section X.Y)

Testing:
- Manual test: <test scenario>
- Result: Pass/Fail
```

---

## 🎯 Current Implementation Status

**Phase**: Core Features Complete
**Branch**: `claude/fix-my-cases-timeout-011CV14Ry2QDQDp1c79wqFzS`
**Last Updated**: 2025-11-11

### ✅ Completed Features

#### 1. Foundation & Documentation
- [x] Project structure created
- [x] Documentation framework (CLAUDE.md, AGENTS.md)
- [x] README.md with project overview

#### 2. Authentication System
- [x] Backend: Authentication.gs with @google.com domain restriction
- [x] Backend: SessionManager.gs for session persistence
- [x] Frontend: auth.js with OAuth flow
- [x] Login/Logout functionality

#### 3. Spreadsheet Integration
- [x] Backend: SpreadsheetService.gs for low-level operations
- [x] Backend: Config.gs for spreadsheet configuration management
- [x] Backend: Constants.gs with column mappings for all 6 sheets
- [x] Frontend: Settings screen with spreadsheet connection testing
- [x] Support for all 6 sheet types (OT/3PO Email/Chat/Phone)

#### 4. Case Management (Backend)
- [x] CaseModel.gs with Case class and serialization
- [x] CaseService.gs with full CRUD operations
- [x] IRTService.gs for IRT calculation and tracking
- [x] Support for ReOpen workflow with JSON history
- [x] DATE field preservation for Email sheets (UTC timezone)
- [x] rowIndex-based accurate row updates (prevents data loss)

#### 5. Case Management (Frontend)
- [x] Create Case screen with dynamic form controls
- [x] Sheet-specific field visibility (OT vs 3PO)
- [x] Product Category → Sub Category → Issue Category cascading
- [x] Details autocomplete for 3PO sheets
- [x] Keyboard shortcuts (Ctrl+; for date, Ctrl+Shift+; for time)
- [x] Form validation with real-time feedback

#### 6. My Cases Screen
- [x] Display user's assigned cases with real-time IRT timer
- [x] Color-coded urgency levels (Normal/Warning/Critical/Missed)
- [x] Summary statistics dashboard
- [x] Auto-refresh every 1 minute
- [x] Sheet badge with color coding (Blue/Red/Green)

#### 7. Case Details Modal
- [x] Comprehensive case information display
- [x] Read-only view of all case fields
- [x] IRT information section
- [x] Flags and options display
- [x] Edit Case button integration

#### 8. Edit Case Modal
- [x] Status & Assignment editing
- [x] Close Date/Time fields with dynamic labels (1st Close vs Reopen Close)
- [x] Default current date/time for empty Close Date/Time fields
- [x] Keyboard shortcuts for Close Date/Time (Ctrl+; and Ctrl+Shift+;)
- [x] Case flags editing with IRT除外対象 tooltip
- [x] Transfer & Disposition fields
- [x] rowIndex-based updates to prevent wrong row overwrites
- [x] Toast notifications (non-blocking)

#### 9. UI/UX Enhancements
- [x] Material Design compliance
- [x] Toast notification system (replacing blocking alert())
- [x] Focus trap for modals (accessibility)
- [x] Responsive layout
- [x] Loading states and error handling
- [x] Tooltip for IRT exclusion criteria

#### 10. Data Integrity & Bug Fixes
- [x] Fixed: Edit Modal creating duplicate rows
- [x] Fixed: Edit Modal updating wrong rows (CRITICAL - data loss prevention)
- [x] Fixed: UTC timezone issues with DATE field
- [x] Fixed: 1899 date display in time fields
- [x] Fixed: getCaseByRowIndex to read directly from sheet
- [x] Fixed: Time extraction from Date objects

#### 11. Email Notification System
- [x] Backend: NotificationService.gs with full alert system
- [x] sendIRTAlertEmail() - HTML email with professional template
- [x] getTeamLeaderEmail() - TL lookup from Configuration sheet
- [x] logNotification() - Notification logging to spreadsheet
- [x] checkAndSendIRTAlerts() - Hourly scheduled function
- [x] Smart alerting: Only for Assigned cases with IRT ≤ 2 hours
- [x] Duplicate prevention: 6-hour cooldown between alerts
- [x] Setup documentation: docs/EMAIL_NOTIFICATION_SETUP.md

### 🔄 Known Limitations / Future Enhancements
- [ ] Email notification settings UI in Settings screen (currently via script properties)
- [ ] Analytics/Dashboard with IRT metrics visualization
- [ ] Bulk operations (bulk edit, bulk status change)
- [ ] Advanced filtering and search in My Cases
- [ ] Comprehensive automated testing suite
- [ ] ReOpen case functionality (frontend implementation)
- [ ] Status History tracking UI

### 📝 Next Development Priorities
1. ~~**Email Notification System** (Section 7) - IRT alert emails via GmailApp~~ ✅ **COMPLETED**
2. **ReOpen Case UI** - Frontend for reopening closed cases
3. **Analytics Dashboard** - IRT metrics, trends, team performance
4. **Advanced Filters** - Filter My Cases by segment, product, urgency
5. **Automated Testing** - Integration tests for critical workflows

---

## 💡 Tips for AI Agents / Claude Code

1. **Always read specification first**: Before implementing ANY feature, read the relevant section in casesdash-specification.md.

2. **Use Constants.gs**: Never hardcode column letters. Always use getColumnMappings().

3. **IRT is primary metric**: v3.0.0 is IRT-focused. P95 is legacy.

4. **Test integration constantly**: Don't implement entire Backend then Frontend. Go step-by-step and test integration at each step.

5. **Follow Material Design**: Use Google's color palette, spacing (8dp grid), typography (Google Sans, Roboto).

6. **Error messages matter**: Show user-friendly messages in Frontend, log technical details in Backend.

7. **JSON for complex data**: ReOpen History, Status History use JSON format for unlimited extensibility.

8. **Security first**: Always check domain, never trust client input, validate all parameters.

---

**Happy Coding! 🚀**

For questions or clarifications, refer to:
- **Specification**: docs/casesdash-specification.md
- **Automation Guide**: docs/AGENTS.md
- **Main README**: ../README.md
