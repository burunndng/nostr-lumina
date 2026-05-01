"use client"

import { useEffect, useState, useRef } from "react"

export function CinematicLanding() {
  const [loaded, setLoaded] = useState(false)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      setMouseX(nx)
      setMouseY(ny)
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden bg-[#080c12]">

      {/* ── Sky gradient layer ─────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            #060d1c 0%,
            #0a1630 12%,
            #0f2550 28%,
            #1a3a6b 46%,
            #2a4f80 60%,
            #3d5e7a 72%,
            #6b5c45 84%,
            #8c5e35 92%,
            #7a4a28 100%
          )`,
          transform: `translate(${mouseX * -4}px, ${mouseY * -2}px) scale(1.02)`,
          transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* ── Stars ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${mouseX * -6}px, ${mouseY * -3}px)`,
          transition: "transform 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {[
          [8, 5], [14, 12], [22, 8], [31, 18], [38, 6], [46, 14], [55, 9],
          [63, 20], [70, 7], [78, 15], [84, 11], [91, 19], [97, 4],
          [17, 25], [29, 30], [44, 22], [58, 28], [73, 24], [86, 31],
          [5, 32], [50, 3], [66, 35], [90, 8],
        ].map(([x, y], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: i % 4 === 0 ? "2px" : "1px",
              height: i % 4 === 0 ? "2px" : "1px",
              opacity: 0.4 + (i % 5) * 0.1,
              animation: `revealFade ${1 + (i % 3) * 0.4}s ease ${i * 0.06}s forwards`,
              animationFillMode: "backwards",
            }}
          />
        ))}
      </div>

      {/* ── Distant haze / atmosphere ─────────────────────── */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "38%",
          height: "30%",
          background: `linear-gradient(180deg,
            transparent 0%,
            rgba(30,60,100,0.18) 40%,
            rgba(80,90,70,0.25) 70%,
            transparent 100%
          )`,
          transform: `translate(${mouseX * -8}px, ${mouseY * -4}px)`,
          transition: "transform 1.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* ── Floating rocks ────────────────────────────────── */}

      {/* Large rock — upper left */}
      <div
        className="absolute animate-float-a"
        style={{
          top: "4%",
          left: "3%",
          width: "22vw",
          maxWidth: 340,
          transform: `translate(${mouseX * -18}px, ${mouseY * -8}px)`,
          transition: "transform 1.8s cubic-bezier(0.22,1,0.36,1)",
          opacity: loaded ? 1 : 0,
          animation: loaded
            ? "floatA 18s ease-in-out infinite, revealFade 1.6s ease 0.3s forwards"
            : "none",
          animationFillMode: "backwards",
        }}
      >
        <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rock1" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#5a4832" />
              <stop offset="40%" stopColor="#3d3020" />
              <stop offset="100%" stopColor="#1a1408" />
            </radialGradient>
            <radialGradient id="rock1lit" cx="35%" cy="20%" r="50%">
              <stop offset="0%" stopColor="#7a6040" stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {/* Main mass */}
          <path d="M20,220 Q10,200 15,160 Q18,120 40,90 Q70,50 120,30 Q170,10 220,25 Q270,40 300,80 Q330,120 325,170 Q320,220 280,245 Q240,270 190,275 Q140,280 90,265 Q40,250 20,220 Z" fill="url(#rock1)" />
          {/* Light face */}
          <path d="M40,90 Q70,50 120,30 Q170,10 220,25 Q200,55 160,70 Q110,85 70,115 Q50,100 40,90 Z" fill="url(#rock1lit)" />
          {/* Crack lines */}
          <path d="M110,80 Q125,120 115,160 Q110,185 120,210" stroke="#1a1408" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
          <path d="M180,40 Q200,80 185,120" stroke="#1a1408" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          {/* Bottom shadow */}
          <ellipse cx="170" cy="270" rx="140" ry="12" fill="#000" fillOpacity="0.35" />
        </svg>
      </div>

      {/* Medium rock — upper right */}
      <div
        className="absolute animate-float-b"
        style={{
          top: "2%",
          right: "4%",
          width: "18vw",
          maxWidth: 280,
          transform: `translate(${mouseX * 16}px, ${mouseY * -6}px)`,
          transition: "transform 2s cubic-bezier(0.22,1,0.36,1)",
          opacity: loaded ? 1 : 0,
          animation: loaded
            ? "floatB 22s ease-in-out infinite, revealFade 1.6s ease 0.5s forwards"
            : "none",
          animationFillMode: "backwards",
        }}
      >
        <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rock2" cx="45%" cy="28%" r="65%">
              <stop offset="0%" stopColor="#4e3e2c" />
              <stop offset="100%" stopColor="#18110a" />
            </radialGradient>
          </defs>
          <path d="M30,190 Q15,165 25,125 Q35,85 70,55 Q105,25 155,20 Q205,15 240,50 Q268,80 262,130 Q256,175 220,200 Q180,225 130,228 Q80,231 50,215 Q35,207 30,190 Z" fill="url(#rock2)" />
          <path d="M70,55 Q105,25 155,20 Q140,48 110,60 Q85,68 70,55 Z" fill="#6a5035" fillOpacity="0.5" />
          <path d="M100,55 Q115,95 105,140" stroke="#18110a" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
          <ellipse cx="145" cy="224" rx="110" ry="10" fill="#000" fillOpacity="0.3" />
        </svg>
      </div>

      {/* Small rock cluster — far upper center-right */}
      <div
        className="absolute animate-float-c"
        style={{
          top: "6%",
          left: "52%",
          width: "10vw",
          maxWidth: 160,
          transform: `translate(${mouseX * 10}px, ${mouseY * -10}px)`,
          transition: "transform 2.2s cubic-bezier(0.22,1,0.36,1)",
          opacity: loaded ? 1 : 0,
          animation: loaded
            ? "floatC 26s ease-in-out infinite, revealFade 1.6s ease 0.7s forwards"
            : "none",
          animationFillMode: "backwards",
        }}
      >
        <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rock3" cx="42%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#42341e" />
              <stop offset="100%" stopColor="#16100a" />
            </radialGradient>
          </defs>
          <path d="M20,100 Q10,80 18,55 Q28,30 55,18 Q82,6 110,16 Q138,26 148,52 Q156,76 142,96 Q125,116 95,120 Q65,124 40,112 Q25,106 20,100 Z" fill="url(#rock3)" />
          <ellipse cx="84" cy="118" rx="65" ry="8" fill="#000" fillOpacity="0.28" />
        </svg>
      </div>

      {/* Tiny far rock — upper far right */}
      <div
        className="absolute"
        style={{
          top: "14%",
          right: "18%",
          width: "6vw",
          maxWidth: 90,
          transform: `translate(${mouseX * 20}px, ${mouseY * -5}px)`,
          transition: "transform 2.4s cubic-bezier(0.22,1,0.36,1)",
          opacity: loaded ? 0.7 : 0,
          animation: loaded ? "floatA 30s ease-in-out infinite reverse, revealFade 1.8s ease 0.9s forwards" : "none",
          animationFillMode: "backwards",
        }}
      >
        <svg viewBox="0 0 90 75" fill="none">
          <path d="M10,55 Q5,42 10,28 Q18,12 38,8 Q58,4 72,18 Q84,32 80,50 Q74,65 55,70 Q35,75 20,65 Q12,60 10,55 Z" fill="#2a2010" />
        </svg>
      </div>

      {/* ── Distant mesa range ────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          transform: `translate(${mouseX * -12}px, ${mouseY * 4}px)`,
          transition: "transform 2s cubic-bezier(0.22,1,0.36,1)",
          opacity: loaded ? 1 : 0,
          animationFillMode: "backwards",
        }}
      >
        <svg
          viewBox="0 0 1440 500"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 2s ease 0.4s" }}
        >
          <defs>
            <linearGradient id="mesa-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3b5e" />
              <stop offset="100%" stopColor="#162d48" />
            </linearGradient>
          </defs>
          {/* Far mountains silhouette */}
          <path
            d="M0,500 L0,340 Q80,290 160,300 Q200,295 240,270 Q280,245 320,265 Q360,285 400,260 Q450,230 500,250 Q540,265 580,240 Q620,215 660,240 Q700,265 740,240 Q780,215 830,235 Q870,250 910,225 Q960,195 1000,220 Q1040,245 1080,220 Q1120,195 1160,215 Q1200,235 1240,210 Q1280,185 1320,200 Q1380,220 1440,195 L1440,500 Z"
            fill="url(#mesa-far)"
          />
        </svg>
      </div>

      {/* ── Mid mesas ─────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "50%",
          transform: `translate(${mouseX * -20}px, ${mouseY * 6}px)`,
          transition: "transform 1.8s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <svg
          viewBox="0 0 1440 500"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 2s ease 0.6s" }}
        >
          <defs>
            <linearGradient id="mesa-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a1e10" />
              <stop offset="60%" stopColor="#3a2815" />
              <stop offset="100%" stopColor="#1a1008" />
            </linearGradient>
          </defs>
          {/* Left wide mesa */}
          <path
            d="M-20,500 L-20,310 L30,295 L60,240 L110,220 L160,215 L210,220 L255,240 L290,295 L340,320 L380,315 L400,310 L400,500 Z"
            fill="url(#mesa-mid)"
          />
          {/* Center butte */}
          <path
            d="M640,500 L640,280 L665,255 L690,210 L720,185 L748,182 L775,185 L800,210 L825,255 L850,280 L860,500 Z"
            fill="url(#mesa-mid)"
          />
          {/* Right mesa cluster */}
          <path
            d="M1060,500 L1060,300 L1090,275 L1120,235 L1165,215 L1210,210 L1255,215 L1295,240 L1330,280 L1360,305 L1380,310 L1440,300 L1440,500 Z"
            fill="url(#mesa-mid)"
          />
        </svg>
      </div>

      {/* ── Near ground / desert floor ────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "30%",
          transform: `translate(${mouseX * -28}px, ${mouseY * 8}px)`,
          transition: "transform 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <svg
          viewBox="0 0 1440 300"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 2s ease 0.8s" }}
        >
          <defs>
            <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a2a12" />
              <stop offset="50%" stopColor="#2a1e0c" />
              <stop offset="100%" stopColor="#1a1208" />
            </linearGradient>
          </defs>
          {/* Ground plane */}
          <path d="M0,300 L0,120 Q360,80 720,90 Q1080,100 1440,80 L1440,300 Z" fill="url(#ground)" />
          {/* Subtle ground texture lines */}
          <path d="M0,160 Q360,140 720,148 Q1080,156 1440,140" stroke="#4a3518" strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
          <path d="M0,190 Q360,172 720,178 Q1080,184 1440,170" stroke="#4a3518" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
          <path d="M0,220 Q360,205 720,210 Q1080,215 1440,202" stroke="#4a3518" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
        </svg>
      </div>

      {/* ── Road perspective ──────────────────────────────── */}
      <div
        className="absolute bottom-0 left-1/2"
        style={{
          transform: `translateX(-50%) translate(${mouseX * -32}px, ${mouseY * 10}px)`,
          transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1)",
          width: "100%",
          height: "28%",
          opacity: loaded ? 1 : 0,
          transition: "opacity 2s ease 1s, transform 1.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <svg viewBox="0 0 1440 280" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1a14" />
              <stop offset="100%" stopColor="#0e0c08" />
            </linearGradient>
          </defs>
          {/* Road surface */}
          <path d="M660,0 L780,0 L1440,280 L0,280 Z" fill="url(#road)" fillOpacity="0.9" />
          {/* Center line dashes */}
          {[0,1,2,3,4].map(i => (
            <path
              key={i}
              d={`M715,${i*60} L725,${i*60} L730,${i*60+40} L720,${i*60+40} Z`}
              fill="#c89040"
              fillOpacity="0.5"
            />
          ))}
        </svg>
      </div>

      {/* ── Lone figure ───────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          bottom: "26%",
          left: "50%",
          transform: `translateX(-50%) translate(${mouseX * -35}px, 0)`,
          transition: "transform 1.1s cubic-bezier(0.22,1,0.36,1)",
          opacity: loaded ? 1 : 0,
          animation: loaded ? "revealFade 2s ease 1.2s forwards" : "none",
          animationFillMode: "backwards",
        }}
      >
        <svg width="28" height="64" viewBox="0 0 28 64" fill="none">
          {/* Head */}
          <ellipse cx="14" cy="7" rx="5" ry="6" fill="#0e0c08" />
          {/* Body / coat */}
          <path d="M8,13 Q6,20 5,32 Q4,42 6,52 L8,52 Q9,42 10,32 L14,34 L18,32 Q19,42 20,52 L22,52 Q24,42 23,32 Q22,20 20,13 Q17,11 14,11 Q11,11 8,13 Z" fill="#0e0c08" />
          {/* Long coat flap */}
          <path d="M7,28 Q5,38 4,52 L10,52 Q10,40 10,32 Z" fill="#0e0c08" />
          <path d="M21,28 Q23,38 24,52 L18,52 Q18,40 18,32 Z" fill="#0e0c08" />
          {/* Shadow */}
          <ellipse cx="14" cy="62" rx="10" ry="2.5" fill="#000" fillOpacity="0.4" />
        </svg>
      </div>

      {/* ── Dust particles ────────────────────────────────── */}
      {loaded && [
        { left: "20%", top: "72%", delay: "0s", dur: "9s" },
        { left: "35%", top: "78%", delay: "2s", dur: "12s" },
        { left: "65%", top: "74%", delay: "4s", dur: "8s" },
        { left: "80%", top: "70%", delay: "1s", dur: "11s" },
        { left: "50%", top: "80%", delay: "6s", dur: "10s" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#c89040]"
          style={{
            left: p.left,
            top: p.top,
            opacity: 0,
            animation: `dustDrift ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}

      {/* ── Letterbox bars (cinematic framing) ───────────── */}
      <div
        className="absolute inset-x-0 top-0 bg-[#060a0f]"
        style={{
          height: "6vh",
          transformOrigin: "top center",
          animation: loaded ? "letterboxIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both" : "none",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-[#06090e]"
        style={{
          height: "5vh",
          transformOrigin: "bottom center",
          animation: loaded ? "letterboxIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both" : "none",
        }}
      />

      {/* ── Center overlay — title block ──────────────────── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* Brand name */}
        <div
          className="text-center"
          style={{
            opacity: loaded ? 1 : 0,
            animation: loaded ? "revealUp 1.4s cubic-bezier(0.22,1,0.36,1) 0.6s both" : "none",
          }}
        >
          {/* Overline label */}
          <p
            className="font-mono text-[10px] md:text-xs tracking-[0.55em] uppercase mb-4"
            style={{ color: "rgba(200,144,64,0.85)" }}
          >
            Est. 2024 &nbsp;/&nbsp; Vol. I
          </p>

          {/* Main wordmark */}
          <h1
            className="font-display font-800 leading-none uppercase tracking-[-0.01em]"
            style={{
              fontSize: "clamp(4.5rem, 14vw, 13rem)",
              fontWeight: 800,
              fontStyle: "italic",
              color: "#f0ece4",
              textShadow: "0 0 80px rgba(200,144,64,0.2), 0 2px 0 rgba(0,0,0,0.8)",
              letterSpacing: "-0.02em",
            }}
          >
            KUR<span style={{ color: "#d46a28" }}>4</span>TEK
          </h1>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mt-5 mb-5">
            <div className="h-px bg-[#c89040] opacity-50" style={{ width: "clamp(40px, 8vw, 100px)" }} />
            <div className="w-1 h-1 rounded-full bg-[#c89040] opacity-70" />
            <div className="h-px bg-[#c89040] opacity-50" style={{ width: "clamp(40px, 8vw, 100px)" }} />
          </div>

          {/* Subtitle */}
          <p
            className="font-mono text-[11px] md:text-[13px] uppercase tracking-[0.35em]"
            style={{ color: "rgba(240,236,228,0.4)" }}
          >
            Cinematic Motion &nbsp;&bull;&nbsp; Dynamic Landscapes
          </p>
        </div>

        {/* Panel hint — appears later */}
        <div
          className="absolute bottom-[12vh] flex items-center gap-3"
          style={{
            opacity: loaded ? 1 : 0,
            animation: loaded ? "revealFade 1.4s ease 2s both" : "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "rgba(200,144,64,0.6)" }}>
            <path d="M11 8L6 4V12L11 8Z" fill="currentColor" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: "rgba(240,236,228,0.3)" }}>
            Pull the panels
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "rgba(200,144,64,0.6)", transform: "scaleX(-1)" }}>
            <path d="M11 8L6 4V12L11 8Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* ── Vignette ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(4,6,10,0.7) 100%)`,
          zIndex: 8,
        }}
      />
    </div>
  )
}
