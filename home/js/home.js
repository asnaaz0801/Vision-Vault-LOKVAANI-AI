/**
 * LOKVAANI AI — Interactive Web Application Engine
 * GovTech + AI Civic Intelligence Platform
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initHeroVisual();
  initWorkflowTimeline();
  initDuplicateVisualizer();
  initCityMap();
  initSlaTimers();
  initIssueReportingModal();
  initTrackComplaintModal();
  initHelpModal();
});

/* ==========================================================================
   1. NAVBAR BEHAVIOR
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Glassmorphic scroll trigger
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isOpen = navMenu.classList.contains('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu on modal button click
    document.querySelectorAll('.open-report-modal, .open-track-modal, .open-help-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);

      if (correspondingLink && scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        correspondingLink.classList.add('active');
      }
    });
  }
}

/* ==========================================================================
   2. ANIMATED IMPACT METRIC COUNTERS
   ========================================================================== */
function initCounters() {
  const counterElements = document.querySelectorAll('.counter-val');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterElements.forEach(el => animateCount(el));
      }
    });
  }, { threshold: 0.25 });

  const targetSection = document.querySelector('.impact-strip-section');
  if (targetSection) observer.observe(targetSection);

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(ease * target);

      el.textContent = currentVal.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target.toLocaleString('en-IN') + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  }
}

/* ==========================================================================
   3. HERO CIVIC INTELLIGENCE NETWORK INTERACTION
   ========================================================================== */
function initHeroVisual() {
  const civicNodes = document.querySelectorAll('.civic-node');
  const aiCoreText = document.querySelector('.ai-core-text');
  const aiCoreSub = document.querySelector('.ai-core-sub');

  const nodeData = {
    water: { title: 'Jal Board', status: 'Active Telemetry', ping: 'Pipeline 4-B' },
    roads: { title: 'PWD Roads', status: 'Vision Triage', ping: 'Surface Defect' },
    waste: { title: 'Solid Waste', status: 'Geo-Cluster', ping: 'Bin Overflow' },
    lights: { title: 'Electrical', status: 'Grid Link', ping: 'Luminaire 14' },
    drainage: { title: 'Stormwater', status: 'Sensing', ping: 'Culvert Clear' },
    location: { title: 'GIS Engine', status: 'Polygon Map', ping: 'Ward 12 Centroid' }
  };

  civicNodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      const domain = node.getAttribute('data-domain');
      if (nodeData[domain] && aiCoreText && aiCoreSub) {
        aiCoreText.textContent = nodeData[domain].title;
        aiCoreSub.textContent = nodeData[domain].status;
        civicNodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
      }
    });

    node.addEventListener('mouseleave', () => {
      if (aiCoreText && aiCoreSub) {
        aiCoreText.textContent = 'AI';
        aiCoreSub.textContent = 'NEURAL HUB';
      }
    });
  });
}

/* ==========================================================================
   4. 7-STEP WORKFLOW TIMELINE
   ========================================================================== */
