/**
 * LokVaani AI — Officer Portal Application Engine
 * Operational Console, Work Queue State Management, SLA Clocks, and Decision Support
 */

// Application State Container
let appState = {
  profile: { ...INITIAL_OFFICER_PROFILE },
  complaints: JSON.parse(JSON.stringify(INITIAL_COMPLAINTS)),
  currentView: 'dashboard', // dashboard | complaints | priority-queue | analytics | profile
  selectedComplaintId: null,
  filters: {
    search: '',
    category: 'all',
    priority: 'all',
    status: 'all',
    slaState: 'all'
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Hydrate complaints from Supabase if connected, else use mock
  if (typeof getComplaintsFromDb === 'function') {
    try {
      const result = await getComplaintsFromDb();
      if (result.success && result.source === 'supabase' && result.data.length > 0) {
        // Merge Supabase data with mock data for comprehensive display
        const supabaseIds = new Set(result.data.map(c => c.complaintId));
        const mockOnly = INITIAL_COMPLAINTS.filter(c => !supabaseIds.has(c.complaintId));
        appState.complaints = [...result.data, ...mockOnly];
        console.log(`🟢 Officer Portal: Loaded ${result.data.length} complaints from Supabase + ${mockOnly.length} mock.`);
      } else {
        console.log('ℹ️ Officer Portal: Using mock complaint data.');
      }
    } catch (err) {
      console.warn('Officer Portal Supabase hydration failed, using mock data:', err);
    }
  }

  initNavigation();
  initSearchAndFilters();
  initSlaClockEngine();
  renderCurrentView();
  initModals();
});

/* ==========================================================================
   1. NAVIGATION & VIEW SWITCHER
   ========================================================================== */
function initNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-view]');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const sidebar = document.querySelector('.officer-sidebar');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      appState.currentView = targetView;
      renderCurrentView();

      // Mobile sidebar close on link click
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  });

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function renderCurrentView() {
  const sections = document.querySelectorAll('.officer-view-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const activeSec = document.getElementById(`view-${appState.currentView}`);
  if (activeSec) {
    activeSec.classList.add('active');
  }

  // Refresh counts
  updateKpiSummaryCards();

  // Render view specific content
  switch (appState.currentView) {
    case 'dashboard':
      renderDashboardView();
      break;
    case 'complaints':
      renderComplaintsTable();
      break;
    case 'priority-queue':
      renderPriorityQueueFullView();
      break;
    case 'analytics':
      renderAnalyticsView();
      break;
    case 'profile':
      renderProfileView();
      break;
  }
}

/* ==========================================================================
   2. KPI SUMMARY REFRESH
   ========================================================================== */
function updateKpiSummaryCards() {
  const stats = calculateOfficerStats(appState.complaints);

  // Update sidebar badge
  const sidebarBadge = document.querySelector('.sidebar-badge-count');
  if (sidebarBadge) sidebarBadge.textContent = stats.criticalCount;

  // Update Dashboard KPI elements
  const elAssigned = document.getElementById('kpi-val-assigned');
  const elCritical = document.getElementById('kpi-val-critical');
  const elPending = document.getElementById('kpi-val-pending');
  const elBreached = document.getElementById('kpi-val-breached');

  if (elAssigned) elAssigned.textContent = stats.totalAssigned;
  if (elCritical) elCritical.textContent = stats.criticalCount;
  if (elPending) elPending.textContent = stats.pendingCount;
  if (elBreached) elBreached.textContent = stats.breachedCount;
}

/* ==========================================================================
   3. SLA COUNTDOWN ENGINE
   ========================================================================== */
function initSlaClockEngine() {
  setInterval(() => {
    appState.complaints.forEach(item => {
      if (item.status !== 'Resolved' && item.slaRemainingSeconds !== undefined) {
        item.slaRemainingSeconds--;
        
        // Auto SLA status threshold logic
        if (item.slaRemainingSeconds <= 0) {
          item.slaState = 'SLA BREACHED';
          if (item.status !== 'Resolved' && item.status !== 'Escalated') {
            item.status = 'SLA Breached';
          }
        } else if (item.slaRemainingSeconds < 3600) {
          item.slaState = 'AT RISK';
        }
      }
    });

    // Update active timers on screen
    updateVisibleSlaTimers();
  }, 1000);
}

function formatSlaString(seconds) {
  if (seconds <= 0) {
    const absSec = Math.abs(seconds);
    const hrs = Math.floor(absSec / 3600);
    const mins = Math.floor((absSec % 3600) / 60);
    return `Breached (-${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m)`;
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

function updateVisibleSlaTimers() {
  const timerElements = document.querySelectorAll('[data-sla-id]');
  timerElements.forEach(el => {
    const id = el.getAttribute('data-sla-id');
    const complaint = appState.complaints.find(c => c.complaintId === id);
    if (complaint) {
      el.textContent = formatSlaString(complaint.slaRemainingSeconds);
      if (complaint.slaState === 'SLA BREACHED') {
        el.className = 'sla-time-str sla-breached';
      } else if (complaint.slaState === 'AT RISK') {
        el.className = 'sla-time-str sla-atrisk';
      } else {
        el.className = 'sla-time-str sla-ontrack';
      }
    }
  });
}

/* ==========================================================================
   4. DASHBOARD VIEW RENDERER
   ========================================================================== */
function renderDashboardView() {
  const queueContainer = document.getElementById('dashboard-priority-queue');
  if (!queueContainer) return;

  // Sort complaints by priority score descending
  const sorted = [...appState.complaints].sort((a, b) => b.priorityScore - a.priorityScore);

  queueContainer.innerHTML = sorted.map(item => createQueueCardHtml(item)).join('');
  attachQueueCardClickListeners();
}

function createQueueCardHtml(item) {
  let cardModifier = 'queue-card-low';
  let badgeClass = 'badge-low';
  if (item.priorityLevel === 'Critical') { cardModifier = 'queue-card-critical'; badgeClass = 'badge-critical'; }
  else if (item.priorityLevel === 'High') { cardModifier = 'queue-card-high'; badgeClass = 'badge-high'; }
  else if (item.priorityLevel === 'Medium') { cardModifier = 'queue-card-medium'; badgeClass = 'badge-medium'; }

  let slaClass = 'sla-ontrack';
  if (item.slaState === 'SLA BREACHED') slaClass = 'sla-breached';
  else if (item.slaState === 'AT RISK') slaClass = 'sla-atrisk';

  let statusClass = 'st-assigned';
  if (item.status === 'In Progress') statusClass = 'st-inprogress';
  else if (item.status === 'Pending') statusClass = 'st-pending';
  else if (item.status === 'Resolved') statusClass = 'st-resolved';
  else if (item.status === 'Escalated' || item.status === 'SLA Breached') statusClass = 'st-escalated';

  return `
    <div class="queue-card ${cardModifier}" data-complaint-id="${item.complaintId}">
      <div>
        <div class="queue-id">${item.complaintId}</div>
        <div class="queue-location">${item.location.split('(')[0]}</div>
      </div>
      <div>
        <div class="queue-issue-title">${item.category}</div>
        <div class="queue-location" style="font-size: 0.8125rem;">${item.aiSummary}</div>
      </div>
      <div>
        <span class="queue-category-tag">${item.department.split(' ')[0]}</span>
      </div>
      <div>
        <span class="priority-score-badge ${badgeClass}">
          <span>▲ ${item.priorityLevel}</span>
          <span>(${item.priorityScore}/100)</span>
        </span>
      </div>
      <div class="sla-display">
        <span class="sla-time-str ${slaClass}" data-sla-id="${item.complaintId}">${formatSlaString(item.slaRemainingSeconds)}</span>
        <span class="sla-label">${item.slaState}</span>
      </div>
      <div>
        <span class="status-pill ${statusClass}">${item.status}</span>
      </div>
      <div>
        <button class="btn btn-secondary open-detail-btn" style="padding: 6px 12px; font-size: 0.75rem; width: 100%;" data-complaint-id="${item.complaintId}">
          Inspect →
        </button>
      </div>
    </div>
  `;
}

function attachQueueCardClickListeners() {
  document.querySelectorAll('[data-complaint-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      // Avoid double trigger if clicking button
      const id = el.getAttribute('data-complaint-id');
      if (id) openComplaintDetailModal(id);
    });
  });
}

