"use client";

import * as React from "react";
import { CheckCircle2, History, Save, XCircle } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, initialsOf } from "@/lib/format";
import { useAuditFeed, useSettings, useUpdateSettings } from "@/features/admin/cms-hooks";
import { ADMIN_SETTINGS_TEXT as T, AUDIT_ACTION_LABELS } from "@/features/admin/labels";

const labelCls = "text-t-13 font-semibold text-ilm-ink";

export function SettingsContent() {
  const { data, isLoading, isError } = useSettings();
  const update = useUpdateSettings();

  const [commissionPct, setCommissionPct] = React.useState("");
  const [maintenance, setMaintenance] = React.useState(false);
  const [senderName, setSenderName] = React.useState("");
  const [senderAddress, setSenderAddress] = React.useState("");

  React.useEffect(() => {
    if (!data) return;
    setCommissionPct(String(Math.round(data.commissionRate * 1000) / 10));
    setMaintenance(data.maintenanceMode);
    setSenderName(data.emailSender.name);
    setSenderAddress(data.emailSender.address);
  }, [data]);

  function save() {
    const pct = Number(commissionPct);
    update.mutate({
      commissionRate: Number.isFinite(pct)
        ? Math.min(1, Math.max(0, pct / 100))
        : undefined,
      maintenanceMode: maintenance,
      emailSender: { name: senderName, address: senderAddress },
    });
  }

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorCard />;

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-1">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          {T.title}
        </h1>
        <p className="text-t-14 text-fg-2">{T.subtitle}</p>
      </div>

      <div className="grid gap-sp-6 lg:grid-cols-2">
        {/* Commission */}
        <Card padding="lg" className="flex flex-col gap-sp-3">
          <h2 className="text-t-16 font-bold text-ilm-ink">{T.commission.title}</h2>
          <div className="flex flex-col gap-sp-1">
            <label className={labelCls}>{T.commission.label}</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={commissionPct}
              onChange={(e) => setCommissionPct(e.target.value)}
            />
            <p className="text-t-12 text-fg-3">{T.commission.hint}</p>
          </div>
        </Card>

        {/* Maintenance */}
        <Card padding="lg" className="flex flex-col gap-sp-3">
          <h2 className="text-t-16 font-bold text-ilm-ink">{T.maintenance.title}</h2>
          <label className="flex items-center gap-sp-2 text-t-14 text-ilm-ink">
            <Checkbox
              checked={maintenance}
              onCheckedChange={(v) => setMaintenance(Boolean(v))}
            />
            {T.maintenance.label}
          </label>
          <p className="text-t-12 text-fg-3">{T.maintenance.hint}</p>
        </Card>

        {/* Email sender */}
        <Card padding="lg" className="flex flex-col gap-sp-3">
          <h2 className="text-t-16 font-bold text-ilm-ink">{T.emailSender.title}</h2>
          <div className="flex flex-col gap-sp-1">
            <label className={labelCls}>{T.emailSender.name}</label>
            <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-sp-1">
            <label className={labelCls}>{T.emailSender.address}</label>
            <Input
              type="email"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
            />
          </div>
        </Card>

        {/* Integrations */}
        <Card padding="lg" className="flex flex-col gap-sp-3">
          <h2 className="text-t-16 font-bold text-ilm-ink">{T.integrations.title}</h2>
          <div className="flex flex-col gap-sp-2">
            {data.integrations.map((i) => (
              <div
                key={i.key}
                className="flex items-center justify-between rounded-ilm-md bg-ilm-surface px-sp-3 py-sp-2"
              >
                <span className="text-t-14 font-medium text-ilm-ink">{i.label}</span>
                {i.configured ? (
                  <Badge tone="success" icon={CheckCircle2}>
                    {T.integrations.configured}
                  </Badge>
                ) : (
                  <Badge tone="neutral" icon={XCircle}>
                    {T.integrations.notConfigured}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Email templates */}
      <Card padding="lg" className="flex flex-col gap-sp-3">
        <h2 className="text-t-16 font-bold text-ilm-ink">{T.emailTemplates.title}</h2>
        <p className="text-t-12 text-fg-3">{T.emailTemplates.hint}</p>
        <div className="grid gap-sp-2 sm:grid-cols-2">
          {data.emailTemplates.map((t) => (
            <div key={t.key} className="rounded-ilm-md bg-ilm-surface px-sp-3 py-sp-2">
              <p className="text-t-14 font-semibold text-ilm-ink">{t.name}</p>
              <p className="text-t-12 text-fg-3">{t.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button iconLeft={Save} onClick={save} disabled={update.isPending}>
          {T.save}
        </Button>
      </div>

      <AuditFeed />
    </div>
  );
}

function AuditFeed() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError } = useAuditFeed({ page, limit: 15 });

  return (
    <Card padding="lg" className="flex flex-col gap-sp-3">
      <h2 className="text-t-16 font-bold text-ilm-ink">{T.audit.title}</h2>
      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <ErrorCard />
      ) : data.items.length === 0 ? (
        <EmptyState icon={History} text={T.audit.empty} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-3 py-sp-2 font-semibold">{T.audit.columns.action}</th>
                  <th className="px-sp-3 py-sp-2 font-semibold">{T.audit.columns.actor}</th>
                  <th className="px-sp-3 py-sp-2 font-semibold">{T.audit.columns.target}</th>
                  <th className="px-sp-3 py-sp-2 font-semibold">{T.audit.columns.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-ilm-border last:border-0"
                  >
                    <td className="px-sp-3 py-sp-2 text-t-14 text-ilm-ink">
                      {AUDIT_ACTION_LABELS[e.action] ?? e.action}
                    </td>
                    <td className="px-sp-3 py-sp-2">
                      {e.actor ? (
                        <div className="flex items-center gap-sp-2">
                          <Avatar
                            size="sm"
                            ink
                            src={e.actor.avatarUrl ?? undefined}
                            alt={e.actor.name}
                            initials={initialsOf(e.actor.name)}
                          />
                          <span className="text-t-13 text-fg-2">{e.actor.name}</span>
                        </div>
                      ) : (
                        <span className="text-t-12 text-fg-3">—</span>
                      )}
                    </td>
                    <td className="px-sp-3 py-sp-2 text-t-12 text-fg-3">
                      {e.targetType}
                    </td>
                    <td className="px-sp-3 py-sp-2 text-t-13 text-fg-2">
                      {formatShortDate(e.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPage={setPage}
          />
        </>
      )}
    </Card>
  );
}
