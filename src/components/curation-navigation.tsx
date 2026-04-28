"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { LoginArea } from "@/components/auth/LoginArea"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { genUserName } from "@/lib/genUserName"
import { nip19 } from "nostr-tools"

const NAV_SECTIONS = [
  {
    label: "Discover",
    items: [
      { id: "01", name: "Browse", sub: "Find lists", href: "/lists" },
      { id: "02", name: "Following", sub: "Your feed", href: "/following" },
      { id: "03", name: "Trending", sub: "Most zapped", href: "/lists" },
      { id: "04", name: "Search", sub: "Find anything", href: "/lists" },
    ],
  },
  {
    label: "Categories",
    items: [
      { id: "05", name: "Articles", sub: "Web reads", href: "/lists?category=curation:articles" },
      { id: "06", name: "Books", sub: "Must-reads", href: "/lists?category=curation:books" },
      { id: "07", name: "Videos", sub: "Watch later", href: "/lists?category=curation:videos" },
      { id: "08", name: "Research", sub: "Deep dives", href: "/lists?category=curation:research" },
      { id: "09", name: "Adult", sub: "18+ curated", href: "/lists?category=curation:nsfw:adult" },
    ],
  },
  {
    label: "Studio",
    items: [
      { id: "10", name: "Curate", sub: "Your lists", href: "/curate" },
      { id: "11", name: "Relays", sub: "Connection health", href: "/settings/relays" },
      { id: "12", name: "Preferences", sub: "Content settings", href: "/settings/preferences" },
    ],
  },
]

export function NavigationMenu() {
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const location = useLocation()
  const { user, metadata } = useCurrentUser()

  return (
    <div className="flex flex-col min-h-screen py-[8vh] px-8 md:px-12">

      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.5em]" style={{ color: "rgba(200,144,64,0.7)" }}>
          Kur4tex &nbsp;/&nbsp; Navigation
        </p>
        <div className="mt-4 h-px" style={{ background: "linear-gradient(90deg, rgba(200,144,64,0.5), transparent)" }} />
      </div>

      {/* Login area */}
      <div className="mb-8">
        <LoginArea className="w-full" />
      </div>

      {/* Nav sections */}
      <nav className="flex-1 space-y-10">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className="font-mono text-[9px] uppercase tracking-[0.5em] mb-5"
              style={{ color: "rgba(240,236,228,0.22)" }}
            >
              {section.label}
            </p>

            <ul className="space-y-0">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || location.pathname + location.search === item.href
                const isHovered = hoveredItem === item.id
                return (
                  <li key={item.id}>
                    <Link
                      to={item.href}
                      onClick={() => setActiveItem(isActive ? null : item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="w-full text-left flex items-baseline gap-4 py-3 block no-underline"
                      style={{
                        borderBottom: "1px solid rgba(240,236,228,0.06)",
                        transition: "all 0.18s ease",
                      }}
                    >
                      {/* Number */}
                      <span
                        className="font-mono text-[10px] shrink-0 w-6"
                        style={{
                          color: isActive || isHovered ? "rgba(200,144,64,0.9)" : "rgba(240,236,228,0.18)",
                          transition: "color 0.18s ease",
                        }}
                      >
                        {item.id}
                      </span>

                      {/* Name */}
                      <span
                        className="font-display uppercase leading-none"
                        style={{
                          fontSize: "clamp(1.6rem, 3.2vw, 2.1rem)",
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                          color: isActive
                            ? "#f0ece4"
                            : isHovered
                            ? "rgba(240,236,228,0.8)"
                            : "rgba(240,236,228,0.42)",
                          transition: "color 0.18s ease",
                        }}
                      >
                        {item.name}
                      </span>

                      {/* Sub label */}
                      <span
                        className="font-mono text-[9px] ml-auto shrink-0"
                        style={{
                          letterSpacing: "0.12em",
                          color: isActive || isHovered ? "rgba(200,144,64,0.65)" : "rgba(240,236,228,0.14)",
                          transition: "color 0.18s ease",
                        }}
                      >
                        {item.sub}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile section */}
      {user && (
        <div className="mb-8">
          <Link
            to={`/profile/${nip19.npubEncode(user.pubkey)}`}
            className="flex items-center gap-3 py-3 no-underline"
            style={{
              borderTop: "1px solid rgba(240,236,228,0.08)",
              borderBottom: "1px solid rgba(240,236,228,0.08)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full"
              style={{ background: "rgba(200,144,64,0.2)" }}
            />
            <div>
              <p className="font-display uppercase leading-none" style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f0ece4" }}>
                {metadata?.name || genUserName(user.pubkey)}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: "rgba(240,236,228,0.3)" }}>
                View Profile
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-12 pt-8 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(240,236,228,0.08)" }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.4em]" style={{ color: "rgba(240,236,228,0.18)" }}>
          Phase 2 &mdash; 2026
        </span>
        <a
          href="https://github.com/burunndng/nostr-lumina"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[9px] uppercase tracking-[0.25em] no-underline"
          style={{ color: "rgba(240,236,228,0.22)", transition: "color 0.18s ease" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(200,144,64,0.85)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(240,236,228,0.22)")}
        >
          GitHub
        </a>
      </div>
    </div>
  )
}