function initWorkflowTimeline() {
  const stepCards = document.querySelectorAll('.workflow-step-card');
  const previewBadge = document.querySelector('.preview-badge');
  const previewStageTitle = document.querySelector('.preview-stage-title');
  const previewStageDesc = document.querySelector('.preview-stage-desc');
  const previewDataBox = document.querySelector('.preview-data-box');
  const stepDots = document.querySelectorAll('.step-dot');

  const stepDetails = [
    {
      step: '01',
      badge: 'STAGE 1: CITIZEN INTAKE',
      title: 'Multimodal Citizen Submission',
      desc: 'Citizen reports issue through WhatsApp, Web, Mobile App, or Dial-in IVR in their native dialect.',
      data: [
        { key: 'Input Mode', val: 'Voice Note (Marathi) + Geo-Photo', highlight: true },
        { key: 'GPS Location', val: '18.5204° N, 73.8567° E (Ward 12)', highlight: false },
        { key: 'Citizen ID', val: 'Verified Aadhaar Mobile Linked', highlight: false },
        { key: 'Payload Size', val: '3.4 MB (Encrypted transit)', highlight: false }
      ]
    },
    {
      step: '02',
      badge: 'STAGE 2: AI UNDERSTANDING',
      title: 'Intent & Entity Extraction',
      desc: 'Speech-to-text with Bhashini NLP engine transcribes dialects, extracts civic domain entities, and verifies image authenticity.',
      data: [
        { key: 'Detected Language', val: 'Marathi (Devanagari)', highlight: true },
        { key: 'Extracted Intent', val: 'Water Pipeline Rupture', highlight: true },
        { key: 'Vision Model', val: 'Puddle & Pressure Water Detected (98.2%)', highlight: true },
        { key: 'Entity Extracted', val: 'Station Road, near Pillar 42', highlight: false }
      ]
    },
    {
      step: '03',
      badge: 'STAGE 3: INTELLIGENT PRIORITIZATION',
      title: 'Dynamic Severity Matrix',
      desc: 'Calculates dynamic urgency index factoring in hazard risk, school/hospital proximity, and population density.',
      data: [
        { key: 'Impact Score', val: '94 / 100 (CRITICAL)', highlight: 'saffron' },
        { key: 'Critical Factors', val: 'Drinking Water Loss + Hospital Corridor', highlight: true },
        { key: 'Calculated SLA', val: '4 Hours Guaranteed Response', highlight: 'green' },
        { key: 'Public Risk', val: 'High (Road Contamination Risk)', highlight: 'saffron' }
      ]
    },
    {
      step: '04',
      badge: 'STAGE 4: SMART ASSIGNMENT',
      title: 'Automated Department Routing',
      desc: 'Instantly dispatches ticket to the jurisdiction officer without intermediate manual clerks.',
      data: [
        { key: 'Department', val: 'Municipal Water & Sewerage Board', highlight: true },
        { key: 'Assigned Officer', val: 'Er. Ramesh Kulkarni (Sub-Divisional Eng.)', highlight: false },
        { key: 'Field Crew', val: 'Quick Response Team 03 (GPS En Route)', highlight: 'green' },
        { key: 'Dispatch Time', val: 'Instantaneous (< 1.4 seconds)', highlight: true }
      ]
    },
    {
      step: '05',
      badge: 'STAGE 5: SLA MONITORING',
      title: 'Autonomous Clock & Escalation',
      desc: 'Active SLA countdown runs. If unresolved at 75% mark, notification escalates to Executive Engineer; at 100%, to CMO.',
      data: [
        { key: 'Active Countdown', val: '03h : 21m : 14s Remaining', highlight: 'green' },
        { key: 'Escalation Level', val: 'Level 1 Normal -> Level 2 CMO alert', highlight: false },
        { key: 'Officer Device', val: 'Field Tablet Notification Acknowledged', highlight: true },
        { key: 'Breach Status', val: 'On Track (Compliant)', highlight: 'green' }
      ]
    },
    {
      step: '06',
      badge: 'STAGE 6: FIELD RESOLUTION',
      title: 'Geotagged Proof of Work',
      desc: 'Field team repairs rupture and uploads geotagged, timestamped resolution photograph verified by Computer Vision.',
      data: [
        { key: 'Resolution Proof', val: 'Repaired Valve Geotagged Photo', highlight: true },
        { key: 'AI Verification', val: 'Dry Road & Intact Pipe Confirmed (97%)', highlight: 'green' },
        { key: 'Completed At', val: 'Today, 11:42 AM IST', highlight: false },
        { key: 'Inventory Used', val: 'Valve 8-inch CI Replacement', highlight: false }
      ]
    },
    {
      step: '07',
      badge: 'STAGE 7: CITIZEN VERIFICATION',
      title: 'Closing the Feedback Loop',
      desc: 'Citizen receives WhatsApp notification with before/after photos and rates satisfaction.',
      data: [
        { key: 'Citizen Alert', val: 'WhatsApp Notification Delivered', highlight: 'green' },
        { key: 'Before / After', val: 'Visual Proof Attached', highlight: true },
        { key: 'Citizen Rating', val: '5 / 5 Stars ("Repaired within 3 hrs")', highlight: 'green' },
        { key: 'Ticket Status', val: 'Closed & Archived to Smart City BI', highlight: true }
      ]
    }
  ];

  let currentStepIdx = 0;
  let autoPlayTimer = null;

  function setStep(idx) {
    currentStepIdx = idx;
    const data = stepDetails[idx];
    if (!data) return;

    stepCards.forEach((card, i) => {
      card.classList.toggle('active', i === idx);
    });

    stepDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });

    if (previewBadge) previewBadge.textContent = data.badge;
    if (previewStageTitle) previewStageTitle.textContent = data.title;
    if (previewStageDesc) previewStageDesc.textContent = data.desc;

    if (previewDataBox) {
      previewDataBox.innerHTML = data.data.map(item => {
        let valClass = '';
        if (item.highlight === true) valClass = 'data-val-highlight';
        else if (item.highlight === 'green') valClass = 'data-val-green';
        else if (item.highlight === 'saffron') valClass = 'data-val-saffron';

        return `
          <div class="preview-data-row">
            <span class="data-key">${item.key}:</span>
            <span class="${valClass}">${item.val}</span>
          </div>
        `;
      }).join('');
    }
  }

  stepCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      stopAutoPlay();
      setStep(idx);
    });
  });

  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      currentStepIdx = (currentStepIdx + 1) % stepDetails.length;
      setStep(currentStepIdx);
    }, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  // Initial load
  setStep(0);
  startAutoPlay();
}

