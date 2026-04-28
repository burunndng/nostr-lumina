"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SidePanelProps {
  side: "left" | "right"
  children: React.ReactNode
  tabLabel?: string
  onOpenChange?: (isOpen: boolean) => void
}

export function SidePanel({
  side,
  children,
  tabLabel = "Menu",
  onOpenChange,
}: SidePanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  const isLeft = side === "left"

  return (
    <>
      {/* ── Panel body ───────────────────────────────── */}
      <div
        className={cn(
          "fixed top-0 h-full z-40 panel-transition overflow-hidden",
          "scanlines",
          isLeft ? "left-0" : "right-0",
        )}
        style={{
          width: isOpen ? "var(--panel-width-expanded)" : "0px",
          background: "rgba(6,8,14,0.97)",
          borderRight: isLeft ? "1px solid rgba(200,144,64,0.15)" : "none",
          borderLeft: !isLeft ? "1px solid rgba(200,144,64,0.15)" : "none",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Ember top accent line */}
        <div
          className="absolute top-0 inset-x-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #d46a28 40%, #c89040 60%, transparent)" }}
        />

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: "rgba(200,144,64,0.2)" }}
        />

        {/* Vertical rule on the inner edge */}
        <div
          className={cn("absolute top-0 bottom-0 w-px opacity-20", isLeft ? "right-0" : "left-0")}
          style={{ background: "linear-gradient(180deg, transparent, #c89040 30%, #c89040 70%, transparent)" }}
        />

        {/* Scrollable content */}
        <div
          className="h-full overflow-y-auto overflow-x-hidden"
          style={{
            opacity: isOpen ? 1 : 0,
            transition: "opacity 0.3s ease 0.25s",
            scrollbarWidth: "none",
          }}
        >
          <div style={{ minWidth: "300px" }}>
            {children}
          </div>
        </div>
      </div>

      {/* ── Tab trigger ──────────────────────────────── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? `Close ${tabLabel}` : `Open ${tabLabel}`}
        className="fixed z-50 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-2.5 tab-transition group"
        style={{
          [isLeft ? "left" : "right"]: isOpen ? "var(--panel-width-expanded)" : "0px",
          width: "var(--panel-tab-width)",
          height: "120px",
          background: isOpen
            ? "rgba(200,144,64,0.12)"
            : "rgba(6,8,14,0.9)",
          border: `1px solid rgba(200,144,64,${isOpen ? "0.4" : "0.2"})`,
          borderLeft: isLeft ? "none" : `1px solid rgba(200,144,64,${isOpen ? "0.4" : "0.2"})`,
          borderRight: isLeft ? `1px solid rgba(200,144,64,${isOpen ? "0.4" : "0.2"})` : "none",
          borderRadius: isLeft ? "0 4px 4px 0" : "4px 0 0 4px",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {/* Arrow icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            color: "rgba(200,144,64,0.8)",
            transform: isLeft
              ? isOpen ? "rotate(180deg)" : "rotate(0deg)"
              : isOpen ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Vertical label */}
        <span
          className="font-mono text-[9px] uppercase tracking-[0.25em]"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            color: "rgba(240,236,228,0.45)",
            transform: isLeft ? "rotate(180deg)" : "none",
            letterSpacing: "0.25em",
          }}
        >
          {tabLabel}
        </span>

        {/* Tick marks — decorative */}
        <div className="flex flex-col gap-1 opacity-40">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="bg-[#c89040]"
              style={{ width: 12 - i * 3, height: "1px" }}
            />
          ))}
        </div>
      </button>
    </>
  )
}
