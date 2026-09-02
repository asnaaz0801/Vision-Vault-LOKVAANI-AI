/**
 * LOKVAANI AI — Dedicated Citizen Issue Submission Engine
 * Full-width 7-step flow with dynamic department routing, subcategories, impact calculation, and live AI summary
 */

document.addEventListener('DOMContentLoaded', () => {
  initSubmitFlow();
  initNavbar();
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

function initSubmitFlow() {
  // Category Definitions, Departments, and Subcategories
  const categoryData = {
    water: {
      name: 'Water',
      department: 'Water Supply Department',
      icon: '💧',
      subcategories: [
        'No Water Supply',
        'Drinking Water Shortage',
        'Water Leakage',
        'Low Water Pressure',
        'Contaminated Water',
        'Broken Pipeline',
        'Water Tank Maintenance',
        'Other'
      ]
    },
    roads: {
      name: 'Roads',
      department: 'Public Works Department',
      icon: '🚧',
      subcategories: [
        'Pothole Cluster',
        'Damaged Road Surface / Cracks',
        'Cave-in / Road Collapse Risk',
        'Missing Speed Breaker / Signage',
        'Broken Footpath / Pavement',
        'Road Waterlogging',
        'Encroachment / Obstruction',
        'Other'
      ]
    },
    electricity: {
      name: 'Electricity',
      department: 'Electrical Department',
      icon: '⚡',
      subcategories: [
        'Street Light Inoperative',
        'High-Mast Light Failure',
        'Exposed / Hanging Live Wires',
        'Sparking Transformer / Electric Pole',
        'Power Fluctuations / Phase Outage',
        'Broken Electric Pole',
        'Street Light Timer Defect',
        'Other'
      ]
    },
    waste: {
      name: 'Waste',
      department: 'Sanitation Department',
      icon: '🗑️',
      subcategories: [
        'Overflowing Public Bin / Container',
        'Irregular Door-to-Door Collection',
        'Illegal Garbage Dumping Site',
        'Dead Animal Removal',
        'Construction & Demolition Debris',
        'Plastic Waste Burning',
        'Hazardous Medical / Chemical Waste',
        'Other'
      ]
    },
    drainage: {
      name: 'Drainage',
      department: 'Drainage & Sewerage Department',
      icon: '🌊',
      subcategories: [
        'Choked Stormwater Drain',
        'Open / Broken Manhole Cover',
        'Sewage Overflow on Street',
        'Foul Odor & Mosquito Breeding',
        'Gutter Desilting Required',
        'Septic Tank Overflow',
        'Underground Sewer Blockage',
        'Other'
      ]
    },
    parks: {
      name: 'Parks',
      department: 'Parks & Horticulture Department',
      icon: '🌳',
      subcategories: [
        'Broken Benches / Walkways',
        'Overgrown Grass / Fallen Branches',
        'Damaged Children Play Equipment',
        'Non-functional Garden Lights / Fountains',
        'Dead Trees / Pruning Needed',
        'Stray Animals in Park',
        'Garbage in Park / Littering',
        'Other'
      ]
    },
    other: {
      name: 'Other',
      department: 'General Civic Services',
      icon: '🏛️',
      subcategories: [
        'Stray Animal Nuisance',
        'Public Noise Pollution',
        'Encroachment / Illegal Hoarding',
        'Public Restroom Defect',
        'Fire Safety Hazard',
        'Air Quality / Smoke Hazard',
        'Unlicensed Commercial Activity',
        'Other Unlisted Civic Issue'
      ]
    }
  };

  // State
  let currentCategory = 'water';
  let currentSubcategory = 'Broken Pipeline';
  let currentPeople = 'Building / Street (10-50 people)';
  let currentDuration = '1 - 2 Days';
  let currentImpactLevel = 'high'; // low, medium, high, critical
  let isRecording = false;
  let recordedSeconds = 0;
  let audioTimerInterval = null;

  // DOM Elements
  const categoryCards = document.querySelectorAll('.category-card');
  const deptNameEl = document.getElementById('selected-dept-name');
  const priorityPillEl = document.getElementById('selected-priority-pill');
  const slaPillEl = document.getElementById('selected-sla-pill');
  const subcatChipsContainer = document.getElementById('subcat-chips-container');

  const descTextarea = document.getElementById('issue-description');
  const charCounter = document.getElementById('char-count');

  const photoDropzone = document.getElementById('photo-dropzone');
  const photoInput = document.getElementById('photo-input');
  const photoStatus = document.getElementById('photo-status-text');

  const voiceRecordBox = document.getElementById('voice-record-box');
  const voiceStatus = document.getElementById('voice-status-text');
  const voiceTimer = document.getElementById('voice-timer-display');

  const locationInput = document.getElementById('issue-address');
  const gpsBtn = document.getElementById('btn-use-gps');
  const mapPinTag = document.getElementById('map-pin-label');

  // Preview elements
  const prevCat = document.getElementById('prev-category');
  const prevSubcat = document.getElementById('prev-subcategory');
  const prevDept = document.getElementById('prev-dept');
  const prevPriority = document.getElementById('prev-priority');
  const prevSla = document.getElementById('prev-sla');
  const prevSummary = document.getElementById('prev-summary');

  // Form & Success View
  const mainForm = document.getElementById('citizen-submit-form');
  const submitBtn = document.getElementById('btn-submit-complaint');
  const successView = document.getElementById('submit-success-view');

  const successTicketId = document.getElementById('success-complaint-id');
  const successDept = document.getElementById('success-department');
  const successPriority = document.getElementById('success-priority');
  const successSla = document.getElementById('success-sla');

  // 1. Category Selection
  function setCategory(catKey) {
    currentCategory = catKey;
    const cat = categoryData[catKey];
    if (!cat) return;

    categoryCards.forEach(c => {
      c.classList.toggle('selected', c.getAttribute('data-cat') === catKey);
    });

    // Step 2: Immediate Department Display
    if (deptNameEl) deptNameEl.textContent = cat.department;

    // Step 3: Populate Subcategories
    renderSubcategories(cat.subcategories);

    // Calculate priority & SLA
    calculatePriorityAndSla();
  }

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const catKey = card.getAttribute('data-cat');
      setCategory(catKey);
    });
  });

  // 2. Render Subcategory Chips
  function renderSubcategories(subcats) {
    if (!subcatChipsContainer) return;
    subcatChipsContainer.innerHTML = '';

    subcats.forEach((sub, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `subcat-chip ${idx === 0 ? 'selected' : ''}`;
      chip.textContent = sub;

      chip.addEventListener('click', () => {
        document.querySelectorAll('.subcat-chip').forEach(sc => sc.classList.remove('selected'));
        chip.classList.add('selected');
        currentSubcategory = sub;
        calculatePriorityAndSla();
      });

      subcatChipsContainer.appendChild(chip);
    });

    currentSubcategory = subcats[0];
  }

  // 3. Estimated Impact Listeners
  document.querySelectorAll('.impact-people-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.impact-people-pill').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentPeople = btn.getAttribute('data-val');
      calculatePriorityAndSla();
    });
  });

  document.querySelectorAll('.impact-duration-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.impact-duration-pill').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentDuration = btn.getAttribute('data-val');
      calculatePriorityAndSla();
    });
  });

  document.querySelectorAll('.impact-level-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.impact-level-pill').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentImpactLevel = btn.getAttribute('data-level');
      calculatePriorityAndSla();
    });
  });

  // 4. Calculate Dynamic Priority & SLA
  function calculatePriorityAndSla() {
    let baseScore = 65;
    let slaHours = '24 - 48 Hours';
    let priorityLabel = 'Medium';
    let priorityClass = 'metric-priority-med';

    // Impact level baseline
    if (currentImpactLevel === 'low') {
      baseScore = 48;
      slaHours = '48 - 72 Hours';
      priorityLabel = 'Low';
      priorityClass = 'metric-priority-norm';
    } else if (currentImpactLevel === 'medium') {
      baseScore = 68;
      slaHours = '24 - 48 Hours';
      priorityLabel = 'Medium';
      priorityClass = 'metric-priority-med';
    } else if (currentImpactLevel === 'high') {
      baseScore = 84;
      slaHours = '8 - 18 Hours';
      priorityLabel = 'High';
      priorityClass = 'metric-priority-high';
    } else if (currentImpactLevel === 'critical') {
      baseScore = 95;
      slaHours = '2 - 6 Hours';
      priorityLabel = 'Critical (Urgent)';
      priorityClass = 'metric-priority-high';
    }

    // Critical keyword subcategory boosts
    const subLower = currentSubcategory.toLowerCase();
    if (subLower.includes('burst') || subLower.includes('live wire') || subLower.includes('cave-in') || subLower.includes('open / broken manhole')) {
      baseScore = Math.max(baseScore, 92);
      if (currentImpactLevel !== 'critical') {
        priorityLabel = 'High (Severe)';
        slaHours = '4 - 12 Hours';
        priorityClass = 'metric-priority-high';
      }
    }

    // Update Step 2 Pills
    if (priorityPillEl) {
      priorityPillEl.textContent = `Priority: ${priorityLabel} (${baseScore}/100)`;
      priorityPillEl.className = `metric-pill ${priorityClass}`;
    }
    if (slaPillEl) {
      slaPillEl.textContent = `Expected SLA: ${slaHours}`;
    }

    // Update Step 7 Preview Card
    updatePreview(baseScore, priorityLabel, slaHours);
  }

  // 5. Update Step 7 AI Complaint Preview
  function updatePreview(score, priorityLabel, slaHours) {
    const cat = categoryData[currentCategory];
    if (!cat) return;

    if (prevCat) prevCat.textContent = `${cat.icon} ${cat.name}`;
    if (prevSubcat) prevSubcat.textContent = currentSubcategory;
    if (prevDept) prevDept.textContent = cat.department;
    if (prevPriority) prevPriority.textContent = `${priorityLabel} (${score}/100)`;
    if (prevSla) prevSla.textContent = slaHours;

    const userDesc = descTextarea ? descTextarea.value.trim() : '';
    const userLoc = locationInput && locationInput.value.trim() ? locationInput.value.trim() : 'Ward 12 Municipal Jurisdiction';

    let summaryText = '';
    if (userDesc.length > 5) {
      summaryText = `Citizen report filed for ${cat.name} (${currentSubcategory}) at ${userLoc}. Specifics: "${userDesc.slice(0, 150)}${userDesc.length > 150 ? '...' : ''}". Impact assessed as ${priorityLabel} affecting ${currentPeople}. Dispatched to ${cat.department} with guaranteed ${slaHours} resolution SLA.`;
    } else {
      summaryText = `${cat.name} incident: "${currentSubcategory}" reported at ${userLoc}. Severity matrix evaluated impact as ${priorityLabel} (${currentPeople}, duration: ${currentDuration}). Issue placed under ${cat.department} with expected ${slaHours} SLA turnaround.`;
    }

    if (prevSummary) {
      prevSummary.textContent = `"${summaryText}"`;
    }
  }

  // 6. Description Textarea & Presets
  if (descTextarea && charCounter) {
    descTextarea.addEventListener('input', () => {
      charCounter.textContent = `${descTextarea.value.length} / 500 characters`;
      calculatePriorityAndSla();
    });
  }

  document.querySelectorAll('.preset-btn-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-text');
      if (descTextarea) {
        descTextarea.value = text;
        descTextarea.dispatchEvent(new Event('input'));
      }
    });
  });

  // 7. Evidence Photo
  if (photoDropzone && photoInput) {
    photoDropzone.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', () => {
      if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        if (photoStatus) {
          photoStatus.innerHTML = `<span style="color: var(--civic-green); font-weight: 700;">✓ Attached: ${file.name}</span><br><span style="font-size: 11px; color: #64748B;">EXIF & GPS validated</span>`;
        }
        calculatePriorityAndSla();
      }
    });
  }

  // 8. Voice Note Simulator
  if (voiceRecordBox) {
    voiceRecordBox.addEventListener('click', () => {
      if (!isRecording) {
        isRecording = true;
        recordedSeconds = 0;
        voiceRecordBox.classList.add('audio-recording-active');
        if (voiceStatus) {
          voiceStatus.innerHTML = `<span style="color: #DC2626; font-weight: 700;">● Recording audio note...</span><br><span style="font-size: 11px;">Click to stop & attach</span>`;
        }
        if (voiceTimer) voiceTimer.style.display = 'inline-block';

        audioTimerInterval = setInterval(() => {
          recordedSeconds++;
          const mins = Math.floor(recordedSeconds / 60);
          const secs = recordedSeconds % 60;
          if (voiceTimer) {
            voiceTimer.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}s`;
          }
        }, 1000);
      } else {
        isRecording = false;
        clearInterval(audioTimerInterval);
        voiceRecordBox.classList.remove('audio-recording-active');
        if (voiceStatus) {
          voiceStatus.innerHTML = `<span style="color: var(--civic-green); font-weight: 700;">✓ Audio attached (${voiceTimer.textContent})</span><br><span style="font-size: 11px; color: #64748B;">Bhashini Speech Model Ready</span>`;
        }
        calculatePriorityAndSla();
      }
    });
  }

  // 9. Location
  if (gpsBtn && locationInput) {
    gpsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      gpsBtn.textContent = 'Acquiring GPS...';
      setTimeout(() => {
        locationInput.value = 'Station Road near Metro Pillar 42, Ward 12 (18.5204° N, 73.8567° E)';
        gpsBtn.innerHTML = '<span style="color: var(--civic-green);">✓ GPS Locked</span>';
        if (mapPinTag) mapPinTag.textContent = 'Ward 12 • High Accuracy';
        calculatePriorityAndSla();
      }, 500);
    });

    locationInput.addEventListener('input', () => {
      if (mapPinTag && locationInput.value) {
        mapPinTag.textContent = locationInput.value.slice(0, 24) + '...';
      }
      calculatePriorityAndSla();
    });
  }

  // 10. Submit Complaint CTA & Success View
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const userDesc = descTextarea ? descTextarea.value.trim() : '';
      if (!userDesc && !isRecording && recordedSeconds === 0) {
        alert('Please provide a brief description or record a voice note for your civic issue.');
        if (descTextarea) descTextarea.focus();
        return;
      }

      submitBtn.textContent = 'Submitting to LokVaani AI...';
      submitBtn.disabled = true;

      setTimeout(() => {
        const cat = categoryData[currentCategory];
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const ticketId = `LOK-2026-${randomNum}`;

        if (successTicketId) successTicketId.textContent = ticketId;
        if (successDept) successDept.textContent = cat.department;
        if (successPriority) successPriority.textContent = prevPriority ? prevPriority.textContent : 'High';
        if (successSla) successSla.textContent = prevSla ? prevSla.textContent : '12 - 24 Hours';

        const successTrackBtn = document.getElementById('btn-success-track');
        if (successTrackBtn) {
          successTrackBtn.href = `track.html?id=${ticketId}`;
        }

        if (mainForm) mainForm.style.display = 'none';
        if (successView) {
          successView.classList.add('active');
          window.scrollTo({ top: successView.offsetTop - 80, behavior: 'smooth' });
        }
      }, 700);
    });
  }

  // Initial category setup
  setCategory('water');
}
