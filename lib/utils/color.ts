const PALETTE = ["#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#f2a72f", "#06b6d4"];

export function templateColor(name: string): string {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
    return PALETTE[Math.abs(h) % PALETTE.length];
}
