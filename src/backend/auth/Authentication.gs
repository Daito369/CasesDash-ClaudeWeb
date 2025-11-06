/**
 * Authentication Service
 *
 * Handles Google OAuth authentication and domain restriction.
 * Only @google.com domain is allowed (plus test accounts in development).
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 10.2, 11.1
 */

/**
 * Authenticate user with domain restriction
 * @return {Object} Authentication result { success: boolean, data/error }
 */
function authenticate() {
  try {
    // Get user email from Google Session
    const user = Session.getActiveUser();
    const email = user.getEmail();

    Logger.log(`Authentication attempt: ${email}`);

    // Check if email is empty (not logged in)
    if (!email) {
      return {
        success: false,
        error: 'No active Google session. Please login to Google first.',
        code: 'NO_SESSION'
      };
    }

    // Validate domain
    const validationResult = validateUserDomain(email);
    if (!validationResult.success) {
      Logger.log(`Authentication failed for ${email}: ${validationResult.error}`);
      return validationResult;
    }

    // Create session
    const session = createSession(email, {
      authenticatedAt: new Date().toISOString()
    });

    if (!session) {
      return {
        success: false,
        error: 'Failed to create session',
        code: 'SESSION_ERROR'
      };
    }

    Logger.log(`Authentication successful: ${email}`);

    return {
      success: true,
      data: {
        email: email,
        ldap: session.ldap,
        domain: session.domain,
        message: 'Authentication successful'
      }
    };

  } catch (error) {
    Logger.log(`Authentication error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      code: 'AUTH_ERROR'
    };
  }
}

/**
 * Validate user domain
 * @param {string} email - User email
 * @return {Object} Validation result { success: boolean, error? }
 */
function validateUserDomain(email) {
  try {
    if (!email || email.trim() === '') {
      return {
        success: false,
        error: 'Email is required',
        code: 'EMAIL_REQUIRED'
      };
    }

    const domain = email.split('@')[1];
    const allowedDomain = getConfig(ConfigKeys.ALLOWED_DOMAIN, 'google.com');

    // Check if domain matches
    if (domain === allowedDomain) {
      return { success: true };
    }

    // Check if user is in test accounts (development only)
    const testAccounts = getTestAccounts();
    if (testAccounts.includes(email)) {
      Logger.log(`Test account authenticated: ${email}`);
      return { success: true };
    }

    // Domain not allowed
    return {
      success: false,
      error: `Access denied. Only @${allowedDomain} domain is allowed.`,
      code: 'INVALID_DOMAIN',
      details: {
        userEmail: email,
        userDomain: domain,
        allowedDomain: allowedDomain
      }
    };

  } catch (error) {
    Logger.log(`Domain validation error: ${error.message}`);
    return {
      success: false,
      error: 'Domain validation failed',
      code: 'VALIDATION_ERROR'
    };
  }
}

/**
 * Logout user
 * @return {Object} Logout result { success: boolean }
 */
function logout() {
  try {
    const email = getCurrentUserEmail();
    destroySession();

    Logger.log(`User logged out: ${email}`);

    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    Logger.log(`Logout error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check authentication status
 * @return {Object} Status { authenticated: boolean, user? }
 */
function checkAuthStatus() {
  try {
    const session = getActiveSession();

    if (!session) {
      return {
        authenticated: false,
        message: 'Not authenticated'
      };
    }

    return {
      authenticated: true,
      user: {
        email: session.email,
        ldap: session.ldap,
        domain: session.domain
      }
    };

  } catch (error) {
    Logger.log(`Auth status check error: ${error.message}`);
    return {
      authenticated: false,
      error: error.message
    };
  }
}

/**
 * Require authentication (middleware-like function)
 * @return {Object} User session or error response
 */
function requireAuth() {
  const session = getActiveSession();

  if (!session) {
    return {
      success: false,
      error: 'Authentication required. Please login.',
      code: 'AUTH_REQUIRED'
    };
  }

  return {
    success: true,
    data: session
  };
}

/**
 * Get current authenticated user
 * @return {Object} User data or null
 */
function getCurrentUser() {
  try {
    const session = getActiveSession();

    if (!session) {
      return null;
    }

    return {
      email: session.email,
      ldap: session.ldap,
      domain: session.domain,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt
    };

  } catch (error) {
    Logger.log(`Get current user error: ${error.message}`);
    return null;
  }
}

/**
 * Refresh authentication token
 * @return {Object} Refresh result { success: boolean }
 */
function refreshAuth() {
  try {
    const refreshed = refreshSession();

    if (!refreshed) {
      return {
        success: false,
        error: 'No active session to refresh',
        code: 'NO_SESSION'
      };
    }

    return {
      success: true,
      message: 'Authentication refreshed'
    };

  } catch (error) {
    Logger.log(`Auth refresh error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}
