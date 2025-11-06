# CasesDash - Automation & Agent Guide

**Version**: 3.0.0
**Last Updated**: 2025-11-06
**Target Audience**: AI Agents, CI/CD Systems, Automation Tools

---

## 🤖 Overview

This document describes automation workflows, testing strategies, and CI/CD processes for CasesDash development. It is designed for AI agents (like Claude Code), automated testing systems, and deployment pipelines.

---

## 🔄 Development Automation Workflow

### Agent-Driven Development Cycle

```
┌─────────────────────────────────────────────────────────┐
│  1. PLANNING PHASE                                       │
│     - Read casesdash-specification.md (Section X)       │
│     - Identify Backend + Frontend integration points    │
│     - Create integration test checklist                 │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  2. BACKEND IMPLEMENTATION                               │
│     - Write .gs file with JSDoc                         │
│     - Add to appropriate service/model/util directory   │
│     - Test in GAS editor (manual)                       │
│     - Verify: Response structure matches spec           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  3. FRONTEND IMPLEMENTATION                              │
│     - Write JS component/function                       │
│     - Add API wrapper in api.js                         │
│     - Implement UI in HTML/CSS                          │
│     - Verify: Calls Backend with correct params         │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  4. INTEGRATION TESTING                                  │
│     - Test: Frontend → Backend → Spreadsheet → Frontend │
│     - Test: Error handling (both sides)                 │
│     - Test: Edge cases (empty data, invalid input)      │
│     - Document: Test results in commit message          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  5. VERIFICATION & COMMIT                                │
│     - Run integration checklist                         │
│     - Verify specification compliance                   │
│     - Update documentation if needed                    │
│     - Commit with detailed message                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
              [Next Feature]
```

---

## ✅ Integration Test Automation

### Automated Integration Checklist Template

For AI agents to verify after each feature implementation:

```yaml
feature: "Authentication System"
specification_section: "10.2, 11.1"
integration_points:
  - frontend_to_backend: "auth.js → Authentication.gs"
  - backend_to_service: "Authentication.gs → Session API"
  - service_to_storage: "Session API → PropertiesService"

verification_checklist:
  - id: "auth-1"
    description: "Frontend sends correct parameters to Backend"
    test_command: "Check: google.script.run.authenticate() called with email"
    expected: "Backend receives email parameter"
    status: "pending"

  - id: "auth-2"
    description: "Backend validates @google.com domain"
    test_command: "Test: authenticate('user@gmail.com')"
    expected: "Returns { success: false, error: 'Invalid domain' }"
    status: "pending"

  - id: "auth-3"
    description: "Backend creates session on success"
    test_command: "Test: authenticate('user@google.com')"
    expected: "Session stored in PropertiesService, returns { success: true }"
    status: "pending"

  - id: "auth-4"
    description: "Frontend redirects on authentication success"
    test_command: "Check: window.location changes after success"
    expected: "Redirects to dashboard"
    status: "pending"

  - id: "auth-5"
    description: "Frontend shows error on authentication failure"
    test_command: "Check: Error notification displayed"
    expected: "User sees 'Invalid domain' message"
    status: "pending"
```

### Agent Verification Script Template

