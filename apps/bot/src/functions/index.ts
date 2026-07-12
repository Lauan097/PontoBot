export * from "./utils/banner.js";
export * from "./utils/emoji.js";
export * from "./utils/verify.js";
export * from "./utils/audit.js";

export function formatDuration(seconds: number): string {
    const units = [
        { label: "d", value: 86400 },
        { label: "h", value: 3600 },
        { label: "m", value: 60 },
        { label: "s", value: 1 },
    ];

    const parts: string[] = [];

    for (const unit of units) {
        const amount = Math.floor(seconds / unit.value);

        if (amount > 0) {
            parts.push(`${amount}${unit.label}`);
            seconds %= unit.value;
        }

        if (parts.length === 2) break;
    }

    return parts.join(" e ") || "0s";
}