export function AuthDivider({ label = "yoki" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-ilm-border" />
      <span className="text-t-12 font-medium uppercase tracking-ilm-wide text-fg-3">
        {label}
      </span>
      <div className="h-px flex-1 bg-ilm-border" />
    </div>
  );
}