/* ==========================================================================
   5. COMPLAINTS VIEW & FILTERS
   ========================================================================== */
function initSearchAndFilters() {
  const searchInput = document.getElementById('complaint-search-input');
  const catFilter = document.getElementById('filter-category');
  const prioFilter = document.getElementById('filter-priority');
  const statusFilter = document.getElementById('filter-status');
  const slaFilter = document.getElementById('filter-sla');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.filters.search = e.target.value.toLowerCase().trim();
      renderComplaintsTable();
    });
  }

  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      appState.filters.category = e.target.value;
      renderComplaintsTable();
    });
  }

  if (prioFilter) {
    prioFilter.addEventListener('change', (e) => {
      appState.filters.priority = e.target.value;
      renderComplaintsTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      appState.filters.status = e.target.value;
      renderComplaintsTable();
    });
  }

  if (slaFilter) {
    slaFilter.addEventListener('change', (e) => {
      appState.filters.slaState = e.target.value;
      renderComplaintsTable();
    });
  }
}

function renderComplaintsTable() {
  const tableBody = document.getElementById('complaints-tbody');
  if (!tableBody) return;

  let filtered = appState.complaints.filter(c => {
    // Search
    if (appState.filters.search) {
      const q = appState.filters.search;
      const match = c.complaintId.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q) ||
                    c.location.toLowerCase().includes(q) ||
                    c.category.toLowerCase().includes(q) ||
                    c.citizenName.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (appState.filters.category !== 'all' && c.category !== appState.filters.category) return false;

    // Priority
    if (appState.filters.priority !== 'all' && c.priorityLevel.toLowerCase() !== appState.filters.priority.toLowerCase()) return false;

    // Status
    if (appState.filters.status !== 'all' && c.status.toLowerCase() !== appState.filters.status.toLowerCase()) return false;

    // SLA
    if (appState.filters.slaState !== 'all' && c.slaState !== appState.filters.slaState) return false;

    return true;
  });

  // Default sorting: Critical -> High -> Medium -> Low
  const priorityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  filtered.sort((a, b) => (priorityRank[b.priorityLevel] || 0) - (priorityRank[a.priorityLevel] || 0) || b.priorityScore - a.priorityScore);

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No complaints match the specified filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(c => {
    let badgeClass = 'badge-low';
    if (c.priorityLevel === 'Critical') badgeClass = 'badge-critical';
    else if (c.priorityLevel === 'High') badgeClass = 'badge-high';
    else if (c.priorityLevel === 'Medium') badgeClass = 'badge-medium';

    let statusClass = 'st-assigned';
    if (c.status === 'In Progress') statusClass = 'st-inprogress';
    else if (c.status === 'Pending') statusClass = 'st-pending';
    else if (c.status === 'Resolved') statusClass = 'st-resolved';
    else if (c.status === 'Escalated' || c.status === 'SLA Breached') statusClass = 'st-escalated';

    return `
      <tr data-complaint-id="${c.complaintId}">
        <td style="font-family: monospace; font-weight: 700; color: var(--royal-blue);">${c.complaintId}</td>
        <td>
          <div class="table-issue-title">${c.category}</div>
          <div class="table-issue-sub">${c.description.substring(0, 55)}...</div>
        </td>
        <td><span class="queue-category-tag">${c.category.split(' ')[0]}</span></td>
        <td>${c.location.split('(')[0]}</td>
        <td>
          <span class="priority-score-badge ${badgeClass}">
            ${c.priorityLevel} (${c.priorityScore})
          </span>
        </td>
        <td>
          <span class="sla-time-str" data-sla-id="${c.complaintId}">${formatSlaString(c.slaRemainingSeconds)}</span>
        </td>
        <td><span class="status-pill ${statusClass}">${c.status}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openComplaintDetailModal('${c.complaintId}')">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');

  attachQueueCardClickListeners();
}

/* ==========================================================================
   6. PRIORITY QUEUE FULL VIEW
   ========================================================================== */
function renderPriorityQueueFullView() {
  const criticalCol = document.getElementById('prio-col-critical');
  const highCol = document.getElementById('prio-col-high');
  const mediumCol = document.getElementById('prio-col-medium');
  const lowCol = document.getElementById('prio-col-low');

  if (!criticalCol) return;

  const criticals = appState.complaints.filter(c => c.priorityLevel === 'Critical');
  const highs = appState.complaints.filter(c => c.priorityLevel === 'High');
  const mediums = appState.complaints.filter(c => c.priorityLevel === 'Medium');
  const lows = appState.complaints.filter(c => c.priorityLevel === 'Low');

  criticalCol.innerHTML = criticals.map(c => createQueueCardHtml(c)).join('');
  highCol.innerHTML = highs.map(c => createQueueCardHtml(c)).join('');
  mediumCol.innerHTML = mediums.map(c => createQueueCardHtml(c)).join('');
  lowCol.innerHTML = lows.map(c => createQueueCardHtml(c)).join('');

  attachQueueCardClickListeners();
}

/* ==========================================================================
   7. COMPLAINT DETAILS MODAL CONSOLE
   ========================================================================== */
function openComplaintDetailModal(complaintId) {
  const complaint = appState.complaints.find(c => c.complaintId === complaintId);
  if (!complaint) return;

  appState.selectedComplaintId = complaintId;

  const modal = document.getElementById('complaint-detail-modal');
  if (!modal) return;

  // Header Title
  document.getElementById('modal-id-text').textContent = complaint.complaintId;
  document.getElementById('modal-status-pill').textContent = complaint.status;
  document.getElementById('modal-prio-badge').textContent = `▲ ${complaint.priorityLevel} (${complaint.priorityScore}/100)`;

  // Citizen Report Card
  document.getElementById('modal-citizen-name').textContent = complaint.citizenName;
  document.getElementById('modal-citizen-contact').textContent = complaint.citizenContact;
  document.getElementById('modal-report-text').textContent = `"${complaint.description}"`;
  document.getElementById('modal-location-text').textContent = `${complaint.location} • GPS (${complaint.gisCoordinates})`;
  document.getElementById('modal-submitted-time').textContent = complaint.createdAt;

  // AI Analysis Card
  document.getElementById('modal-ai-cat').textContent = complaint.category;
  document.getElementById('modal-ai-dept').textContent = complaint.department;
  document.getElementById('modal-ai-sev').textContent = complaint.severity;
  document.getElementById('modal-ai-sent').textContent = complaint.sentiment;
  document.getElementById('modal-ai-summary').textContent = `"${complaint.aiSummary}"`;

  // AI Priority Explainability List
  const reasonsList = document.getElementById('modal-ai-reasons-list');
  if (reasonsList && complaint.priorityReasons) {
    reasonsList.innerHTML = complaint.priorityReasons.map(r => `
      <li class="reasoning-item">
        <span>${r.label}</span>
        <span class="reasoning-points">+${r.points}</span>
      </li>
    `).join('');
    document.getElementById('modal-ai-total-score').textContent = `${complaint.priorityScore} / 100`;
  }

  // Duplicate Cluster Card
  const clusterBox = document.getElementById('modal-duplicate-cluster');
  if (clusterBox) {
    const count = complaint.relatedComplaints ? complaint.relatedComplaints.length : 0;
    if (count > 0) {
      clusterBox.style.display = 'block';
      document.getElementById('cluster-count-text').textContent = `${count + 1} Similar Reports Detected within 500m`;
      const clusterList = document.getElementById('cluster-list-preview');
      if (clusterList) {
        clusterList.innerHTML = complaint.relatedComplaints.map(r => `
          <div style="font-size: 0.78125rem; background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <strong style="color: var(--royal-blue);">${r.id}</strong>
            <span>${r.user}</span>
            <span style="color: var(--text-muted);">${r.snippet}</span>
          </div>
        `).join('');
      }
    } else {
      clusterBox.style.display = 'none';
    }
  }

  // SLA Card
  const slaTimerEl = document.getElementById('modal-sla-countdown');
  if (slaTimerEl) {
    slaTimerEl.setAttribute('data-sla-id', complaint.complaintId);
    slaTimerEl.textContent = formatSlaString(complaint.slaRemainingSeconds);
  }
  document.getElementById('modal-sla-target').textContent = `${complaint.slaHours} Hours Standard`;
  document.getElementById('modal-sla-state-badge').textContent = complaint.slaState;

  // Activity Timeline
  const timelineContainer = document.getElementById('modal-activity-timeline');
  if (timelineContainer && complaint.activityTimeline) {
    timelineContainer.innerHTML = complaint.activityTimeline.map(item => `
      <li class="timeline-item">
        <div class="timeline-dot">${item.icon || '●'}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-meta">${item.timestamp} • by ${item.author}</div>
      </li>
    `).join('');
  }

  // Action Buttons Bar
  renderModalActionBar(complaint);

  modal.classList.add('active');
}

function renderModalActionBar(complaint) {
  const actionsBar = document.getElementById('modal-action-buttons');
  if (!actionsBar) return;

  if (complaint.status === 'Resolved') {
    actionsBar.innerHTML = `
      <div style="color: var(--civic-green-dark); font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>✅ Complaint Successfully Resolved</span>
      </div>
      <button class="btn btn-secondary modal-close-trigger">Close</button>
    `;
  } else if (complaint.status === 'Escalated') {
    actionsBar.innerHTML = `
      <div style="color: #DC2626; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <span>🚨 Escalated to Senior Executive Officer</span>
      </div>
      <button class="btn btn-secondary modal-close-trigger">Close</button>
    `;
  } else {
    actionsBar.innerHTML = `
      <div style="display: flex; gap: 10px;">
        ${complaint.status === 'Assigned' || complaint.status === 'Pending' ? `
          <button class="btn btn-primary" id="btn-action-inprogress">
            ⚡ Mark In Progress
          </button>
        ` : ''}
        ${complaint.status === 'In Progress' || complaint.status === 'Assigned' ? `
          <button class="btn" style="background: var(--civic-green); color: white;" id="btn-action-resolve">
            ✓ Resolve Complaint
          </button>
        ` : ''}
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-dark-outline" style="border-color: #DC2626; color: #DC2626;" id="btn-action-escalate">
          Escalate Ticket
        </button>
        <button class="btn btn-secondary modal-close-trigger">Close</button>
      </div>
    `;

    // Attach event listeners to dynamic actions
    const btnInProg = document.getElementById('btn-action-inprogress');
    const btnResolve = document.getElementById('btn-action-resolve');
    const btnEscalate = document.getElementById('btn-action-escalate');

    if (btnInProg) {
      btnInProg.addEventListener('click', () => {
        updateComplaintStatus(complaint.complaintId, 'In Progress', 'Field crew deployed on-site for repair operations');
      });
    }

    if (btnResolve) {
      btnResolve.addEventListener('click', () => {
        openResolutionModal(complaint.complaintId);
      });
    }

    if (btnEscalate) {
      btnEscalate.addEventListener('click', () => {
        openEscalationModal(complaint.complaintId);
      });
    }
  }

  // Attach close handlers
  document.querySelectorAll('.modal-close-trigger').forEach(b => {
    b.addEventListener('click', () => {
      document.getElementById('complaint-detail-modal').classList.remove('active');
    });
  });
}

function updateComplaintStatus(complaintId, newStatus, logText) {
  const complaint = appState.complaints.find(c => c.complaintId === complaintId);
  if (!complaint) return;

  complaint.status = newStatus;
  complaint.updatedAt = "Just Now";

  // Add timeline entry
  const nowStr = "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  complaint.activityTimeline.push({
    title: `Status Changed to ${newStatus}`,
    timestamp: nowStr,
    author: `Er. Rajesh Kumar (${logText})`,
    icon: newStatus === 'In Progress' ? '🔧' : newStatus === 'Resolved' ? '✅' : '🚨'
  });

  renderCurrentView();
  openComplaintDetailModal(complaintId);
}

/* ==========================================================================
   8. RESOLUTION WORKFLOW MODAL
   ========================================================================== */
function openResolutionModal(complaintId) {
  const resModal = document.getElementById('resolution-modal');
  if (!resModal) return;

  document.getElementById('res-complaint-id-text').textContent = complaintId;
  resModal.classList.add('active');
}

function openEscalationModal(complaintId) {
  const escModal = document.getElementById('escalation-modal');
  if (!escModal) return;

  document.getElementById('esc-complaint-id-text').textContent = complaintId;
  escModal.classList.add('active');
}

function initModals() {
  // Resolution form submit
  const resForm = document.getElementById('resolution-form');
  if (resForm) {
    resForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const actionTaken = document.getElementById('res-action-taken').value;
      const note = document.getElementById('res-note-input').value;

      if (!note) {
        alert('Please provide a brief resolution description.');
        return;
      }

      const complaintId = appState.selectedComplaintId;
      const complaint = appState.complaints.find(c => c.complaintId === complaintId);

      if (complaint) {
        complaint.status = 'Resolved';
        complaint.resolutionNote = `${actionTaken}: ${note}`;
        complaint.resolutionProof = 'Geotagged_Field_Photo_Verified.jpg';
        complaint.updatedAt = 'Just Now';

        const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        complaint.activityTimeline.push({
          title: 'Complaint Resolved & Work Verified',
          timestamp: nowStr,
          author: `Er. Rajesh Kumar (${actionTaken})`,
          icon: '✅'
        });

        document.getElementById('resolution-modal').classList.remove('active');
        renderCurrentView();
        openComplaintDetailModal(complaintId);
        showToastNotification(`Ticket #${complaintId} successfully resolved and archived!`);
      }
    });
  }

  // Escalation form submit
  const escForm = document.getElementById('escalation-form');
  if (escForm) {
    escForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const targetOfficer = document.getElementById('esc-target-officer').value;
      const reason = document.getElementById('esc-reason-input').value;

      const complaintId = appState.selectedComplaintId;
      const complaint = appState.complaints.find(c => c.complaintId === complaintId);

      if (complaint) {
        complaint.status = 'Escalated';
        complaint.slaState = 'SLA BREACHED';
        complaint.updatedAt = 'Just Now';

        const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        complaint.activityTimeline.push({
          title: `Escalated to ${targetOfficer}`,
          timestamp: nowStr,
          author: `Er. Rajesh Kumar (Reason: ${reason})`,
          icon: '🚀'
        });

        document.getElementById('escalation-modal').classList.remove('active');
        renderCurrentView();
        openComplaintDetailModal(complaintId);
        showToastNotification(`Ticket #${complaintId} escalated to ${targetOfficer}.`);
      }
    });
  }

  // Modal backdrop close handlers
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) modal.classList.remove('active');
    });
  });
}

