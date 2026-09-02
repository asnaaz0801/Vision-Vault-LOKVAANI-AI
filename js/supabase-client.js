/**
 * LokVaani AI — Centralized Supabase Client & Data Access Layer
 * Supports Live Supabase PostgreSQL Connection with Seamless Mock Data Fallback
 */

let supabaseClient = null;

/**
 * Initialize Supabase Client dynamically from window.SUPABASE_URL and window.SUPABASE_PUBLISHABLE_KEY
 */
function initSupabaseClient() {
  const url = typeof window !== 'undefined' && window.SUPABASE_URL ? window.SUPABASE_URL.trim() : "";
  const key = typeof window !== 'undefined' && window.SUPABASE_PUBLISHABLE_KEY ? window.SUPABASE_PUBLISHABLE_KEY.trim() : "";

  if (typeof window !== 'undefined' && window.supabase && url && key && url.startsWith('http')) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      console.log("🟢 LokVaani AI: Supabase client connected successfully to", url);
    } catch (err) {
      console.warn("⚠️ LokVaani AI: Supabase client initialization deferred. Fallback to mock mode.", err);
    }
  } else {
    console.log("ℹ️ LokVaani AI: Running in Local Mock Mode. Add SUPABASE_URL & SUPABASE_PUBLISHABLE_KEY to root .env for live sync.");
  }
}

/**
 * Check if Supabase live connection is active
 */
function isSupabaseConnected() {
  return supabaseClient !== null;
}

/**
 * FETCH COMPLAINTS (SUPABASE + LOCAL STORAGE + MOCK)
 */
async function getComplaintsFromDb() {
  let dbMapped = [];
  let fetchedFromDb = false;

  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbMapped = data.map(c => ({
          complaintId: c.reference_code,
          dbId: c.id,
          citizenName: c.citizen_name,
          citizenContact: c.citizen_contact,
          description: c.description,
          category: c.category,
          department: c.department_id || (c.category && c.category.includes('Water') ? 'Water Supply Department' : 'Public Works Department'),
          location: c.location_name,
          gisCoordinates: `${c.latitude}° N, ${c.longitude}° E`,
          priorityScore: c.priority_score,
          priorityLevel: c.priority_level,
          severity: c.severity,
          sentiment: c.sentiment,
          aiSummary: c.ai_summary,
          priorityReasons: c.priority_reasons || [{ label: "Public report received", points: 25 }],
          slaHours: c.sla_hours || 24,
          slaRemainingSeconds: (c.sla_hours || 24) * 3600,
          slaState: c.sla_state || "ON TRACK",
          status: c.status || "Assigned",
          assignedOfficer: c.assigned_officer_id || "Er. Rajesh Kumar",
          createdAt: c.created_at ? new Date(c.created_at).toLocaleString() : "Today",
          updatedAt: c.updated_at ? new Date(c.updated_at).toLocaleString() : "Today",
          resolutionNote: c.resolution_note || "",
          resolutionProof: c.resolution_proof_url || "",
          relatedComplaints: []
        }));
        fetchedFromDb = true;
      }
    } catch (err) {
      console.warn("Supabase complaints query fallback:", err);
    }
  }

  // Load complaints submitted via browser form and saved in localStorage
  let localSubmitted = [];
  try {
    localSubmitted = JSON.parse(localStorage.getItem('lokvaani_submitted_complaints') || '[]');
  } catch (e) {}

  // Baseline mock complaints with parsed lat/lng coordinates
  const rawBaseline = typeof INITIAL_COMPLAINTS !== 'undefined' ? INITIAL_COMPLAINTS : [];
  const mockBaseline = rawBaseline.map((c, i) => {
    let lat = c.latitude;
    let lng = c.longitude;

    if (!lat || !lng) {
      if (c.gisCoordinates && c.gisCoordinates.includes(',')) {
        const parts = c.gisCoordinates.split(',');
        lat = parseFloat(parts[0].replace(/[^\d.]/g, ''));
        lng = parseFloat(parts[1].replace(/[^\d.]/g, ''));
      }
    }

    return {
      ...c,
      latitude: typeof lat === 'number' && !isNaN(lat) ? lat : (18.5204 + (i * 0.004 - 0.010)),
      longitude: typeof lng === 'number' && !isNaN(lng) ? lng : (73.8567 + (i * 0.005 - 0.012))
    };
  });

  // Merge order: Local Submitted (newest) -> Supabase DB -> Mock Baseline (deduplicated by complaintId)
  const combined = [];
  const seenIds = new Set();

  [...localSubmitted, ...dbMapped, ...mockBaseline].forEach(item => {
    if (item && item.complaintId && !seenIds.has(item.complaintId)) {
      seenIds.add(item.complaintId);
      combined.push(item);
    }
  });

  return { success: true, data: combined, source: fetchedFromDb ? 'supabase' : 'local' };
}

