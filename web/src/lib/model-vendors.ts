// Vendor classification for model pickers. Classification is keyword based so
// models from any upstream vendor (not just ToAPIs) are grouped automatically:
// a new model only needs its name to carry a known brand keyword. Add a new
// vendor entry (or keyword) here when onboarding a new provider; nothing else
// needs to change.

export type ModelVendor = {
    id: string;
    /** Brand label shown in the vendor dropdown. */
    label: string;
    /** Lowercase keywords matched against the model name (contains-match). */
    keywords: string[];
};

// Ordered: the first vendor whose keyword matches wins, so more specific
// brands must come before looser ones.
export const MODEL_VENDORS: ModelVendor[] = [
    { id: "openai", label: "OpenAI", keywords: ["gpt", "openai", "chatgpt", "dall", "sora", "o1", "o3", "o4"] },
    { id: "google", label: "Google", keywords: ["gemini", "nano-banana", "nano_banana", "imagen", "veo", "gemma"] },
    { id: "anthropic", label: "Anthropic", keywords: ["claude", "anthropic"] },
    { id: "xai", label: "xAI", keywords: ["grok"] },
    { id: "bytedance", label: "字节跳动", keywords: ["doubao", "seedance", "seedream", "jimeng", "pixeldance"] },
    { id: "alibaba", label: "阿里云", keywords: ["qwen", "wanx", "wan2", "wan3", "tongyi", "wan-"] },
    { id: "deepseek", label: "DeepSeek", keywords: ["deepseek"] },
    { id: "zhipu", label: "智谱 AI", keywords: ["glm", "cogview", "cogvideo", "charglm"] },
    { id: "moonshot", label: "月之暗面", keywords: ["kimi", "moonshot"] },
    { id: "minimax", label: "MiniMax", keywords: ["minimax", "hailuo", "abab"] },
    { id: "baidu", label: "百度", keywords: ["ernie", "wenxin"] },
    { id: "tencent", label: "腾讯", keywords: ["hunyuan"] },
    { id: "bfl", label: "Black Forest Labs", keywords: ["flux"] },
    { id: "stability", label: "Stability AI", keywords: ["stable-diffusion", "stable-", "sdxl", "sd3"] },
    { id: "midjourney", label: "Midjourney", keywords: ["midjourney", "niji", "mj_"] },
    { id: "meta", label: "Meta", keywords: ["llama"] },
];

export const OTHER_VENDOR_ID = "other";

/** Classify one model name into a vendor id; unmatched models fall to "other". */
export function classifyModelVendor(model: string): string {
    const name = (model || "").toLowerCase();
    if (!name) return OTHER_VENDOR_ID;
    for (const vendor of MODEL_VENDORS) {
        if (vendor.keywords.some((keyword) => name.includes(keyword))) return vendor.id;
    }
    return OTHER_VENDOR_ID;
}

export function vendorLabel(vendorId: string): string {
    if (vendorId === OTHER_VENDOR_ID) return "其他";
    return MODEL_VENDORS.find((vendor) => vendor.id === vendorId)?.label || vendorId;
}

/** Group model names by vendor, preserving the original model order and the
 * MODEL_VENDORS order for vendors; unmatched models land in "other". */
export function groupModelsByVendor(models: string[]): Array<{ vendorId: string; models: string[] }> {
    const buckets = new Map<string, string[]>();
    for (const model of models) {
        const vendorId = classifyModelVendor(model);
        const bucket = buckets.get(vendorId);
        if (bucket) bucket.push(model);
        else buckets.set(vendorId, [model]);
    }
    const grouped: Array<{ vendorId: string; models: string[] }> = [];
    for (const vendor of MODEL_VENDORS) {
        const bucket = buckets.get(vendor.id);
        if (bucket?.length) grouped.push({ vendorId: vendor.id, models: bucket });
        buckets.delete(vendor.id);
    }
    const other = buckets.get(OTHER_VENDOR_ID);
    if (other?.length) grouped.push({ vendorId: OTHER_VENDOR_ID, models: other });
    return grouped;
}
