/**
 * LokVaani AI — Administrator Portal Application Engine
 * AI Municipal Command Center & Governance Intelligence
 */

let adminState = {
  profile: typeof INITIAL_ADMIN_PROFILE !== 'undefined' ? { ...INITIAL_ADMIN_PROFILE } : {},
  departments: typeof INITIAL_DEPARTMENTS !== 'undefined' ? JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS)) : [],
  officers: typeof INITIAL_OFFICERS !== 'undefined' ? JSON.parse(JSON.stringify(INITIAL_OFFICERS)) : [],
  escalations: typeof INITIAL_ESCALATIONS !== 'undefined' ? JSON.parse(JSON.stringify(INITIAL_ESCALATIONS)) : [],
  insights: typeof INITIAL_CITY_INSIGHTS !== 'undefined' ? JSON.parse(JSON.stringify(INITIAL_CITY_INSIGHTS)) : [],
  zones: typeof MUNICIPAL_ZONES !== 'undefined' ? JSON.parse(JSON.stringify(MUNICIPAL_ZONES)) : [],
  auditLogs: typeof INITIAL_AUDIT_LOGS !== 'undefined' ? JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)) : [],
  notifications: typeof INITIAL_ADMIN_NOTIFICATIONS !== 'undefined' ? JSON.parse(JSON.stringify(INITIAL_ADMIN_NOTIFICATIONS)) : [],
  slaPolicies: typeof SLA_POLICIES !== 'undefined' ? JSON.parse(JSON.stringify(SLA_POLICIES)) : [],
  currentView: 'overview',
  selectedEscalationId: null,
  selectedZoneId: null,
  searchQuery: ''
};

document.addEventListener('DOMContentLoaded', () => {
  initAdminNavigation();
  initNotificationDrawer();
  initProfileDropdown();
  initAdminSearch();
  renderAdminCurrentView();
  initAdminModals();
  initControlCardGrid();
});

/* ==========================================================================
   1. NAVIGATION & VIEW SWITCHER
   ========================================================================== */
function initAdminNavigation() {
  const sidebarLinks = document.querySelectorAll('.admin-sidebar-link[data-view]');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const sidebar = document.querySelector('.admin-sidebar');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      adminState.currentView = targetView;
      renderAdminCurrentView();

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

function renderAdminCurrentView() {
  const sections = document.querySelectorAll('.admin-view-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const activeSec = document.getElementById(`admin-view-${adminState.currentView}`);
  if (activeSec) {
    activeSec.classList.add('active');
  }

  // Update Dynamic Topbar Titles & Breadcrumbs
  const breadcrumbEl = document.getElementById('topbar-breadcrumb-text');
  const titleEl = document.getElementById('topbar-view-title');
  const viewTitles = {
    overview: { breadcrumb: "Administration / Overview", title: "City Command Center" },
    escalations: { breadcrumb: "Administration / Escalations", title: "Escalation Decision Management" },
    departments: { breadcrumb: "Administration / Departments", title: "Municipal Departments Performance" },
    officers: { breadcrumb: "Administration / Officers", title: "Department Officers Directory" },
    complaints: { breadcrumb: "City Monitoring / Complaints", title: "City-Wide Complaints Register" },
    intelligence: { breadcrumb: "City Monitoring / Intelligence", title: "AI City Intelligence & Insights" },
    analytics: { breadcrumb: "City Monitoring / Analytics", title: "City-Wide Analytics Dashboard" },
    'audit-log': { breadcrumb: "City Monitoring / Audit Log", title: "Governance Audit Log & Security" },
    profile: { breadcrumb: "Administration / Profile", title: "Administrator Credentials & Authority" }
  };

  if (viewTitles[adminState.currentView]) {
    if (breadcrumbEl) breadcrumbEl.textContent = viewTitles[adminState.currentView].breadcrumb;
    if (titleEl) titleEl.textContent = viewTitles[adminState.currentView].title;
  }

  // Update Notification Badge Count
  const unreadCount = adminState.notifications.filter(n => !n.read).length;
  const notifBadge = document.getElementById('notif-badge-count');
  if (notifBadge) {
    notifBadge.textContent = unreadCount;
    notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }

  const escBadge = document.getElementById('sidebar-esc-count');
  const activeEscCount = adminState.escalations.filter(e => e.status === 'Pending Action').length;
  if (escBadge) {
    escBadge.textContent = activeEscCount;
    escBadge.style.display = activeEscCount > 0 ? 'inline-block' : 'none';
  }

  switch (adminState.currentView) {
    case 'overview':
      renderOverviewCommandCenter();
      break;
    case 'escalations':
      renderEscalationsView();
      break;
    case 'departments':
      renderDepartmentsView();
      break;
    case 'officers':
      renderOfficersView();
      break;
    case 'complaints':
      renderCityComplaintsView();
      break;
    case 'intelligence':
      renderCityIntelligenceView();
      break;
    case 'analytics':
      renderAnalyticsView();
      break;
    case 'audit-log':
      renderAuditLogView();
      break;
    case 'profile':
      renderProfileView();
      break;
  }
}

/* ==========================================================================
   2. LIVE SEARCH ENGINE
   ========================================================================== */
function initAdminSearch() {
  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      adminState.searchQuery = e.target.value.trim().toLowerCase();
      renderAdminCurrentView();
    });
  }
}

