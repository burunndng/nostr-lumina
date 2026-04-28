"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useNostr } from "@nostrify/react"
import { useQuery } from "@tanstack/react-query"
import { CURATION_LIST_KIND } from "@/lib/nip51"
import { parseCurationListEvent } from "@/hooks/useLists"
import { getListTypeLabel } from "@/lib/nip51"
import { CONTENT_WARNING_LABELS } from "@/lib/nip36"

const CONNECT = [
  { label: "GitHub", href: "https://github.com/burunndng/nostr-lumina" },
  { label: "Shakespeare", href: "https://shakespeare.diy" },
  { label: "NIP-51 Spec", href: "https://github.com/nostr-protocol/nips/blob/master/51.md" },
]

export function InfoPanel() {
  const { nostr } = useNostr()
  const [hoveredDrop, setHoveredDrop] = useState<string | null>(null)

  // Fetch recent public lists for the "Recent Lists" section
  const { data: recentLists } = useQuery({
    queryKey: ['nostr', 'lists', 'recent', 'info-panel'],
    queryFn: async () => {
      const events = await nostr.query(
        [{ kinds: [CURATION_LIST_KIND], limit: 5 }],
        { signal: AbortSignal.timeout(2000) },
      )
      return events.map(parseCurationListEvent)
    },
    staleTime: 60 * 1000,
  })

  return (
    <div className="flex flex-col min-h-screen py-[8vh] px-8 md:px-12">

      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.5em]" style={{ color: "rgba(200,144,64,0.7)" }}>
          Kur4tex &nbsp;/&nbsp; Channel
        </p>
        <div className="mt-4 h-px" style={{ background: "linear-gradient(90deg, rgba(200,144,64,0.5), transparent)" }} />
      </div>

      {/* Protocol Info */}
      <div
        className="mb-10 p-6"
        style={{ border: "1px solid rgba(200,144,64,0.15)", background: "rgba(200,144,64,0.03)" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.45em] mb-3" style={{ color: "rgba(200,144,64,0.7)" }}>
          Powered by Nostr
        </p>
        <p className="font-display uppercase leading-tight mb-2" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f0ece4" }}>
          Your data, your keys
        </p>
        <p className="font-mono text-[10px] leading-relaxed" style={{ color: "rgba(240,236,228,0.4)" }}>
          Lists are Nostr events (kind 30100). They live on relays you choose.
          No centralized server. No content policy gatekeepers.
        </p>
      </div>

      {/* Recent Lists */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(240,236,228,0.22)" }}>
            Recent Lists
          </p>
          <Link
            to="/lists"
            className="font-mono text-[9px] uppercase tracking-[0.3em] no-underline"
            style={{ color: "rgba(200,144,64,0.6)", transition: "color 0.18s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(200,144,64,1)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(200,144,64,0.6)")}
          >
            View All &rsaquo;
          </Link>
        </div>

        <ul className="space-y-0">
          {(recentLists || []).slice(0, 5).map((list) => {
            const isHovered = hoveredDrop === list.eventId
            return (
              <li
                key={list.eventId}
                onMouseEnter={() => setHoveredDrop(list.eventId)}
                onMouseLeave={() => setHoveredDrop(null)}
                className="flex items-center gap-4 py-3.5 cursor-pointer"
                style={{
                  borderBottom: "1px solid rgba(240,236,228,0.06)",
                  transition: "all 0.18s ease",
                }}
              >
                {/* Play icon */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    border: `1px solid ${isHovered ? "rgba(200,144,64,0.7)" : "rgba(240,236,228,0.12)"}`,
                    background: isHovered ? "rgba(200,144,64,0.1)" : "transparent",
                    transition: "all 0.18s ease",
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path
                      d="M2 1.5L7.5 4.5L2 7.5V1.5Z"
                      fill={isHovered ? "rgba(200,144,64,0.9)" : "rgba(240,236,228,0.35)"}
                      style={{ transition: "fill 0.18s ease" }}
                    />
                  </svg>
                </div>

                {/* Title */}
                <Link
                  to={`/list/${list.pubkey}/${list.id}`}
                  className="flex-1 min-w-0 no-underline"
                >
                  <p
                    className="font-display uppercase leading-none truncate"
                    style={{
                      fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: isHovered ? "#f0ece4" : "rgba(240,236,228,0.5)",
                      transition: "color 0.18s ease",
                    }}
                  >
                    {list.title}
                  </p>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.2em] mt-0.5"
                    style={{ color: isHovered ? "rgba(200,144,64,0.65)" : "rgba(240,236,228,0.18)" }}
                  >
                    {getListTypeLabel(list.type)} &bull; {list.items.length} items
                  </p>
                </Link>

                {/* CW badge */}
                {list.cw !== 'none' && (
                  <span
                    className="font-mono text-[8px] uppercase px-2 py-0.5 shrink-0"
                    style={{ color: "rgba(200,144,64,0.7)", border: "1px solid rgba(200,144,64,0.2)" }}
                  >
                    18+
                  </span>
                )}
              </li>
            )
          })}
          {(!recentLists || recentLists.length === 0) && (
            <li className="py-8 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(240,236,228,0.2)" }}>
                No lists yet. Be the first to curate.
              </p>
            </li>
          )}
        </ul>
      </div>

      {/* Connect */}
      <div className="flex-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.5em] mb-5" style={{ color: "rgba(240,236,228,0.22)" }}>
          Connect
        </p>
        <div className="space-y-0">
          {CONNECT.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left flex items-center justify-between py-3 no-underline"
              style={{
                borderBottom: "1px solid rgba(240,236,228,0.06)",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.paddingLeft = "6px"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.paddingLeft = "0px"
              }}
            >
              <span
                className="font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(240,236,228,0.4)", transition: "color 0.18s" }}
              >
                {c.label}
              </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: "rgba(200,144,64,0.55)", letterSpacing: "0.1em" }}
              >
                &rsaquo;
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer tag */}
      <div className="mt-12 pt-8 flex items-center justify-between" style={{ borderTop: "1px solid rgba(240,236,228,0.08)" }}>
        <span className="font-mono text-[9px] uppercase tracking-[0.4em]" style={{ color: "rgba(240,236,228,0.18)" }}>
          Kur4tex &copy; 2026
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: "rgba(200,144,64,0.4)" }}>
          Curation is truth
        </span>
      </div>
    </div>
  )
}
