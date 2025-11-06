/**
 * Authentication Flow
 *
 * Handles login and logout operations with UI feedback.
 * Uses helper functions from api.js (showLoading, hideLoading, showError, hideError, showSuccess, handleAPIError)
 *
 * @author CasesDash v3.0.0
 */

/**
 * Handle login button click
 */
async function handleLogin() {
  console.log('Login initiated');

  // Hide previous errors
  hideError('loginError');

  // Show loading
  showLoading('loginLoading');

  // Disable login button
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.disabled = true;
  }

  try {
    // Call authentication API
    const result = await API.auth.authenticate();

    console.log('Authentication response:', result);

    if (result.success) {
      // Authentication successful
      console.log('Authentication successful:', result.data);

      // Show success message
      showSuccess(`Welcome, ${result.data.email}!`);

      // Reload page to show main app (only in browser)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

    } else {
      // Authentication failed
      const errorMessage = result.error || 'Authentication failed. Please try again.';
      showError('loginError', errorMessage);

      // Log error details
      if (result.code) {
        console.error(`Auth failed with code: ${result.code}`);
      }
      if (result.details) {
        console.error('Error details:', result.details);
      }
    }

  } catch (error) {
    // Network or script error
    const errorMessage = handleAPIError(error, 'login');
    showError('loginError', errorMessage);

  } finally {
    // Hide loading and re-enable button
    hideLoading('loginLoading');
    if (loginButton) {
      loginButton.disabled = false;
    }
  }
}

/**
 * Handle logout button click
 */
async function handleLogout() {
  console.log('Logout initiated');

  // Confirm logout
  const confirmed = confirm('Are you sure you want to logout?');
  if (!confirmed) {
    return;
  }

  // Disable logout button
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.disabled = true;
    logoutButton.textContent = 'Logging out...';
  }

  try {
    // Call logout API
    const result = await API.auth.logout();

    console.log('Logout response:', result);

    if (result.success) {
      // Logout successful
      console.log('Logout successful');

      // Show success message
      showSuccess('Logged out successfully');

      // Redirect to login page (only in browser)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

    } else {
      // Logout failed (unlikely but handle it)
      const errorMessage = result.error || 'Logout failed. Please try again.';
      alert(errorMessage);
    }

  } catch (error) {
    // Network or script error
    const errorMessage = handleAPIError(error, 'logout');
    alert(errorMessage);

  } finally {
    // Re-enable button
    if (logoutButton) {
      logoutButton.disabled = false;
      logoutButton.innerHTML = '<span class="material-icons">logout</span> Logout';
    }
  }
}

/**
 * Check authentication status on page load
 */
async function checkAuthOnLoad() {
  try {
    const status = await API.auth.checkStatus();
    console.log('Auth status on load:', status);

    if (!status.authenticated) {
      console.log('User not authenticated');
      // If on main app page but not authenticated, redirect to login (only in browser)
      if (typeof window !== 'undefined' && window.location.pathname.includes('app')) {
        window.location.href = '/';
      }
    } else {
      console.log('User authenticated:', status.user);
    }

  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

/**
 * Set up periodic session refresh (every 30 minutes)
 */
function setupSessionRefresh() {
  // Refresh session every 30 minutes
  setInterval(async () => {
    try {
      console.log('Refreshing session...');
      const result = await API.auth.refresh();

      if (result.success) {
        console.log('Session refreshed successfully');
      } else {
        console.warn('Session refresh failed:', result.error);
      }

    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, 30 * 60 * 1000); // 30 minutes
}

/**
 * Initialize authentication module
 */
function initAuth() {
  console.log('Auth module initialized');

  // Check auth status on load
  checkAuthOnLoad();

  // Set up session refresh
  setupSessionRefresh();

  // Add keyboard shortcuts (only in browser environment)
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter on login page triggers login
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const loginButton = document.getElementById('loginButton');
        if (loginButton && !loginButton.disabled) {
          handleLogin();
        }
      }
    });
  }
}

// Initialize when DOM is ready (only in browser environment)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
  console.log('Auth module loaded');
}
