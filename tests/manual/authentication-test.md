# Authentication System - Manual Integration Test

**Feature**: User Authentication with Google OAuth and Domain Restriction
**Specification**: docs/casesdash-specification.md Section 10.2, 11.1
**Test Date**: 2025-11-06
**Tester**: [To be filled]

---

## Test Environment

- [ ] GAS project deployed as web app
- [ ] Web app URL accessible
- [ ] Google account (@google.com) available for testing
- [ ] Non-@google.com account available for negative testing

---

## Test 1: Login Flow (Valid Domain)

**Objective**: Verify successful authentication for @google.com users

**Preconditions**:
- User NOT logged in
- Using @google.com Google account

**Test Steps**:
1. Navigate to web app URL
2. Verify login page is displayed
3. Click "Login with Google" button
4. Observe authentication process

**Expected Results**:
- [ ] Login page displays with:
  - CasesDash logo and title
  - Version "v3.0.0 - IRT Support"
  - "Login with Google" button
  - "@google.com accounts only" message
- [ ] Login button shows loading state during authentication
- [ ] Success message appears: "Welcome, [email]!"
- [ ] Page reloads after ~500ms
- [ ] Main application page is displayed
- [ ] Navigation bar shows user email
- [ ] Welcome message displays user information (Email, LDAP, Domain)

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Test 2: Login Flow (Invalid Domain)

**Objective**: Verify rejection of non-@google.com users

**Preconditions**:
- User NOT logged in
- Using non-@google.com Google account (e.g., @gmail.com)

**Test Steps**:
1. Navigate to web app URL
2. Verify login page is displayed
3. Click "Login with Google" button
4. Observe authentication process

**Expected Results**:
- [ ] Login page displays
- [ ] Login button shows loading state during authentication
- [ ] Error message appears: "Access denied. Only @google.com domain is allowed."
- [ ] User remains on login page
- [ ] Login button is re-enabled
- [ ] No success message or page reload occurs

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Test 3: Session Persistence

**Objective**: Verify session persists across page reloads

**Preconditions**:
- User successfully logged in (from Test 1)

**Test Steps**:
1. After successful login, note the user email displayed
2. Reload the page (F5 or Ctrl+R)
3. Observe the application state

**Expected Results**:
- [ ] Page reloads successfully
- [ ] User remains logged in (no redirect to login page)
- [ ] Main application page is displayed immediately
- [ ] User email still displayed in navigation bar
- [ ] No re-authentication required

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Test 4: Logout Flow

**Objective**: Verify successful logout and session destruction

**Preconditions**:
- User successfully logged in (from Test 1)

**Test Steps**:
1. Click the "Logout" button in the navigation bar
2. Confirm logout in the confirmation dialog
3. Observe the logout process

**Expected Results**:
- [ ] Confirmation dialog appears: "Are you sure you want to logout?"
- [ ] After confirming:
  - Logout button shows "Logging out..." state
  - Success message appears: "Logged out successfully"
  - Page reloads after ~500ms
- [ ] Login page is displayed
- [ ] User must re-authenticate to access main app

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Test 5: Session Timeout (24 hours)

**Objective**: Verify session expires after 24 hours

**Preconditions**:
- User successfully logged in
- Access to GAS Script Properties or ability to manipulate time

**Test Steps**:
1. Login successfully
2. Note the session creation time
3. [Option A] Wait 24+ hours
4. [Option B] Manually modify SESSION_TIMESTAMP in Script Properties to simulate 24+ hours ago
5. Reload the page

**Expected Results**:
- [ ] After 24 hours, session is considered expired
- [ ] User is redirected to login page
- [ ] Must re-authenticate to access main app
- [ ] Log shows "Session expired" message

**Actual Results**:
[To be filled during testing - Can be simulated]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail / ⚠️ Simulated

---

## Test 6: Direct Access Without Login

**Objective**: Verify unauthenticated users cannot access main app

**Preconditions**:
- User NOT logged in (clear session if needed)

