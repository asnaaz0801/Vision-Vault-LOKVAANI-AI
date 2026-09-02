/**
 * LokVaani AI — Administrator Portal Mock Database
 * Enterprise Command Center Data Architecture
 */

const INITIAL_ADMIN_PROFILE = {
  id: "ADM-GOV-001",
  name: "Ananya Sharma",
  role: "Administrator",
  designation: "Senior Municipal Officer",
  department: "City Administration & Governance",
  authority: "City-Wide Command Center",
  jurisdiction: "Central Municipal Zone (All 8 Zones)",
  email: "ananya.sharma@lokvaani.gov.in",
  phone: "+91 98100 88776",
  avatarInitials: "AS",
  accountStatus: "Active • Senior Administrator Privileges",
  cityHealthScore: 78,
  cityHealthStatus: "Stable, but requires attention",
  cityHealthBreakdown: {
    slaCompliance: 86,
    resolutionRate: 78,
    criticalLoad: 72,
    officerAvailability: 91
  },
  stats: {
    totalComplaints: 1284,
    resolvedCount: 842,
    pendingCount: 317,
    breachedCount: 125,
    criticalCount: 18,
    activeOfficers: 42,
    slaCompliancePct: 88,
    avgResolutionHours: 14.2,
    satisfactionRating: 4.4,
    trends: {
      total: "+8.4% vs last week",
      resolved: "↑ 18.2% monthly speedup",
      pending: "Active triage queue",
      breached: "↑ 12.4% from last week — Needs immediate attention",
      critical: "↓ 8.2% from yesterday — City-wide incidents",
      officers: "Across 5 Municipal Depts"
    }
  }
};

const INITIAL_DEPARTMENTS = [
  { id: "DEP-WTR", name: "Water Supply Department", complaints: 284, resolved: 201, pending: 61, slaCompliance: 91, critical: 7, officersCount: 12, status: "Operational", statusColor: "green", trend: "+4%" },
  { id: "DEP-SAN", name: "Solid Waste & Sanitation", complaints: 210, resolved: 140, pending: 55, slaCompliance: 82, critical: 5, officersCount: 10, status: "Needs Attention", statusColor: "amber", trend: "+12%" },
  { id: "DEP-ELE", name: "Electrical & Street Lighting", complaints: 180, resolved: 135, pending: 38, slaCompliance: 93, critical: 2, officersCount: 8, status: "Operational", statusColor: "green", trend: "-2%" },
  { id: "DEP-PWD", name: "Roads & Public Works (PWD)", complaints: 260, resolved: 160, pending: 82, slaCompliance: 76, critical: 9, officersCount: 14, status: "High Risk", statusColor: "red", trend: "+18%" },
  { id: "DEP-DRN", name: "Drainage & Stormwater", complaints: 140, resolved: 95, pending: 39, slaCompliance: 88, critical: 3, officersCount: 6, status: "Operational", statusColor: "green", trend: "0%" },
  { id: "DEP-TRF", name: "Traffic Management", complaints: 112, resolved: 78, pending: 28, slaCompliance: 90, critical: 1, officersCount: 5, status: "Operational", statusColor: "green", trend: "-5%" },
  { id: "DEP-PRK", name: "Parks & Public Spaces", complaints: 98, resolved: 73, pending: 22, slaCompliance: 95, critical: 0, officersCount: 4, status: "Operational", statusColor: "green", trend: "-8%" }
];

