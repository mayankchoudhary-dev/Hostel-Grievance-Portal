// js/auth.js - Shared utilities: API helpers, toast, theme, auth guards
// =============================================================

// API_BASE will be set in index.html
const API_BASE = window.API_BASE || 'https://hostel-grievance-portal.onrender.com';

// Connection pool for better reliability
const connectionPool = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  activeRequests: new Map()
};

/* -------------------------------------------------------
   API Helpers
------------------------------------------------------- */
// Test connection to backend
async function testConnection() {
  try {
    console.log("Testing connection to:", API_BASE + '/api/health');
    console.log("Current API_BASE:", API_BASE);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), connectionPool.timeout);
    
    const res = await fetch(API_BASE + '/api/health', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache',
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    console.log("Health check response status:", res.status);
    console.log("Health check response headers:", Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Health check response data:", data);
    
    if (data.success) {
      console.log("✅ Backend connection verified successfully");
      return data;
    } else {
      throw new Error('Backend health check failed');
    }
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    if (error.name === 'AbortError') {
      throw new Error('Connection timeout - server not responding');
    }
    throw error;
  }
}

async function apiPost(endpoint, body) {
  console.log("API POST:", endpoint); // Debug log
  console.log("API_BASE:", API_BASE); // Debug log
  console.log("Body:", body); // Debug log
  
  // Registration and login endpoints don't require authentication
  const isPublicEndpoint = endpoint === '/api/register' || endpoint === '/api/login';
  
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found in localStorage");
      showToast('Please login first.', 'error');
      return null;
    }
  }

  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization header only for authenticated endpoints
  if (!isPublicEndpoint) {
    headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  }

  let lastError = null;

  for (let attempt = 1; attempt <= connectionPool.maxRetries; attempt++) {
    try {
      console.log(`🔄 POST Attempt ${attempt} for ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), connectionPool.timeout);
      
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        mode: 'cors',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ POST Attempt ${attempt} failed:`, res.status, res.statusText);
        console.error('Response body:', errorText);
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        if (attempt < connectionPool.maxRetries) {
          console.log(`⏳ Waiting ${connectionPool.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, connectionPool.retryDelay));
          continue;
        } else {
          throw lastError;
        }
      }

      const data = await res.json();
      console.log(`✅ POST Attempt ${attempt} successful:`, res.status);
      console.log("Response data:", data);

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid server response format');
      }

      if (!data.success) {
        console.error('API returned success=false:', data);
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (err) {
      console.error(`❌ POST Attempt ${attempt} error:`, err.message);
      console.error("Error stack:", err.stack);
      lastError = err;
      
      if (attempt < connectionPool.maxRetries) {
        console.log(`⏳ Waiting ${connectionPool.retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, connectionPool.retryDelay));
        continue;
      } else {
        // Final attempt failed - show user friendly error
        const errorMessage = err.message || 'Network connection failed';
        console.error(`💥 Final POST attempt ${attempt} failed:`, errorMessage);
        showToast(`Connection failed: ${errorMessage}. Please check your internet connection and try again.`, 'error');
        throw lastError || new Error(errorMessage);
      }
    }
  }
}