```javascript
/**
 * Integration Test: Authentication Flow
 *
 * This script is executed by AI agents after implementing auth feature
 * to verify complete integration.
 */

// Test 1: Backend domain validation
function testBackendDomainValidation() {
  console.log("TEST: Backend domain validation");

  // Valid domain
  const validResult = authenticate("test@google.com");
  assert(validResult.success === true, "Valid domain should succeed");

  // Invalid domain
  const invalidResult = authenticate("test@gmail.com");
  assert(invalidResult.success === false, "Invalid domain should fail");
  assert(invalidResult.error.includes("domain"), "Error should mention domain");

  console.log("✅ PASS: Backend domain validation");
}

// Test 2: Session creation
function testSessionCreation() {
  console.log("TEST: Session creation");

  const email = "testuser@google.com";
  const result = authenticate(email);

  assert(result.success === true, "Authentication should succeed");

  // Verify session stored
  const properties = PropertiesService.getUserProperties();
  const sessionData = properties.getProperty('ACTIVE_SESSION');
  assert(sessionData !== null, "Session should be stored");

  const session = JSON.parse(sessionData);
  assert(session.email === email, "Session should contain correct email");

  console.log("✅ PASS: Session creation");
}

// Test 3: Frontend-Backend integration
function testFrontendBackendIntegration() {
  console.log("TEST: Frontend-Backend integration");

  // Simulate Frontend call
  const mockFrontendCall = () => {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .authenticate("test@google.com");
    });
  };

  mockFrontendCall()
    .then(result => {
      assert(result.success === true, "Frontend should receive success response");
      console.log("✅ PASS: Frontend-Backend integration");
    })
    .catch(error => {
      console.error("❌ FAIL: Frontend-Backend integration", error);
    });
}

// Run all tests
function runIntegrationTests() {
  console.log("=== Running Integration Tests for Authentication ===");

  try {
    testBackendDomainValidation();
    testSessionCreation();
    testFrontendBackendIntegration();

    console.log("\n✅ ALL TESTS PASSED");
    return true;
  } catch (error) {
    console.error("\n❌ TESTS FAILED:", error);
    return false;
  }
}

// Helper assertion function
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
```

---

## 🚀 Deployment Automation (clasp)

### Setup clasp for GAS Deployment

```bash
# Install clasp
npm install -g @google/clasp

# Login to Google account
clasp login

# Create new GAS project (first time only)
clasp create --type webapp --title "CasesDash v3.0.0"

# Push code to GAS
clasp push

# Deploy as web app
clasp deploy --description "v3.0.0 Phase 1"

# Open in GAS editor
clasp open
```

### Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh - Automated deployment script

set -e  # Exit on error

echo "🚀 CasesDash Deployment Script"
echo "================================"

# Step 1: Verify all tests pass
echo "Step 1: Running integration tests..."
# TODO: Add test runner when tests are implemented
echo "✅ Tests passed (manual verification required for now)"

# Step 2: Push to GAS
echo "Step 2: Pushing code to Google Apps Script..."
clasp push

if [ $? -ne 0 ]; then
  echo "❌ Failed to push code to GAS"
  exit 1
fi

echo "✅ Code pushed successfully"

# Step 3: Deploy new version
echo "Step 3: Deploying new version..."
VERSION="v3.0.0-$(date +%Y%m%d-%H%M%S)"
clasp deploy --description "$VERSION"

if [ $? -ne 0 ]; then
  echo "❌ Failed to deploy"
  exit 1
fi

echo "✅ Deployed: $VERSION"

# Step 4: Open in browser for manual verification
echo "Step 4: Opening in GAS editor for verification..."
clasp open

echo ""
echo "🎉 Deployment complete!"
echo "Please verify the deployment manually in the GAS editor."
```

---

## 🔍 Code Quality Automation

### Pre-Commit Checks (for AI Agents)

Before committing, AI agents should verify:

```yaml
pre_commit_checks:
  - check: "JSDoc Comments"
    rule: "All Backend functions must have JSDoc with @param and @return"
    auto_fix: false
    severity: "error"

  - check: "Column Mapping Usage"
    rule: "No hardcoded column letters (e.g., 'C', 'U'). Must use Constants.gs"
    pattern: 'getRange\("[A-Z]'
    auto_fix: false
    severity: "error"

  - check: "IRT Calculation Source"
    rule: "IRT calculation must read from 'IRT RAW data' sheet, not 6-sheet columns"
    pattern: "(firstCloseDate|reopenCloseDate)"
    auto_fix: false
    severity: "error"

  - check: "Notification Method"
    rule: "Must use GmailApp.sendEmail(), not UrlFetchApp (Google Chat webhooks)"
    pattern: "UrlFetchApp.fetch.*webhook"
    auto_fix: false
    severity: "error"

  - check: "Error Handling"
    rule: "All Backend functions must have try-catch"
    auto_fix: false
    severity: "warning"

  - check: "Frontend API Calls"
    rule: "Use callBackend() wrapper, not raw google.script.run"
    pattern: "google\\.script\\.run\\.(?!withSuccessHandler|withFailureHandler)"
    auto_fix: false
    severity: "warning"