**Test Steps**:
1. Clear browser cache/cookies OR open in incognito mode
2. Navigate directly to web app URL
3. Observe the page

**Expected Results**:
- [ ] Login page is displayed (not main app)
- [ ] No user information is shown
- [ ] Cannot access main app without authenticating

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Test 7: Backend API Direct Call

**Objective**: Verify Backend functions require authentication

**Preconditions**:
- User NOT logged in
- Access to GAS script editor

**Test Steps**:
1. In GAS script editor, run `testAuthentication()` function
2. Observe the logs

**Expected Results**:
- [ ] Function returns current user from Google Session
- [ ] Authentication attempt succeeds if user has @google.com account
- [ ] Session is created in PropertiesService
- [ ] Auth status shows authenticated: true

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Test 8: Test Account Configuration (Development)

**Objective**: Verify test accounts can bypass domain restriction

**Preconditions**:
- Test account email configured in Script Properties
- Using non-@google.com account matching test account

**Test Steps**:
1. In GAS script editor, run:
   ```javascript
   addTestAccount('testuser@example.com');
   ```
2. Login with testuser@example.com
3. Observe authentication result

**Expected Results**:
- [ ] Test account is added successfully
- [ ] Authentication succeeds despite non-@google.com domain
- [ ] Log shows "Test account authenticated: testuser@example.com"
- [ ] Main application page is displayed

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail / ⚠️ Development Only

---

## Test 9: Session Refresh

**Objective**: Verify session automatically refreshes

**Preconditions**:
- User successfully logged in
- Wait 30+ minutes OR manually trigger refresh

**Test Steps**:
1. Login successfully
2. [Option A] Wait 30 minutes and check browser console
3. [Option B] Manually call `API.auth.refresh()` in browser console
4. Observe the refresh behavior

**Expected Results**:
- [ ] After 30 minutes, console log shows "Refreshing session..."
- [ ] Session refresh succeeds
- [ ] SESSION_TIMESTAMP is updated in PropertiesService
- [ ] User remains logged in without interruption

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Test 10: Error Handling

**Objective**: Verify graceful error handling

**Test Steps**:
1. Simulate network error (disconnect network during login)
2. Observe error message

**Expected Results**:
- [ ] User-friendly error message is displayed
- [ ] Login button is re-enabled
- [ ] Error is logged to console
- [ ] Application does not crash

**Actual Results**:
[To be filled during testing]

**Status**: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Integration Checklist

### Frontend → Backend Communication
- [ ] Login button correctly triggers `authenticate()` Backend function
- [ ] Logout button correctly triggers `logout()` Backend function
- [ ] Backend responses are received in Frontend
- [ ] Errors are properly communicated from Backend to Frontend

### Backend → PropertiesService
- [ ] Session is stored in UserProperties
- [ ] Session data is correctly formatted (JSON)
- [ ] Session retrieval works correctly
- [ ] Session deletion works (logout)
- [ ] Test accounts are stored in ScriptProperties

### UI Feedback
- [ ] Loading states are shown during async operations
- [ ] Success messages are displayed
- [ ] Error messages are displayed with clear text
- [ ] Buttons are disabled during operations to prevent double-click

### Specification Compliance
- [ ] Only @google.com domain is allowed (Section 11.1)
- [ ] Test accounts can bypass restriction (Section 11.1)
- [ ] Session timeout is 24 hours (Section 10.2)
- [ ] OAuth uses Session.getActiveUser() (Section 10.2)
- [ ] Material Design styling is applied (Section 10.1)

---

## Summary

**Total Tests**: 10
**Passed**: [To be filled]
**Failed**: [To be filled]
**Pending**: [To be filled]

**Overall Status**: ⏳ Pending / ✅ Pass / ❌ Fail

**Notes**:
[Add any observations, issues discovered, or recommendations]

---

## Sign-off

**Tested By**: [Name]
**Date**: [Date]
**Signature**: [Signature]
