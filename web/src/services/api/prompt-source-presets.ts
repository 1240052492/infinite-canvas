import { nanoid } from "nanoid";

export type PromptSourceKind = "image" | "video";

export type PromptSource = {
    id: string;
    name: string;
    url: string;
    homepage: string;
    enabled: boolean;
    builtIn: boolean;
    /** Library tab the source belongs to; undefined shows in both tabs (custom sources). */
    kind?: PromptSourceKind;
};

export function sourceMatchesKind(source: PromptSource, kind: PromptSourceKind | undefined) {
    return !kind || !source.kind || source.kind === kind;
}

export const PROMPT_REGISTRY_HOMEPAGE = "https://github.com/yukkcat/image-prompts";
const PROMPT_REGISTRY_SOURCE_BASE = "https://raw.githubusercontent.com/yukkcat/image-prompts/main/dist/sources";

export function createPromptSource(source?: Partial<PromptSource>): PromptSource {
    return {
        id: source?.id?.trim() || nanoid(),
        name: source?.name?.trim() || "",
        url: source?.url?.trim() || "",
        homepage: source?.homepage?.trim() || "",
        enabled: source?.enabled ?? true,
        builtIn: source?.builtIn ?? false,
    };
}

export const DEFAULT_PROMPT_SOURCES: PromptSource[] = [
    registrySource("banana-prompt-quicker", "Nano Banana", "https://glidea.github.io/banana-prompt-quicker/", "image"),
    registrySource("awesome-gpt-image", "GPT Image", "https://github.com/ZeroLu/awesome-gpt-image", "image"),
    registrySource("freestylefly-gpt-image-2", "GPT Image 2", "https://github.com/freestylefly/awesome-gpt-image-2", "image"),
    registrySource("youmind-nano-banana-pro", "Nano Banana Pro", "https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts", "image"),
    localSource("youmind-gemini-3", "Gemini 3", "/prompts/gemini-3-prompts.json", "https://github.com/YouMind-OpenLab/awesome-gemini-3-prompts", "image"),
    localSource("video-veo", "Veo 精选", "/prompts/video-veo.json", "https://awesomevideoprompts.com/", "video"),
    localSource("youmind-seedance-2", "Seedance 2.0 精选", "/prompts/seedance-2-prompts.json", "https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts", "video"),
    localSource("video-seedance25", "Seedance 2.5 精选", "/prompts/seedance-2-prompts.json", "https://awesomevideoprompts.com/zh/models/seedance25", "video"),
    localSource("video-grok", "Grok 精选", "/prompts/video-grok.json", "https://awesomevideoprompts.com/", "video"),
    localSource("video-minimax", "MiniMax 精选", "/prompts/video-minimax.json", "https://awesomevideoprompts.com/", "video"),
    localSource("video-kling", "可灵精选", "/prompts/video-kling.json", "https://awesomevideoprompts.com/", "video"),
    localSource("video-wan", "万相精选", "/prompts/video-wan.json", "https://help.aliyun.com/zh/model-studio/text-to-video-prompt", "video"),
];

function registrySource(id: string, name: string, homepage: string, kind: PromptSourceKind): PromptSource {
    return { id, name, url: `${PROMPT_REGISTRY_SOURCE_BASE}/${id}.json`, homepage, enabled: true, builtIn: true, kind };
}

function localSource(id: string, name: string, url: string, homepage: string, kind: PromptSourceKind): PromptSource {
    return { id, name, url, homepage, enabled: true, builtIn: true, kind };
}
