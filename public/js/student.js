// js/student.js - Student dashboard logic
// Depends on: auth.js (loaded before this script)
// =============================================================
/* global apiGet, apiPut, apiDelete, apiPostForm, showToast, requireAuth,
   logout, statusBadge, priorityBadge, catBadge, formatDate,
   renderPagination, showSection, openModal, closeModal, API_BASE */

// ── State ────────────────────────────────────────────────────
let currentPage = 1;
let currentUser = null;
let socket = null;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  currentUser = requireAuth('student');
  if (!currentUser) return;

  // Fill user info in sidebar / topbar
  document.getElementById('sidebarName').textContent = currentUser.name;
  document.getElementById('topbarName').textContent = currentUser.name;
  document.getElementById('sidebarAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

  // Load initial data
  loadStats();
  loadRecentComplaints();

  // Setup submit form
  setupSubmitForm();

  // Image file name preview
  document.getElementById('cImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    document.getElementById('filePreviewText').textContent = file ? `📎 ${file.name}` : '';
  });

  // Filter listeners
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadMyComplaints(1);
  });

  // Socket.io for real-time updates
  initSocket();
});

// ── Socket.io ────────────────────────────────────────────────
function initSocket() {
  const indicator = document.getElementById('socketIndicator');

  try {
    // Dynamic import from CDN if not preloaded
    const script = document.createElement('script');
    // Force Socket.IO to use port 5000 regardless of cached values
    const backendUrl = 'https://hostel-grievance-portal.onrender.com';
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
      // When a complaint is updated by admin, refresh if on complaints section
      socket.on('complaint:updated', (data) => {
        showToast(`Complaint #${data.id} status updated to "${data.status}"`, 'info', '📩 Update');
        const sec = document.getElementById('sec-complaints');
        if (sec && sec.style.display !== 'none') loadMyComplaints(currentPage);
        loadStats();
      });
      socket.on('complaint:remark', (data) => {
        showToast(`Admin added a remark on Complaint #${data.id}`, 'info', '💬 Remark');
      });
    };
    script.onerror = () => { indicator.textContent = '⚪ Offline'; };
    document.head.appendChild(script);
  } catch (e) {
    console.warn('Socket.io not available:', e.message);
  }
}

// ── Stats ─────────────────────────────────────────────────────
async function loadStats() {
  try {
    const data = await apiGet('/api/complaints/my?page=1');
    const all = data.pagination.total;
    // Also get per-status counts
    const [pend, prog, res] = await Promise.all([
      apiGet('/api/complaints/my?status=Pending'),
      apiGet('/api/complaints/my?status=In%20Progress'),
      apiGet('/api/complaints/my?status=Resolved'),
    ]);
    document.getElementById('statTotal').textContent = all;
    document.getElementById('statPending').textContent = pend.pagination.total;
    document.getElementById('statInProgress').textContent = prog.pagination.total;
    document.getElementById('statResolved').textContent = res.pagination.total;
  } catch (err) {
    console.error('loadStats:', err.message);
  }
}

// ── Recent Complaints (Dashboard preview) ────────────────────
async function loadRecentComplaints() {
  const tbody = document.getElementById('recentComplaintsBody');
  try {
    const data = await apiGet('/api/complaints/my?page=1');
    const list = data.complaints.slice(0, 5);
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>No complaints yet. Submit your first one!</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(c.title)}</td>
        <td>${catBadge(c.category)}</td>
        <td>${statusBadge(c.status)}</td>
        <td>${formatDate(c.created_at)}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger);text-align:center;">Failed to load</td></tr>`;
  }
}

// ── Submit Complaint ─────────────────────────────────────────
function setupSubmitForm() {
  const form = document.getElementById('submitComplaintForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('submitBtnText');
    const spinner = document.getElementById('submitSpinner');
    const errEl = document.getElementById('submitError');

    errEl.style.display = 'none';

    const title = document.getElementById('cTitle').value.trim();
    const category = document.getElementById('cCategory').value;
    const priority = document.getElementById('cPriority').value;
    const description = document.getElementById('cDesc').value.trim();
    const imageFile = document.getElementById('cImage').files[0];

    if (!title || !category || !description || !priority) {
      errEl.textContent = 'Please fill in all required fields.';
      errEl.style.display = 'block';
      return;
    }

    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('description', description);
    if (imageFile) formData.append('image', imageFile);

    try {
      await apiPostForm('/api/complaints', formData);
      showToast('Complaint submitted successfully!', 'success');
      form.reset();
      document.getElementById('filePreviewText').textContent = '';
      loadStats();
      loadRecentComplaints();
      // Switch to complaints list
      setTimeout(() => { showSection('complaints'); loadMyComplaints(1); }, 1000);
    } catch (err) {
      errEl.textContent = err.message || 'Failed to submit complaint.';
      errEl.style.display = 'block';
    } finally {
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      btn.disabled = false;
    }
  });
}

