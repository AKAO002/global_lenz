"use client";

import { useEffect, useId, useState } from "react";

const BG = "#F7F5F0";
const ACCENT = "#7895B2";
const TEXT = "#2C2C2C";
const BORDER = "#E5E1DA";

const LINKS = [
  {
    label: "外務省 安全情報",
    href: "https://www.anzen.mofa.go.jp/",
  },
  {
    label: "各国の天気",
    href: "https://www.accuweather.com/",
  },
] as const;

export default function DebugLinksPage() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-4"
      style={{ backgroundColor: BG, color: TEXT }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border px-6 py-3 text-sm font-medium transition-[filter,transform] duration-200 ease-out hover:brightness-110 active:scale-[0.98]"
        style={{
          backgroundColor: ACCENT,
          color: "#FAF8F3",
          borderColor: BORDER,
          borderRadius: 12,
        }}
      >
        リンク集を開く
      </button>

      <div
        className={`fixed inset-0 z-50 flex items-end justify-center p-4 transition-[opacity] duration-300 ease-out sm:items-center ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        {...(!open ? { inert: true as const } : {})}
      >
        <button
          type="button"
          aria-label="オーバーレイを閉じる"
          className="absolute inset-0 transition-opacity duration-300"
          style={{ backgroundColor: "rgb(44 44 44 / 0.25)" }}
          onClick={() => setOpen(false)}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative z-10 w-full max-w-md border transition-[opacity,transform] duration-300 ease-out ${
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
          }`}
          style={{
            backgroundColor: "#FAF8F3",
            borderColor: BORDER,
            borderRadius: 12,
            boxShadow: "none",
          }}
        >
          <div
            className="flex items-center justify-between gap-3 border-b px-4 py-3"
            style={{ borderColor: BORDER }}
          >
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              便利リンク集
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="閉じる"
              className="flex h-9 w-9 items-center justify-center rounded-[12px] text-xl leading-none transition-colors duration-200 hover:bg-[#F0EDE6]"
              style={{ color: TEXT }}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-3 p-4">
            {LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="border px-4 py-3 text-sm font-medium transition-[background-color,transform] duration-200 hover:bg-[#F0EDE6] active:scale-[0.99]"
                style={{
                  borderColor: BORDER,
                  borderRadius: 12,
                  color: ACCENT,
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
