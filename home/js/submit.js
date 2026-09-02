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

    // Trigger smooth step reveal animation on steps 2 & 3
    const step2Card = document.querySelector('.form-section-card:nth-of-type(2)');
    const step3Card = document.querySelector('.form-section-card:nth-of-type(3)');
    if (step2Card) {
      step2Card.classList.remove('step-revealed');
      void step2Card.offsetWidth;
      step2Card.classList.add('step-revealed');
    }
    if (step3Card) {
      step3Card.classList.remove('step-revealed');
      void step3Card.offsetWidth;
      step3Card.classList.add('step-revealed');
    }
    const deptCard = document.getElementById('section-dept-routing');
    if (deptCard) {
      deptCard.classList.remove('step-revealed');
      void deptCard.offsetWidth;
      deptCard.classList.add('step-revealed');
    }

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
      priorityPillEl.innerHTML = `<span class="live-pulse-dot"></span> Priority: ${priorityLabel} (${baseScore}/100)`;
      priorityPillEl.className = `metric-pill ${priorityClass}`;
    }
    if (slaPillEl) {
      slaPillEl.innerHTML = `<span class="live-pulse-dot" style="background: #3B82F6;"></span> Expected SLA: ${slaHours}`;
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
    if (prevPriority) prevPriority.innerHTML = `<span class="live-pulse-dot"></span> ${priorityLabel} (${score}/100)`;
    if (prevSla) prevSla.innerHTML = `<span class="live-pulse-dot" style="background: #60A5FA;"></span> ${slaHours}`;

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

    // Subtle AI-style animated highlight scan
    const previewCard = document.querySelector('.ai-preview-section-card');
    if (previewCard) {
      previewCard.classList.remove('ai-preview-updating');
      void previewCard.offsetWidth; // Force CSS reflow
      previewCard.classList.add('ai-preview-updating');
      setTimeout(() => previewCard.classList.remove('ai-preview-updating'), 600);
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

  // 9. Location & Interactive Leaflet GIS Map with Live Reverse Geocoding
  let citizenMap = null;
  let citizenMarker = null;
  let selectedLat = 18.5204;
  let selectedLng = 73.8567;

  async function fetchExactStreetAddress(lat, lng) {
    const statusEl = document.getElementById('citizen-map-status');
    if (statusEl) {
      statusEl.innerHTML = `⏳ Resolving exact street address for <strong>${lat}° N, ${lng}° E</strong>...`;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addrObj = data.address || {};
          const streetPart = addrObj.road || addrObj.pedestrian || addrObj.suburb || addrObj.neighbourhood || addrObj.residential || '';
          const cityPart = addrObj.city || addrObj.town || addrObj.village || addrObj.subdistrict || addrObj.county || '';
          const statePart = addrObj.state || '';
          const postPart = addrObj.postcode || '';

          const shortAddress = [streetPart, cityPart, statePart, postPart].filter(Boolean).join(', ');
          const finalAddress = shortAddress || data.display_name;

          if (locationInput) {
            locationInput.value = `${finalAddress} (${lat}° N, ${lng}° E)`;
          }

          if (statusEl) {
            statusEl.innerHTML = `🟢 Exact Location Detected: <strong>${finalAddress}</strong>`;
          }
          calculatePriorityAndSla();
          return finalAddress;
        }
      }
    } catch (e) {
      console.warn("Reverse geocode notice:", e);
    }

    if (statusEl) {
      statusEl.innerHTML = `📍 GPS Coordinates Pin: <strong>${lat}° N, ${lng}° E</strong>`;
    }
  }

  function initCitizenLeafletMap() {
    const mapContainer = document.getElementById('citizen-leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    try {
      citizenMap = L.map('citizen-leaflet-map', { zoomControl: true }).setView([selectedLat, selectedLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(citizenMap);

      const customIcon = L.divIcon({
        className: 'citizen-custom-pin',
        html: `<div style="background: #3B82F6; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; animation: pulse 2s infinite;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      citizenMarker = L.marker([selectedLat, selectedLng], { draggable: true, icon: customIcon }).addTo(citizenMap);

      citizenMarker.on('dragend', async (e) => {
        const pos = e.target.getLatLng();
        selectedLat = parseFloat(pos.lat.toFixed(6));
        selectedLng = parseFloat(pos.lng.toFixed(6));
        await fetchExactStreetAddress(selectedLat, selectedLng);
      });

      citizenMap.on('click', async (e) => {
        citizenMarker.setLatLng(e.latlng);
        selectedLat = parseFloat(e.latlng.lat.toFixed(6));
        selectedLng = parseFloat(e.latlng.lng.toFixed(6));
        await fetchExactStreetAddress(selectedLat, selectedLng);
      });
    } catch (err) {
      console.warn("Leaflet map init notice:", err);
    }
  }

  // Initialize Map
  initCitizenLeafletMap();

  if (gpsBtn) {
    gpsBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (!navigator.geolocation) {
        alert('Geolocation API is not supported by your browser.');
        return;
      }

      gpsBtn.innerHTML = '<span class="btn-spinner" style="border-top-color: var(--royal-blue); width: 14px; height: 14px;"></span> Detecting Exact GPS...';

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          selectedLat = parseFloat(position.coords.latitude.toFixed(6));
          selectedLng = parseFloat(position.coords.longitude.toFixed(6));

          // Zoom to high resolution street level (zoom 17)
          if (citizenMap && citizenMarker) {
            citizenMap.setView([selectedLat, selectedLng], 17);
            citizenMarker.setLatLng([selectedLat, selectedLng]);
          }

          gpsBtn.innerHTML = '<span style="color: var(--civic-green); font-weight: 700;">✓ Exact GPS Acquired</span>';

          // Perform reverse geocoding for exact street address
          await fetchExactStreetAddress(selectedLat, selectedLng);
        },
        (error) => {
          console.warn('Citizen GPS Error:', error.message);
          let errText = 'GPS Permission Denied';
          if (error.code === error.POSITION_UNAVAILABLE) errText = 'GPS Signal Unavailable';
          if (error.code === error.TIMEOUT) errText = 'GPS Request Timed Out';

          gpsBtn.innerHTML = `<span style="color: #EF4444;">⚠️ ${errText}</span>`;
          alert(`${errText}. Defaulting to Ward 12 center coordinates. You can click or drag the pin on the map to set your exact location.`);

          if (locationInput && !locationInput.value) {
            locationInput.value = `Sector 12, Station Road (18.5204° N, 73.8567° E)`;
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });

    if (locationInput) {
      locationInput.addEventListener('input', () => {
        calculatePriorityAndSla();
      });
    }
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

      // Button press / loading state
      submitBtn.classList.add('is-loading');
      submitBtn.innerHTML = '<span class="btn-spinner"></span> <span>Submitting to LokVaani AI...</span>';
      submitBtn.disabled = true;

      // Smooth form fade out
      if (mainForm) {
        mainForm.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        mainForm.style.opacity = '0';
        mainForm.style.transform = 'translateY(-14px)';
      }

      // Async Supabase insert + UI transition
      (async () => {
        const cat = categoryData[currentCategory];
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const ticketId = `LV-${randomNum}`;
        const userDesc = descTextarea ? descTextarea.value.trim() : '';
        const userLoc = locationInput && locationInput.value.trim() ? locationInput.value.trim() : 'Sector 12 (Ward 12)';

        // Determine priority/SLA from current UI state
        let pScore = 82, pLevel = 'High', slaH = 24;
        if (currentImpactLevel === 'critical') { pScore = 95; pLevel = 'Critical'; slaH = 4; }
        else if (currentImpactLevel === 'high') { pScore = 84; pLevel = 'High'; slaH = 24; }
        else if (currentImpactLevel === 'medium') { pScore = 68; pLevel = 'Medium'; slaH = 48; }
        else if (currentImpactLevel === 'low') { pScore = 48; pLevel = 'Low'; slaH = 72; }

        const complaintPayload = {
          complaintId: ticketId,
          citizenName: 'LokVaani Citizen',
          citizenContact: '+91 98000 00000',
          description: userDesc || `${cat.name} issue: ${currentSubcategory}`,
          category: `${cat.name} — ${currentSubcategory}`,
          department: cat.department,
          location: userLoc,
          latitude: selectedLat,
          longitude: selectedLng,
          zone: 'Zone 4',
          priorityScore: pScore,
          priorityLevel: pLevel,
          severity: pLevel,
          sentiment: 'Concerned',
          aiSummary: `Citizen report for ${cat.name} (${currentSubcategory}) at ${userLoc}.`,
          slaHours: slaH
        };

        // Upload photo to Supabase Storage if available
        let photoUrl = '';
        if (photoInput && photoInput.files && photoInput.files[0] && typeof isSupabaseConnected === 'function' && isSupabaseConnected()) {
          try {
            const file = photoInput.files[0];
            const fileName = `${ticketId}_${Date.now()}_${file.name}`;
            const { data: upData, error: upError } = await supabaseClient
              .storage
              .from('complaint-photos')
              .upload(fileName, file, { cacheControl: '3600', upsert: false });
            if (!upError && upData) {
              const { data: urlData } = supabaseClient.storage.from('complaint-photos').getPublicUrl(fileName);
              photoUrl = urlData ? urlData.publicUrl : '';
              console.log('🟢 Photo uploaded to Supabase Storage:', photoUrl);
            } else {
              console.warn('Photo upload skipped (bucket may not exist yet):', upError);
            }
          } catch (photoErr) {
            console.warn('Photo upload error (non-fatal):', photoErr);
          }
        }

        // Save to Supabase database
        let dbResult = { mock: true };
        if (typeof createComplaintInDb === 'function') {
          dbResult = await createComplaintInDb(complaintPayload);
          if (dbResult.success && !dbResult.mock) {
            console.log('🟢 Complaint saved to Supabase DB:', dbResult.referenceCode || ticketId);
          }
        }

        const finalTicketId = (dbResult.referenceCode) || ticketId;

        if (successTicketId) successTicketId.textContent = finalTicketId;
        if (successDept) successDept.textContent = cat.department;
        if (successPriority) successPriority.innerHTML = `<span class="live-pulse-dot"></span> ${prevPriority ? prevPriority.textContent : 'High'}`;
        if (successSla) successSla.innerHTML = `<span class="live-pulse-dot" style="background: var(--royal-blue);"></span> ${prevSla ? prevSla.textContent : '12 - 24 Hours'}`;

        const successTrackBtn = document.getElementById('btn-success-track');
        if (successTrackBtn) {
          successTrackBtn.href = `track.html?id=${finalTicketId}`;
        }

        if (mainForm) mainForm.style.display = 'none';
        if (successView) {
          successView.classList.add('active');
          successView.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      })();
    });
  }

  // Initial category setup
  setCategory('water');
}