function resetSubmitForm() {
  document.getElementById('submitComplaintForm').reset();
  document.getElementById('filePreviewText').textContent = '';
  document.getElementById('submitError').style.display = 'none';
}

// ── My Complaints Table ───────────────────────────────────────
async function loadMyComplaints(page = currentPage) {
  currentPage = page;
  const tbody = document.getElementById('complaintsBody');
  const paginationEl = document.getElementById('paginationContainer');
  tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="spinner"></div></div></td></tr>`;

  const search = encodeURIComponent(document.getElementById('searchInput').value.trim());
  const status = encodeURIComponent(document.getElementById('filterStatus').value);
  const category = encodeURIComponent(document.getElementById('filterCategory').value);

  try {
    const data = await apiGet(
      `/api/complaints/my?page=${page}&search=${search}&status=${status}&category=${category}`
    );
    const list = data.complaints;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🔍</div><p>No complaints found</p></div></td></tr>`;
      paginationEl.innerHTML = '';
      return;
    }

    tbody.innerHTML = list.map((c, i) => {
      const canEdit = c.status !== 'Resolved';
      const offset = (page - 1) * 10;
      return `
        <tr>
          <td>${offset + i + 1}</td>
          <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escHtml(c.title)}">${escHtml(c.title)}</td>
          <td>${catBadge(c.category)}</td>
          <td>${statusBadge(c.status)}</td>
          <td>${priorityBadge(c.priority)}</td>
          <td>${formatDate(c.created_at)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm" onclick='viewComplaint(${JSON.stringify(c)})' title="View">👁️</button>
              ${canEdit ? `<button class="btn btn-warning btn-sm" onclick='openEditModal(${JSON.stringify(c)})' title="Edit">✏️</button>` : ''}
              ${canEdit ? `<button class="btn btn-danger btn-sm" onclick="deleteComplaint(${c.id})" title="Delete">🗑️</button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join('');

    renderPagination(paginationEl, page, data.pagination.totalPages, loadMyComplaints);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--danger);text-align:center;">${err.message}</td></tr>`;
  }
}

// ── View Complaint ────────────────────────────────────────────
function viewComplaint(c) {
  document.getElementById('viewModalBody').innerHTML = `
    <div style="display:grid;gap:1rem;">
      <div><strong>Title:</strong> ${escHtml(c.title)}</div>
      <div><strong>Category:</strong> ${catBadge(c.category)}</div>
      <div><strong>Status:</strong> ${statusBadge(c.status)}</div>
      <div><strong>Priority:</strong> ${priorityBadge(c.priority)}</div>
      <div><strong>Description:</strong><br/><p style="color:var(--text-secondary);margin-top:0.25rem;">${escHtml(c.description)}</p></div>
      ${c.admin_remark ? `<div style="background:rgba(99,102,241,0.08);border-radius:8px;padding:0.75rem;"><strong>Admin Remark:</strong><br/><p style="color:var(--text-secondary);margin-top:0.25rem;">${escHtml(c.admin_remark)}</p></div>` : ''}
      ${c.image_url ? `<div><strong>Attached Image:</strong><br/><img src="${window.API_BASE}${c.image_url}" class="complaint-image" style="margin-top:0.5rem;" alt="Complaint image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"/><div style="display:none;color:#ef4444;font-size:0.8rem;">Image not available</div></div>` : ''}
      <div style="color:var(--text-muted);font-size:0.8rem;">Submitted: ${formatDate(c.created_at)}</div>
    </div>
  `;
  openModal('viewModal');
}

// ── Edit Complaint ────────────────────────────────────────────
function openEditModal(c) {
  document.getElementById('editId').value = c.id;
  document.getElementById('editTitle').value = c.title;
  document.getElementById('editCategory').value = c.category;
  document.getElementById('editDesc').value = c.description;
  openModal('editModal');
}

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const title = document.getElementById('editTitle').value.trim();
  const category = document.getElementById('editCategory').value;
  const description = document.getElementById('editDesc').value.trim();

  if (!title || !description) {
    showToast('Title and description cannot be empty.', 'error');
    return;
  }

  try {
    await apiPut(`/api/complaints/${id}`, { title, category, description });
    showToast('Complaint updated!', 'success');
    closeModal('editModal');
    loadMyComplaints(currentPage);
    loadStats();
    loadRecentComplaints();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Delete Complaint ──────────────────────────────────────────
async function deleteComplaint(id) {
  if (!confirm('Are you sure you want to delete this complaint?')) return;
  try {
    await apiDelete(`/api/complaints/${id}`);
    showToast('Complaint deleted.', 'success');
    loadMyComplaints(currentPage);
    loadStats();
    loadRecentComplaints();
  } catch (err) {
    showToast(err.message, 'error');
  }
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
