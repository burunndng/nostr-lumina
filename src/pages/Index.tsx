"use client"

import { useState } from "react"
import { useSeoMeta } from '@unhead/react'
import { SidePanel } from "@/components/side-panel"
import { NavigationMenu } from "@/components/curation-navigation"
import { InfoPanel } from "@/components/curation-info-panel"
import { CinematicLanding } from "@/components/cinematic-landing"
import { Link } from "react-router-dom"

export default function Index() {
  useSeoMeta({
    title: 'KUR4TEK | Curation Lists for Nostr',
    description: 'Discover and curate content on Nostr. Public lists, premium collections, Lightning payments. No gatekeepers.',
  })

  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  const anyOpen = leftOpen || rightOpen

  return (
    <main className="relative w-screen h-screen overflow-hidden">

      {/* Full-screen cinematic landscape */}
      <CinematicLanding />

      {/* Dim overlay — covers the landscape when a panel is open */}
      <div
        className="fixed inset-0 z-30 pointer-events-none theatrical-dim"
        style={{
          background: "rgba(4,6,10,0.55)",
          opacity: anyOpen ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Left panel — Navigation */}
      <SidePanel
        side="left"
        tabLabel="Menu"
        onOpenChange={setLeftOpen}
      >
        <NavigationMenu />
      </SidePanel>

      {/* Right panel — Channel / Info */}
      <SidePanel
        side="right"
        tabLabel="Info"
        onOpenChange={setRightOpen}
      >
        <InfoPanel />
      </SidePanel>

      {/* Noise grain over everything */}
      <div
        className="fixed inset-0 pointer-events-none noise-overlay"
        style={{ zIndex: 200 }}
        aria-hidden="true"
      />

      {/* Shakespeare badge */}
      <a
        href="https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2Fburunndng%2Fnostr-lumina.git"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[201] no-underline opacity-40 hover:opacity-80 transition-opacity"
        aria-label="Edit with Shakespeare"
      >
        <img src="https://shakespeare.diy/badge.svg" alt="Edit with Shakespeare" className="h-auto" />
      </a>
    </main>
  )
}
