// js/admin.js - Admin dashboard logic
// Depends on: auth.js (loaded before this script)
// =============================================================
/* global apiGet, apiPut, apiDelete, showToast, requireAuth,
   logout, statusBadge, priorityBadge, catBadge, formatDate,
   renderPagination, showSection, openModal, closeModal, Chart, API_BASE, connectionPool */

// ── State ─────────────────────────────────────────────────────
let adminCurrentPage = 1;
let statusChartMini = null, categoryChartMini = null;
let statusChartLarge = null, categoryChartLarge = null;
let socket = null;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth('admin');
  if (!user) return;

  // Fill sidebar
  document.getElementById('sidebarName').textContent = user.name;
  document.getElementById('sidebarAvatar').textContent = user.name.charAt(0).toUpperCase();

  // Load dashboard data
  loadAdminStats();
  loadRecentComplaints();

  // Socket.io for real-time updates
  initSocket();
});

// ── Socket.io ─────────────────────────────────────────────────
function initSocket() {
  const indicator = document.getElementById('socketIndicator');
  const script = document.createElement('script');
  const backendUrl = window.API_BASE || 'https://hostel-grievance-portal.onrender.com';
  script.src = backendUrl + '/socket.io/socket.io.js';
  script.onload = () => {
    /* global io */
    socket = io(backendUrl);
    socket.on('connect', () => {
      indicator.textContent = '🟢 Live';
      indicator.style.color = 'var(--success)';
    });
    socket.on('disconnect', () => {
      indicator.textContent = '⚪ Offline';
      indicator.style.color = 'var(--text-muted)';
    });
    socket.on('complaint:new', () => {
      showToast('A new complaint has been submitted!', 'info', '🆕 New Complaint');
      loadAdminStats();
      const sec = document.getElementById('sec-complaints');
      if (sec && sec.style.display !== 'none') loadAllComplaints(adminCurrentPage);
    });
  };
  script.onerror = () => { indicator.textContent = '⚪ Offline'; };
  document.head.appendChild(script);
}

// ── Admin Stats ───────────────────────────────────────────────
async function loadAdminStats() {
  try {
    const [allData, pend, prog, res] = await Promise.all([
      apiGet('/api/admin/complaints?page=1'),
      apiGet('/api/admin/complaints?status=Pending&page=1'),
      apiGet('/api/admin/complaints?status=In%20Progress&page=1'),
      apiGet('/api/admin/complaints?status=Resolved&page=1'),
    ]);
    document.getElementById('statTotal').textContent = allData.pagination.total;
    document.getElementById('statPending').textContent = pend.pagination.total;
    document.getElementById('statInProgress').textContent = prog.pagination.total;
    document.getElementById('statResolved').textContent = res.pagination.total;

    // Draw mini charts with analytics data
    const analytics = await apiGet('/api/admin/analytics');
    drawStatusChart('statusChartMini', analytics.analytics.byStatus);
    drawCategoryChart('categoryChartMini', analytics.analytics.byCategory);
  } catch (err) {
    console.error('loadAdminStats:', err.message);
  }
}

// ── Recent Complaints (Dashboard preview) ─────────────────────
async function loadRecentComplaints() {
  const tbody = document.getElementById('recentComplaintsBody');
  try {
    const data = await apiGet('/api/admin/complaints?page=1');
    const list = data.complaints.slice(0, 5);
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><p>No complaints yet</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escHtml(c.student_name)}</td>
        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escHtml(c.title)}">${escHtml(c.title)}</td>
        <td>${catBadge(c.category)}</td>
        <td>${statusBadge(c.status)}</td>
        <td>${priorityBadge(c.priority)}</td>
        <td>${formatDate(c.created_at)}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--danger);text-align:center;">Failed to load</td></tr>`;
  }
}

