import { TemplateSection } from "@/lib/types";

export interface SystemTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    icon: string;
    color: string;
    gpsValidation: boolean;
    features: string[];
    sections: TemplateSection[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function field(
    id: string,
    label: string,
    type: "text" | "number" | "checkbox" | "select" | "photo" | "signature" | "route" | "accelerometer",
    required = false,
    options?: string[],
    gyroCapture = false,
) {
    return { id, label, type, required, ...(options ? { options } : {}), ...(gyroCapture ? { gyroCapture } : {}) };
}

function section(id: string, name: string, fields: ReturnType<typeof field>[]): TemplateSection {
    return { id, name, fields } as TemplateSection;
}

const CONDITION = ["Excellent", "Good", "Fair", "Poor"];
const PASS_FAIL = ["Pass", "Fail", "N/A"];

// ─── Template 1 — Rental Inspection ──────────────────────────────────────────

const rentalSections: TemplateSection[] = [
    section("s1", "Property Details", [
        field("f1", "Property address", "text", true),
        field("f2", "Property type", "select", true, ["House", "Apartment", "Unit", "Townhouse"]),
        field("f3", "Inspection date", "text", true),
        field("f4", "Inspector name", "text", true),
        field("f5", "Tenant name", "text"),
        field("f6", "Landlord / Agent name", "text"),
    ]),
    section("s2", "Entry & Exterior", [
        field("f7", "Front door condition", "select", true, CONDITION),
        field("f8", "Front garden / yard", "select", false, CONDITION),
        field("f9", "Fencing", "select", false, CONDITION),
        field("f10", "Exterior walls", "select", false, CONDITION),
        field("f11", "Exterior photos", "photo"),
        field("f12", "Notes", "text"),
    ]),
    section("s3", "Living Areas", [
        field("f13", "Walls", "select", false, CONDITION),
        field("f14", "Ceiling", "select", false, CONDITION),
        field("f15", "Flooring", "select", false, CONDITION),
        field("f16", "Lighting functional", "checkbox"),
        field("f17", "Photos", "photo"),
        field("f18", "Notes", "text"),
    ]),
    section("s4", "Kitchen", [
        field("f19", "Benchtops", "select", false, CONDITION),
        field("f20", "Appliances", "select", false, CONDITION),
        field("f21", "Cupboards", "select", false, CONDITION),
        field("f22", "Sink & tapware", "select", false, CONDITION),
        field("f23", "Photos", "photo"),
        field("f24", "Notes", "text"),
    ]),
    section("s5", "Bathrooms", [
        field("f25", "Shower / bath", "select", false, CONDITION),
        field("f26", "Toilet", "select", false, CONDITION),
        field("f27", "Vanity", "select", false, CONDITION),
        field("f28", "Exhaust fan functional", "checkbox"),
        field("f29", "Photos", "photo"),
        field("f30", "Notes", "text"),
    ]),
    section("s6", "Bedrooms", [
        field("f31", "Number of bedrooms", "number", true),
        field("f32", "Walls condition", "select", false, CONDITION),
        field("f33", "Flooring condition", "select", false, CONDITION),
        field("f34", "Built-in wardrobes present", "checkbox"),
        field("f35", "Photos", "photo"),
        field("f36", "Notes", "text"),
    ]),
    section("s7", "Utilities & Safety", [
        field("f37", "Smoke detectors present & working", "checkbox", true),
        field("f38", "Hot water system", "select", false, CONDITION),
        field("f39", "Heating / cooling", "select", false, CONDITION),
        field("f40", "Gas / electricity connected", "checkbox"),
        field("f41", "Notes", "text"),
    ]),
    section("s8", "Summary", [
        field("f42", "Overall property condition", "select", true, CONDITION),
        field("f43", "Action items", "text"),
        field("f44", "Inspector signature", "signature", true),
    ]),
];

// ─── Template 2 — Trades Report ───────────────────────────────────────────────

const tradesSections: TemplateSection[] = [
    section("s1", "Job Details", [
        field("f1", "Job type", "select", true, ["Electrical", "Plumbing", "Fitting & Turning", "Other"]),
        field("f2", "Client name", "text", true),
        field("f3", "Site address", "text", true),
        field("f4", "Job / work order number", "text"),
        field("f5", "Date", "text", true),
        field("f6", "Technician name", "text", true),
    ]),
    section("s2", "Before Work", [
        field("f7", "Pre-work condition description", "text"),
        field("f8", "Pre-work photos", "photo", true, undefined, true),
        field("f9", "Hazards identified", "checkbox"),
        field("f10", "Hazard description", "text"),
    ]),
    section("s3", "Work Completed", [
        field("f11", "Work description", "text", true),
        field("f12", "Materials used", "text"),
        field("f13", "Time started", "text"),
        field("f14", "Time completed", "text"),
        field("f15", "After work photos", "photo", true, undefined, true),
        field("f16", "Annotated diagram / sketch", "photo", false, undefined, true),
    ]),
    section("s4", "Measurements & Compliance", [
        field("f17", "Measurement label", "text"),
        field("f18", "Measurement value", "number"),
        field("f19", "Second measurement label", "text"),
        field("f20", "Second measurement value", "number"),
        field("f21", "Compliant to relevant standards", "checkbox", true),
        field("f22", "Standard / code reference", "text"),
    ]),
    section("s5", "Testing & Verification", [
        field("f23", "Tests performed", "text"),
        field("f24", "Test result", "select", true, PASS_FAIL),
        field("f25", "GPS-tagged evidence photo", "photo"),
        field("f26", "Notes", "text"),
    ]),
    section("s6", "Sign-off", [
        field("f27", "Additional notes", "text"),
        field("f28", "Technician signature", "signature", true),
        field("f29", "Client signature", "signature"),
    ]),
];

// ─── Template 3 — Legal & Forensic ────────────────────────────────────────────

const legalSections: TemplateSection[] = [
    section("s1", "Report Type & Incident", [
        field("f1", "Report type", "select", true, ["Forensics", "Police Incident", "General Legal"]),
        field("f2", "Case / incident number", "text", true),
        field("f3", "Date & time of incident", "text", true),
        field("f4", "Reporting officer / investigator", "text", true),
        field("f5", "Incident location", "text", true),
    ]),
    section("s2", "Scene Documentation", [
        field("f6", "Scene description", "text", true),
        field("f7", "Scene photos", "photo", true),
        field("f9", "Sketch / diagram", "photo"),
    ]),
    section("s3", "Evidence", [
        field("f10", "Evidence item description", "text"),
        field("f11", "Evidence photo", "photo"),
        field("f12", "Additional evidence item", "text"),
        field("f13", "Additional evidence photo", "photo"),
        field("f14", "Screenshot uploads", "photo"),
        field("f15", "Audio transcript / speech notes", "text"),
    ]),
    section("s4", "Persons Involved", [
        field("f16", "Persons involved", "text", true),
        field("f17", "Witness names", "text"),
        field("f18", "Witness statements", "text"),
    ]),
    section("s5", "Chain of Custody", [
        field("f19", "Evidence collected by", "text"),
        field("f20", "Collection timestamp", "text"),
        field("f21", "Storage location", "text"),
        field("f22", "Transferred to", "text"),
        field("f23", "Chain-of-custody photo", "photo"),
    ]),
    section("s6", "Notes & Actions", [
        field("f27", "Investigator notes", "text"),
        field("f28", "Recommendations", "text"),
        field("f29", "Follow-up actions", "text"),
        field("f30", "Supervisor signature", "signature"),
    ]),
];

// ─── Template 4 — Driving Test ────────────────────────────────────────────────

const drivingSections: TemplateSection[] = [
    section("s1", "Driver & Vehicle", [
        field("f1", "Driver name", "text", true),
        field("f2", "Licence number", "text", true),
        field("f3", "Vehicle registration", "text", true),
        field("f4", "Vehicle type", "select", true, ["Car", "Van", "Ambulance", "Bus", "Truck"]),
        field("f5", "Test date", "text", true),
        field("f6", "Assessor name", "text", true),
    ]),
    section("s2", "Pre-Drive Vehicle Check", [
        field("f7", "Lights functional", "checkbox", true),
        field("f8", "Mirrors adjusted", "checkbox", true),
        field("f9", "Seatbelt functional", "checkbox", true),
        field("f10", "Brakes responsive", "checkbox", true),
        field("f11", "Vehicle condition photos", "photo"),
    ]),
    section("s3", "Route & GPS", [
        field("f12", "Route tracking", "route"),
        field("f13", "Start location", "text"),
        field("f14", "End location", "text"),
        field("f15", "Route notes", "text"),
    ]),
    section("s4", "Driving Behaviour", [
        field("f16", "Speed compliance", "select", true, CONDITION),
        field("f17", "Smoothness of acceleration", "select", true, CONDITION),
        field("f18", "Braking control", "select", true, CONDITION),
        field("f19", "Steering stability", "select", true, CONDITION),
        field("f20", "Hazard awareness", "select", true, CONDITION),
        field("f21", "Lane discipline", "select", false, CONDITION),
    ]),
    section("s5", "Sensor Analysis", [
        field("f22", "Vibration analysis", "accelerometer"),
        field("f23", "RMS", "number"),
        field("f24", "Peak", "number"),
        field("f25", "Avg", "number"),
        field("f26", "Sensor notes", "text"),
    ]),
    section("s6", "Assessment Summary", [
        field("f27", "Overall result", "select", true, ["Pass", "Fail", "Conditional Pass"]),
        field("f28", "Assessor comments", "text"),
        field("f29", "Areas for improvement", "text"),
        field("f30", "Assessor signature", "signature", true),
        field("f31", "Driver signature", "signature"),
    ]),
];

// ─── Template 5 — Patient Rehabilitation ──────────────────────────────────────

const rehabSections: TemplateSection[] = [
    section("s1", "Patient Information", [
        field("f1", "Patient name", "text", true),
        field("f2", "Patient ID", "text", true),
        field("f3", "Date of birth", "text"),
        field("f4", "Condition / diagnosis", "text", true),
        field("f5", "Clinician name", "text", true),
        field("f6", "Session date", "text", true),
    ]),
    section("s2", "Session Details", [
        field("f7", "Session number", "number", true),
        field("f8", "Session duration (min)", "number"),
        field("f9", "Session type", "select", true, ["Physiotherapy", "Occupational Therapy", "Exercise Rehab", "Other"]),
        field("f10", "Pain level (0–10)", "select", false, ["0","1","2","3","4","5","6","7","8","9","10"]),
    ]),
    section("s3", "Range of Motion", [
        field("f11", "Joint assessed", "select", true, ["Knee", "Shoulder", "Elbow", "Hip", "Ankle", "Wrist"]),
        field("f12", "Starting angle (°)", "number"),
        field("f13", "End angle (°)", "number"),
        field("f14", "Movement photos / video", "photo"),
        field("f15", "ROM notes", "text"),
    ]),
    section("s4", "Strength & Repetitions", [
        field("f16", "Exercise name", "text"),
        field("f17", "Target reps", "number"),
        field("f18", "Completed reps", "number"),
        field("f19", "Sets completed", "number"),
        field("f20", "Resistance level", "text"),
    ]),
    section("s5", "Reflex & Timing", [
        field("f21", "Test performed", "text"),
        field("f22", "Reaction time (ms)", "number"),
        field("f23", "Response quality", "select", false, ["Normal", "Reduced", "Absent", "Hyperreflexic"]),
        field("f24", "Notes", "text"),
    ]),
    section("s6", "Progress & Sign-off", [
        field("f25", "Progress vs last session", "select", true, ["Improved", "Same", "Declined"]),
        field("f26", "Patient feedback", "text"),
        field("f27", "Clinician observations", "text"),
        field("f28", "Next session goals", "text"),
        field("f29", "Clinician signature", "signature", true),
    ]),
];

// ─── Template 6 — General Report ─────────────────────────────────────────────

const generalSections: TemplateSection[] = [
    section("s1", "Report Details", [
        field("f1", "Title", "text", true),
        field("f2", "Date", "text", true),
        field("f3", "Author", "text", true),
        field("f4", "Category / subject", "text"),
    ]),
    section("s2", "Notes", [
        field("f5", "Main content", "text", true),
        field("f6", "Additional notes", "text"),
    ]),
    section("s3", "Media", [
        field("f7", "Photos", "photo"),
        field("f8", "Supporting photos", "photo"),
    ]),
];

// ─── Template 7 — Service Delivery ────────────────────────────────────────────

const deliverySections: TemplateSection[] = [
    section("s1", "Driver & Vehicle", [
        field("f1", "Driver name", "text", true),
        field("f2", "Vehicle registration", "text", true),
        field("f3", "Service type", "select", true, ["Rideshare", "Delivery", "Trades", "Other"]),
        field("f4", "Shift start time", "text", true),
    ]),
    section("s2", "Route Details", [
        field("f5", "Start location", "text", true),
        field("f6", "Planned end location", "text"),
        field("f7", "Expected duration", "text"),
        field("f8", "Route notes", "text"),
    ]),
    section("s3", "Stops Log", [
        field("f9",  "Stop 1 — address", "text"),
        field("f10", "Stop 1 — arrival time", "text"),
        field("f11", "Stop 1 — departure time", "text"),
        field("f12", "Stop 1 — status", "select", false, ["Completed", "Missed", "Delayed"]),
        field("f13", "Stop 1 — notes", "text"),
        field("f14", "Stop 1 — photo", "photo"),
        field("f15", "Stop 2 — address", "text"),
        field("f16", "Stop 2 — arrival time", "text"),
        field("f17", "Stop 2 — departure time", "text"),
        field("f18", "Stop 2 — status", "select", false, ["Completed", "Missed", "Delayed"]),
    ]),
    section("s4", "Performance Metrics", [
        field("f19", "Total distance (km)", "number"),
        field("f20", "Average speed (km/h)", "number"),
        field("f21", "Stops completed", "number"),
        field("f22", "Total time", "text"),
    ]),
    section("s5", "Summary", [
        field("f23", "Notes", "text"),
        field("f24", "Issues encountered", "text"),
        field("f25", "Driver signature", "signature"),
    ]),
];

// ─── Exported catalogue ───────────────────────────────────────────────────────

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
    {
        id: "sys_rental",
        name: "Rental Inspection",
        category: "Property",
        description: "Document property condition room-by-room for landlords, tenants, and agents.",
        icon: "home-outline",
        color: "#8b5cf6",
        gpsValidation: true,
        features: ["Room-by-room photos", "GPS-tagged images", "Condition scoring"],
        sections: rentalSections,
    },
    {
        id: "sys_trades",
        name: "Trades Report",
        category: "Trades",
        description: "Verify work completed and compliance for electricians, plumbers, and fitters.",
        icon: "construct-outline",
        color: "#22c55e",
        gpsValidation: true,
        features: ["Before & after photos", "Measurement capture", "Compliance check"],
        sections: tradesSections,
    },
    {
        id: "sys_legal",
        name: "Legal & Forensic",
        category: "Legal",
        description: "Evidence documentation for forensics and police incidents with chain-of-custody tracking.",
        icon: "shield-outline",
        color: "#ec4899",
        gpsValidation: true,
        features: ["Chain of custody", "Audio transcript", "GPS & timestamp verification"],
        sections: legalSections,
    },
    {
        id: "sys_driving",
        name: "Driving Test",
        category: "Driving",
        description: "Evaluate driving behaviour, stability, and route compliance (e.g. ambulance driver assessments).",
        icon: "car-outline",
        color: "#f59e0b",
        gpsValidation: true,
        features: ["Accelerometer analysis", "GPS route tracking", "Stability scoring"],
        sections: drivingSections,
    },
    {
        id: "sys_rehab",
        name: "Patient Rehabilitation",
        category: "Rehab",
        description: "Track patient recovery, joint angles, strength, and reflex timing across sessions.",
        icon: "fitness-outline",
        color: "#3b82f6",
        gpsValidation: false,
        features: ["Gyroscope angle capture", "Rep & reflex timing", "Session comparison"],
        sections: rehabSections,
    },
    {
        id: "sys_general",
        name: "General Report",
        category: "General",
        description: "Flexible note-taking for journals, coaching, hobbies, or any field report.",
        icon: "create-outline",
        color: "#64748b",
        gpsValidation: false,
        features: ["Speech-to-text notes", "Photo attachments", "Free-form content"],
        sections: generalSections,
    },
    {
        id: "sys_delivery",
        name: "Service Delivery",
        category: "Delivery",
        description: "Track driver routes, stop times, and delivery performance with GPS and notifications.",
        icon: "navigate-outline",
        color: "#06b6d4",
        gpsValidation: true,
        features: ["GPS route & markers", "Stop time logging", "Average speed"],
        sections: deliverySections,
    },
];

export const CATEGORIES = [
    "All",
    "Property",
    "Trades",
    "Legal",
    "Driving",
    "Rehab",
    "General",
    "Delivery",
] as const;
