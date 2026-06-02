"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[260px] w-full place-items-center bg-ilm-ink text-t-12 text-white/70">
      Muharrir yuklanmoqda...
    </div>
  ),
});

export function CodeEditor({
  value,
  language,
  onChange,
  height = "260px",
  readOnly = false,
}: {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-ilm-xl border border-ilm-border">
      <MonacoEditor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