const INITIAL_OFFICERS = [
  { id: "OFF-WTR-047", name: "Rajesh Kumar", title: "Junior Civic Officer", department: "Water Supply Department", zone: "Zone 4", activeCases: 18, resolved: 142, slaCompliance: 68, status: "Needs Attention", statusBadge: "amber", email: "rajesh.kumar@lokvaani.gov.in" },
  { id: "OFF-WTR-012", name: "Suresh Patel", title: "Senior Assistant Engineer", department: "Water Supply Department", zone: "Zone 4 & 12", activeCases: 12, resolved: 188, slaCompliance: 98, status: "Excellent", statusBadge: "green", email: "suresh.patel@lokvaani.gov.in" },
  { id: "OFF-PWD-088", name: "Priya Nair", title: "Assistant Executive Engineer", department: "Roads & Public Works (PWD)", zone: "Zone 7", activeCases: 31, resolved: 165, slaCompliance: 78, status: "Needs Attention", statusBadge: "amber", email: "priya.nair@lokvaani.gov.in" },
  { id: "OFF-SAN-034", name: "Vikram Singh", title: "Sanitation Inspector", department: "Solid Waste & Sanitation", zone: "Zone 2", activeCases: 18, resolved: 154, slaCompliance: 84, status: "Good", statusBadge: "green", email: "vikram.singh@lokvaani.gov.in" },
  { id: "OFF-ELE-055", name: "Amitabh Verma", title: "Electrical Divisional Engineer", department: "Electrical & Street Lighting", zone: "Zone 1", activeCases: 8, resolved: 192, slaCompliance: 96, status: "Excellent", statusBadge: "green", email: "amitabh.verma@lokvaani.gov.in" },
  { id: "OFF-WTR-099", name: "Kavita Deshmukh", title: "Field Inspector Trainee", department: "Water Supply Department", zone: "Zone 3", activeCases: 0, resolved: 0, slaCompliance: 100, status: "Pending Approval", statusBadge: "amber", email: "kavita.d@lokvaani.gov.in" }
];

const INITIAL_ESCALATIONS = [
  {
    escalationId: "EX-2041",
    complaintId: "LV-10482",
    citizenName: "Sunita Verma & 6 Residents",
    citizenContact: "+91 98112 34567",
    description: "2 din se Sector 12 mein paani nahi aa raha. Elderly residents and school hostels facing serious drinking water crises.",
    category: "Water Supply Outage",
    department: "Water Supply",
    officer: "Rajesh Kumar",
    officerId: "OFF-WTR-047",
    location: "Sector 12, Station Road (Ward 12)",
    priorityScore: 94,
    priorityLevel: "CRITICAL",
    priorityBreakdown: [
      { label: "Essential Public Service", points: 30 },
      { label: "SLA Delay (> 24h outage)", points: 25 },
      { label: "Multiple Citizens Affected", points: 20 },
      { label: "Vulnerable Citizens Mentioned", points: 10 },
      { label: "High Frustration Sentiment", points: 9 }
    ],
    slaHours: 4,
    breachDuration: "1h 13m OVERDUE",
    escalationLevel: "Level 2 — System Auto-Escalated",
    reason: "No resolution update or field crew dispatch logged within 4-hour SLA window.",
    status: "Pending Action",
    createdAt: "Today, 08:42 AM",
    escalatedAt: "Today, 12:42 PM",
    aiRecommendation: "Immediate reassignment recommended to Senior Engineer Suresh Patel due to critical severity.",
    citizenImpact: "High (High-density block & 2 school hostels)",
    relatedComplaintsCount: 7
  },
  {
    escalationId: "EX-2038",
    complaintId: "LV-10398",
    citizenName: "Resident Welfare Assoc. Sector 8",
    citizenContact: "+91 94220 99887",
    description: "Contaminated muddy water coming from municipal taps for the third consecutive day. Potential sewage seepage in lines.",
    category: "Water Contamination",
    department: "Water Supply",
    officer: "Rajesh Kumar",
    officerId: "OFF-WTR-047",
    location: "Sector 8, Park Street (Ward 8)",
    priorityScore: 98,
    priorityLevel: "CRITICAL",
    priorityBreakdown: [
      { label: "Public Health Hazard", points: 35 },
      { label: "Duration > 48 Hours", points: 30 },
      { label: "RWA Collective Petition", points: 20 },
      { label: "Contamination Risk Alert", points: 13 }
    ],
    slaHours: 6,
    breachDuration: "15h 20m OVERDUE",
    escalationLevel: "Level 3 — Repeated SLA Breach",
    reason: "Health hazard risk. Water sample lab report pending; SLA elapsed yesterday.",
    status: "Pending Action",
    createdAt: "Yesterday, 02:10 PM",
    escalatedAt: "Yesterday, 08:11 PM",
    aiRecommendation: "Authorize Emergency Water Tanker Dispatch & Quality Mobile Unit.",
    citizenImpact: "Severe (Public Health Alert across 250 households)",
    relatedComplaintsCount: 3
  },
  {
    escalationId: "EX-2022",
    complaintId: "LV-10290",
    citizenName: "Priyanka Deshmukh",
    citizenContact: "+91 93321 00998",
    description: "Illegal booster pump connection altering pipeline pressure in residential lane.",
    category: "Illegal Abstraction",
    department: "Water Supply",
    officer: "Rajesh Kumar",
    officerId: "OFF-WTR-047",
    location: "Ward 14, Lane 5",
    priorityScore: 89,
    priorityLevel: "HIGH",
    priorityBreakdown: [
      { label: "Illegal Infrastructure Tampering", points: 35 },
      { label: "Neighboring Household Equity", points: 30 },
      { label: "Multiple Verbal Complaints", points: 24 }
    ],
    slaHours: 24,
    breachDuration: "24h 00m OVERDUE",
    escalationLevel: "Level 1 — Field Officer Request",
    reason: "Requires municipal search & confiscation warrant beyond junior officer legal scope.",
    status: "Escalated to Dept Head",
    createdAt: "2 Days Ago, 11:00 AM",
    escalatedAt: "Yesterday, 06:00 PM",
    aiRecommendation: "Forward to Municipal Enforcement Cell & Chief Legal Officer.",
    citizenImpact: "Moderate (Neighborhood water pressure imbalance)",
    relatedComplaintsCount: 2
  }
];

