import { useMemo } from "react";
import { Cpu } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { classifyModelVendor, groupModelsByVendor, vendorLabel } from "@/lib/model-vendors";
import { modelOptionLabel, selectableModelsByCapability, type AiConfig, type ModelCapability } from "@/stores/use-config-store";
import { ModelIcon, ModelLabel } from "@/components/model-picker";

type VendorModelPickerProps = {
    config: AiConfig;
    value?: string;
    onChange: (model: string) => void;
    capability?: ModelCapability;
    className?: string;
    onMissingConfig?: () => void;
};

// Two-level cascading picker: vendor first, then the vendor's models. Vendors
// are derived from the model names themselves (see lib/model-vendors.ts), so
// newly onboarded providers are grouped automatically.
export function VendorModelPicker({ config, value, onChange, capability, className, onMissingConfig }: VendorModelPickerProps) {
    const { t } = useTranslation();
    const groups = useMemo(
        () => groupModelsByVendor(Array.from(new Set(selectableModelsByCapability(config, capability)))),
        [capability, config],
    );
    const current = value || "";
    const currentVendor = current ? classifyModelVendor(current) : "";
    const activeVendor = groups.some((group) => group.vendorId === currentVendor) ? currentVendor : "";
    const activeModels = groups.find((group) => group.vendorId === activeVendor)?.models || [];

    return (
        <div className={cn("flex w-full min-w-0 items-center gap-2", className)}>
            <Select
                value={activeVendor}
                onValueChange={(vendorId) => {
                    const group = groups.find((item) => item.vendorId === vendorId);
                    if (!group?.models.length) return;
                    // Keep the current model when it already belongs to the
                    // chosen vendor; otherwise jump to the vendor's first one.
                    if (group.models.includes(current)) return;
                    onChange(group.models[0]);
                }}
            >
                <SelectTrigger
                    className="h-8 max-w-[50%] shrink-0 gap-2 rounded-full border border-input bg-transparent px-3 text-sm font-normal shadow-sm transition-colors data-[state=open]:border-ring data-[state=open]:ring-2 data-[state=open]:ring-ring/20"
                    onMouseDown={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <ModelIcon model={current} />
                    <span className="min-w-0 truncate">{activeVendor ? vendorLabel(activeVendor) : t("settingsPanels.model.vendor")}</span>
                </SelectTrigger>
                <SelectContent
                    data-canvas-no-zoom
                    className="z-[1200] w-56 rounded-xl border border-border/70 bg-popover p-1 shadow-xl"
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    onPointerDown={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    {groups.map((group) => (
                        <SelectItem key={group.vendorId} value={group.vendorId} textValue={vendorLabel(group.vendorId)}>
                            <span className="flex min-w-0 items-center gap-2">
                                <VendorIcon vendorId={group.vendorId} model={group.models[0]} />
                                <span className="truncate">{vendorLabel(group.vendorId)}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{group.models.length}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={current}
                onOpenChange={(nextOpen) => {
                    if (nextOpen && !activeModels.length && config.channelMode === "local") onMissingConfig?.();
                }}
                onValueChange={onChange}
                disabled={!activeVendor}
            >
                <SelectTrigger
                    className="h-8 min-w-0 flex-1 justify-start gap-2 rounded-full border border-input bg-transparent px-3 text-sm font-normal shadow-sm transition-colors data-[state=open]:border-ring data-[state=open]:ring-2 data-[state=open]:ring-ring/20"
                    onMouseDown={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    title={current ? modelOptionLabel(config, current) : t("settingsPanels.model.select")}
                >
                    <span className="canvas-model-picker-text min-w-0 flex-1 truncate text-left">{current ? modelOptionLabel(config, current) : t("settingsPanels.model.select")}</span>
                </SelectTrigger>
                <SelectContent
                    data-canvas-no-zoom
                    className="z-[1200] w-80 max-w-[calc(100vw-24px)] rounded-xl border border-border/70 bg-popover p-1 shadow-xl"
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    onPointerDown={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    {activeModels.length ? (
                        activeModels.map((model) => (
                            <SelectItem key={model} value={model} textValue={modelOptionLabel(config, model)}>
                                <ModelLabel config={config} model={model} />
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="__empty__" disabled>
                            {t("settingsPanels.model.noMatch", { capability: capability ? t(`settingsPanels.model.capabilities.${capability}`) : "" })}
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

function VendorIcon({ vendorId, model }: { vendorId: string; model?: string }) {
    if (vendorId === "other") return <Cpu className="size-4 shrink-0 opacity-70" />;
    // Reuse the per-model brand icons; the vendor's first model usually
    // carries the same brand keyword.
    return <ModelIcon model={model || vendorId} />;
}
