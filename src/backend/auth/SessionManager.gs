/**
 * Session Management Utility
 *
 * Manages user sessions using PropertiesService for persistence.
 * Sessions are stored per-user and include authentication state.
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 10.2, 11.1
 */

/**
 * Session keys
 */
const SessionKeys = {
  ACTIVE_SESSION: 'ACTIVE_SESSION',
  SESSION_TIMESTAMP: 'SESSION_TIMESTAMP'
};

/**
 * Session timeout (24 hours in milliseconds)
 */
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

/**
 * Create new session for authenticated user
 * @param {string} email - User email
 * @param {Object} userData - Additional user data
 * @return {Object} Session object
 */
function createSession(email, userData = {}) {
  try {
    const now = new Date().getTime();

    const session = {
      email: email,
      ldap: email.split('@')[0],
      domain: email.split('@')[1],
      createdAt: now,
      lastAccessedAt: now,
      userData: userData
    };

    // Store session
    const properties = PropertiesService.getUserProperties();
    properties.setProperty(SessionKeys.ACTIVE_SESSION, JSON.stringify(session));
    properties.setProperty(SessionKeys.SESSION_TIMESTAMP, String(now));

    Logger.log(`Session created for user: ${email}`);
    return session;
  } catch (error) {
    Logger.log(`Error creating session: ${error.message}`);
    return null;
  }
}

/**
 * Get active session
 * @return {Object|null} Session object or null if not found/expired
 */
function getActiveSession() {
  try {
    const properties = PropertiesService.getUserProperties();
    const sessionJson = properties.getProperty(SessionKeys.ACTIVE_SESSION);
    const timestamp = properties.getProperty(SessionKeys.SESSION_TIMESTAMP);

    if (!sessionJson || !timestamp) {
      return null;
    }

    // Check if session expired
    const now = new Date().getTime();
    const sessionAge = now - parseInt(timestamp);

    if (sessionAge > SESSION_TIMEOUT) {
      Logger.log('Session expired');
      destroySession();
      return null;
    }

    // Update last accessed timestamp
    properties.setProperty(SessionKeys.SESSION_TIMESTAMP, String(now));

    const session = JSON.parse(sessionJson);
    session.lastAccessedAt = now;

    return session;
  } catch (error) {
    Logger.log(`Error getting session: ${error.message}`);
    return null;
  }
}

/**
 * Update session data
 * @param {Object} updates - Object with fields to update
 * @return {boolean} Success status
 */
function updateSession(updates) {
  try {
    const session = getActiveSession();
    if (!session) {
      return false;
    }

    // Merge updates
    Object.keys(updates).forEach(key => {
      session[key] = updates[key];
    });

    session.lastAccessedAt = new Date().getTime();

    // Save updated session
    const properties = PropertiesService.getUserProperties();
    properties.setProperty(SessionKeys.ACTIVE_SESSION, JSON.stringify(session));

    Logger.log('Session updated');
    return true;
  } catch (error) {
    Logger.log(`Error updating session: ${error.message}`);
    return false;
  }
}

/**
 * Destroy active session (logout)
 * @return {boolean} Success status
 */
function destroySession() {
  try {
    const properties = PropertiesService.getUserProperties();
    properties.deleteProperty(SessionKeys.ACTIVE_SESSION);
    properties.deleteProperty(SessionKeys.SESSION_TIMESTAMP);

    Logger.log('Session destroyed');
    return true;
  } catch (error) {
    Logger.log(`Error destroying session: ${error.message}`);
    return false;
  }
}

/**
 * Check if user is authenticated
 * @return {boolean} Authentication status
 */
function isAuthenticated() {
  const session = getActiveSession();
  return session !== null;
}

/**
 * Get current user email from session
 * @return {string|null} User email or null if not authenticated
 */
function getCurrentUserEmail() {
  const session = getActiveSession();
  return session ? session.email : null;
}

/**
 * Get current user LDAP from session
 * @return {string|null} User LDAP or null if not authenticated
 */
function getCurrentUserLdap() {
  const session = getActiveSession();
  return session ? session.ldap : null;
}

/**
 * Get session info (for debugging)
 * @return {Object} Session information
 */
function getSessionInfo() {
  try {
    const session = getActiveSession();
    if (!session) {
      return {
        authenticated: false,
        message: 'No active session'
      };
    }

    const now = new Date().getTime();
    const sessionAge = now - session.createdAt;
    const timeRemaining = SESSION_TIMEOUT - sessionAge;

    return {
      authenticated: true,
      email: session.email,
      ldap: session.ldap,
      domain: session.domain,
      createdAt: new Date(session.createdAt).toISOString(),
      lastAccessedAt: new Date(session.lastAccessedAt).toISOString(),
      sessionAge: Math.floor(sessionAge / 1000 / 60) + ' minutes',
      timeRemaining: Math.floor(timeRemaining / 1000 / 60) + ' minutes'
    };
  } catch (error) {
    Logger.log(`Error getting session info: ${error.message}`);
    return {
      authenticated: false,
      error: error.message
    };
  }
}

/**
 * Refresh session (extend timeout)
 * @return {boolean} Success status
 */
function refreshSession() {
  try {
    const session = getActiveSession();
    if (!session) {
      return false;
    }

    const now = new Date().getTime();
    const properties = PropertiesService.getUserProperties();
    properties.setProperty(SessionKeys.SESSION_TIMESTAMP, String(now));

    Logger.log('Session refreshed');
    return true;
  } catch (error) {
    Logger.log(`Error refreshing session: ${error.message}`);
    return false;
  }
}