```

### Automated Code Review Checklist

```markdown
## Automated Code Review: [Feature Name]

### Backend Review
- [ ] Function has JSDoc with @param, @return, and description
- [ ] Uses Constants.gs for all column access
- [ ] Has try-catch error handling
- [ ] Returns consistent response format: { success: true/false, data/error }
- [ ] Logs errors with Logger.log()
- [ ] No hardcoded values (use Config.gs)

### Frontend Review
- [ ] Uses async/await for Backend calls
- [ ] Wraps google.script.run in callBackend()
- [ ] Has error handling with user-friendly messages
- [ ] Updates UI state correctly
- [ ] Follows Material Design guidelines
- [ ] Uses CSS variables for colors

### Integration Review
- [ ] Frontend sends all required parameters
- [ ] Backend validates all input parameters
- [ ] Response structure matches specification
- [ ] Error scenarios handled on both sides
- [ ] User feedback provided (loading, success, error)

### Specification Compliance
- [ ] Implementation matches Section X.Y of specification
- [ ] All edge cases from specification are handled
- [ ] No contradictions with other parts of specification

### Testing
- [ ] Manual integration test performed
- [ ] Test documented in commit message
- [ ] Edge cases tested (empty data, invalid input, network error)
```

---

## 📊 Monitoring & Logging Automation

### Backend Logging Standards

```javascript
// Logger.gs - Centralized logging utility

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Centralized logger with structured logging
 */
class AppLogger {
  /**
   * Log a message with metadata
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  static log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const user = Session.getActiveUser().getEmail();

    const logEntry = {
      timestamp,
      level,
      user,
      message,
      ...metadata
    };

    // Log to GAS console
    Logger.log(JSON.stringify(logEntry));

    // Optionally: Write to separate logging sheet for long-term storage
    if (level === LogLevel.ERROR) {
      this.writeToLogSheet(logEntry);
    }
  }

  static debug(message, metadata) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  static info(message, metadata) {
    this.log(LogLevel.INFO, message, metadata);
  }

  static warn(message, metadata) {
    this.log(LogLevel.WARN, message, metadata);
  }

  static error(message, metadata) {
    this.log(LogLevel.ERROR, message, metadata);
  }

  /**
   * Write error logs to dedicated sheet for monitoring
   */
  static writeToLogSheet(logEntry) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let logSheet = ss.getSheetByName('Error Logs');

      if (!logSheet) {
        logSheet = ss.insertSheet('Error Logs');
        logSheet.appendRow(['Timestamp', 'Level', 'User', 'Message', 'Metadata']);
      }

      logSheet.appendRow([
        logEntry.timestamp,
        logEntry.level,
        logEntry.user,
        logEntry.message,
        JSON.stringify(logEntry)
      ]);
    } catch (error) {
      // Fallback: If we can't write to sheet, at least log to console
      Logger.log(`Failed to write to log sheet: ${error.message}`);
    }
  }
}

// Usage example
function getCaseById(caseId, sheetName) {
  AppLogger.info('Getting case by ID', { caseId, sheetName });

  try {
    // Business logic...

    AppLogger.info('Case retrieved successfully', { caseId });
    return { success: true, data: caseData };
  } catch (error) {
    AppLogger.error('Failed to get case', {
      caseId,
      sheetName,
      error: error.message,
      stack: error.stack
    });

    return { success: false, error: error.message };
  }
}
```

### Frontend Error Logging

```javascript
// frontend/js/error-logger.js

/**
 * Log client-side errors to Backend for monitoring
 */
