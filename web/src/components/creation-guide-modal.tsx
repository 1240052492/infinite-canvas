import { Check, Lock, RefreshCw, Save, Scaling, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";

const ACK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function ackStorageKey(platform: "image" | "video") {
    return `canvas.creationGuideAck.${platform}`;
}

function hasRecentAck(platform: "image" | "video") {
    try {
        const raw = localStorage.getItem(ackStorageKey(platform));
        if (!raw) return false;
        const acknowledgedAt = Number(raw);
        return Number.isFinite(acknowledgedAt) && Date.now() - acknowledgedAt < ACK_TTL_MS;
    } catch {
        return false;
    }
}

type GuideItem = { icon: React.ReactNode; titleKey: string; descKey: string };

export function CreationGuideModal({ platform }: { platform: "image" | "video" }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [remindLater, setRemindLater] = useState(false);

    useEffect(() => {
        if (!hasRecentAck(platform)) setOpen(true);
    }, [platform]);

    const acknowledge = () => {
        if (remindLater) {
            try {
                localStorage.setItem(ackStorageKey(platform), String(Date.now()));
            } catch {
                /* storage unavailable; ignore */
            }
        }
        setOpen(false);
    };

    const items: GuideItem[] = useMemo(
        () => [
            { icon: <ShieldCheck className="size-4" />, titleKey: "guide.item1Title", descKey: "guide.item1Desc" },
            { icon: <Save className="size-4" />, titleKey: "guide.item2Title", descKey: platform === "video" ? "guide.item2DescVideo" : "guide.item2Desc" },
            { icon: <Scaling className="size-4" />, titleKey: "guide.item3Title", descKey: "guide.item3Desc" },
            { icon: <Lock className="size-4" />, titleKey: "guide.item4Title", descKey: "guide.item4Desc" },
        ],
        [platform],
    );

    return (
        <Modal
            open={open}
            onCancel={acknowledge}
            width={680}
            footer={null}
            title={
                <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                        <Check className="size-3.5" />
                    </span>
                    <span>{t("guide.title")}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-normal text-stone-500 dark:bg-stone-800 dark:text-stone-400">{t(platform === "video" ? "guide.platformVideo" : "guide.platformImage")}</span>
                </div>
            }
        >
            <p className="mb-4 mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{t("guide.intro")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                    <div key={item.titleKey} className="rounded-xl border border-stone-200 p-3.5 dark:border-stone-700">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">{item.icon}</span>
                            <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{t(item.titleKey)}</span>
                        </div>
                        <p className="text-xs leading-5 text-stone-500 dark:text-stone-400">{t(item.descKey)}</p>
                    </div>
                ))}
            </div>
            <div className="mt-3 rounded-xl border border-stone-200 p-3.5 dark:border-stone-700">
                <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        <RefreshCw className="size-4" />
                    </span>
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{t("guide.item5Title")}</span>
                </div>
                <p className="text-xs leading-5 text-stone-500 dark:text-stone-400">{t("guide.item5Desc")}</p>
            </div>
            {platform === "video" ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-5 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">{t("guide.videoNotice")}</div>
            ) : null}
            <p className="mt-4 text-xs leading-5 text-stone-400 dark:text-stone-500">{t("guide.footerNote")}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
                <Checkbox checked={remindLater} onChange={(event) => setRemindLater(event.target.checked)}>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{t("guide.remind7d")}</span>
                </Checkbox>
                <div className={cn("flex items-center gap-2")}>
                    <Button onClick={() => { setOpen(false); navigate("/", { replace: true }); }}>{t("guide.later")}</Button>
                    <Button type="primary" onClick={acknowledge}>{t("guide.confirm")}</Button>
                </div>
            </div>
        </Modal>
    );
}
