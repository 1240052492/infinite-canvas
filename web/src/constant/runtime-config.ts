// Runtime configuration access layer.
// Priority: window.__RUNTIME_CONFIG__ (injected by the container entrypoint or public/config.js) > build-time VITE_ variables > defaults.
// This supports both configuring the same image with docker run -e and injecting values during custom builds.
//
// Each analytics provider has its own variable; configured providers are enabled independently and all are disabled by default.
// Only GA4 and Baidu are supported. Both accept IDs only, and script URLs are assembled in code without arbitrary scripts or inline JavaScript.

type RuntimeConfig = {
    ANALYTICS_GA4_ID?: string; // GA4 measurement ID (G-XXXX)
    ANALYTICS_BAIDU_ID?: string; // Baidu Analytics site ID
    NEW_API_BASE_URL?: string; // Base URL for the top-bar Home/Wallet/Keys links; supports relative paths (e.g. "/")
    TOP_NAV_HIDDEN?: string; // Comma-separated top-bar entries to hide: home,wallet,keys,docs,github
    DEFAULT_CHANNEL_BASE_URL?: string; // Default (and, when locked, mandatory) channel endpoint URL
    LOCK_CHANNEL_BASE_URL?: string; // "true" forces every channel to DEFAULT_CHANNEL_BASE_URL and disables editing
};

declare global {
    interface Window {
        __RUNTIME_CONFIG__?: RuntimeConfig;
    }
}

const runtime: RuntimeConfig = (typeof window !== "undefined" && window.__RUNTIME_CONFIG__) || {};

function read(key: keyof RuntimeConfig, buildTime: string | undefined, fallback = ""): string {
    const value = runtime[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof buildTime === "string" && buildTime.trim()) return buildTime.trim();
    return fallback;
}

export const ANALYTICS_GA4_ID = read("ANALYTICS_GA4_ID", import.meta.env.VITE_ANALYTICS_GA4_ID);
export const ANALYTICS_BAIDU_ID = read("ANALYTICS_BAIDU_ID", import.meta.env.VITE_ANALYTICS_BAIDU_ID);

export const NEW_API_BASE_URL = read("NEW_API_BASE_URL", import.meta.env.VITE_NEW_API_BASE_URL);

const RAW_TOP_NAV_HIDDEN = read("TOP_NAV_HIDDEN", import.meta.env.VITE_TOP_NAV_HIDDEN);
export const TOP_NAV_HIDDEN_ITEMS: ReadonlySet<string> = new Set(
    RAW_TOP_NAV_HIDDEN.split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
);

export const DEFAULT_CHANNEL_BASE_URL = read("DEFAULT_CHANNEL_BASE_URL", import.meta.env.VITE_DEFAULT_CHANNEL_BASE_URL);

const RAW_LOCK_CHANNEL_BASE_URL = read("LOCK_CHANNEL_BASE_URL", import.meta.env.VITE_LOCK_CHANNEL_BASE_URL);
/** Lock only takes effect when a fixed URL is actually configured. */
export const CHANNEL_BASE_URL_LOCKED = RAW_LOCK_CHANNEL_BASE_URL.trim().toLowerCase() === "true" && Boolean(DEFAULT_CHANNEL_BASE_URL);
