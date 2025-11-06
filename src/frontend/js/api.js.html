/**
 * API Communication Layer
 *
 * Provides clean interface for Frontend to Backend communication
 * using google.script.run wrapped in Promises.
 *
 * @author CasesDash v3.0.0
 */

/**
 * Call Backend function with Promise wrapper
 * @param {string} functionName - Backend function name
 * @param {...any} args - Function arguments
 * @return {Promise} Promise resolving to function result
 */
function callBackend(functionName, ...args) {
  return new Promise((resolve, reject) => {
    try {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](...args);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * API namespace for organized function calls
 */
const API = {
  /**
   * Authentication API
   */
  auth: {
    /**
     * Authenticate user
     * @return {Promise<Object>} Authentication result
     */
    authenticate: async function() {
      try {
        const result = await callBackend('authenticate');
        console.log('Auth result:', result);
        return result;
      } catch (error) {
        console.error('Auth error:', error);
        throw error;
      }
    },

    /**
     * Logout user
     * @return {Promise<Object>} Logout result
     */
    logout: async function() {
      try {
        const result = await callBackend('logout');
        console.log('Logout result:', result);
        return result;
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },

    /**
     * Check authentication status
     * @return {Promise<Object>} Auth status
     */
    checkStatus: async function() {
      try {
        const result = await callBackend('checkAuthStatus');
        return result;
      } catch (error) {
        console.error('Check auth status error:', error);
        throw error;
      }
    },

    /**
     * Refresh authentication
     * @return {Promise<Object>} Refresh result
     */
    refresh: async function() {
      try {
        const result = await callBackend('refreshAuth');
        return result;
      } catch (error) {
        console.error('Refresh auth error:', error);
        throw error;
      }
    }
  },

  /**
   * Configuration API
   */
  config: {
    /**
     * Get application configuration
     * @return {Promise<Object>} Configuration object
     */
    get: async function() {
      try {
        const result = await callBackend('getAppConfig');
        return result;
      } catch (error) {
        console.error('Get config error:', error);
        throw error;
      }
    }
  },

  /**
   * Spreadsheet API
   */
  spreadsheet: {
    /**
     * Get spreadsheet connection status
     * @return {Promise<Object>} Status object
     */
    getStatus: async function() {
      try {
        const result = await callBackend('getSpreadsheetStatus');
        return result;
      } catch (error) {
        console.error('Get spreadsheet status error:', error);
        throw error;
      }
    },

    /**
     * Configure spreadsheet connection
     * @param {string} spreadsheetId - Spreadsheet ID
     * @return {Promise<Object>} Configuration result
     */
    configure: async function(spreadsheetId) {
      try {
        const result = await callBackend('configureSpreadsheet', spreadsheetId);
        return result;
      } catch (error) {
        console.error('Configure spreadsheet error:', error);
        throw error;
      }
    },

    /**
     * Validate spreadsheet structure
     * @return {Promise<Object>} Validation result
     */
    validate: async function() {
      try {
        const result = await callBackend('validateSpreadsheetStructure');
        return result;
      } catch (error) {
        console.error('Validate spreadsheet error:', error);
        throw error;
      }
    }
  }
};

/**
 * Show loading indicator
 * @param {string} elementId - Loading element ID
 */
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'flex';
  }
}

/**
 * Hide loading indicator
 * @param {string} elementId - Loading element ID
 */
function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Show error message
 * @param {string} elementId - Error element ID
 * @param {string} message - Error message
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
  }
}

/**
 * Hide error message
 * @param {string} elementId - Error element ID
 */
function hideError(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Show success notification (simple alert for now)
 * @param {string} message - Success message
 */
function showSuccess(message) {
  // TODO: Replace with better notification system
  alert(message);
}

/**
 * Handle API errors
 * @param {Error|Object} error - Error object
 * @param {string} context - Error context (e.g., 'login')
 */
function handleAPIError(error, context = '') {
  console.error(`API Error (${context}):`, error);

  let errorMessage = 'An unexpected error occurred. Please try again.';

  if (typeof error === 'object') {
    if (error.message) {
      errorMessage = error.message;
    } else if (error.error) {
      errorMessage = error.error;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return errorMessage;
}

// Log only in browser environment
if (typeof console !== 'undefined') {
  console.log('API module loaded');
}
