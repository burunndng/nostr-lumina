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
    ],
  },
  {
    label: "Categories",
    items: [
      { id: "03", name: "Articles", sub: "247 curated", href: "/lists?category=curation:articles", featured: [
        { title: "The Bitcoin Standard by Saifedean Ammous", url: "https://www.amazon.com/Bitcoin-Standard-Decentralized-Alternative-Central/dp/1119473861" },
        { title: "Why Bitcoin Matters (Marc Andreessen)", url: "https://a16z.com/2014/01/21/why-bitcoin-matters/" },
      ]},
      { id: "04", name: "Books", sub: "182 curated", href: "/lists?category=curation:books", featured: [
        { title: "Mastering Bitcoin — Programming the Open Blockchain", url: "https://github.com/bitcoinbook/bitcoinbook" },
        { title: "The Sovereign Individual — Davidson & Rees-Mogg", url: "https://www.amazon.com/Sovereign-Individual-Transition-Information-Age/dp/0684832720" },
      ]},
      { id: "05", name: "Research", sub: "93 curated", href: "/lists?category=curation:research", featured: [
        { title: "Bitcoin Whitepaper — Satoshi Nakamoto", url: "https://bitcoin.org/bitcoin.pdf" },
        { title: "Lightning Network BOLTs Specification", url: "https://github.com/lightning/bolts" },
      ]},
      { id: "06", name: "Videos", sub: "156 curated", href: "/lists?category=curation:videos", featured: [
        { title: "How The Bitcoin Protocol Actually Works (Computerphile)", url: "https://www.youtube.com/watch?v=l9jGJrd2_Qk" },
        { title: "Lightning Network Explained (MIT Media Lab)", url: "https://www.youtube.com/watch?v=rrrZ1UpHNRc" },
      ]},
      { id: "07", name: "Tools", sub: "64 curated", href: "/lists?category=curation:tools", featured: [
        { title: "Nostr — A decentralized social protocol", url: "https://nostr.com" },
        { title: "Alby — Lightning wallet for the web", url: "https://getalby.com" },
      ]},
      { id: "08", name: "Adult", sub: "18+ curated", href: "/lists?category=curation:nsfw:adult", featured: [] },
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

      {/* ── CURATE BUTTON — the whole point of the app ── */}
      <Link
        to="/curate"
        className="w-full flex items-center justify-center gap-3 py-4 mb-10 no-underline rounded"
        style={{
          background: "rgba(200,144,64,0.9)",
          color: "#060810",
          fontFamily: "var(--font-display, inherit)",
          fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
          fontWeight: 800,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          border: "2px solid rgba(212,106,40,1)",
          boxShadow: "0 0 40px rgba(200,144,64,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = "rgba(212,106,40,1)"
          el.style.boxShadow = "0 0 60px rgba(200,144,64,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
          el.style.transform = "scale(1.02)"
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = "rgba(200,144,64,0.9)"
          el.style.boxShadow = "0 0 40px rgba(200,144,64,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
          el.style.transform = "scale(1)"
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        Curate
      </Link>

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
                const isActive = location.pathname === item.href
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
                          fontSize: "clamp(1.4rem, 2.8vw, 1.8rem)",
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

                    {/* Featured posts for this category */}
                    {item.featured && item.featured.length > 0 && isHovered && (
                      <div
                        className="ml-10 mb-3 space-y-2"
                        style={{ animation: "revealFade 0.3s ease forwards" }}
                      >
                        {item.featured.map((post, i) => (
                          <a
                            key={i}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 py-1.5 no-underline group/post"
                            style={{ borderBottom: "1px solid rgba(240,236,228,0.04)" }}
                          >
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0">
                              <path d="M1 7L7 1M7 1H2M7 1V6" stroke="rgba(200,144,64,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span
                              className="font-mono text-[9px] truncate"
                              style={{ color: "rgba(240,236,228,0.35)", letterSpacing: "0.05em", transition: "color 0.18s" }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(200,144,64,0.8)")}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(240,236,228,0.35)")}
                            >
                              {post.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
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
