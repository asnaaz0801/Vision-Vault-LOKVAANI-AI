/**
 * LokVaani AI — Officer Portal Mock Database
 * Single source of truth for Officer Work Queue, AI Analytics, and Complaints
 */

const INITIAL_OFFICER_PROFILE = {
  id: "OFF-WTR-047",
  name: "Rajesh Kumar",
  role: "Junior Civic Officer",
  department: "Water Supply Department",
  zone: "Zone 4 (Central)",
  email: "rajesh.kumar@lokvaani.gov.in",
  phone: "+91 98765 43210",
  avatarInitials: "RK",
  accountStatus: "Active • SSO Verified (MeriPehchan)",
  jurisdictionWards: ["Ward 12", "Ward 14", "Ward 10", "Sector 12", "Sector 14"],
  stats: {
    totalAssigned: 24,
    criticalCount: 3,
    pendingCount: 8,
    breachedCount: 1,
    resolvedCount: 42,
    avgResolutionHours: 11.4,
    slaCompliancePct: 94,
    rating: 4.6
  }
};

const INITIAL_COMPLAINTS = [
  {
    complaintId: "LV-10482",
    citizenName: "Sunita Verma & 6 Residents",
    citizenContact: "+91 98112 34567 (Verified Aadhaar Link)",
    description: "No water supply in Sector 12 for the last two days. Elderly residents and school hostels are facing serious drinking water crises. Main distribution valve suspected faulty.",
    category: "Water Supply Outage",
    department: "Water Supply Department",
    location: "Sector 12, Station Road Junction (Ward 12)",
    gisCoordinates: "18.5204° N, 73.8567° E",
    priorityScore: 94,
    priorityLevel: "Critical",
    severity: "Critical",
    sentiment: "Highly Frustrated",
    aiSummary: "Extended major drinking water outage affecting multiple residential blocks and vulnerable institutions.",
    priorityReasons: [
      { label: "Essential public service disrupted", points: 30 },
      { label: "Reported duration exceeds 24 hours", points: 25 },
      { label: "Multiple citizens affected in high-density zone", points: 20 },
      { label: "Vulnerable citizens & school hostels mentioned", points: 10 },
      { label: "High frustration sentiment detected in voice transcript", points: 9 }
    ],
    slaHours: 4,
    slaRemainingSeconds: 2 * 3600 + 17 * 60, // 02h 17m
    slaState: "ON TRACK", // ON TRACK | AT RISK | SLA BREACHED
    status: "Assigned", // Assigned | In Progress | Pending | Resolved | Escalated
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "Today, 08:42 AM",
    updatedAt: "Today, 08:43 AM",
    relatedComplaints: [
      { id: "LV-10421", user: "Ramesh P.", time: "Yesterday, 06:15 PM", snippet: "No tap water since evening" },
      { id: "LV-10456", user: "Anil Sharma", time: "Today, 06:30 AM", snippet: "Dry pipelines in Block C" },
      { id: "LV-10478", user: "Pooja Mehta", time: "Today, 08:10 AM", snippet: "Water pressure zero" },
      { id: "LV-10480", user: "Karan Johar", time: "Today, 08:25 AM", snippet: "Hospital ward facing water shortage" },
      { id: "LV-10481", user: "Suresh K.", time: "Today, 08:35 AM", snippet: "Low pressure near Sector 12" },
      { id: "LV-10483", user: "Meena Gupta", time: "Today, 08:45 AM", snippet: "No water in apartments" }
    ],
    resolutionNote: "",
    resolutionProof: "",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "Today, 08:42 AM", author: "Citizen (Sunita Verma via Voice Note)", icon: "📥" },
      { title: "AI Analysis & Bhashini Triaged", timestamp: "Today, 08:43 AM", author: "LokVaani AI Core Engine", icon: "⚡" },
      { title: "Dynamic Priority Surged (94/100)", timestamp: "Today, 08:43 AM", author: "Priority Matrix Engine", icon: "🚨" },
      { title: "Department Assigned", timestamp: "Today, 08:43 AM", author: "Auto-Routing Service", icon: "🏛️" },
      { title: "Officer Assigned", timestamp: "Today, 08:44 AM", author: "Er. Rajesh Kumar (Water Dept)", icon: "👤" }
    ]
  },
  {
    complaintId: "LV-10491",
    citizenName: "Amitabh Joshi",
    citizenContact: "+91 97654 32109",
    description: "Major pipeline leak on main arterial road near Sector 14 market. Water gushing out and flooding road, creating traffic chaos.",
    category: "Pipeline Leakage",
    department: "Water Supply Department",
    location: "Sector 14 Main Road (Ward 14)",
    gisCoordinates: "18.5280° N, 73.8610° E",
    priorityScore: 82,
    priorityLevel: "High",
    severity: "High",
    sentiment: "Concerned",
    aiSummary: "Pressurized main water trunk leakage causing road flooding and commercial traffic bottleneck.",
    priorityReasons: [
      { label: "Drinking water loss from main trunk", points: 30 },
      { label: "Commercial arterial road traffic impact", points: 25 },
      { label: "Visual photo proof confirmed (98.4% confidence)", points: 15 },
      { label: "Reported duration < 6 hours", points: 12 }
    ],
    slaHours: 24,
    slaRemainingSeconds: 16 * 3600 + 32 * 60, // 16h 32m
    slaState: "ON TRACK",
    status: "In Progress",
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "Today, 07:15 AM",
    updatedAt: "Today, 09:10 AM",
    relatedComplaints: [
      { id: "LV-10488", user: "Deepak S.", time: "Today, 07:00 AM", snippet: "Puddle forming near Sector 14" },
      { id: "LV-10489", user: "Rajiv K.", time: "Today, 07:10 AM", snippet: "Water pipe bursting near shop" }
    ],
    resolutionNote: "",
    resolutionProof: "",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "Today, 07:15 AM", author: "Citizen (Amitabh Joshi via WhatsApp)", icon: "📥" },
      { title: "AI Analysis Completed", timestamp: "Today, 07:16 AM", author: "LokVaani AI Engine", icon: "⚡" },
      { title: "Officer Assigned", timestamp: "Today, 07:20 AM", author: "Er. Rajesh Kumar", icon: "👤" },
      { title: "Field Crew Dispatched & Work In Progress", timestamp: "Today, 09:10 AM", author: "Er. Rajesh Kumar", icon: "🔧" }
    ]
  },
  {
    complaintId: "LV-10503",
    citizenName: "Vikram Malhotra",
    citizenContact: "+91 98989 12345",
    description: "Low water pressure in 3rd floor apartments across Sector 10. Water pumps unable to draw sufficient volume during morning supply hours.",
    category: "Low Water Pressure",
    department: "Water Supply Department",
    location: "Sector 10 Residential Complex (Ward 10)",
    gisCoordinates: "18.5140° N, 73.8490° E",
    priorityScore: 61,
    priorityLevel: "Medium",
    severity: "Medium",
    sentiment: "Moderate",
    aiSummary: "Sub-optimal line pressure affecting upper floors in multi-story residential housing.",
    priorityReasons: [
      { label: "Partial service disruption (low pressure)", points: 25 },
      { label: "Residential sector impact", points: 20 },
      { label: "No critical institution affected", points: 16 }
    ],
    slaHours: 48,
    slaRemainingSeconds: 38 * 3600 + 12 * 60, // 38h 12m
    slaState: "ON TRACK",
    status: "Pending",
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "Today, 06:30 AM",
    updatedAt: "Today, 06:31 AM",
    relatedComplaints: [],
    resolutionNote: "",
    resolutionProof: "",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "Today, 06:30 AM", author: "Citizen (Vikram M. via Portal)", icon: "📥" },
      { title: "AI Analysis Completed", timestamp: "Today, 06:31 AM", author: "LokVaani AI Engine", icon: "⚡" },
      { title: "Queued for Inspection", timestamp: "Today, 06:31 AM", author: "Auto Scheduler", icon: "⏳" }
    ]
  },
  {
    complaintId: "LV-10398",
    citizenName: "Resident Welfare Assoc. Sector 8",
    citizenContact: "+91 94220 99887",
    description: "Contaminated muddy water coming from municipal taps for the third consecutive day. Potential sewage seepage in distribution lines near Park Street.",
    category: "Water Contamination",
    department: "Water Supply Department",
    location: "Sector 8, Park Street (Ward 8)",
    gisCoordinates: "18.5312° N, 73.8701° E",
    priorityScore: 98,
    priorityLevel: "Critical",
    severity: "Critical",
    sentiment: "Urgent Alarm",
    aiSummary: "Severe drinking water contamination posing immediate public health risk and epidemic threat.",
    priorityReasons: [
      { label: "Public health hazard & contamination risk", points: 35 },
      { label: "Reported duration > 48 hours", points: 30 },
      { label: "RWA collective petition filed", points: 20 },
      { label: "Lab test alert triggered", points: 13 }
    ],
    slaHours: 6,
    slaRemainingSeconds: -45 * 60, // -45m (BREACHED)
    slaState: "SLA BREACHED",
    status: "SLA Breached",
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "Yesterday, 02:10 PM",
    updatedAt: "Today, 09:30 AM",
    relatedComplaints: [
      { id: "LV-10390", user: "Dr. Alok Nath", time: "Yesterday, 10:00 AM", snippet: "Muddy tap water reported" },
      { id: "LV-10395", user: "Kavita S.", time: "Yesterday, 01:20 PM", snippet: "Foul odor in drinking water" }
    ],
    resolutionNote: "",
    resolutionProof: "",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "Yesterday, 02:10 PM", author: "RWA Sector 8", icon: "📥" },
      { title: "AI Severity Flagged (CRITICAL 98)", timestamp: "Yesterday, 02:11 PM", author: "Health AI Safety Guard", icon: "🚨" },
      { title: "Assigned to Water Quality Cell", timestamp: "Yesterday, 02:15 PM", author: "Routing Desk", icon: "🏛️" },
      { title: "SLA Target Time Elapsed (6 Hours)", timestamp: "Yesterday, 08:11 PM", author: "SLA Monitor System", icon: "⏱️" },
      { title: "Automated Governance Escalation Triggered", timestamp: "Today, 08:30 AM", author: "Chief Executive Desk Alert", icon: "⚠️" }
    ]
  },
  {
    complaintId: "LV-10515",
    citizenName: "Ganesh Hegde",
    citizenContact: "+91 98450 11223",
    description: "Water meter leakage in commercial building basement causing slow seepage.",
    category: "Meter & Valve Issue",
    department: "Water Supply Department",
    location: "Sector 14 Commercial Complex",
    gisCoordinates: "18.5275° N, 73.8625° E",
    priorityScore: 45,
    priorityLevel: "Low",
    severity: "Low",
    sentiment: "Neutral",
    aiSummary: "Localized commercial meter joint drip without public supply disruption.",
    priorityReasons: [
      { label: "Minor commercial property leak", points: 20 },
      { label: "No main line disruption", points: 15 },
      { label: "Private property boundary", points: 10 }
    ],
    slaHours: 72,
    slaRemainingSeconds: 65 * 3600 + 40 * 60,
    slaState: "ON TRACK",
    status: "Pending",
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "Today, 09:15 AM",
    updatedAt: "Today, 09:15 AM",
    relatedComplaints: [],
    resolutionNote: "",
    resolutionProof: "",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "Today, 09:15 AM", author: "Ganesh Hegde", icon: "📥" },
      { title: "AI Analysis Completed", timestamp: "Today, 09:16 AM", author: "LokVaani AI", icon: "⚡" }
    ]
  },
  {
    complaintId: "LV-10310",
    citizenName: "Manish Shah",
    citizenContact: "+91 99001 55443",
    description: "Broken valve cap on public drinking water standpost near Bus Depot.",
    category: "Public Water Post",
    department: "Water Supply Department",
    location: "Central Bus Depot, Ward 12",
    gisCoordinates: "18.5210° N, 73.8580° E",
    priorityScore: 78,
    priorityLevel: "High",
    severity: "High",
    sentiment: "Satisfied",
    aiSummary: "Public utility standpost valve replacement completed successfully.",
    priorityReasons: [
      { label: "Public transit node location", points: 30 },
      { label: "Water waste prevention", points: 28 },
      { label: "High footfall zone", points: 20 }
    ],
    slaHours: 24,
    slaRemainingSeconds: 0,
    slaState: "ON TRACK",
    status: "Resolved",
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "Yesterday, 09:00 AM",
    updatedAt: "Yesterday, 04:30 PM",
    relatedComplaints: [],
    resolutionNote: "Replaced faulty brass valve fixture with tamper-proof heavy-duty unit. Geotagged water flow test verified zero leak.",
    resolutionProof: "Proof_Valve_Fix_LV10310.jpg (Verified by CV)",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "Yesterday, 09:00 AM", author: "Manish Shah", icon: "📥" },
      { title: "Officer Assigned", timestamp: "Yesterday, 09:15 AM", author: "Er. Rajesh Kumar", icon: "👤" },
      { title: "Field Crew Deployed", timestamp: "Yesterday, 11:00 AM", author: "QRT Team 02", icon: "🔧" },
      { title: "Resolution Uploaded & Verified", timestamp: "Yesterday, 04:30 PM", author: "Er. Rajesh Kumar", icon: "✅" },
      { title: "Closed & Citizen Feedback 5/5 Stars", timestamp: "Yesterday, 04:45 PM", author: "Citizen Confirmation", icon: "⭐" }
    ]
  },
  {
    complaintId: "LV-10290",
    citizenName: "Priyanaka Deshmukh",
    citizenContact: "+91 93321 00998",
    description: "Illegal booster pump connection altering pipeline pressure in residential lane.",
    category: "Illegal Abstraction",
    department: "Water Enforcement Cell",
    location: "Ward 14, Lane 5",
    gisCoordinates: "18.5290° N, 73.8640° E",
    priorityScore: 89,
    priorityLevel: "High",
    severity: "High",
    sentiment: "Highly Frustrated",
    aiSummary: "Unauthorized high-power suction pump causing illegal pressure loss for neighboring houses.",
    priorityReasons: [
      { label: "Illegal infrastructure tampering", points: 35 },
      { label: "Neighboring household equity disruption", points: 30 },
      { label: "Multiple verbal complaints logged", points: 24 }
    ],
    slaHours: 24,
    slaRemainingSeconds: 0,
    slaState: "SLA BREACHED",
    status: "Escalated",
    assignedOfficer: "Er. Rajesh Kumar",
    createdAt: "2 Days Ago, 11:00 AM",
    updatedAt: "Yesterday, 06:00 PM",
    relatedComplaints: [
      { id: "LV-10285", user: "Sunil G.", time: "2 Days Ago", snippet: "Suction noise in pipeline" }
    ],
    resolutionNote: "Escalated to Chief Enforcement Officer for municipal search warrant and confiscation of unauthorized high-HP pump.",
    resolutionProof: "Enforcement_Notice_LV10290.pdf",
    activityTimeline: [
      { title: "Complaint Submitted", timestamp: "2 Days Ago, 11:00 AM", author: "Citizen Priyanka D.", icon: "📥" },
      { title: "SLA Breach Threshold Crossed", timestamp: "Yesterday, 11:00 AM", author: "SLA Watchdog", icon: "⚠️" },
      { title: "Escalated to Chief Enforcement Officer", timestamp: "Yesterday, 06:00 PM", author: "Er. Rajesh Kumar", icon: "🚀" }
    ]
  }
];

// Helper to calculate runtime stats dynamically
function calculateOfficerStats(complaintsList) {
  const stats = {
    totalAssigned: complaintsList.length,
    criticalCount: complaintsList.filter(c => c.priorityLevel === "Critical" && c.status !== "Resolved").length,
    pendingCount: complaintsList.filter(c => (c.status === "Pending" || c.status === "Assigned")).length,
    breachedCount: complaintsList.filter(c => c.slaState === "SLA BREACHED" && c.status !== "Resolved").length,
    resolvedCount: 42 + complaintsList.filter(c => c.status === "Resolved").length,
    inProgressCount: complaintsList.filter(c => c.status === "In Progress").length
  };
  return stats;
}

if (typeof window !== 'undefined') {
  window.INITIAL_COMPLAINTS = INITIAL_COMPLAINTS;
  window.INITIAL_OFFICER_PROFILE = INITIAL_OFFICER_PROFILE;
}
if (typeof global !== 'undefined') {
  global.INITIAL_COMPLAINTS = INITIAL_COMPLAINTS;
  global.INITIAL_OFFICER_PROFILE = INITIAL_OFFICER_PROFILE;
}
