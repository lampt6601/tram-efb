"use client";

import { useState, useTransition } from "react";
import { updateSiteSetting } from "@/app/actions/super-admin-actions";
import { Button } from "@thc-efb/ui/button";
import { Input } from "@thc-efb/ui/input";
import { Save, Loader2, Check } from "lucide-react";
import type { SiteSetting } from "@thc-efb/supabase/types";

interface SiteSettingsFormProps {
  settings: SiteSetting[];
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function handleSave(key: string) {
    setSavingKey(key);
    startTransition(async () => {
      try {
        await updateSiteSetting(key, values[key] ?? "");
        setSaved((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
      } catch (err) {
        alert("Lỗi: " + (err instanceof Error ? err.message : "Không thể lưu"));
      } finally {
        setSavingKey(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      {settings.map((setting) => (
        <div
          key={setting.key}
          className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {setting.label || setting.key}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Key: <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] dark:bg-slate-700">{setting.key}</code>
              </p>
            </div>
            {saved[setting.key] && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Đã lưu
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={values[setting.key] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
              }
              placeholder="Nhập giá trị..."
              className="h-9 flex-1 text-sm"
            />
            <Button
              size="sm"
              onClick={() => handleSave(setting.key)}
              disabled={isPending && savingKey === setting.key}
              className="h-9 gap-1.5"
            >
              {isPending && savingKey === setting.key ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Lưu
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
