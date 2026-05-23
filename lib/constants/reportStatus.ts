export const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
    completed:  { label: "Completed",   bg: "#44ff0025", text: "#44ff00" },
    inprogress: { label: "In Progress", bg: "#44d2f925", text: "#44d2f9" },
    archived:   { label: "Archived",    bg: "#6b728025", text: "#6b7280" },
    draft:      { label: "Draft",       bg: "#ffff5b25", text: "#ffff5b" },
};

export const STATUS_CFG_DETAIL: Record<string, { label: string; color: string; bg: string }> = {
    completed:  { label: "Completed",   color: "#22c55e", bg: "#22c55e20" },
    inprogress: { label: "In Progress", color: "#44d2f9", bg: "#44d2f920" },
    archived:   { label: "Archived",    color: "#6b7280", bg: "#6b728020" },
    draft:      { label: "Draft",       color: "#ffff5b", bg: "#ffff5b20" },
};

export const SECTION_STATUS_CFG = {
    completed:  { icon: "checkmark"            as const, color: "#22c55e", bg: "#22c55e20" },
    partial:    { icon: "remove"               as const, color: "#eab308", bg: "#eab30820" },
    inprogress: { icon: "ellipsis-horizontal"  as const, color: "#f2a72f", bg: "#f2a72f20" },
    skipped:    { icon: "remove"               as const, color: "#52525b", bg: "#3f3f4640" },
    notstarted: { icon: "remove"               as const, color: "#52525b", bg: "#3f3f4640" },
};