async function apiGet(endpoint) {
  console.log("API GET:", endpoint); // Debug log
  console.log("API_BASE:", API_BASE); // Debug log
  console.log("Token:", localStorage.getItem('token')); // Debug log
  console.log("User role:", localStorage.getItem('userRole')); // Debug log
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("No token found in localStorage");
    showToast('Please login first.', 'error');
    return null;
  }

  // Check if same request is already in progress
  const requestKey = `${endpoint}_${Date.now()}`;
  if (connectionPool.activeRequests.has(requestKey)) {
    console.log("🔄 Request already in progress, waiting...");
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!connectionPool.activeRequests.has(requestKey)) {
          clearInterval(checkInterval);
          return apiGet(endpoint); // Retry the request
        }
      }, 500);
    });
  }

  connectionPool.activeRequests.set(requestKey, true);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  let lastError = null;

  for (let attempt = 1; attempt <= connectionPool.maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt} for ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), connectionPool.timeout);
      
      const res = await fetch(API_BASE + endpoint, {
        method: 'GET',
        headers,
        mode: 'cors',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      connectionPool.activeRequests.delete(requestKey);

      // Check if response is ok
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Attempt ${attempt} failed:`, res.status, res.statusText);
        console.error('Response body:', errorText);
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        if (attempt < connectionPool.maxRetries) {
          console.log(`⏳ Waiting ${connectionPool.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, connectionPool.retryDelay));
          continue;
        } else {
          throw lastError;
        }
      }

      const data = await res.json();
      console.log(`✅ Attempt ${attempt} successful:`, res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));
      console.log("Response data success:", data.success);

      if (!data.success) {
        console.error('API returned success=false:', data);
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (err) {
      connectionPool.activeRequests.delete(requestKey);
      console.error(`❌ Attempt ${attempt} error:`, err.message);
      console.error("Error stack:", err.stack);
      lastError = err;
      
      if (attempt < connectionPool.maxRetries) {
        console.log(`⏳ Waiting ${connectionPool.retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, connectionPool.retryDelay));
        continue;
      } else {
        // Final attempt failed - show user friendly error
        const errorMessage = err.message || 'Network connection failed';
        console.error(`💥 Final attempt ${attempt} failed:`, errorMessage);
        showToast(`Connection failed: ${errorMessage}. Please check your internet connection and try again.`, 'error');
        throw lastError || new Error(errorMessage);
      }
    }
  }
}

async function apiPut(endpoint, body) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("No token found in localStorage");
    showToast('Please login first.', 'error');
    return null;
  }

  try {
    const res = await fetch(API_BASE + endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    console.error("API PUT Error:", error);
    throw error;
  }
}

async function apiDelete(endpoint) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("No token found in localStorage");
    showToast('Please login first.', 'error');
    return null;
  }

  try {
    const res = await fetch(API_BASE + endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    console.error("API DELETE Error:", error);
    throw error;
  }
}

async function apiPostForm(url, formData) {
  const res = await /https://hostel-grievance-portal.onrender.com" + url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token") // 🔥 FIX
    },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API POST Form Error:", res.status, text);
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

/* -------------------------------------------------------
   Toast Notifications
------------------------------------------------------- */
function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(80px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* -------------------------------------------------------
   Dark Mode Toggle
------------------------------------------------------- */
function initTheme() {
  const saved = localStorage.getItem('hgp_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('hgp_theme', next);
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.textContent = next === 'dark' ? '☀️' : '🌙';
}

/* -------------------------------------------------------
   Modal helpers
------------------------------------------------------- */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

/* -------------------------------------------------------
   Auth Guard
------------------------------------------------------- */
function requireAuth(role) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  console.log('?? requireAuth called with role:', role);
  console.log('?? User data:', user);
  console.log('?? Token present:', !!token);
  
  if (!token || !user) {
    console.log('?? No token or user, redirecting to login');
    window.location.href = 'index.html';
    return null;
  }
  
  if (role && user.role !== role) {
    console.log('?? Role mismatch. User role:', user.role, 'Required role:', role);
    console.log('?? Redirecting to correct dashboard...');
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
    return null;
  }
  
  console.log('?? Authentication successful for:', user.email);
  return user;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  console.log('🚪 Logging out, clearing auth data...');
  
  // Try multiple redirect methods in order of preference
  const redirects = [
    'https://hostel-grievance-portal.onrender.com/index.html',  // Preferred: Frontend server
    'http://127.0.0.1:5000/index.html', // Alternative: localhost IP
    'index.html',  // Fallback: Direct file
    '../index.html',  // Another fallback: Relative path
    './index.html'   // Last resort: Current directory
  ];
  
  let redirectAttempt = 0;
  
  function tryNextRedirect() {
    if (redirectAttempt >= redirects.length) {
      console.error('❌ All redirect attempts failed');
      alert('Logout successful! Please manually navigate to login page.');
      return;
    }
    
    const targetUrl = redirects[redirectAttempt];
    console.log(`🔄 Redirect attempt ${redirectAttempt + 1}: ${targetUrl}`);
    
    // Test if this URL works (only for HTTP URLs)
    if (targetUrl.startsWith('http')) {
      fetch(targetUrl.replace('/index.html', '/health'), { 
        mode: 'no-cors',
        signal: AbortSignal.timeout(1000)
      })
        .then(() => {
          console.log('✅ Server is running, redirecting to:', targetUrl);
          window.location.href = targetUrl;
        })
        .catch(() => {
          console.log('❌ Server not responding, trying next method...');
          redirectAttempt++;
          setTimeout(tryNextRedirect, 100);
        });
    } else {
      // For file:// URLs, redirect immediately
      console.log('📁 Redirecting to file:', targetUrl);
      window.location.href = targetUrl;
    }
  }
  
  // Start redirect attempts
  tryNextRedirect();
  
  // Emergency fallback - force redirect after 3 seconds
  setTimeout(() => {
    if (window.location.href.includes('dashboard')) {
      console.log('🚨 Emergency fallback redirect');
      window.location.href = 'index.html';
    }
  }, 3000);
}

/* -------------------------------------------------------
   Badge HTML helpers
------------------------------------------------------- */
function statusBadge(status) {
  const map = {
    'Pending': 'badge-pending',
    'In Progress': 'badge-in-progress',
    'Resolved': 'badge-resolved',
  };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}

function priorityBadge(priority) {
  const map = {
    'Low': 'badge-low',
    'Medium': 'badge-medium',
    'High': 'badge-high',
  };
  return `<span class="badge ${map[priority] || ''}">${priority}</span>`;
}

function catBadge(cat) {
  return `<span class="badge-cat">${cat}</span>`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* -------------------------------------------------------
   Pagination renderer
------------------------------------------------------- */
function renderPagination(container, currentPage, totalPages, onPageClick) {
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '‹';
  prev.disabled = currentPage === 1;
  prev.onclick = () => onPageClick(currentPage - 1);
  container.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = i;
      btn.onclick = () => onPageClick(i);
      container.appendChild(btn);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      const dots = document.createElement('span');
      dots.textContent = '…';
      dots.style.cssText = 'padding:0 0.25rem;color:var(--text-muted);';
      container.appendChild(dots);
    }
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = '›';
  next.disabled = currentPage === totalPages;
  next.onclick = () => onPageClick(currentPage + 1);
  container.appendChild(next);
}

/* -------------------------------------------------------
   Section switcher for dashboards
------------------------------------------------------- */
function showSection(name) {
  document.querySelectorAll('[id^="sec-"]').forEach(el => el.style.display = 'none');
  const el = document.getElementById('sec-' + name);
  if (el) el.style.display = 'block';

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById('nav' + name.charAt(0).toUpperCase() + name.slice(1));
  if (navEl) navEl.classList.add('active');

  const titles = {
    dashboard: 'Dashboard',
    submit: 'Submit Complaint',
    complaints: 'My Complaints',
    analytics: 'Analytics',
  };
  const topbar = document.getElementById('topbarTitle');
  if (topbar) topbar.textContent = titles[name] || 'Dashboard';
}

/* Run on every page load */
initTheme();
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
