import axios from "axios";
import { Check, Lock, RefreshCw, Save, Scaling, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";

import { OAUTH_CONFIG } from "@/constants/oauth-config";
import { checkPlatformSession, ensureAuthenticated, startSilentSso } from "@/services/auth-gate";
import { isTokenExpired } from "@/services/oauth";
import { useAuthStore } from "@/stores/use-auth-store";

// Server-side frequency control for logged-in users (per account, survives
// browser resets). Guests always see the guide with a login prompt; admins
// never do. When the status endpoint is unreachable the local record below
// keeps the dialog from nagging on every entry.
const LOCAL_ACK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_SECONDS = 24 * 60 * 60;

const guideApiOrigin = new URL(OAUTH_CONFIG.tokenUrl).origin;

function ackStorageKey(platform: "image" | "video") {
    return `canvas.creationGuideAck.${platform}`;
}

function hasRecentLocalAck(platform: "image" | "video") {
    try {
        const raw = localStorage.getItem(ackStorageKey(platform));
        if (!raw) return false;
        const acknowledgedAt = Number(raw);
        return Number.isFinite(acknowledgedAt) && Date.now() - acknowledgedAt < LOCAL_ACK_TTL_MS;
    } catch {
        return false;
    }
}

function recordLocalAck(platform: "image" | "video") {
    try {
        localStorage.setItem(ackStorageKey(platform), String(Date.now()));
    } catch {
        /* storage unavailable; ignore */
    }
}

type GuideItem = { icon: React.ReactNode; titleKey: string; descKey: string };

type ServerGuideStatus = { reminder_days?: number; acked_at?: Record<string, number> };

export function CreationGuideModal({ platform }: { platform: "image" | "video" }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    // Reactive auth state: the footer buttons must follow the logged-in
    // status, otherwise a returning user would still see the login prompt.
    const authed = useAuthStore((state) => Boolean(state.token && state.expiresAt && !isTokenExpired(state.expiresAt)));

    useEffect(() => {
        let cancelled = false;
        if (useAuthStore.getState().isAdmin()) return;

        if (!authed) {
            // Guests: only show the login prompt once we know there is no
            // platform session. A visitor logged in to the New API console
            // is signed in silently instead, so the dialog never asks them
            // to log in twice.
            void checkPlatformSession().then((session) => {
                if (cancelled) return;
                if (session.authenticated) {
                    startSilentSso();
                    return;
                }
                setOpen(true);
            });
            return () => {
                cancelled = true;
            };
        }

        const decideByAccount = async () => {
            const token = useAuthStore.getState().token;
            try {
                const response = await axios.get<ServerGuideStatus>(`${guideApiOrigin}/api/creation-guide/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (cancelled) return;
                const reminderDays = response.data.reminder_days ?? 7;
                const ackedAt = response.data.acked_at?.[platform];
                if (ackedAt && Date.now() / 1000 - ackedAt < reminderDays * DAY_SECONDS) return;
                setOpen(true);
            } catch {
                if (cancelled) return;
                if (!hasRecentLocalAck(platform)) setOpen(true);
            }
        };
        void decideByAccount();
        return () => {
            cancelled = true;
        };
    }, [platform, authed]);

    // Explicit confirmation records the acknowledgement for the account
    // (server) and this browser (fallback). Guests are not recorded: the
    // agreed strategy shows them the guide on every workbench entry, with a
    // login button next to the confirmation. Closing without confirming
    // does not record either, so the guide shows again on the next entry.
    const acknowledge = () => {
        const { token } = useAuthStore.getState();
        if (authed && token) {
            void axios
                .post(
                    `${guideApiOrigin}/api/creation-guide/ack`,
                    { platform },
                    { headers: { Authorization: `Bearer ${token}` } },
                )
                .catch(() => {
                    /* server unavailable; the local record below still applies */
                });
            recordLocalAck(platform);
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
            onCancel={() => setOpen(false)}
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
            <div className="mt-4 flex items-center justify-end gap-2">
                {!authed ? (
                    <Button onClick={() => { ensureAuthenticated(); }}>{t("guide.login")}</Button>
                ) : null}
                <Button type="primary" onClick={acknowledge}>{t("guide.confirm")}</Button>
            </div>
        </Modal>
    );
}