// ── All Complaints Table ──────────────────────────────────────
async function loadAllComplaints(page = adminCurrentPage) {
  console.log("🔍 loadAllComplaints: Starting with page:", page); // Debug log
  adminCurrentPage = page;
  const tbody = document.getElementById('adminComplaintsBody');
  const paginationEl = document.getElementById('adminPaginationContainer');
  const countEl = document.getElementById('complaintCount');
  tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="spinner"></div></div></td></tr>`;

  const search = encodeURIComponent(document.getElementById('adminSearch').value.trim());
  const status = encodeURIComponent(document.getElementById('adminFilterStatus').value);
  const category = encodeURIComponent(document.getElementById('adminFilterCategory').value);
  const dateFrom = document.getElementById('adminDateFrom').value;
  const dateTo = document.getElementById('adminDateTo').value;

  let query = `/api/admin/complaints?page=${page}&search=${search}&status=${status}&category=${category}`;
  if (dateFrom) query += `&dateFrom=${dateFrom}`;
  if (dateTo) query += `&dateTo=${dateTo}`;

  console.log("🔍 loadAllComplaints: Query:", query); // Debug log

  try {
    const data = await apiGet(query);
    console.log("🔍 loadAllComplaints: API response:", data); // Debug log
    
    if (!data.success || !data.complaints) {
      console.error("🔍 loadAllComplaints: Invalid response:", data); // Debug log
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load complaints</p></div></td></tr>`;
      paginationEl.innerHTML = '';
      countEl.textContent = '0 complaint(s)';
      return;
    }
    
    const list = data.complaints || [];
    countEl.textContent = `${data.pagination?.total || list.length} complaint(s)`;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">�</div><p>No complaints found</p></div></td></tr>`;
      paginationEl.innerHTML = '';
      return;
    }

    tbody.innerHTML = list.map((c, i) => `
      <tr>
        <td>${(page - 1) * 10 + i + 1}</td>
        <td>${escHtml(c.student_name)}</td>
        <td>${escHtml(c.room_no || '—')}</td>
        <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escHtml(c.title)}">${escHtml(c.title)}</td>
        <td>${catBadge(c.category)}</td>
        <td>
          <select class="inline-select" onchange="quickUpdateStatus(${c.id}, this.value, '${c.priority}')">
            <option ${c.status==='Pending'?'selected':''}>Pending</option>
            <option ${c.status==='In Progress'?'selected':''}>In Progress</option>
            <option ${c.status==='Resolved'?'selected':''}>Resolved</option>
          </select>
        </td>
        <td>
          <select class="inline-select" onchange="quickUpdateStatus(${c.id}, '${c.status}', this.value)">
            <option ${c.priority==='Low'?'selected':''}>Low</option>
            <option ${c.priority==='Medium'?'selected':''}>Medium</option>
            <option ${c.priority==='High'?'selected':''}>High</option>
          </select>
        </td>
        <td>${formatDate(c.created_at)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" onclick='viewComplaintAdmin(${JSON.stringify(c)})' title="View">👁️</button>
            <button class="btn btn-primary btn-sm" onclick="openRemarkModal(${c.id}, \`${escHtml(c.admin_remark || '').replace(/`/g, '\\`')}\`)" title="Remark">💬</button>
            <button class="btn btn-danger btn-sm" onclick="adminDeleteComplaint(${c.id})" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination(paginationEl, page, data.pagination.totalPages, loadAllComplaints);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="color:var(--danger);text-align:center;">${err.message}</td></tr>`;
  }
}

function clearFilters() {
  document.getElementById('adminSearch').value = '';
  document.getElementById('adminFilterStatus').value = '';
  document.getElementById('adminFilterCategory').value = '';
  document.getElementById('adminDateFrom').value = '';
  document.getElementById('adminDateTo').value = '';
  loadAllComplaints(1);
}

// ── Quick Inline Status/Priority Update ───────────────────────
async function quickUpdateStatus(id, status, priority) {
  try {
    await apiPut(`/api/admin/complaints/${id}/status`, { status, priority });
    showToast('Updated successfully!', 'success');
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
    loadAllComplaints(adminCurrentPage); // Revert UI
  }
}

// ── Remark Modal ──────────────────────────────────────────────
function openRemarkModal(id, currentRemark) {
  document.getElementById('remarkComplaintId').value = id;
  document.getElementById('remarkText').value = currentRemark || '';
  openModal('remarkModal');
}

