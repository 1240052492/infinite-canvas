// Grouping helpers for the workbench generation-log sidebars: records are
// grouped by day bucket (today / yesterday / ... / older) and, inside each
// bucket, near-duplicate submissions (same model + similar prompt) collapse
// into one cluster so repeated retries do not clutter the list.

export type DateGroupKind = "today" | "yesterday" | "dayBefore" | "week" | "month" | "older";

export const DATE_GROUP_ORDER: DateGroupKind[] = ["today", "yesterday", "dayBefore", "week", "month", "older"];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(timestamp: number): number {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

export function dateGroupKind(createdAt: number): DateGroupKind {
    const today = startOfDay(Date.now());
    const day = startOfDay(createdAt);
    const diffDays = Math.round((today - day) / DAY_MS);
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays === 2) return "dayBefore";
    if (diffDays <= 7) return "week";
    if (diffDays <= 30) return "month";
    return "older";
}

export type LogDateGroup<T> = { kind: DateGroupKind; logs: T[] };

/** Bucket logs into date groups, keeping recency order inside each bucket. */
export function groupLogsByDate<T>(logs: T[], createdAtOf: (log: T) => number): LogDateGroup<T>[] {
    const buckets = new Map<DateGroupKind, T[]>();
    for (const log of logs) {
        const kind = dateGroupKind(createdAtOf(log));
        const bucket = buckets.get(kind);
        if (bucket) bucket.push(log);
        else buckets.set(kind, [log]);
    }
    return DATE_GROUP_ORDER.filter((kind) => buckets.has(kind)).map((kind) => ({ kind, logs: buckets.get(kind)! }));
}

export type LogCluster<T> = { key: string; logs: T[] };

/** Cluster logs whose key matches (same vendor model + similar prompt). */
export function clusterSimilarLogs<T>(logs: T[], keyOf: (log: T) => string): LogCluster<T>[] {
    const clusters: LogCluster<T>[] = [];
    const index = new Map<string, LogCluster<T>>();
    for (const log of logs) {
        const key = keyOf(log);
        const existing = index.get(key);
        if (existing) existing.logs.push(log);
        else {
            const cluster: LogCluster<T> = { key, logs: [log] };
            index.set(key, cluster);
            clusters.push(cluster);
        }
    }
    return clusters;
}

/** Similarity key: vendor model + the first 40 normalized prompt characters. */
export function logSimilarityKey(prompt: string, model: string): string {
    const normalized = (prompt || "").replace(/\s+/g, " ").trim().slice(0, 40).toLowerCase();
    return `${model}::${normalized}`;
}