function showToastNotification(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = 'var(--navy-900)';
  toast.style.color = '#FFFFFF';
  toast.style.padding = '14px 20px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = 'var(--shadow-xl)';
  toast.style.zIndex = '9999';
  toast.style.fontWeight = '700';
  toast.style.fontSize = '0.875rem';
  toast.style.borderLeft = '4px solid var(--ai-cyan)';
  toast.textContent = msg;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

/* ==========================================================================
   9. ANALYTICS VIEW RENDERER
   ========================================================================== */
function renderAnalyticsView() {
  // Category progress bars
  const bars = [
    { label: 'Water Supply Outage', pct: 42, color: 'fill-blue' },
    { label: 'Pipeline Leakage', pct: 27, color: 'fill-cyan' },
    { label: 'Low Water Pressure', pct: 16, color: 'fill-amber' },
    { label: 'Contamination & Other', pct: 15, color: 'fill-green' }
  ];

  const catContainer = document.getElementById('analytics-category-bars');
  if (catContainer) {
    catContainer.innerHTML = bars.map(b => `
      <div class="progress-bar-item">
        <div class="bar-label-wrap">
          <span>${b.label}</span>
          <span>${b.pct}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${b.color}" style="width: ${b.pct}%;"></div>
        </div>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   10. PROFILE VIEW RENDERER
   ========================================================================== */
function renderProfileView() {
  const p = appState.profile;
  const nameEl = document.getElementById('prof-name');
  const roleEl = document.getElementById('prof-role');
  const deptEl = document.getElementById('prof-dept');
  const idEl = document.getElementById('prof-id');
  const emailEl = document.getElementById('prof-email');
  const zoneEl = document.getElementById('prof-zone');

  if (nameEl) nameEl.textContent = p.name;
  if (roleEl) roleEl.textContent = p.role;
  if (deptEl) deptEl.textContent = p.department;
  if (idEl) idEl.textContent = p.id;
  if (emailEl) emailEl.textContent = p.email;
  if (zoneEl) zoneEl.textContent = p.zone;
}

/* ==========================================================================
   DEMO SIMULATOR HELPER (FOR HACKATHON DEMO FLOW)
   ========================================================================== */
function triggerDemoComplaintIntake(textInput) {
  const newId = `LV-${Math.floor(10520 + Math.random() * 100)}`;
  const newComplaint = {
    complaintId: newId,
    citizenName: "New Citizen Demo (Sector 12)",
    citizenContact: "+91 98765 00000",
    description: textInput || "2 din se Sector 12 mein paani nahi aa raha.",
    category: "Water Supply Outage",
    department: "Water Supply Department",
    location: "Sector 12, Main Line Junction",
    gisCoordinates: "18.5204° N, 73.8567° E",
    priorityScore: 91,
    priorityLevel: "High",
    severity: "High",
    sentiment: "Frustrated",
    aiSummary: "Citizen reporting 2-day drinking water outage in Sector 12.",
    priorityReasons: [
      { label: "Essential service disruption", points: 30 },
      { label: "Outage duration > 48 hrs mentioned", points: 25 },
      { label: "Residential sector impact", points: 20 },
      { label: "High frustration detected", points: 16 }
    ],
    slaHours: 24,
    slaRemainingSeconds: 23 * 3600 + 59 * 60,
    slaState: "ON TRACK",
    status: "Assigned",
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "Just Now",
    updatedAt: "Just Now",
    relatedComplaints: [],
    resolutionNote: "",
    resolutionProof: "",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "Just Now", author: "Citizen (Voice Transcript)", icon: "📥" },
      { title: "AI Analysis & Categorization Complete", timestamp: "Just Now", author: "LokVaani AI Engine", icon: "⚡" },
      { title: "Department & Officer Auto-Assigned", timestamp: "Just Now", author: "Routing Desk", icon: "👤" }
    ]
  };

  appState.complaints.unshift(newComplaint);
  renderCurrentView();
  openComplaintDetailModal(newId);
  showToastNotification(`Demo Complaint #${newId} ingested into Officer Queue!`);
}