/**
 * CREATE NEW COMPLAINT (CITIZEN PORTAL)
 */
async function createComplaintInDb(complaint) {
  const refCode = complaint.complaintId || `LV-${Math.floor(10000 + Math.random() * 90000)}`;

  const formattedComplaint = {
    complaintId: refCode,
    citizenName: complaint.citizenName || "LokVaani Citizen",
    citizenContact: complaint.citizenContact || "+91 98000 00000",
    description: complaint.description || complaint.text || "Civic Issue",
    category: complaint.category || "Municipal Grievance",
    department: complaint.department || "Water Supply Department",
    location: complaint.location || "Sector 12 (Ward 12)",
    gisCoordinates: complaint.gisCoordinates || `${complaint.latitude || 18.5204}° N, ${complaint.longitude || 73.8567}° E`,
    priorityScore: complaint.priorityScore || 82,
    priorityLevel: complaint.priorityLevel || "High",
    severity: complaint.severity || complaint.priorityLevel || "High",
    sentiment: complaint.sentiment || "Concerned",
    aiSummary: complaint.aiSummary || `Citizen grievance report submitted at ${complaint.location || 'Ward 12'}.`,
    priorityReasons: complaint.priorityReasons || [
      { label: "Public grievance submitted by citizen", points: 30 },
      { label: "Location & Ward boundaries verified", points: 25 },
      { label: "Assigned default resolution SLA", points: 20 }
    ],
    slaHours: complaint.slaHours || 24,
    slaRemainingSeconds: (complaint.slaHours || 24) * 3600,
    slaState: complaint.slaState || "ON TRACK",
    status: complaint.status || "Assigned",
    assignedOfficer: complaint.assignedOfficer || "Er. Rajesh Kumar",
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    updatedAt: "Just now",
    resolutionNote: "",
    resolutionProof: "",
    relatedComplaints: []
  };

  // Always save to localStorage immediately for instant cross-portal access
  try {
    const localList = JSON.parse(localStorage.getItem('lokvaani_submitted_complaints') || '[]');
    const existsIndex = localList.findIndex(c => c.complaintId === refCode);
    if (existsIndex >= 0) {
      localList[existsIndex] = formattedComplaint;
    } else {
      localList.unshift(formattedComplaint);
    }
    localStorage.setItem('lokvaani_submitted_complaints', JSON.stringify(localList));
    console.log("🟢 Saved complaint to localStorage:", refCode);
  } catch (e) {
    console.warn("localStorage write error:", e);
  }

  // Attempt live Supabase database insert
  if (isSupabaseConnected()) {
    try {
      const payload = {
        reference_code: refCode,
        citizen_name: formattedComplaint.citizenName,
        citizen_contact: formattedComplaint.citizenContact,
        description: formattedComplaint.description,
        category: formattedComplaint.category,
        location_name: formattedComplaint.location,
        latitude: complaint.latitude || 18.5204,
        longitude: complaint.longitude || 73.8567,
        zone: complaint.zone || "Zone 4",
        priority_score: formattedComplaint.priorityScore,
        priority_level: formattedComplaint.priorityLevel,
        severity: formattedComplaint.severity,
        sentiment: formattedComplaint.sentiment,
        ai_summary: formattedComplaint.aiSummary,
        sla_hours: formattedComplaint.slaHours,
        sla_deadline: new Date(Date.now() + formattedComplaint.slaHours * 3600 * 1000).toISOString(),
        sla_state: formattedComplaint.slaState,
        status: formattedComplaint.status
      };

      const { data, error } = await supabaseClient
        .from('complaints')
        .insert([payload])
        .select();

      if (!error && data && data.length > 0) {
        console.log("🟢 Complaint saved to Supabase DB:", data[0].reference_code);
        return { success: true, data: data[0], referenceCode: data[0].reference_code };
      } else if (error) {
        console.warn("Supabase insert notice (using local storage backup):", error.message);
      }
    } catch (err) {
      console.warn("Failed to insert complaint into Supabase:", err);
    }
  }

  return { success: true, referenceCode: refCode, mock: true };
}

