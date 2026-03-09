// ==========================================
// GLOBAL JAVASCRIPT UTILITIES
// Common functions used across all pages
// ==========================================

// API Base URL - Change this if backend is on different server
const API_BASE_URL = 'http://localhost:5000/api';

// ==========================================
// TOKEN MANAGEMENT
// Store and retrieve JWT token from localStorage
// ==========================================

function saveToken(token) {
  // Save token in browser's localStorage
  // localStorage persists data even after page refresh
  localStorage.setItem('authToken', token);
}

function getToken() {
  // Retrieve token from localStorage
  return localStorage.getItem('authToken');
}

function removeToken() {
  // Remove token (when user logs out)
  localStorage.removeItem('authToken');
}

function isLoggedIn() {
  // Check if token exists
  return getToken() !== null;
}

// ==========================================
// API REQUEST HELPER
// Make HTTP requests with proper headers
// ==========================================

async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false) {
  /*
   * PARAMETERS:
   *   endpoint: API path (e.g., '/auth/login')
   *   method: HTTP method ('GET', 'POST', 'PUT', 'DELETE')
   *   data: Request body (for POST/PUT)
   *   requiresAuth: If true, adds Authorization header
   *
   * EXAMPLE:
   *   apiRequest('/rooms', 'GET') - Get all rooms
   *   apiRequest('/bookings', 'POST', { roomId: 1, ... }, true) - Create booking
   */

  const url = API_BASE_URL + endpoint;

  // Build request options
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Add authentication token if needed
  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      // Redirect to login if not authenticated
      showAlert('Please login first', 'error');
      window.location.href = 'login.html';
      return;
    }
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add request body if provided
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    // Send request
    const response = await fetch(url, options);
    const result = await response.json();

    // Check if response was successful
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }

    return result;

  } catch (error) {
    console.error('API Error:', error);
    showAlert(error.message, 'error');
    throw error;
  }
}

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================

function showAlert(message, type = 'success') {
  /*
   * Display alert message to user
   * TYPES: 'success', 'error', 'info', 'warning'
   */

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  // Insert at top of page
  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

function formatDate(dateString) {
  // Convert date from "2026-01-15" to "Jan 15, 2026"
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
  // Convert number to currency format
  // Example: 100 → "$100.00"
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function calculateNights(checkInDate, checkOutDate) {
  // Calculate number of nights between two dates
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

// ==========================================
// PAGE LOAD CHECKS
// ==========================================

function checkAuthenticationStatus() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showAlert('Please login first', 'error');
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  // Redirect to dashboard if already logged in
  if (isLoggedIn()) {
    window.location.href = 'user-dashboard.html';
  }
}

// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

async function getCurrentUserProfile() {
  // Get logged-in user's profile
  try {
    const response = await apiRequest('/auth/profile', 'GET', null, true);
    return response.user;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

function logout() {
  // Clear token and redirect to login
  removeToken();
  showAlert('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// ==========================================
// LOCAL STORAGE FOR USER DATA
// ==========================================

function saveUserProfile(userProfile) {
  // Save user info locally for quick access
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function getUserProfile() {
  // Get user info from local storage
  const profile = localStorage.getItem('userProfile');
  return profile ? JSON.parse(profile) : null;
}

// Export functions (for use in other files)
// Note: In browsers, all functions are global by default