async function submitRemark() {
  const id = document.getElementById('remarkComplaintId').value;
  const remark = document.getElementById('remarkText').value.trim();
  if (!remark) { showToast('Remark cannot be empty.', 'error'); return; }

  try {
    await apiPut(`/api/admin/complaints/${id}/remark`, { remark });
    showToast('Remark saved!', 'success');
    closeModal('remarkModal');
    loadAllComplaints(adminCurrentPage);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── View Complaint (Admin) ────────────────────────────────────
function viewComplaintAdmin(c) {
  console.log("🔍 viewComplaintAdmin: Full complaint data:", c); // Debug log
  console.log("🔍 viewComplaintAdmin: Image URL:", c.image_url); // Debug log
  
  // Fix image URL - extract filename and use API endpoint
  let imageUrl = '';
  if (c.image_url) {
    // Extract just the filename from any path format and decode spaces
    const filename = c.image_url.replace(/^\/uploads\//, '').replace(/^uploads\//, '').replace(/%20/g, ' ');
    imageUrl = `${window.API_BASE}/api/images/${encodeURIComponent(filename)}`;
  }
  
  console.log("🔍 viewComplaintAdmin: Final image URL:", imageUrl); // Debug log
  
  document.getElementById('viewModalBody').innerHTML = `
    <div style="display:grid;gap:1rem;">
      <div><strong>Title:</strong> ${escHtml(c.title)}</div>
      <div><strong>Category:</strong> ${catBadge(c.category)}</div>
      <div><strong>Status:</strong> ${statusBadge(c.status)}</div>
      <div><strong>Priority:</strong> ${priorityBadge(c.priority)}</div>
      <div><strong>Description:</strong><br/><p style="color:var(--text-secondary);margin-top:0.25rem;">${escHtml(c.description)}</p></div>
      ${c.admin_remark ? `<div style="background:rgba(99,102,241,0.08);border-radius:8px;padding:0.75rem;"><strong>Admin Remark:</strong><br/><p style="color:var(--text-secondary);margin-top:0.25rem;">${escHtml(c.admin_remark)}</p></div>` : ''}
      ${imageUrl ? `<div><strong>Attached Image:</strong><br/><img src="${imageUrl}" class="complaint-image" style="margin-top:0.5rem;max-width:100%;border-radius:8px;" alt="Complaint image" onerror="console.log('Image failed to load:', this.src);"/></div>` : ''}
      <div style="color:var(--text-muted);font-size:0.8rem;">Submitted: ${formatDate(c.created_at)}</div>
    </div>
  `;
  openModal('viewModal');
}

// ── Delete Complaint (Admin) ──────────────────────────────────
async function adminDeleteComplaint(id) {
  if (!confirm('Delete this complaint? This action cannot be undone.')) return;
  try {
    await apiDelete(`/api/admin/complaints/${id}`);
    showToast('Complaint deleted.', 'success');
    loadAllComplaints(adminCurrentPage);
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Analytics Section ─────────────────────────────────────────
async function loadAnalytics() {
  try {
    const data = await apiGet('/api/admin/analytics');
    const { byStatus, byCategory, total } = data.analytics;

    console.log("🔍 loadAnalytics: Raw byStatus:", byStatus); // Debug log
    console.log("🔍 loadAnalytics: Raw byCategory:", byCategory); // Debug log

    // Ensure data is in array format
    let statusArray, categoryArray;
    
    if (!Array.isArray(byStatus)) {
      if (byStatus.status && byStatus.count) {
        statusArray = [byStatus]; // Wrap single object in array
      } else {
        statusArray = Object.values(byStatus || []);
      }
    } else {
      statusArray = byStatus;
    }
    
    if (!Array.isArray(byCategory)) {
      categoryArray = Object.values(byCategory || []);
    } else {
      categoryArray = byCategory;
    }
    
    console.log("🔍 loadAnalytics: Processed statusArray:", statusArray); // Debug log
    console.log("🔍 loadAnalytics: Processed categoryArray:", categoryArray); // Debug log
    
    drawStatusChart('statusChartLarge', statusArray);
    drawCategoryChart('categoryChartLarge', categoryArray);

    // Summary grid
    const summaryEl = document.getElementById('analyticsSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="stat-card total"><div class="stat-icon">📁</div><div class="stat-number">${total}</div><div class="stat-label">Total</div></div>
        ${statusArray.map(s => {
          const status = s.status || s.name || 'Unknown';
          const count = s.count || s.value || 0;
          const statusLower = (status || '').toLowerCase();
          
          console.log(`🔍 loadAnalytics: Creating status card - status: "${status}", count: ${count}`); // Debug log
          
          return `
            <div class="stat-card ${statusLower}"><div class="stat-icon">${statusBadge(status)}</div><div class="stat-number">${count}</div><div class="stat-label">${status}</div></div>
          `;
        }).join('')}
      `;
    }
  } catch (err) {
    console.error('loadAnalytics error:', err);
    showToast('Failed to load analytics.', 'error');
  }
}

// ── Chart Helpers ─────────────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#8b5cf6'];

function drawStatusChart(canvasId, byStatus) {
  console.log("🔍 drawStatusChart: Input data:", byStatus); // Debug log
  
  if (!Array.isArray(byStatus)) {
    console.log("🔍 drawStatusChart: Converting object to array"); // Debug log
    // If it's an object like {status: "Pending", count: 1}, convert to array format
    if (byStatus.status && byStatus.count) {
      byStatus = [byStatus]; // Wrap single object in array
    } else {
      byStatus = Object.values(byStatus || []);
    }
  }
  
  console.log("🔍 drawStatusChart: Final array:", byStatus); // Debug log
  
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  
  // Destroy existing chart
  const existingChart = window[canvasId];
  if (existingChart && typeof existingChart.destroy === 'function') {
    existingChart.destroy();
  }

  window[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: byStatus.map(s => s.status || s.name || 'Unknown'),
      datasets: [{
        data: byStatus.map(s => s.count || s.value || 0),
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#fff', padding: 10 } },
      },
    },
  });
}

function drawCategoryChart(canvasId, byCategory) {
  if (!Array.isArray(byCategory)) {
    byCategory = Object.values(byCategory || []);
  }
  
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  // Destroy existing chart
  const existingChart = window[canvasId];
  if (existingChart && typeof existingChart.destroy === 'function') {
    existingChart.destroy();
  }

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: byCategory.map(c => c.category || c.name || 'Unknown'),
      datasets: [{
        data: byCategory.map(c => c.count || c.value || 0),
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#fff', padding: 10 } },
      },
    },
  });

  window[canvasId] = chart;
}

// ── Utility ───────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