/* ==========================================================================
   3. NOTIFICATION DRAWER & PROFILE DROPDOWN
   ========================================================================== */
function initNotificationDrawer() {
  const notifBtn = document.getElementById('admin-notif-btn');
  const dropdown = document.getElementById('admin-notif-dropdown');

  if (notifBtn && dropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const profileDropdown = document.getElementById('profile-dropdown-panel');
      if (profileDropdown) profileDropdown.classList.remove('active');

      dropdown.classList.toggle('active');
      renderNotificationList();
    });
  }

  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      adminState.notifications.forEach(n => n.read = true);
      renderAdminCurrentView();
      renderNotificationList();
    });
  }

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target) && !notifBtn.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

function renderNotificationList() {
  const listContainer = document.getElementById('notif-list-container');
  if (!listContainer) return;

  listContainer.innerHTML = adminState.notifications.map(n => `
    <li class="notif-item ${!n.read ? 'unread' : ''}" onclick="handleNotifClick('${n.id}')">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <strong style="color: var(--navy-900); font-size: 0.8125rem;">${n.title}</strong>
        <span style="font-size: 0.6875rem; color: var(--text-muted);">${n.time}</span>
      </div>
      <div style="color: var(--text-secondary); font-size: 0.75rem;">${n.desc}</div>
    </li>
  `).join('');
}

function handleNotifClick(notifId) {
  const notif = adminState.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    if (notif.link) {
      adminState.currentView = notif.link;
    }
    renderAdminCurrentView();
  }
}

function initProfileDropdown() {
  const chipBtn = document.getElementById('admin-profile-chip');
  const panel = document.getElementById('profile-dropdown-panel');

  if (chipBtn && panel) {
    chipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const notifDropdown = document.getElementById('admin-notif-dropdown');
      if (notifDropdown) notifDropdown.classList.remove('active');

      panel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !chipBtn.contains(e.target)) {
        panel.classList.remove('active');
      }
    });
  }
}

/* ==========================================================================
   4. OVERVIEW COMMAND CENTER RENDERER
   ========================================================================== */
function renderOverviewCommandCenter() {
  const p = adminState.profile;
  const stats = p.stats;

  const totalEl = document.getElementById('cmd-total-num');
  const resEl = document.getElementById('cmd-resolved-num');
  const pendEl = document.getElementById('cmd-pending-num');
  const breachEl = document.getElementById('cmd-breached-num');
  const critEl = document.getElementById('cmd-critical-num');
  const offEl = document.getElementById('cmd-officers-num');

  if (totalEl) totalEl.textContent = stats.totalComplaints.toLocaleString();
  if (resEl) resEl.textContent = stats.resolvedCount.toLocaleString();
  if (pendEl) pendEl.textContent = stats.pendingCount.toLocaleString();
  if (breachEl) breachEl.textContent = stats.breachedCount.toLocaleString();
  if (critEl) critEl.textContent = stats.criticalCount.toLocaleString();
  if (offEl) offEl.textContent = stats.activeOfficers.toLocaleString();

  renderAttentionRequiredFeed();
  renderDepartmentHealthSection();
  renderAiIntelligenceSection();
  renderMunicipalZoneMap();
  renderOfficerWatchlistAndTimeline();
}