const INITIAL_CITY_INSIGHTS = [
  {
    id: "INS-01",
    tag: "TREND DETECTED",
    title: "Water Complaints Surge",
    insight: "Water complaints increased 28% in Zone 4 over the last 24 hours.",
    impact: "High (Affecting Wards 8, 12, 14)",
    confidence: "92%",
    recommendation: "Inspect Sector 12 water pipeline network.",
    actionBtnText: "Investigate Zone 4",
    zone: "Zone 4"
  },
  {
    id: "INS-02",
    tag: "DUPLICATE CLUSTER",
    title: "Sector 12 Pipeline Cluster",
    insight: "7 complaints near Sector 12 appear to describe the same underlying issue.",
    impact: "Critical (500m cluster)",
    confidence: "99.2%",
    recommendation: "Consolidate into Master Work Order LV-10482.",
    actionBtnText: "View Cluster",
    zone: "Zone 4"
  },
  {
    id: "INS-03",
    tag: "SLA HOTSPOT",
    title: "Road Degradation Bottleneck",
    insight: "Road-related SLA breaches are concentrated in Zone 7 commercial corridor.",
    impact: "High Traffic Bottleneck",
    confidence: "88%",
    recommendation: "Reallocate PWD asphalt maintenance squad to Zone 7.",
    actionBtnText: "Reallocate Budget",
    zone: "Zone 7"
  }
];

