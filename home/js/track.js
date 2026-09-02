/**
 * LOKVAANI AI — Dedicated Citizen Track Request Engine
 * Search handling, status timeline, SLA telemetry, and mock complaint database
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTrackFlow();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

function initTrackFlow() {
  // Realistic Mock Database
  const complaintsDb = {
    'LOK-2026-7853': {
      id: 'LOK-2026-7853',
      category: 'Water',
      categoryIcon: '💧',
      subcategory: 'Broken Pipeline',
      department: 'Water Supply Department',
      location: 'Station Road near Metro Pillar 42, Ward 12',
      submittedDate: 'Today, 08:30 AM',
      priority: 'Critical (95/100)',
      priorityClass: 'metric-priority-high',
      expectedSla: '6 Hours (Target: 02:30 PM)',
      status: 'In Progress',
      statusClass: 'status-badge-in-progress',
      slaStatus: 'On Track',
      slaProgressPercent: 55,
      slaColorClass: 'status-green',
      slaTimeRemaining: 'Remaining: 2h 45m (Within SLA target)',
      latestUpdate: {
        text: 'Field Maintenance Unit #4 deployed on-site. Isolation valve shut off to stop surface flooding. Replacement 150mm ductile iron pipe segment being welded. Expected completion in ~2 hours.',
        time: 'Today, 09:40 AM',
        officer: 'Er. R. Deshmukh, Junior Engineer (Water Works)'
      },
      timeline: [
        {
          title: 'Complaint Submitted',
          time: 'Today, 08:30 AM',
          desc: 'Citizen grievance filed with geotagged photo proof and location coordinates.',
          state: 'completed'
        },
        {
          title: 'AI Analysis Completed',
          time: 'Today, 08:31 AM',
          desc: 'NLP identified water main burst. Priority scored 95/100. Routed under Water Supply Dept.',
          state: 'completed'
        },
        {
          title: 'Assigned to Department',
          time: 'Today, 08:32 AM',
          desc: 'Dispatched to Ward 12 Municipal Water Maintenance Division work queue.',
          state: 'completed'
        },
        {
          title: 'Officer Accepted',
          time: 'Today, 08:45 AM',
          desc: 'Accepted by Field Supervisor Er. R. Deshmukh. Crew mobilized with repair vehicle #WV-12.',
          state: 'completed'
        },
        {
          title: 'In Progress',
          time: 'Today, 09:15 AM',
          desc: 'Excavation completed. Isolation valve closed. Pipe segment welding underway.',
          state: 'current'
        },
        {
          title: 'Resolved',
          time: 'Pending Inspection',
          desc: 'Post-repair water pressure test, backfilling, and citizen sign-off.',
          state: 'upcoming'
        }
      ],
      details: {
        citizenDesc: 'Main drinking water pipeline ruptured near Station Road junction, gushing water onto road and causing low water supply pressure in nearby residential buildings.',
        peopleAffected: 'Entire Ward (200+ people)',
        evidence: 'Photo attached (EXIF & GPS verified) • Bhashini voice note transcribed',
        coordinates: '18.5204° N, 73.8567° E'
      }
    },
    'LOK-2026-8941': {
      id: 'LOK-2026-8941',
      category: 'Roads',
      categoryIcon: '🚧',
      subcategory: 'Pothole Cluster',
      department: 'Public Works Department',
      location: 'Shivaji Chowk Main Junction, Ward 8',
      submittedDate: 'Yesterday, 10:15 AM',
      priority: 'High (82/100)',
      priorityClass: 'metric-priority-high',
      expectedSla: '24 Hours',
      status: 'Resolved',
      statusClass: 'status-badge-resolved',
      slaStatus: 'Resolved On Time',
      slaProgressPercent: 100,
      slaColorClass: 'status-green',
      slaTimeRemaining: 'Resolved in 21h 30m (Target was 24h - Within SLA)',
      latestUpdate: {
        text: 'Hot-mix bituminous asphalt patching completed. Road surface leveled, rolled and reopened to vehicular traffic. Geotagged after-repair photograph verified by Chief Road Inspector.',
        time: 'Today, 07:45 AM',
        officer: 'S. Kadam, Assistant Executive Engineer, PWD'
      },
      timeline: [
        {
          title: 'Complaint Submitted',
          time: 'Yesterday, 10:15 AM',
          desc: 'Reported with photographic evidence of deep craters on junction.',
          state: 'completed'
        },
        {
          title: 'AI Analysis Completed',
          time: 'Yesterday, 10:16 AM',
          desc: 'Classified under PWD Road Safety Matrix. Priority calculated at 82/100.',
          state: 'completed'
        },
        {
          title: 'Assigned to Department',
          time: 'Yesterday, 10:18 AM',
          desc: 'Assigned to Central Road Maintenance Depot (Zone 2).',
          state: 'completed'
        },
        {
          title: 'Officer Accepted',
          time: 'Yesterday, 11:30 AM',
          desc: 'Work order #RO-412 issued to asphalt road maintenance crew.',
          state: 'completed'
        },
        {
          title: 'In Progress',
          time: 'Yesterday, 03:00 PM',
          desc: 'Debris cleared, tack coat applied, hot mix bitumen laid and compacted.',
          state: 'completed'
        },
        {
          title: 'Resolved',
          time: 'Today, 07:45 AM',
          desc: 'Final inspection signed off. Case closed with verified after-photos.',
          state: 'completed'
        }
      ],
      details: {
        citizenDesc: 'Cluster of dangerous potholes right at the bus turnaround, causing frequent two-wheeler skidding and severe traffic congestion during rush hours.',
        peopleAffected: 'Locality (50-200 people)',
        evidence: '2 Photos attached • Geotagged',
        coordinates: '18.5312° N, 73.8445° E'
      }
    },
    'LOK-2026-4109': {
      id: 'LOK-2026-4109',
      category: 'Electricity',
      categoryIcon: '⚡',
      subcategory: 'Street Light Inoperative',
      department: 'Electrical Department',
      location: 'Market Lane Junction, Ward 5',
      submittedDate: '2 Days Ago, 06:10 PM',
      priority: 'Medium (68/100)',
      priorityClass: 'metric-priority-med',
      expectedSla: '24 Hours',
      status: 'At Risk',
      statusClass: 'status-badge-at-risk',
      slaStatus: 'At Risk',
      slaProgressPercent: 88,
      slaColorClass: 'status-amber',
      slaTimeRemaining: '45m Remaining before automated Escalation Level 1',
      latestUpdate: {
        text: 'Feeder line replacement encountered underground telecom duct conflict. Additional technician team dispatched to reroute wiring. Superintending Engineer notified.',
        time: 'Today, 11:15 AM',
        officer: 'V. Patil, Sectional Engineer (Electrical Works)'
      },
      timeline: [
        {
          title: 'Complaint Submitted',
          time: '2 Days Ago, 06:10 PM',
          desc: 'Citizen reported 4 consecutive dark street light poles.',
          state: 'completed'
        },
        {
          title: 'AI Analysis Completed',
          time: '2 Days Ago, 06:11 PM',
          desc: 'Identified as feeder circuit trip. Mapped to Electrical Dept.',
          state: 'completed'
        },
        {
          title: 'Assigned to Department',
          time: '2 Days Ago, 06:15 PM',
          desc: 'Dispatched to Ward 5 Electrical Maintenance depot.',
          state: 'completed'
        },
        {
          title: 'Officer Accepted',
          time: 'Yesterday, 09:30 AM',
          desc: 'Assigned to Line Inspector V. Patil for daytime diagnosis.',
          state: 'completed'
        },
        {
          title: 'In Progress',
          time: 'Yesterday, 04:00 PM',
          desc: 'Feeder cable insulation burnt; replacement cable pull in progress.',
          state: 'current'
        },
        {
          title: 'Resolved',
          time: 'Pending Reconnect',
          desc: 'Energizing feeder and illumination test at dusk.',
          state: 'upcoming'
        }
      ],
      details: {
        citizenDesc: 'Four consecutive street light poles completely dark for the past 3 nights, making the market corner unsafe for pedestrians and night shoppers.',
        peopleAffected: 'Building / Street (10-50 people)',
        evidence: 'Night photo attached',
        coordinates: '18.5175° N, 73.8610° E'
      }
    }
  };

  // DOM Elements
  const trackForm = document.getElementById('track-request-form');
  const trackInput = document.getElementById('track-id-input');
  const resultsContainer = document.getElementById('track-results-wrap');
  const emptyState = document.getElementById('track-empty-state');

  // Search mode tabs
  const tabIdBtn = document.getElementById('tab-search-id');
  const tabPhoneBtn = document.getElementById('tab-search-phone');
  let currentSearchMode = 'id'; // 'id' or 'phone'

  // Result Card Elements
  const resIdEl = document.getElementById('res-complaint-id');
  const resStatusBadge = document.getElementById('res-status-badge');
  const resCatEl = document.getElementById('res-category');
  const resSubcatEl = document.getElementById('res-subcategory');
  const resDeptEl = document.getElementById('res-department');
  const resLocEl = document.getElementById('res-location');
  const resDateEl = document.getElementById('res-submitted-date');
  const resPriorityEl = document.getElementById('res-priority');
  const resSlaEl = document.getElementById('res-expected-sla');
  const resStatusTextEl = document.getElementById('res-current-status');

  // Timeline Container
  const timelineContainer = document.getElementById('timeline-steps-container');

  // Latest Update Elements
  const updateQuoteEl = document.getElementById('latest-update-text');
  const updateTimeEl = document.getElementById('latest-update-time');
  const updateOfficerEl = document.getElementById('latest-update-officer');

  // SLA Telemetry Elements
  const slaBadgeEl = document.getElementById('sla-status-pill');
  const slaProgressFill = document.getElementById('sla-progress-fill-bar');
  const slaTimeTextEl = document.getElementById('sla-remaining-time-text');

  // Modals
  const detailsModal = document.getElementById('details-modal');
  const addInfoModal = document.getElementById('add-info-modal');
  let activeLoadedComplaint = null;

  // 1. Tab Switching (Complaint ID vs Mobile Number)
  if (tabIdBtn && tabPhoneBtn && trackInput) {
    tabIdBtn.addEventListener('click', () => {
      currentSearchMode = 'id';
      tabIdBtn.classList.add('active');
      tabPhoneBtn.classList.remove('active');
      trackInput.placeholder = 'Enter Complaint ID (e.g., LOK-2026-7853)';
      trackInput.value = '';
      trackInput.focus();
    });

    tabPhoneBtn.addEventListener('click', () => {
      currentSearchMode = 'phone';
      tabPhoneBtn.classList.add('active');
      tabIdBtn.classList.remove('active');
      trackInput.placeholder = 'Enter 10-digit Registered Mobile Number';
      trackInput.value = '';
      trackInput.focus();
    });
  }

  // 2. Sample ID Chips
  document.querySelectorAll('.sample-id-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.getAttribute('data-id');
      if (trackInput) {
        trackInput.value = id;
        performSearch(id);
      }
    });
  });

  // 3. Search Form Submit
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = trackInput.value.trim();
      if (!query) {
        alert('Please enter a valid Complaint ID or Mobile Number.');
        trackInput.focus();
        return;
      }
      performSearch(query);
    });
  }

  // 4. Perform Search Function
  function performSearch(query) {
    let complaint = null;
    const cleanQuery = query.toUpperCase();

    // Check direct match
    if (complaintsDb[cleanQuery]) {
      complaint = complaintsDb[cleanQuery];
    } else if (currentSearchMode === 'phone' || query.length === 10) {
      // Mobile search simulation: maps to LOK-2026-7853
      complaint = complaintsDb['LOK-2026-7853'];
    } else {
      // Dynamic fallback generator for any custom ID entered by user!
      complaint = generateDynamicRecord(cleanQuery);
    }

    renderComplaint(complaint);
  }

  // Fallback dynamic generator
  function generateDynamicRecord(customId) {
    return {
      id: customId,
      category: 'Civic Infrastructure',
      categoryIcon: '🏛️',
      subcategory: 'Public Maintenance',
      department: 'Municipal Operations Division',
      location: 'Ward 12 Municipal Jurisdiction',
      submittedDate: 'Today, 10:00 AM',
      priority: 'High (80/100)',
      priorityClass: 'metric-priority-high',
      expectedSla: '12 - 24 Hours',
      status: 'In Progress',
      statusClass: 'status-badge-in-progress',
      slaStatus: 'On Track',
      slaProgressPercent: 40,
      slaColorClass: 'status-green',
      slaTimeRemaining: 'Remaining: 14h 20m (Within SLA)',
      latestUpdate: {
        text: 'Grievance verified by Ward Triage Desk. Field officer assigned for site inspection and photographic survey.',
        time: 'Today, 10:45 AM',
        officer: 'Duty Officer, Ward 12 Redressal Cell'
      },
      timeline: [
        {
          title: 'Complaint Submitted',
          time: 'Today, 10:00 AM',
          desc: 'Citizen issue ingested and digital token created.',
          state: 'completed'
        },
        {
          title: 'AI Analysis Completed',
          time: 'Today, 10:01 AM',
          desc: 'Automated categorization and department routing complete.',
          state: 'completed'
        },
        {
          title: 'Assigned to Department',
          time: 'Today, 10:05 AM',
          desc: 'Forwarded to Municipal Operations Division work queue.',
          state: 'completed'
        },
        {
          title: 'Officer Accepted',
          time: 'Today, 10:30 AM',
          desc: 'Assigned to field duty inspection crew.',
          state: 'completed'
        },
        {
          title: 'In Progress',
          time: 'Today, 10:45 AM',
          desc: 'Inspection and remedial dispatch initiated.',
          state: 'current'
        },
        {
          title: 'Resolved',
          time: 'Pending',
          desc: 'Field verification and final resolution notice.',
          state: 'upcoming'
        }
      ],
      details: {
        citizenDesc: 'Civic issue reported via LokVaani AI portal. Field team working on timely rectification.',
        peopleAffected: 'Building / Street',
        evidence: 'Digital submission tag',
        coordinates: '18.5204° N, 73.8567° E'
      }
    };
  }

  // 5. Render Complaint Data to DOM
  function renderComplaint(c) {
    activeLoadedComplaint = c;

    // Show results, hide empty state
    if (emptyState) emptyState.style.display = 'none';
    if (resultsContainer) {
      resultsContainer.style.display = 'flex';
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Header & Summary
    if (resIdEl) resIdEl.textContent = c.id;
    if (resStatusBadge) {
      resStatusBadge.textContent = c.status;
      resStatusBadge.className = `status-badge-lg ${c.statusClass}`;
    }
    if (resCatEl) resCatEl.textContent = `${c.categoryIcon} ${c.category}`;
    if (resSubcatEl) resSubcatEl.textContent = c.subcategory;
    if (resDeptEl) resDeptEl.textContent = c.department;
    if (resLocEl) resLocEl.textContent = c.location;
    if (resDateEl) resDateEl.textContent = c.submittedDate;
    if (resPriorityEl) {
      resPriorityEl.textContent = c.priority;
      resPriorityEl.className = `summary-field-val ${c.priorityClass}`;
    }
    if (resSlaEl) resSlaEl.textContent = c.expectedSla;
    if (resStatusTextEl) resStatusTextEl.textContent = c.status;

    // Timeline Rendering
    if (timelineContainer) {
      timelineContainer.innerHTML = '';
      c.timeline.forEach((step, idx) => {
        const stepEl = document.createElement('div');
        stepEl.className = `timeline-step-item ${step.state}`;

        let dotIcon = '●';
        if (step.state === 'completed') dotIcon = '✓';

        stepEl.innerHTML = `
          <div class="timeline-step-dot">${dotIcon}</div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title">${step.title}</span>
              <span class="timeline-step-time">${step.time}</span>
            </div>
            <div class="timeline-step-desc">${step.desc}</div>
          </div>
        `;
        timelineContainer.appendChild(stepEl);
      });
    }

    // Latest Update Card
    if (updateQuoteEl) updateQuoteEl.textContent = `"${c.latestUpdate.text}"`;
    if (updateTimeEl) updateTimeEl.textContent = c.latestUpdate.time;
    if (updateOfficerEl) updateOfficerEl.textContent = `Official Note: ${c.latestUpdate.officer}`;

    // SLA Telemetry
    if (slaBadgeEl) {
      slaBadgeEl.textContent = c.slaStatus;
      slaBadgeEl.className = `metric-pill ${c.slaColorClass === 'status-green' ? 'metric-priority-norm' : c.slaColorClass === 'status-amber' ? 'metric-priority-med' : 'metric-priority-high'}`;
    }
    if (slaProgressFill) {
      slaProgressFill.style.width = '0%';
      slaProgressFill.className = `sla-progress-fill ${c.slaColorClass}`;
      setTimeout(() => {
        slaProgressFill.style.width = `${c.slaProgressPercent}%`;
      }, 100);
    }
    if (slaTimeTextEl) slaTimeTextEl.textContent = c.slaTimeRemaining;
  }

  // 6. Modal Interactions
  const btnViewDetails = document.getElementById('btn-view-details');
  const btnAddInfo = document.getElementById('btn-add-info');
  const closeDetailsBtn = document.getElementById('close-details-modal');
  const closeAddInfoBtn = document.getElementById('close-add-info-modal');
  const formAddInfo = document.getElementById('form-add-info');

  if (btnViewDetails && detailsModal) {
    btnViewDetails.addEventListener('click', () => {
      if (!activeLoadedComplaint) return;
      document.getElementById('modal-detail-id').textContent = activeLoadedComplaint.id;
      document.getElementById('modal-detail-desc').textContent = activeLoadedComplaint.details.citizenDesc;
      document.getElementById('modal-detail-affected').textContent = activeLoadedComplaint.details.peopleAffected;
      document.getElementById('modal-detail-evidence').textContent = activeLoadedComplaint.details.evidence;
      document.getElementById('modal-detail-coords').textContent = activeLoadedComplaint.details.coordinates;
      detailsModal.classList.add('active');
    });
  }

  if (closeDetailsBtn && detailsModal) {
    closeDetailsBtn.addEventListener('click', () => detailsModal.classList.remove('active'));
  }

  if (btnAddInfo && addInfoModal) {
    btnAddInfo.addEventListener('click', () => {
      addInfoModal.classList.add('active');
    });
  }

  if (closeAddInfoBtn && addInfoModal) {
    closeAddInfoBtn.addEventListener('click', () => addInfoModal.classList.remove('active'));
  }

  // Backdrop dismissal
  [detailsModal, addInfoModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailsModal) detailsModal.classList.remove('active');
      if (addInfoModal) addInfoModal.classList.remove('active');
    }
  });

  // Handle citizen appending note
  if (formAddInfo) {
    formAddInfo.addEventListener('submit', (e) => {
      e.preventDefault();
      const citizenNote = document.getElementById('citizen-new-info').value.trim();
      if (!citizenNote) return;

      if (activeLoadedComplaint && timelineContainer) {
        // Append citizen note as an entry to the timeline!
        const citizenStep = document.createElement('div');
        citizenStep.className = 'timeline-step-item completed';
        citizenStep.innerHTML = `
          <div class="timeline-step-dot" style="background: var(--ai-cyan); border-color: var(--ai-cyan); color: #000;">💬</div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title" style="color: var(--royal-blue);">Citizen Information Added</span>
              <span class="timeline-step-time">Just now</span>
            </div>
            <div class="timeline-step-desc">"${citizenNote}"</div>
          </div>
        `;
        timelineContainer.insertBefore(citizenStep, timelineContainer.lastElementChild);
        alert('Your additional information has been dispatched to the field officer!');
        addInfoModal.classList.remove('active');
        document.getElementById('citizen-new-info').value = '';
      }
    });
  }

  // 7. Check URL query parameters (e.g. track.html?id=LOK-2026-7853)
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  if (paramId) {
    if (trackInput) trackInput.value = paramId;
    performSearch(paramId);
  } else {
    // By default, display LOK-2026-7853 as an active preview so the demo works instantly!
    performSearch('LOK-2026-7853');
  }
}
