/**
 * Configuration Management Utility
 *
 * Provides centralized configuration management using PropertiesService.
 * All configuration values should be accessed through this utility.
 *
 * @author CasesDash v3.0.0
 * @specification docs/casesdash-specification.md Section 10.2
 */

/**
 * Configuration keys
 */
const ConfigKeys = {
  // Spreadsheet
  SPREADSHEET_ID: 'SPREADSHEET_ID',

  // Authentication
  ALLOWED_DOMAIN: 'ALLOWED_DOMAIN',
  TEST_ACCOUNTS: 'TEST_ACCOUNTS', // JSON array of test account emails

  // Notification
  DEFAULT_TL_EMAIL: 'DEFAULT_TL_EMAIL',
  IRT_ALERT_ENABLED: 'IRT_ALERT_ENABLED',
  IRT_ALERT_THRESHOLD: 'IRT_ALERT_THRESHOLD',

  // UI
  THEME: 'THEME',
  LANGUAGE: 'LANGUAGE',

  // App
  APP_URL: 'APP_URL'
};

/**
 * Default configuration values
 */
const ConfigDefaults = {
  ALLOWED_DOMAIN: 'google.com',
  IRT_ALERT_ENABLED: 'true',
  IRT_ALERT_THRESHOLD: '2',
  THEME: 'light',
  LANGUAGE: 'ja'
};

/**
 * Get configuration value
 * @param {string} key - Configuration key
 * @param {string} defaultValue - Default value if key not found
 * @return {string} Configuration value
 */
function getConfig(key, defaultValue = null) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const value = properties.getProperty(key);

    if (value !== null) {
      return value;
    }

    // Return default if exists
    if (ConfigDefaults[key] !== undefined) {
      return ConfigDefaults[key];
    }

    return defaultValue;
  } catch (error) {
    Logger.log(`Error getting config ${key}: ${error.message}`);
    return defaultValue;
  }
}

/**
 * Set configuration value
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @return {boolean} Success status
 */
function setConfig(key, value) {
  try {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(key, value);
    Logger.log(`Config set: ${key} = ${value}`);
    return true;
  } catch (error) {
    Logger.log(`Error setting config ${key}: ${error.message}`);
    return false;
  }
}

/**
 * Get all configuration as object
 * @return {Object} Configuration object
 */
function getAllConfig() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const allProperties = properties.getProperties();

    return {
      spreadsheetId: allProperties[ConfigKeys.SPREADSHEET_ID] || null,
      allowedDomain: allProperties[ConfigKeys.ALLOWED_DOMAIN] || ConfigDefaults.ALLOWED_DOMAIN,
      defaultTLEmail: allProperties[ConfigKeys.DEFAULT_TL_EMAIL] || null,
      irtAlertEnabled: allProperties[ConfigKeys.IRT_ALERT_ENABLED] === 'true',
      irtAlertThreshold: parseInt(allProperties[ConfigKeys.IRT_ALERT_THRESHOLD] || ConfigDefaults.IRT_ALERT_THRESHOLD),
      theme: allProperties[ConfigKeys.THEME] || ConfigDefaults.THEME,
      language: allProperties[ConfigKeys.LANGUAGE] || ConfigDefaults.LANGUAGE,
      appUrl: allProperties[ConfigKeys.APP_URL] || null
    };
  } catch (error) {
    Logger.log(`Error getting all config: ${error.message}`);
    return {};
  }
}

/**
 * Save multiple configuration values
 * @param {Object} configObject - Object with key-value pairs
 * @return {boolean} Success status
 */
function saveConfig(configObject) {
  try {
    const properties = PropertiesService.getScriptProperties();

    Object.keys(configObject).forEach(key => {
      const value = configObject[key];
      if (value !== null && value !== undefined) {
        properties.setProperty(key, String(value));
      }
    });

    Logger.log('Configuration saved successfully');
    return true;
  } catch (error) {
    Logger.log(`Error saving configuration: ${error.message}`);
    return false;
  }
}

/**
 * Delete configuration value
 * @param {string} key - Configuration key
 * @return {boolean} Success status
 */
function deleteConfig(key) {
  try {
    const properties = PropertiesService.getScriptProperties();
    properties.deleteProperty(key);
    Logger.log(`Config deleted: ${key}`);
    return true;
  } catch (error) {
    Logger.log(`Error deleting config ${key}: ${error.message}`);
    return false;
  }
}

/**
 * Clear all configuration (use with caution)
 * @return {boolean} Success status
 */
function clearAllConfig() {
  try {
    const properties = PropertiesService.getScriptProperties();
    properties.deleteAllProperties();
    Logger.log('All configuration cleared');
    return true;
  } catch (error) {
    Logger.log(`Error clearing configuration: ${error.message}`);
    return false;
  }
}

/**
 * Get test accounts (for development)
 * @return {Array<string>} Array of test account emails
 */
function getTestAccounts() {
  try {
    const testAccountsJson = getConfig(ConfigKeys.TEST_ACCOUNTS, '[]');
    return JSON.parse(testAccountsJson);
  } catch (error) {
    Logger.log(`Error getting test accounts: ${error.message}`);
    return [];
  }
}

/**
 * Add test account (for development)
 * @param {string} email - Test account email
 * @return {boolean} Success status
 */
function addTestAccount(email) {
  try {
    const testAccounts = getTestAccounts();
    if (!testAccounts.includes(email)) {
      testAccounts.push(email);
      setConfig(ConfigKeys.TEST_ACCOUNTS, JSON.stringify(testAccounts));
      Logger.log(`Test account added: ${email}`);
    }
    return true;
  } catch (error) {
    Logger.log(`Error adding test account: ${error.message}`);
    return false;
  }
}

/**
 * Remove test account
 * @param {string} email - Test account email
 * @return {boolean} Success status
 */
function removeTestAccount(email) {
  try {
    const testAccounts = getTestAccounts();
    const index = testAccounts.indexOf(email);
    if (index > -1) {
      testAccounts.splice(index, 1);
      setConfig(ConfigKeys.TEST_ACCOUNTS, JSON.stringify(testAccounts));
      Logger.log(`Test account removed: ${email}`);
    }
    return true;
  } catch (error) {
    Logger.log(`Error removing test account: ${error.message}`);
    return false;
  }
}