/* ==========================================================================
   5. DUPLICATE COMPLAINT CONVERGENCE VISUALIZER
   ========================================================================== */
function initDuplicateVisualizer() {
  const triggerBtn = document.getElementById('trigger-dedup-btn');
  const resetBtn = document.getElementById('reset-dedup-btn');
  const chips = document.querySelectorAll('.citizen-chip');
  const surgeScore = document.getElementById('dedup-surge-score');
  const linkedCount = document.getElementById('dedup-linked-count');
  const funnelTag = document.querySelector('.funnel-tag');

  if (!triggerBtn) return;

  triggerBtn.addEventListener('click', () => {
    // 1. Chips converge
    chips.forEach(chip => chip.classList.add('converging'));
    if (funnelTag) funnelTag.textContent = 'CLUSTERING...';

    // 2. AI calculates merge
    setTimeout(() => {
      if (surgeScore) surgeScore.textContent = '94 (CRITICAL)';
      if (linkedCount) linkedCount.textContent = '50 Citizens Linked';
      if (funnelTag) funnelTag.textContent = '100% MERGED';
      triggerBtn.disabled = true;
      triggerBtn.style.opacity = '0.5';
    }, 600);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      chips.forEach(chip => chip.classList.remove('converging'));
      if (surgeScore) surgeScore.textContent = '42 (SINGLE)';
      if (linkedCount) linkedCount.textContent = '1 Citizen';
      if (funnelTag) funnelTag.textContent = 'VECTOR MATCH';
      triggerBtn.disabled = false;
      triggerBtn.style.opacity = '1';
    });
  }
}

/* ==========================================================================
   6. SMART CITY GIS MAP & HOTSPOTS
   ========================================================================== */
