// js/auth.js - Shared utilities: API helpers, toast, theme, auth guards
// =============================================================

const API_BASE = window.ENV.API_BASE_URL;

/* -------------------------------------------------------
   API Helpers
------------------------------------------------------- */
// Test connection to backend
async function testConnection() {
  try {
    console.log("Testing connection to:", API_BASE + '/api/health');
    const res = await fetch(API_BASE + '/api/health');
    const data = await res.json();
    console.log("Health check response:", data);
    return data;
  } catch (error) {
    console.error("Connection test failed:", error);
    throw error;
  }
}

async function apiPost(endpoint, body) {
  console.log("API POST:", endpoint); // Debug log
  console.log("API_BASE:", API_BASE); // Debug log
  console.log("Body:", body); // Debug log
  
  try {
    const res = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log("POST Response status:", res.status); // Debug log
    
    const data = await res.json();
    console.log("POST Response data:", data); // Debug log
    
    if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    console.error("API POST Error:", error); // Debug log
    throw error;
  }
}

async function apiGet(endpoint) {
  const token = localStorage.getItem('hgp_token');
  console.log("API GET:", endpoint); // Debug log
  console.log("Token:", token); // Debug log
  console.log("API_BASE:", API_BASE); // Debug log
  
  // Check if admin endpoint and verify admin role
  if (endpoint.includes('/admin/')) {
    const user = JSON.parse(localStorage.getItem('hgp_user') || '{}');
    console.log("User role:", user.role); // Debug log
    if (user.role !== 'admin') {
      console.error("❌ Admin access required but user is:", user.role);
      throw new Error('Admin access required');
    }
  }
  
  try {
    console.log("Making request to:", API_BASE + endpoint); // Debug log
    const res = await fetch(API_BASE + endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Response status:", res.status); // Debug log
    console.log("Response headers:", [...res.headers.entries()]); // Debug log
    
    const data = await res.json();
    console.log("Response data:", data); // Debug log
    console.log("Response data success:", data.success); // Debug log
    console.log("Response ok:", res.ok); // Debug log
    
    if (!res.ok || !data.success) {
      console.log("Request failed - ok:", res.ok, "success:", data.success);
      throw new Error(data.message || 'Request failed');
    }
    return data;
  } catch (error) {
    console.error("API GET Error:", error); // Debug log
    console.error("Error stack:", error.stack); // Debug log
    throw error;
  }
}

async function apiPut(endpoint, body) {
  const token = localStorage.getItem('hgp_token');
  const res = await fetch(API_BASE + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiDelete(endpoint) {
  const token = localStorage.getItem('hgp_token');
  const res = await fetch(API_BASE + endpoint, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiPostForm(endpoint, formData) {
  const token = localStorage.getItem('hgp_token');
  const res = await fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data;
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
  const token = localStorage.getItem('hgp_token');
  const user = JSON.parse(localStorage.getItem('hgp_user') || 'null');
  if (!token || !user) {
    window.location.href = 'index.html';
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('hgp_token');
  localStorage.removeItem('hgp_user');
  window.location.href = 'index.html';
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
