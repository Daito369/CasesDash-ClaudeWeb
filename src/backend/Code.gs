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