/**
 * UPDATE COMPLAINT STATUS / OFFICER (OFFICER & ADMIN ACTIONS)
 */
async function updateComplaintInDb(refCode, updates) {
  // Always update localStorage immediately for instant cross-portal status sync
  try {
    const localList = JSON.parse(localStorage.getItem('lokvaani_submitted_complaints') || '[]');
    const target = localList.find(c => c.complaintId === refCode || c.referenceCode === refCode || c.id === refCode);
    if (target) {
      if (updates.status) target.status = updates.status;
      if (updates.slaState) target.slaState = updates.slaState;
      if (updates.resolutionNote) target.resolutionNote = updates.resolutionNote;
      if (updates.resolutionProof) target.resolutionProof = updates.resolutionProof;
      if (updates.assignedOfficer) target.assignedOfficer = updates.assignedOfficer;
      target.updatedAt = 'Just now (Status Updated)';
      localStorage.setItem('lokvaani_submitted_complaints', JSON.stringify(localList));
      console.log('🟢 Updated complaint status in localStorage:', refCode, updates);
    }
  } catch (e) {
    console.warn("localStorage update error:", e);
  }

  if (isSupabaseConnected()) {
    try {
      const dbUpdates = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.slaState) dbUpdates.sla_state = updates.slaState;
      if (updates.resolutionNote) dbUpdates.resolution_note = updates.resolutionNote;
      if (updates.resolutionProof) dbUpdates.resolution_proof_url = updates.resolutionProof;
      if (updates.assignedOfficerId) dbUpdates.assigned_officer_id = updates.assignedOfficerId;

      const { data, error } = await supabaseClient
        .from('complaints')
        .update(dbUpdates)
        .eq('reference_code', refCode)
        .select();

      if (!error) {
        console.log(`🟢 Complaint ${refCode} updated in Supabase:`, dbUpdates);
        return { success: true, data };
      }
    } catch (err) {
      console.warn("Failed to update complaint in Supabase:", err);
    }
  }
  return { success: true, mock: true };
}

/**
 * FETCH ESCALATIONS (ADMIN PORTAL)
 */
async function getEscalationsFromDb() {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient
        .from('escalations')
        .select('*, complaints(reference_code, description, location_name, priority_score, priority_level)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(e => ({
          escalationId: e.escalation_code,
          dbId: e.id,
          complaintId: e.complaints ? e.complaints.reference_code : "LV-10482",
          citizenName: "Sunita Verma & 6 Residents",
          description: e.reason || (e.complaints ? e.complaints.description : "SLA breach escalated"),
          category: "Water Supply Outage",
          department: "Water Supply",
          officer: "Rajesh Kumar",
          location: e.complaints ? e.complaints.location_name : "Sector 12, Station Road (Ward 12)",
          priorityScore: e.priority_score,
          priorityLevel: e.priority_level,
          slaHours: 4,
          breachDuration: e.breach_duration || "1h 13m OVERDUE",
          escalationLevel: e.escalation_level,
          reason: e.reason,
          status: e.status,
          aiRecommendation: e.ai_recommendation,
          citizenImpact: e.citizen_impact || "High Impact"
        }));
        return { success: true, data: mapped, source: 'supabase' };
      }
    } catch (err) {
      console.warn("Supabase escalations fallback:", err);
    }
  }
  return { success: true, data: typeof INITIAL_ESCALATIONS !== 'undefined' ? INITIAL_ESCALATIONS : [], source: 'mock' };
}