function renderAttentionRequiredFeed() {
  const feed = document.getElementById('attention-required-feed');
  if (!feed) return;

  const activeEsc = adminState.escalations.filter(e => e.status === 'Pending Action');

  if (activeEsc.length === 0) {
    feed.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--civic-green-dark); font-weight: 700;">
        ✓ All critical escalations handled cleanly!
      </div>
    `;
    return;
  }

  feed.innerHTML = activeEsc.map(e => `
    <div class="escalation-rich-card">
      <div class="esc-card-top">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-family: monospace; font-size: 0.9375rem; font-weight: 800; color: #DC2626;">${e.escalationId}</span>
          <span style="font-family: monospace; font-size: 0.84375rem; font-weight: 700; color: var(--royal-blue);">${e.complaintId}</span>
        </div>
        <span class="esc-overdue-tag">⚠️ ${e.breachDuration}</span>
      </div>

      <div class="esc-issue-desc">${e.description}</div>

      <div class="esc-meta-row">
        <div>Category: <strong style="color: var(--navy-900);">${e.category}</strong></div>
        <div>Location: <strong>${e.location}</strong></div>
        <div>Officer: <strong style="color: var(--navy-900);">${e.officer}</strong></div>
      </div>

      <!-- Segmented AI Priority Progress Bar -->
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 800;">
          <span style="color: var(--text-muted);">EXPLAINABLE AI PRIORITY</span>
          <span style="color: #DC2626;">▲ CRITICAL ${e.priorityScore} / 100</span>
        </div>
        <div class="ai-segmented-bar">
          <div class="seg-item seg-service" style="width: 30%;"></div>
          <div class="seg-item seg-delay" style="width: 25%;"></div>
          <div class="seg-item seg-citizens" style="width: 20%;"></div>
          <div class="seg-item seg-vulnerable" style="width: 10%;"></div>
          <div class="seg-item seg-sentiment" style="width: 9%;"></div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
        <span style="font-size: 0.78125rem; color: var(--royal-blue); font-weight: 700;">
          🔗 ${e.relatedComplaintsCount} Related Reports Cluster
        </span>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="openEscalationDetailModal('${e.escalationId}')">
            Review Case
          </button>
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="openReassignOfficerForId('${e.escalationId}')">
            Reassign →
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderDepartmentHealthSection() {
  const barsContainer = document.getElementById('dept-health-bars-container');
  if (barsContainer) {
    barsContainer.innerHTML = adminState.departments.slice(0, 5).map(d => `
      <div class="dept-bar-row">
        <div class="dept-bar-name">${d.name.split(' ')[0]}</div>
        <div class="dept-bar-track">
          <div class="dept-bar-fill" style="width: ${d.slaCompliance}%; background: ${d.slaCompliance < 80 ? '#DC2626' : 'var(--royal-blue)'};"></div>
        </div>
        <div style="width: 45px; text-align: right; font-weight: 800; font-size: 0.8125rem;">${d.slaCompliance}%</div>
      </div>
    `).join('');
  }

  const cardsContainer = document.getElementById('dept-health-cards-container');
  if (cardsContainer) {
    cardsContainer.innerHTML = adminState.departments.slice(0, 4).map(d => {
      let stClass = 'st-green';
      if (d.statusColor === 'amber') stClass = 'st-amber';
      else if (d.statusColor === 'red') stClass = 'st-red';

      return `
        <div class="dept-mini-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 0.875rem; color: var(--navy-900);">${d.name}</strong>
            <span class="status-dot-pill ${stClass}" style="font-size: 0.6875rem; padding: 2px 6px;">● ${d.status}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.78125rem; color: var(--text-secondary);">
            <span>${d.complaints} Complaints</span>
            <span style="color: var(--civic-green-dark); font-weight: 700;">${d.slaCompliance}% SLA</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function renderAiIntelligenceSection() {
  const container = document.getElementById('ai-intelligence-feed');
  if (!container) return;

  container.innerHTML = adminState.insights.map(i => `
    <div class="ai-insight-box-clean">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 0.6875rem; font-weight: 800; color: var(--ai-cyan);">${i.tag}</span>
        <span class="ai-conf-tag">${i.confidence} Confidence</span>
      </div>
      <strong style="font-size: 0.875rem; color: #FFFFFF; font-family: var(--font-heading);">${i.title}</strong>
      <p style="color: #CBD5E1; font-size: 0.8125rem; margin: 4px 0 8px;">"${i.insight}"</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; color: #94A3B8;">${i.zone}</span>
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.71875rem; background: rgba(0, 210, 238, 0.15); color: var(--ai-cyan); border-color: rgba(0, 210, 238, 0.3);" onclick="executeAIRecommendation('${i.id}')">
          ${i.actionBtnText} →
        </button>
      </div>
    </div>
  `).join('');
}

function renderMunicipalZoneMap() {
  const container = document.getElementById('municipal-map-tiles-container');
  if (!container) return;

  container.innerHTML = adminState.zones.map(z => {
    let tileClass = '';
    let badgeClass = 'int-low';
    if (z.intensity === 'Critical') { tileClass = 'tile-crit'; badgeClass = 'int-critical'; }
    else if (z.intensity === 'High') { tileClass = 'tile-high'; badgeClass = 'int-high'; }
    else if (z.intensity === 'Medium') { badgeClass = 'int-medium'; }

    return `
      <div class="zone-map-tile ${tileClass}" onclick="openZoneDetailModal('${z.zone}')">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="font-size: 0.8125rem; color: var(--navy-900);">${z.zone}</strong>
          <span class="zone-intensity-badge ${badgeClass}" style="font-size: 0.625rem;">${z.intensity}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); text-align: left;">${z.name}</div>
        <div style="font-size: 0.8125rem; font-weight: 800; color: var(--navy-900); margin-top: 6px; text-align: left;">${z.complaints} Reports</div>
      </div>
    `;
  }).join('');
}

function renderOfficerWatchlistAndTimeline() {
  const watchlist = document.getElementById('officer-watchlist-tbody');
  if (watchlist) {
    watchlist.innerHTML = adminState.officers.slice(0, 4).map(o => `
      <tr>
        <td><strong style="color: var(--navy-900);">${o.name}</strong></td>
        <td>${o.department.split(' ')[0]}</td>
        <td>${o.activeCases}</td>
        <td><strong style="color: ${o.slaCompliance < 75 ? '#DC2626' : 'var(--royal-blue)'};">${o.slaCompliance}%</strong></td>
        <td><span class="status-dot-pill ${o.statusBadge === 'green' ? 'st-green' : 'st-amber'}" style="font-size: 0.6875rem;">● ${o.status}</span></td>
      </tr>
    `).join('');
  }

  const timeline = document.getElementById('recent-admin-activity-timeline');
  if (timeline) {
    timeline.innerHTML = adminState.auditLogs.slice(0, 4).map(l => `
      <li class="act-item">
        <div class="act-dot"></div>
        <div style="font-weight: 700; color: var(--navy-900);">${l.action}</div>
        <div style="color: var(--text-muted); font-size: 0.75rem;">${l.timestamp} • by ${l.actor} (${l.role})</div>
      </li>
    `).join('');
  }
}

/* ==========================================================================
   5. INTERACTIVE CUSTOM MODALS
   ========================================================================== */
function openZoneDetailModal(zoneId) {
  const zone = adminState.zones.find(z => z.zone === zoneId);
  if (!zone) return;

  const modal = document.getElementById('zone-detail-modal');
  if (!modal) return;

  document.getElementById('zone-modal-title').textContent = `🗺️ Municipal ${zone.zone}`;
  document.getElementById('zone-modal-sub').textContent = `${zone.name} Operations Overview`;
  document.getElementById('zone-modal-complaints').textContent = zone.complaints;
  document.getElementById('zone-modal-critical').textContent = zone.critical;
  document.getElementById('zone-modal-sla').textContent = `${zone.slaCompliance}%`;
  document.getElementById('zone-modal-issue').textContent = zone.topIssue;
  document.getElementById('zone-modal-signal').textContent = zone.aiSignal;

  modal.classList.add('active');
}

function openSlaPolicyModal() {
  const modal = document.getElementById('sla-policy-modal');
  if (modal) modal.classList.add('active');
}

function openEscalationDetailModal(escalationId) {
  const esc = adminState.escalations.find(e => e.escalationId === escalationId);
  if (!esc) return;

  adminState.selectedEscalationId = escalationId;

  const modal = document.getElementById('admin-escalation-modal');
  if (!modal) return;

  document.getElementById('modal-esc-id-text').textContent = esc.escalationId;
  document.getElementById('modal-comp-id-text').textContent = esc.complaintId;
  document.getElementById('modal-esc-category').textContent = esc.category;
  document.getElementById('modal-esc-citizen').textContent = esc.citizenName;
  document.getElementById('modal-esc-desc').textContent = `"${esc.description}"`;
  document.getElementById('modal-esc-location').textContent = esc.location;
  document.getElementById('modal-esc-officer').textContent = `${esc.officer} (${esc.officerId})`;
  document.getElementById('modal-esc-dept').textContent = esc.department;
  document.getElementById('modal-esc-breach').textContent = esc.breachDuration;
  document.getElementById('modal-esc-recommendation').textContent = `"${esc.aiRecommendation}"`;
  document.getElementById('modal-esc-impact').textContent = esc.citizenImpact;

  const reasonsContainer = document.getElementById('modal-ai-priority-breakdown');
  if (reasonsContainer && esc.priorityBreakdown) {
    reasonsContainer.innerHTML = esc.priorityBreakdown.map(r => `
      <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 4px;">
        <span>${r.label}</span>
        <strong style="color: var(--royal-blue);">+${r.points}</strong>
      </div>
    `).join('');
    document.getElementById('modal-ai-total-score-val').textContent = `${esc.priorityScore} / 100`;
  }

  modal.classList.add('active');
}

function openReassignOfficerForId(escalationId) {
  adminState.selectedEscalationId = escalationId;
  openReassignOfficerModal();
}

function openReassignOfficerModal() {
  const modal = document.getElementById('reassign-modal');
  if (!modal) return;

  const esc = adminState.escalations.find(e => e.escalationId === adminState.selectedEscalationId);
  if (esc) {
    document.getElementById('reassign-current-officer').textContent = esc.officer;
    const select = document.getElementById('select-new-officer');
    if (select) {
      select.innerHTML = adminState.officers.filter(o => o.status === 'Active' && o.id !== esc.officerId).map(o => `
        <option value="${o.id}">${o.name} (${o.title} • SLA ${o.slaCompliance}%)</option>
      `).join('');
    }
  }

  modal.classList.add('active');
}

function initAdminModals() {
  const btnReassign = document.getElementById('btn-admin-reassign');
  const btnDeptHead = document.getElementById('btn-admin-depthead');
  const btnEmergency = document.getElementById('btn-admin-emergency');
  const btnResolve = document.getElementById('btn-admin-resolve');

  if (btnReassign) {
    btnReassign.addEventListener('click', () => {
      openReassignOfficerModal();
    });
  }

  if (btnDeptHead) {
    btnDeptHead.addEventListener('click', () => {
      executeAdminAction('Escalated to Department Head', 'Case escalated to Chief Engineer / Municipal Department Head for high-level intervention.');
    });
  }

  if (btnEmergency) {
    btnEmergency.addEventListener('click', () => {
      executeAdminAction('Emergency Authorized', 'Authorized Emergency Response & Mobile Disaster Maintenance Unit Allocation.');
    });
  }

  if (btnResolve) {
    btnResolve.addEventListener('click', () => {
      executeAdminAction('Resolved by Administrator', 'Direct Administrative intervention & verification completed.');
    });
  }

  const reassignForm = document.getElementById('reassign-form');
  if (reassignForm) {
    reassignForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newOfficerId = document.getElementById('select-new-officer').value;
      const newOfficer = adminState.officers.find(o => o.id === newOfficerId);
      const reason = document.getElementById('reassign-reason-input').value;

      if (!newOfficer) return;

      const esc = adminState.escalations.find(e => e.escalationId === adminState.selectedEscalationId);
      if (esc) {
        const oldOfficer = esc.officer;
        esc.officer = newOfficer.name;
        esc.officerId = newOfficer.id;
        esc.status = 'Reassigned';

        const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        adminState.auditLogs.unshift({
          timestamp: nowStr,
          actor: "Ananya Sharma",
          role: "Administrator",
          action: `Reassigned Complaint ${esc.complaintId}`,
          complaintId: esc.complaintId,
          department: esc.department,
          result: `Reassigned from ${oldOfficer} to ${newOfficer.name}. Reason: ${reason}`
        });

        document.getElementById('reassign-modal').classList.remove('active');
        document.getElementById('admin-escalation-modal').classList.remove('active');
        renderAdminCurrentView();
        showAdminToast(`✓ Complaint ${esc.complaintId} reassigned successfully to ${newOfficer.name}`);
      }
    });
  }

  document.querySelectorAll('.modal-close-trigger').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    });
  });
}

function executeAdminAction(actionTitle, resultDetails) {
  const esc = adminState.escalations.find(e => e.escalationId === adminState.selectedEscalationId);
  if (esc) {
    esc.status = actionTitle;

    const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    adminState.auditLogs.unshift({
      timestamp: nowStr,
      actor: "Ananya Sharma",
      role: "Administrator",
      action: `${actionTitle} for ${esc.escalationId}`,
      complaintId: esc.complaintId,
      department: esc.department,
      result: resultDetails
    });

    document.getElementById('admin-escalation-modal').classList.remove('active');
    renderAdminCurrentView();
    showAdminToast(`✓ ${actionTitle} for #${esc.complaintId}`);
  }
}

/* ==========================================================================
   6. CONTROL CARD GRID HANDLERS
   ========================================================================== */
function initControlCardGrid() {
  document.querySelectorAll('.control-card-item').forEach(card => {
    card.addEventListener('click', () => {
      const actionKey = card.getAttribute('data-action');
      switch (actionKey) {
        case 'authorize':
          adminState.currentView = 'officers';
          break;
        case 'reassign':
          adminState.currentView = 'escalations';
          break;
        case 'escalate':
          adminState.currentView = 'escalations';
          break;
        case 'emergency':
          if (confirm("Confirm Authorization of Zone 4 Emergency Water Tanker & Disaster Repair Dispatch?")) {
            const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            adminState.auditLogs.unshift({
              timestamp: nowStr,
              actor: "Ananya Sharma",
              role: "Administrator",
              action: "Emergency Response Authorized",
              complaintId: "SYS-EMERG-01",
              department: "Water Supply",
              result: "Dispatched Zone 4 Unit"
            });
            showAdminToast("✓ Emergency Response Authorized for Zone 4!");
          }
          break;
        case 'suspend':
          adminState.currentView = 'officers';
          break;
        case 'policy':
          openSlaPolicyModal();
          break;
      }
      renderAdminCurrentView();
    });
  });
}

function executeAIRecommendation(insightId) {
  const ins = adminState.insights.find(i => i.id === insightId);
  if (ins) {
    const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    adminState.auditLogs.unshift({
      timestamp: nowStr,
      actor: "Ananya Sharma",
      role: "Administrator",
      action: `Executed AI Recommendation: ${ins.title}`,
      complaintId: "AI-INTEL-ACT",
      department: "City Governance Intelligence",
      result: ins.recommendation
    });

    showAdminToast(`✓ Executed Recommendation: ${ins.title}`);
    renderAdminCurrentView();
  }
}

/* ==========================================================================
   7. OTHER VIEW RENDERERS (ESCALATIONS, DEPARTMENTS, OFFICERS, COMPLAINTS, ANALYTICS)
   ========================================================================== */
function renderEscalationsView() {
  const container = document.getElementById('escalations-list-tbody');
  if (!container) return;

  const filterSelect = document.getElementById('filter-escalation-status');
  const selectedStatus = filterSelect ? filterSelect.value : 'all';

  let list = adminState.escalations;
  if (selectedStatus !== 'all') {
    list = list.filter(e => e.status === selectedStatus);
  }

  if (adminState.searchQuery) {
    const q = adminState.searchQuery;
    list = list.filter(e => 
      e.escalationId.toLowerCase().includes(q) ||
      e.complaintId.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.officer.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }

  const activeCountEl = document.getElementById('esc-summary-active');
  if (activeCountEl) activeCountEl.textContent = adminState.escalations.filter(e => e.status === 'Pending Action').length;

  const reassignedCountEl = document.getElementById('esc-summary-reassigned');
  if (reassignedCountEl) reassignedCountEl.textContent = adminState.escalations.filter(e => e.status === 'Reassigned').length;

  container.innerHTML = list.map(e => `
    <tr>
      <td style="font-family: monospace; font-weight: 800; color: #DC2626;">${e.escalationId}</td>
      <td style="font-family: monospace; font-weight: 700; color: var(--royal-blue);">${e.complaintId}</td>
      <td>
        <strong style="color: var(--navy-900); font-size: 0.90625rem;">${e.category}</strong>
        <div style="font-size: 0.78125rem; color: var(--text-muted); margin-top: 2px;">${e.location}</div>
      </td>
      <td><span style="font-weight: 700; color: var(--navy-900);">${e.department}</span></td>
      <td>
        <strong style="color: var(--navy-900);">${e.officer}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${e.officerId}</div>
      </td>
      <td><span class="status-dot-pill st-red" style="font-size: 0.78125rem;">▲ Score ${e.priorityScore}</span></td>
      <td><span style="color: #DC2626; font-weight: 800;">${e.breachDuration}</span></td>
      <td><span class="status-dot-pill ${e.status === 'Pending Action' ? 'st-escalated' : 'st-resolved'}">● ${e.status}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.78125rem;" onclick="openEscalationDetailModal('${e.escalationId}')">
          Console →
        </button>
      </td>
    </tr>
  `).join('');
}

function renderDepartmentsView() {
  const container = document.getElementById('departments-grid-container');
  if (!container) return;

  container.innerHTML = adminState.departments.map(d => {
    let stClass = 'st-green';
    if (d.statusColor === 'amber') stClass = 'st-amber';
    else if (d.statusColor === 'red') stClass = 'st-red';

    return `
      <div class="dept-full-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="control-icon-box" style="width: 42px; height: 42px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.125rem; font-weight: 800; color: var(--navy-900);">${d.name}</h3>
                <span style="font-size: 0.8125rem; color: var(--text-muted); font-weight: 600;">ID: ${d.id} • ${d.officersCount} Active Officers</span>
              </div>
            </div>
            <span class="status-dot-pill ${stClass}">● ${d.status}</span>
          </div>

          <!-- SLA Progress Meter -->
          <div style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 6px;">
              <span style="font-weight: 700; color: var(--text-muted);">SLA Compliance Rate</span>
              <strong style="color: ${d.slaCompliance < 80 ? '#DC2626' : 'var(--royal-blue)'};">${d.slaCompliance}%</strong>
            </div>
            <div class="dept-bar-track" style="height: 10px;">
              <div class="dept-bar-fill" style="width: ${d.slaCompliance}%; background: ${d.slaCompliance < 80 ? '#DC2626' : 'var(--royal-blue)'};"></div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 0.84375rem; background: var(--bg-surface-alt); padding: 14px; border-radius: 8px; border: 1px solid var(--admin-border-subtle);">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Total Ingested</span>
              <strong style="font-size: 1.0625rem; color: var(--navy-900);">${d.complaints}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Resolved</span>
              <strong style="font-size: 1.0625rem; color: var(--civic-green-dark);">${d.resolved}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Critical Load</span>
              <strong style="font-size: 1.0625rem; color: ${d.critical > 5 ? '#DC2626' : 'var(--navy-900)'};">${d.critical}</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--admin-border-subtle);">
          <span style="font-size: 0.78125rem; color: var(--text-muted); font-weight: 600;">Monthly Speedup: ${d.trend}</span>
          <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.78125rem;" onclick="adminState.currentView='officers'; renderAdminCurrentView();">
            View Officers →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderOfficersView() {
  const container = document.getElementById('officers-tbody');
  if (!container) return;

  const filterSelect = document.getElementById('filter-officer-status');
  const selectedStatus = filterSelect ? filterSelect.value : 'all';

  let list = adminState.officers;
  if (selectedStatus !== 'all') {
    list = list.filter(o => o.status === selectedStatus);
  }

  if (adminState.searchQuery) {
    const q = adminState.searchQuery;
    list = list.filter(o => 
      o.name.toLowerCase().includes(q) ||
      o.title.toLowerCase().includes(q) ||
      o.department.toLowerCase().includes(q) ||
      o.zone.toLowerCase().includes(q)
    );
  }

  container.innerHTML = list.map(o => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="admin-profile-avatar" style="width: 36px; height: 36px; font-size: 0.8125rem;">
            ${o.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <strong style="color: var(--navy-900); font-size: 0.90625rem;">${o.name}</strong>
            <div style="font-size: 0.78125rem; color: var(--text-muted);">${o.email}</div>
          </div>
        </div>
      </td>
      <td><span style="font-weight: 700; color: var(--navy-900);">${o.title}</span></td>
      <td>${o.department}</td>
      <td><span class="actor-chip actor-system">${o.zone}</span></td>
      <td><strong style="font-size: 0.9375rem; color: var(--navy-900);">${o.activeCases}</strong> Cases</td>
      <td><strong style="color: var(--civic-green-dark);">${o.resolved}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="color: ${o.slaCompliance < 75 ? '#DC2626' : 'var(--royal-blue)'};">${o.slaCompliance}%</strong>
          <div class="dept-bar-track" style="width: 60px; height: 6px;">
            <div class="dept-bar-fill" style="width: ${o.slaCompliance}%; background: ${o.slaCompliance < 75 ? '#DC2626' : 'var(--royal-blue)'};"></div>
          </div>
        </div>
      </td>
      <td>
        <span class="status-dot-pill ${o.statusBadge === 'green' ? 'st-green' : 'st-amber'}">● ${o.status}</span>
      </td>
      <td>
        ${o.status === 'Pending Approval' ? `
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.78125rem;" onclick="toggleOfficerStatus('${o.id}', 'Active')">
            Authorize Officer
          </button>
        ` : `
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.78125rem;" onclick="toggleOfficerStatus('${o.id}', '${o.status === 'Active' ? 'Suspended' : 'Active'}')">
            ${o.status === 'Active' ? 'Suspend' : 'Reactivate'}
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

function toggleOfficerStatus(officerId, newStatus) {
  const officer = adminState.officers.find(o => o.id === officerId);
  if (officer) {
    officer.status = newStatus;
    officer.statusBadge = newStatus === 'Active' ? 'green' : 'amber';

    const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    adminState.auditLogs.unshift({
      timestamp: nowStr,
      actor: "Ananya Sharma",
      role: "Administrator",
      action: `Changed Officer Status of ${officer.name} to ${newStatus}`,
      complaintId: "SYS-USER-AUTH",
      department: officer.department,
      result: `Officer ID: ${officer.id}`
    });

    renderAdminCurrentView();
    showAdminToast(`✓ Officer ${officer.name} status set to ${newStatus}`);
  }
}

function renderCityComplaintsView() {
  const container = document.getElementById('city-complaints-tbody');
  if (!container) return;

  let list = adminState.escalations;
  if (adminState.searchQuery) {
    const q = adminState.searchQuery;
    list = list.filter(c => 
      c.complaintId.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.officer.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }

  container.innerHTML = list.map(c => `
    <tr>
      <td style="font-family: monospace; font-weight: 800; color: var(--royal-blue);">${c.complaintId}</td>
      <td><strong style="color: var(--navy-900); font-size: 0.90625rem;">${c.category}</strong></td>
      <td><span style="font-weight: 700; color: var(--navy-900);">${c.department}</span></td>
      <td>${c.officer}</td>
      <td>${c.location}</td>
      <td><span class="status-dot-pill st-red">▲ Score ${c.priorityScore}</span></td>
      <td><span style="color: #DC2626; font-weight: 800;">${c.breachDuration}</span></td>
      <td><span class="status-dot-pill ${c.status === 'Pending Action' ? 'st-escalated' : 'st-resolved'}">● ${c.status}</span></td>
    </tr>
  `).join('');
}

function renderCityIntelligenceView() {
  const container = document.getElementById('ai-insights-feed');
  if (!container) return;

  container.innerHTML = adminState.insights.map(i => `
    <div class="ai-insight-box-clean" style="padding: 18px; margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 0.75rem; font-weight: 800; color: var(--ai-cyan); letter-spacing: 0.05em;">${i.tag}</span>
        <span class="ai-conf-tag" style="font-size: 0.75rem; padding: 3px 8px;">${i.confidence} Confidence</span>
      </div>
      <strong style="font-size: 1.0625rem; color: #FFFFFF; font-family: var(--font-heading); display: block; margin-bottom: 6px;">${i.title}</strong>
      <p style="color: #CBD5E1; font-size: 0.875rem; line-height: 1.5; margin-bottom: 12px;">"${i.insight}"</p>
      <div style="background: rgba(0, 0, 0, 0.35); padding: 14px; border-radius: 8px; font-size: 0.875rem; margin-bottom: 16px; border-left: 4px solid var(--ai-cyan);">
        <strong style="color: var(--ai-cyan);">AI Recommended Action:</strong> ${i.recommendation}
      </div>
      <button class="btn btn-primary" style="padding: 8px 16px; font-size: 0.8125rem;" onclick="executeAIRecommendation('${i.id}')">
        ${i.actionBtnText} →
      </button>
    </div>
  `).join('');
}

function renderAnalyticsView() {
  const container = document.getElementById('analytics-chart-container');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 20px; background: var(--bg-surface-alt); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <strong style="font-size: 0.9375rem; color: var(--navy-900);">Weekly Ingestion vs Resolution Velocity (Last 7 Days)</strong>
        <span style="font-size: 0.8125rem; color: var(--civic-green-dark); font-weight: 700;">● Resolution Efficiency: +18.2%</span>
      </div>
      
      <svg width="100%" height="220" viewBox="0 0 600 220" style="overflow: visible;">
        <line x1="40" y1="20" x2="580" y2="20" stroke="#E2E8F0" stroke-width="1" />
        <line x1="40" y1="70" x2="580" y2="70" stroke="#E2E8F0" stroke-width="1" />
        <line x1="40" y1="120" x2="580" y2="120" stroke="#E2E8F0" stroke-width="1" />
        <line x1="40" y1="170" x2="580" y2="170" stroke="#E2E8F0" stroke-width="1" />

        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1769E0" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#1769E0" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <path d="M 60,140 L 140,110 L 220,130 L 300,70 L 380,90 L 460,40 L 540,50 L 540,170 L 60,170 Z" fill="url(#chartGrad)"/>
        <polyline points="60,140 140,110 220,130 300,70 380,90 460,40 540,50" fill="none" stroke="#1769E0" stroke-width="3"/>
        <polyline points="60,160 140,145 220,150 300,110 380,120 460,85 540,90" fill="none" stroke="#16A34A" stroke-width="3" stroke-dasharray="4"/>

        <circle cx="60" cy="140" r="4" fill="#1769E0"/>
        <circle cx="140" cy="110" r="4" fill="#1769E0"/>
        <circle cx="220" cy="130" r="4" fill="#1769E0"/>
        <circle cx="300" cy="70" r="4" fill="#1769E0"/>
        <circle cx="380" cy="90" r="4" fill="#1769E0"/>
        <circle cx="460" cy="40" r="4" fill="#1769E0"/>
        <circle cx="540" cy="50" r="4" fill="#1769E0"/>

        <text x="60" y="195" font-size="11" fill="#64748B" text-anchor="middle">Mon</text>
        <text x="140" y="195" font-size="11" fill="#64748B" text-anchor="middle">Tue</text>
        <text x="220" y="195" font-size="11" fill="#64748B" text-anchor="middle">Wed</text>
        <text x="300" y="195" font-size="11" fill="#64748B" text-anchor="middle">Thu</text>
        <text x="380" y="195" font-size="11" fill="#64748B" text-anchor="middle">Fri</text>
        <text x="460" y="195" font-size="11" fill="#64748B" text-anchor="middle">Sat</text>
        <text x="540" y="195" font-size="11" fill="#64748B" text-anchor="middle">Sun</text>
      </svg>

      <div style="display: flex; justify-content: center; gap: 24px; font-size: 0.8125rem; margin-top: 14px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 3px; background: #1769E0; display: inline-block;"></span>
          <span>Complaints Ingested</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 3px; background: #16A34A; display: inline-block;"></span>
          <span>Cases Resolved</span>
        </div>
      </div>
    </div>
  `;
}

function renderAuditLogView() {
  const container = document.getElementById('audit-log-tbody');
  if (!container) return;

  let list = adminState.auditLogs;
  if (adminState.searchQuery) {
    const q = adminState.searchQuery;
    list = list.filter(l => 
      l.action.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      l.complaintId.toLowerCase().includes(q) ||
      l.department.toLowerCase().includes(q) ||
      l.result.toLowerCase().includes(q)
    );
  }

  const countTotalEl = document.getElementById('audit-summary-total');
  if (countTotalEl) countTotalEl.textContent = adminState.auditLogs.length;

  container.innerHTML = list.map(l => {
    let actorClass = 'actor-system';
    if (l.role === 'Administrator') actorClass = 'actor-admin';
    else if (l.role === 'Officer') actorClass = 'actor-officer';
    else if (l.role === 'AI Core' || l.role === 'AI Watchdog') actorClass = 'actor-ai';

    return `
      <tr>
        <td style="font-weight: 700; color: var(--text-muted); font-size: 0.8125rem;">${l.timestamp}</td>
        <td>
          <span class="actor-chip ${actorClass}">
            ${l.actor} (${l.role})
          </span>
        </td>
        <td><strong style="color: var(--navy-900); font-size: 0.90625rem;">${l.action}</strong></td>
        <td style="font-family: monospace; font-weight: 700; color: var(--royal-blue);">${l.complaintId}</td>
        <td><span style="font-weight: 700; color: var(--navy-900);">${l.department}</span></td>
        <td style="color: var(--text-secondary); line-height: 1.4;">${l.result}</td>
      </tr>
    `;
  }).join('');
}

function renderProfileView() {
  const p = adminState.profile;
  const elName = document.getElementById('admin-prof-name');
  if (elName) elName.textContent = p.name;
}

function showAdminToast(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = 'var(--admin-navy-950)';
  toast.style.color = '#FFFFFF';
  toast.style.padding = '14px 20px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = 'var(--admin-shadow-elevated)';
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

function triggerAdminDemoStory() {
  const demoEscalationId = "EX-2041";
  openEscalationDetailModal(demoEscalationId);
  showAdminToast("Demo Story Loaded: Complaint LV-10482 SLA Breached & Escalated!");
}