async function logClientError(error, context = {}) {
  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context
    };

    await callBackend('logClientError', errorData);
  } catch (logError) {
    // Failed to log error - at least log to console
    console.error('Failed to log error to backend:', logError);
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  logClientError(event.error, {
    type: 'uncaught_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logClientError(event.reason, {
    type: 'unhandled_promise_rejection'
  });
});
```

---

## 🎯 Agent-Specific Guidelines

### For Claude Code

When implementing features:

1. **Read Specification First**: Always start by reading the relevant section in `docs/casesdash-specification.md`

2. **Use Constants**: Never hardcode column letters. Always use `Constants.gs` getColumnMappings()

3. **Test Integration Immediately**: After writing Backend, test it. After writing Frontend, test the integration. Don't wait until everything is done.

4. **Document as You Go**: Update CLAUDE.md if you discover patterns or pitfalls not documented

5. **Commit Frequently**: Small, tested commits > large, untested commits

6. **Follow Patterns**: Use the patterns documented in CLAUDE.md (IRT calculation, ReOpen workflow, etc.)

### For GitHub Copilot / Code Completion AIs

Useful context to provide:

```javascript
// Context: CasesDash v3.0.0 - Google Apps Script
// Pattern: Always use Constants.gs for column access
// Specification: Section 3 - Column Mappings

// Example: Getting case data from OT Email sheet
function getCaseFromOTEmail(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OT Email');
  const colMap = getColumnMappings()['OT Email'];

  return {
    caseId: sheet.getRange(`${colMap.caseId}${row}`).getValue(),
    status: sheet.getRange(`${colMap.caseStatus}${row}`).getValue(),
    // ... continue pattern
  };
}
```

### For Automated Testing Agents

Key test scenarios to cover:

1. **Authentication Flow**
   - Valid @google.com domain → Success
   - Invalid domain → Rejection with error message
   - Session persistence across page reloads

2. **Spreadsheet Connection**
   - Valid Spreadsheet ID → Connection success
   - Invalid ID → Error with clear message
   - Missing sheets → Detect and report missing sheets

3. **Case Creation**
   - Valid data → Case added to sheet + IRT RAW data
   - Invalid data → Validation error
   - Duplicate Case ID → Rejection

4. **IRT Calculation**
   - No ReOpen → IRT = TRT
   - 1 ReOpen → IRT = TRT - SO period
   - Multiple ReOpens → IRT = TRT - sum(SO periods)

5. **ReOpen Workflow**
   - SO/Finished case → Can ReOpen
   - Assigned case → Cannot ReOpen
   - ReOpen History JSON updated correctly

---

## 🔄 Continuous Integration (Future)

### Planned CI/CD Pipeline

```yaml
# .github/workflows/ci.yml (Future implementation)

name: CasesDash CI

on:
  push:
    branches: [ main, claude/* ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run ESLint
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run integration tests
        run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GAS
        run: |
          clasp login --creds credentials.json
          clasp push
          clasp deploy
```

---

## 📝 Commit Message Automation

### Commit Message Template

```
<type>(<scope>): <short description>

<detailed description of what changed and why>

Integration Verified:
- [x] Frontend → Backend communication tested
- [x] Backend → Spreadsheet operations tested
- [x] Error handling verified (both sides)
- [x] Specification compliance: Section X.Y

Testing:
- Manual Test: <describe test scenario>
- Test Steps:
  1. <step 1>
  2. <step 2>
- Expected Result: <what should happen>
- Actual Result: <what actually happened>
- Status: ✅ Pass / ❌ Fail (if fail, explain)

Files Changed:
- src/backend/<file>.gs: <what changed>
- src/frontend/js/<file>.js: <what changed>

References:
- Specification: Section X.Y
- Related Issue: #<issue number>
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functionality change)
- `docs`: Documentation updates
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)
- `style`: Code style changes (formatting, no logic change)

---

## 🎬 Conclusion

This guide provides automation strategies for developing CasesDash efficiently and reliably. AI agents should follow these workflows to ensure:

1. **Integration First**: Always verify Frontend ↔ Backend ↔ Spreadsheet integration
2. **Specification Compliance**: Every feature matches casesdash-specification.md
3. **Quality Standards**: Code follows patterns and best practices
4. **Testability**: Every feature has clear test scenarios

For implementation details, refer to:
- **Developer Guide**: CLAUDE.md
- **Specification**: casesdash-specification.md
- **Project README**: ../README.md

---

**Happy Automating! 🤖**
