"use client";

import { useState } from "react";

export function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-ink">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-line px-5 py-3">
        <span className="font-mono text-sm text-on-dark-muted">{filename ?? "Dart"}</span>
        <button
          type="button"
          onClick={copy}
          className="min-h-11 rounded-[10px] bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          {copied ? "Copié ✓" : "Copier le code"}
        </button>
      </div>
      <pre className="overflow-x-auto p-6 font-mono text-sm leading-[1.7] text-on-dark">
        <code>{code}</code>
      </pre>
    </div>
  );
}