function initCityMap() {
  const hotspots = document.querySelectorAll('.map-hotspot');
  const filterPills = document.querySelectorAll('.filter-pill');

  const insightWard = document.getElementById('insight-ward-title');
  const insightTotal = document.getElementById('insight-total-reports');
  const insightUnresolved = document.getElementById('insight-unresolved-count');
  const insightPriority = document.getElementById('insight-priority-val');
  const insightPrediction = document.getElementById('insight-prediction-text');

  const wardData = {
    water: {
      ward: 'Ward 12 — Drainage & Water Main',
      total: '84 Reports',
      unresolved: '3 Unresolved',
      priority: 'HIGH (94)',
      prediction: 'Recurring issue risk may increase during heavy rainfall. Pipeline pressure exceeds threshold at Station Road junction.'
    },
    roads: {
      ward: 'Sector 4 — Main Arterial Ring Road',
      total: '46 Reports',
      unresolved: '5 Unresolved',
      priority: 'HIGH (81)',
      prediction: 'Asphalt degradation detected across 240m stretch. Heavy vehicle corridor requires immediate milling and patching.'
    },
    waste: {
      ward: 'Ward 18 — Wholesale Market Yard',
      total: '62 Reports',
      unresolved: '2 Unresolved',
      priority: 'MEDIUM (68)',
      prediction: 'Commercial waste generation surges between 4 PM - 7 PM. Recommended deploying auxiliary compactor truck.'
    },
    lights: {
      ward: 'Ward 07 — ABC Chowk Junction',
      total: '50 Reports',
      unresolved: '1 Unresolved',
      priority: 'HIGH (88)',
      prediction: 'Phase line tripping identified on feeder pole 14. 3 adjacent intersections affected; safety hazard at night.'
    }
  };

  hotspots.forEach(spot => {
    spot.addEventListener('click', () => {
      const type = spot.getAttribute('data-type');
      hotspots.forEach(s => s.classList.remove('active'));
      spot.classList.add('active');

      const data = wardData[type];
      if (data) {
        if (insightWard) insightWard.textContent = data.ward;
        if (insightTotal) insightTotal.textContent = data.total;
        if (insightUnresolved) insightUnresolved.textContent = data.unresolved;
        if (insightPriority) insightPriority.textContent = data.priority;
        if (insightPrediction) insightPrediction.textContent = `"${data.prediction}"`;
      }
    });
  });

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');
      hotspots.forEach(spot => {
        const spotType = spot.getAttribute('data-type');
        if (filter === 'all' || filter === spotType) {
          spot.style.display = 'block';
        } else {
          spot.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. REAL-TIME SLA COUNTDOWN TIMERS
   ========================================================================== */
function initSlaTimers() {
  const timers = [
    { id: 'sla-timer-1', seconds: 3 * 3600 + 21 * 60 + 14 },
    { id: 'sla-timer-2', seconds: 18 * 3600 + 42 * 60 + 8 },
    { id: 'sla-timer-3', seconds: 39 * 3600 + 12 * 60 + 45 }
  ];

  setInterval(() => {
    timers.forEach(timer => {
      if (timer.seconds > 0) {
        timer.seconds--;
        const hours = Math.floor(timer.seconds / 3600);
        const mins = Math.floor((timer.seconds % 3600) / 60);
        const secs = timer.seconds % 60;

        const str = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}h`;
        const el = document.getElementById(timer.id);
        if (el) el.textContent = str;
      }
    });
  }, 1000);

  // SLA Escalation Simulation Button
  const simEscalationBtn = document.getElementById('sim-escalate-btn');
  const escalationBanner = document.querySelector('.escalation-banner');

  if (simEscalationBtn && escalationBanner) {
    simEscalationBtn.addEventListener('click', () => {
      escalationBanner.style.backgroundColor = '#FEF2F2';
      escalationBanner.style.borderLeft = '4px solid #DC2626';
      alert('⚠️ LokVaani AI Escalation Triggered:\n\nSLA Deadline breached for Ticket #LK-4091. Automated SMS & Priority Escalation dispatched to Chief Municipal Officer (CMO) and District Urban Governance Desk.');
    });
  }
}

/* ==========================================================================
   8. INTERACTIVE REPORT AN ISSUE MODAL (LIVE AI TRIAGE PROTOTYPE)
   ========================================================================== */
function initIssueReportingModal() {
  const modal = document.getElementById('report-modal');
  const openBtns = document.querySelectorAll('.open-report-modal');
  const closeBtn = document.getElementById('close-report-modal');
  const runAiBtn = document.getElementById('run-ai-triage-btn');
  const complaintInput = document.getElementById('complaint-text-input');
  const triageOutput = document.getElementById('triage-output');
  const presetChips = document.querySelectorAll('.preset-chip');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Presets
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-preset');
      if (complaintInput) complaintInput.value = text;
    });
  });

  // Run AI Triage Simulation
  if (runAiBtn) {
    runAiBtn.addEventListener('click', () => {
      const text = complaintInput ? complaintInput.value.trim() : '';
      if (!text) {
        alert('Please enter or select a sample civic issue description.');
        return;
      }

      runAiBtn.textContent = 'Analyzing with LokVaani AI...';
      runAiBtn.disabled = true;

      setTimeout(() => {
        runAiBtn.textContent = 'Run AI Triage';
        runAiBtn.disabled = false;

        let category = 'Municipal Civil Works';
        let department = 'Public Works Department (PWD)';
        let priority = '82 / 100 (HIGH)';
        let sla = '24 Hours';

        const lower = text.toLowerCase();
        if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak') || lower.includes('drain')) {
          category = 'Water Supply & Sewerage';
          department = 'Municipal Jal Board (Water Dept)';
          priority = '94 / 100 (CRITICAL)';
          sla = '4 Hours';
        } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('trash') || lower.includes('dump')) {
          category = 'Solid Waste Management';
          department = 'Health & Sanitation Division';
          priority = '76 / 100 (MEDIUM)';
          sla = '12 Hours';
        } else if (lower.includes('light') || lower.includes('lamp') || lower.includes('dark') || lower.includes('pole')) {
          category = 'Electrical & Street Lighting';
          department = 'Municipal Lighting Division';
          priority = '86 / 100 (HIGH)';
          sla = '18 Hours';
        }

        const randomTicketId = `LOK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        if (triageOutput) {
          triageOutput.innerHTML = `
            <div style="background: #FFFFFF; border: 1.5px solid var(--royal-blue); border-radius: 8px; padding: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
                <span style="font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 700; color: var(--royal-blue);">${randomTicketId}</span>
                <span style="background: #DCFCE7; color: #15803D; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">AI TRIAGE COMPLETE</span>
              </div>
              <p style="font-size: 13px; margin-bottom: 6px;"><strong>Detected Category:</strong> ${category}</p>
              <p style="font-size: 13px; margin-bottom: 6px;"><strong>Auto-Routed To:</strong> ${department}</p>
              <p style="font-size: 13px; margin-bottom: 6px;"><strong>Calculated Priority:</strong> <span style="color: #DC2626; font-weight: 700;">${priority}</span></p>
              <p style="font-size: 13px; margin-bottom: 6px;"><strong>SLA Target:</strong> ${sla}</p>
              <p style="font-size: 13px; margin-bottom: 12px;"><strong>Duplicate Analysis:</strong> 0 active duplicates detected within 50m radius (Primary Ticket Created).</p>
              <div style="background: #F1F5F9; padding: 10px; border-radius: 6px; font-size: 12px; color: #475569;">
                ✓ Geotagged SMS confirmation sent to citizen.<br>
                ✓ Field Officer dispatched to Ward 12 with work order.
              </div>
            </div>
          `;
          triageOutput.classList.add('show');
        }
      }, 700);
    });
  }
}

/* ==========================================================================
   9. TRACK COMPLAINT MODAL
   ========================================================================== */
function initTrackComplaintModal() {
  const modal = document.getElementById('track-modal');
  const openBtns = document.querySelectorAll('.open-track-modal');
  const closeBtn = document.getElementById('close-track-modal');
  const checkBtn = document.getElementById('check-status-btn');
  const trackResult = document.getElementById('track-result-box');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (checkBtn && trackResult) {
    checkBtn.addEventListener('click', () => {
      trackResult.style.display = 'block';
    });
  }
}

/* ==========================================================================
   10. CITIZEN HELP MODAL
   ========================================================================== */
function initHelpModal() {
  const modal = document.getElementById('help-modal');
  const openBtns = document.querySelectorAll('.open-help-modal');
  const closeBtn = document.getElementById('close-help-modal');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}