const MUNICIPAL_ZONES = [
  { zone: "Zone 1", name: "North Admin", complaints: 92, critical: 1, slaCompliance: 96, intensity: "Low", topIssue: "Street Lighting", aiSignal: "Normal telemetry" },
  { zone: "Zone 2", name: "Market Yard", complaints: 210, critical: 5, slaCompliance: 82, intensity: "High", topIssue: "Solid Waste", aiSignal: "Post-weekend surge" },
  { zone: "Zone 3", name: "East Residential", complaints: 115, critical: 2, slaCompliance: 91, intensity: "Medium", topIssue: "Drainage", aiSignal: "Stable" },
  { zone: "Zone 4", name: "Central Sector 12", complaints: 238, critical: 72, slaCompliance: 84, intensity: "Critical", topIssue: "Water Supply", aiSignal: "Complaint volume ↑ 28%" },
  { zone: "Zone 5", name: "Industrial Estate", complaints: 88, critical: 1, slaCompliance: 94, intensity: "Low", topIssue: "Electrical Grid", aiSignal: "Stable" },
  { zone: "Zone 6", name: "West Suburbs", complaints: 104, critical: 2, slaCompliance: 90, intensity: "Medium", topIssue: "Potholes", aiSignal: "Minorwear" },
  { zone: "Zone 7", name: "Ring Road Corridor", complaints: 260, critical: 9, slaCompliance: 76, intensity: "Critical", topIssue: "Road Surface", aiSignal: "SLA Breach concentration" },
  { zone: "Zone 8", name: "South Riverfront", complaints: 131, critical: 3, slaCompliance: 88, intensity: "Medium", topIssue: "Stormwater", aiSignal: "Monsoon watch" }
];

const INITIAL_AUDIT_LOGS = [
  { timestamp: "10:42 AM", actor: "Ananya Sharma", role: "Administrator", action: "Reassigned Complaint", complaintId: "LV-10482", department: "Water Supply", result: "Successful (Assigned to Suresh Patel)" },
  { timestamp: "10:31 AM", actor: "Ananya Sharma", role: "Administrator", action: "Emergency Response Authorized", complaintId: "SYS-EMERG-01", department: "Water Supply", result: "Dispatched Zone 4 Unit" },
  { timestamp: "10:12 AM", actor: "System Engine", role: "AI Watchdog", action: "Officer Rajesh Kumar flagged for SLA breach", complaintId: "LV-10482", department: "Water Supply", result: "Auto-escalated to Admin Desk" },
  { timestamp: "09:48 AM", actor: "LokVaani AI Engine", role: "AI Core", action: "7 duplicate complaints detected", complaintId: "LV-10482", department: "Water Supply", result: "Vector Cluster 99.2% match" },
  { timestamp: "08:42 AM", actor: "Citizen (Sunita V.)", role: "Citizen", action: "Submitted Voice Note Grievance", complaintId: "LV-10482", department: "Water Supply", result: "Payload Ingested" }
];

const INITIAL_ADMIN_NOTIFICATIONS = [
  { id: "NOT-01", type: "CRITICAL", title: "🚨 CRITICAL SLA BREACH", desc: "Water Complaint LV-10482 exceeded SLA 1h 13m ago", time: "1h 13m ago", read: false, link: "escalations" },
  { id: "NOT-02", type: "WARNING", title: "⚠️ SLA RISK", desc: "Roads & PWD department SLA compliance dropped to 76%", time: "32m ago", read: false, link: "departments" },
  { id: "NOT-03", type: "AI INSIGHT", title: "🧠 AI INSIGHT", desc: "7 duplicate complaints detected near Sector 12", time: "3h ago", read: false, link: "intelligence" },
  { id: "NOT-04", type: "OFFICER", title: "👤 OFFICER REQUEST", desc: "Officer authorization request received for Kavita Deshmukh", time: "4h ago", read: true, link: "officers" }
];

const SLA_POLICIES = [
  { priority: "Critical", scoreRange: "90-100", maxHours: 4, desc: "Immediate public health/safety risk" },
  { priority: "High", scoreRange: "70-89", maxHours: 24, desc: "Significant essential service disruption" },
  { priority: "Medium", scoreRange: "40-69", maxHours: 48, desc: "Standard civic infrastructure maintenance" },
  { priority: "Low", scoreRange: "0-39", maxHours: 72, desc: "Routine civic improvements" }
];
