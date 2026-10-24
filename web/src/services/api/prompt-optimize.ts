import axios from "axios";

import { ensureAuthenticated } from "@/services/auth-gate";
import type { AiConfig } from "@/stores/use-config-store";

// Prompt optimization prefers the GPT-5.6-terra model when the provider
// exposes it; otherwise it falls back to the currently selected text model.
const OPTIMIZE_MODEL_PATTERN = /gpt-5\.6-terra/i;

const SYSTEM_PROMPTS: Record<"image" | "video", string> = {
    image: [
        "你是一位资深 AI 绘画提示词工程师。",
        "用户会给出一句简短的画面描述，请把它扩写为一段专业、详细的文生图提示词：",
        "保留用户的核心主体与意图，补充主体细节、构图视角、光影氛围、艺术风格、画质与渲染关键词。",
        "不要改变用户想表达的主题，不要添加与主体无关的元素。",
        "直接输出优化后的提示词正文，不要任何解释、引号或前后缀。",
    ].join("\n"),
    video: [
        "你是一位资深 AI 视频生成提示词工程师。",
        "用户会给出一句简短的视频创意描述，请把它扩写为一段专业、详细的文生视频提示词：",
        "保留用户的核心主体与意图，补充镜头运动、景别切换、主体动作、场景氛围、光影与画面风格。",
        "不要改变用户想表达的主题，不要添加与主体无关的元素。",
        "直接输出优化后的提示词正文，不要任何解释、引号或前后缀。",
    ].join("\n"),
};

export function pickPromptOptimizeModel(config: Pick<AiConfig, "models" | "model">): string {
    const preferred = config.models.find((model) => OPTIMIZE_MODEL_PATTERN.test(model));
    return preferred || config.model;
}

export async function requestPromptOptimization(config: AiConfig, prompt: string, mode: "image" | "video"): Promise<string> {
    if (!ensureAuthenticated()) throw new Error("loginRequired");
    const text = prompt.trim();
    if (!text) throw new Error("emptyPrompt");
    const model = pickPromptOptimizeModel(config);
    const baseUrl = (config.baseUrl || "").trim().replace(/\/+$/, "");
    if (!baseUrl || !config.apiKey) throw new Error("configMissing");
    const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
            model,
            messages: [
                { role: "system", content: SYSTEM_PROMPTS[mode] },
                { role: "user", content: text },
            ],
            temperature: 0.7,
            stream: false,
        },
        {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
            timeout: 60_000,
        },
    );
    const content = response.data?.choices?.[0]?.message?.content;
    const optimized = typeof content === "string" ? content.trim() : "";
    if (!optimized) throw new Error("optimizeFailed");
    return optimized;
}