/**
 * UPDATE ESCALATION (REASSIGNMENT / RESOLUTION)
 */
async function updateEscalationInDb(escCode, updates) {
  if (isSupabaseConnected()) {
    try {
      const dbUpdates = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.aiRecommendation) dbUpdates.ai_recommendation = updates.aiRecommendation;

      const { data, error } = await supabaseClient
        .from('escalations')
        .update(dbUpdates)
        .eq('escalation_code', escCode)
        .select();

      if (!error) {
        console.log(`🟢 Escalation ${escCode} updated in Supabase:`, dbUpdates);
        return { success: true, data };
      }
    } catch (err) {
      console.warn("Failed to update escalation in Supabase:", err);
    }
  }
  return { success: true, mock: true };
}

/**
 * FETCH OFFICERS
 */
async function getOfficersFromDb() {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient
        .from('officers')
        .select('*');

      if (!error && data && data.length > 0) {
        const mapped = data.map(o => ({
          id: o.officer_code,
          dbId: o.id,
          name: o.name,
          title: o.title,
          department: "Water Supply Department",
          zone: o.zone,
          activeCases: o.active_cases_count,
          resolved: o.resolved_cases_count,
          slaCompliance: o.sla_compliance_pct,
          status: o.authorization_status === 'Active' ? 'Excellent' : o.authorization_status,
          email: o.email
        }));
        return { success: true, data: mapped, source: 'supabase' };
      }
    } catch (err) {
      console.warn("Supabase officers fallback:", err);
    }
  }
  return { success: true, data: typeof INITIAL_OFFICERS !== 'undefined' ? INITIAL_OFFICERS : [], source: 'mock' };
}

/**
 * UPDATE OFFICER AUTHORIZATION STATUS
 */
async function updateOfficerInDb(officerCode, updates) {
  if (isSupabaseConnected()) {
    try {
      const dbUpdates = {};
      if (updates.authorizationStatus) dbUpdates.authorization_status = updates.authorizationStatus;

      const { data, error } = await supabaseClient
        .from('officers')
        .update(dbUpdates)
        .eq('officer_code', officerCode)
        .select();

      if (!error) {
        console.log(`🟢 Officer ${officerCode} updated in Supabase:`, dbUpdates);
        return { success: true, data };
      }
    } catch (err) {
      console.warn("Failed to update officer in Supabase:", err);
    }
  }
  return { success: true, mock: true };
}

/**
 * FETCH AUDIT LOGS & CREATE LOG
 */
async function getAuditLogsFromDb() {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(l => ({
          timestamp: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: l.actor_name,
          role: l.role,
          action: l.action,
          complaintId: l.target_id || "N/A",
          department: l.department || "General Governance",
          result: l.result
        }));
        return { success: true, data: mapped, source: 'supabase' };
      }
    } catch (err) {
      console.warn("Supabase audit logs fallback:", err);
    }
  }
  return { success: true, data: typeof INITIAL_AUDIT_LOGS !== 'undefined' ? INITIAL_AUDIT_LOGS : [], source: 'mock' };
}

async function createAuditLogRecord(actor, role, action, targetId, department, result, details = {}) {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient
        .from('audit_logs')
        .insert([{
          actor_name: actor,
          role: role,
          action: action,
          target_id: targetId,
          department: department,
          result: result,
          details: details
        }]);

      if (!error) {
        console.log("🟢 Audit Log recorded in Supabase:", action);
        return { success: true, data };
      }
    } catch (err) {
      console.warn("Failed to write audit log to Supabase:", err);
    }
  }
  return { success: true, mock: true };
}

// Auto-initialize client on script load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initSupabaseClient);
  } else {
    initSupabaseClient();
  }
}
