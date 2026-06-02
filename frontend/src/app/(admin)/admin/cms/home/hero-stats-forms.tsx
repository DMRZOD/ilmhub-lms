"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/instructor-shell/page-states";
import { useAdminHome, useUpdateAdminHome } from "@/features/admin/cms-hooks";
import type { HomeHero, HomeStat } from "@/features/admin/cms-schemas";
import { ADMIN_CMS_TEXT as T } from "@/features/admin/labels";

const labelCls = "text-t-13 font-semibold text-ilm-ink";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-sp-1">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export function HeroForm() {
  const { data, isLoading } = useAdminHome();
  const update = useUpdateAdminHome();
  const [hero, setHero] = React.useState<HomeHero | null>(null);

  React.useEffect(() => {
    if (data) setHero(data.hero);
  }, [data]);

  if (isLoading || !hero) return <PageLoader />;

  const set = (patch: Partial<HomeHero>) =>
    setHero((h) => (h ? { ...h, ...patch } : h));

  return (
    <Card padding="lg" className="flex flex-col gap-sp-4">
      <h3 className="text-t-16 font-bold text-ilm-ink">{T.home.hero}</h3>
      <Field label={T.home.heroTitle}>
        <Input value={hero.title} onChange={(e) => set({ title: e.target.value })} />
      </Field>
      <Field label={T.home.heroSubtitle}>
        <textarea
          value={hero.subtitle}
          onChange={(e) => set({ subtitle: e.target.value })}
          rows={3}
          className="min-h-[88px] w-full rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
        />
      </Field>
      <div className="grid gap-sp-4 sm:grid-cols-2">
        <Field label={T.home.primaryCtaLabel}>
          <Input
            value={hero.primaryCtaLabel}
            onChange={(e) => set({ primaryCtaLabel: e.target.value })}
          />
        </Field>
        <Field label={T.home.primaryCtaHref}>
          <Input
            value={hero.primaryCtaHref}
            onChange={(e) => set({ primaryCtaHref: e.target.value })}
          />
        </Field>
        <Field label={T.home.secondaryCtaLabel}>
          <Input
            value={hero.secondaryCtaLabel}
            onChange={(e) => set({ secondaryCtaLabel: e.target.value })}
          />
        </Field>
        <Field label={T.home.secondaryCtaHref}>
          <Input
            value={hero.secondaryCtaHref}
            onChange={(e) => set({ secondaryCtaHref: e.target.value })}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => update.mutate({ hero })} disabled={update.isPending}>
          {T.home.saveHero}
        </Button>
      </div>
    </Card>
  );
}

export function StatsForm() {
  const { data, isLoading } = useAdminHome();
  const update = useUpdateAdminHome();
  const [stats, setStats] = React.useState<HomeStat[]>([]);

  React.useEffect(() => {
    if (data) setStats(data.stats);
  }, [data]);

  if (isLoading) return <PageLoader />;

  const setRow = (i: number, patch: Partial<HomeStat>) =>
    setStats((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <Card padding="lg" className="flex flex-col gap-sp-4">
      <h3 className="text-t-16 font-bold text-ilm-ink">{T.home.stats}</h3>
      <div className="flex flex-col gap-sp-3">
        {stats.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_1fr_auto] items-end gap-sp-2">
            <Field label={T.home.statValue}>
              <Input
                type="number"
                value={s.value}
                onChange={(e) => setRow(i, { value: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label={T.home.statSuffix}>
              <Input value={s.suffix} onChange={(e) => setRow(i, { suffix: e.target.value })} />
            </Field>
            <Field label={T.home.statLabel}>
              <Input value={s.label} onChange={(e) => setRow(i, { label: e.target.value })} />
            </Field>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={Trash2}
              iconOnly
              aria-label="O'chirish"
              onClick={() => setStats((rows) => rows.filter((_, idx) => idx !== i))}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          iconLeft={Plus}
          disabled={stats.length >= 8}
          onClick={() => setStats((rows) => [...rows, { value: 0, suffix: "+", label: "" }])}
        >
          {T.home.addStat}
        </Button>
        <Button onClick={() => update.mutate({ stats })} disabled={update.isPending}>
          {T.home.saveStats}
        </Button>
      </div>
    </Card>
  );
}
