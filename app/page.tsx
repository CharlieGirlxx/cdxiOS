'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Bell, ChevronRight, Crosshair, MapPin, Radio, Shield, Signal, Zap } from 'lucide-react'

type NodeState = 'RINGING' | 'JAMMED' | 'CLAIMED' | 'CONTESTED'
type EventKind = 'WEATHER' | 'TRANSIT' | 'CROWD' | 'ANOMALY'

type Payphone = { id: string; name: string; area: string; distance: string; xp: number; rarity: string; state: NodeState; x: number; y: number; clue: string; lat: number; lon: number; sourceId: string }
type WorldEvent = { kind: EventKind; title: string; detail: string; modifier: string; time: string; color: string; source: string; status: 'LIVE' | 'RECENT' | 'SIMULATED'; locality: string; href: string }
type LocalContext = { place: string; landmark: string; headline: string; detail: string; source: string; time: string; status: 'LIVE' | 'RECENT' | 'SIMULATED'; tag: string; href: string }

// Source: Telstra payphone directory snapshot, published via jvrck-labs/aus-payphones-data (2022-05-09).
// Coordinates and cabinet IDs are retained for provenance; game names/statuses are fictional overlays.
const initialNodes: Payphone[] = []

const events: WorldEvent[] = []
const localContext: LocalContext[] = []

export default function Page() {
  const [nodes, setNodes] = useState(initialNodes)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'tracing' | 'connected' | 'claimed'>('idle')
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [eventTick, setEventTick] = useState(129)
  const selected = useMemo(() => nodes.find((node) => node.id === selectedId), [nodes, selectedId])

  useEffect(() => {
    const timer = window.setInterval(() => setEventTick((value) => (value > 0 ? value - 1 : 129)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function traceSignal() {
    if (!selected || selected?.state === 'JAMMED' || phase === 'tracing' || phase === 'connected' || phase === 'claimed') return
    setPhase('tracing')
    window.setTimeout(() => setPhase('connected'), 1400)
  }

  function claimNode() {
    if (!selected) return
    setPhase('claimed')
    setXp((value) => value + selected.xp)
    setStreak((value) => value + 1)
    setNodes((current) => current.map((node) => node.id === selected.id ? { ...node, state: 'CLAIMED' } : node))
  }

  const status = phase === 'tracing' ? 'TRACING SIGNAL...' : phase === 'connected' ? 'LINE CONNECTED' : phase === 'claimed' ? 'PAYPHONE CLAIMED' : selected?.state === 'JAMMED' ? 'SIGNAL JAMMED' : 'READY TO TRACE'

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">///</span><span>DIAL TO<br /><b>ENTER</b></span><small>FIELD SYSTEM v0.1</small></div>
        <div className="live"><span className="live-dot" /> LIVE WORLD SYNC <span className="divider" /> SAN FRANCISCO // 21:47</div>
        <button className="icon-button" aria-label="Notifications"><Bell /></button>
      </header>

      <section className="ticker"><div className="ticker-label"><Radio /> WORLD EVENTS</div><div className="ticker-event muted"><span className="event-pulse" /> No live events loaded <span>SYNC A LOCATION TO BEGIN</span></div><div className="ticker-event muted">The board is waiting for your first real-world scan</div><div className="ticker-clock">NEXT SYNC 00:{String(eventTick).padStart(2, '0')}</div></section>

      <div className="layout">
        <section className="map-panel">
          <div className="map-heading"><div><p className="eyebrow">TELSTRA DIRECTORY / AUSTRALIA</p><h1>Find the <em>ringing</em> terminal.</h1></div><button className="scan-button" onClick={() => setEventTick(129)}><Activity data-icon="inline-start" /> SCAN CITY</button></div>
          <div className="map-canvas" aria-label="Signal map showing nearby payphones">
            <div className="map-label label-one">MASON ST <span>→</span></div><div className="map-label label-two">MARKET ST <span>↓</span></div><div className="map-label label-three">UNION SQ.</div>
            <div className="street street-a" /><div className="street street-b" /><div className="street street-c" /><div className="street street-d" />
            <div className="player"><span /><b>YOU</b></div>
            {nodes.map((node) => <button key={node.id} className={`node node-${node.state.toLowerCase()} ${selectedId === node.id ? 'selected' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => { setSelectedId(node.id); setPhase('idle') }} aria-label={`${node.name}, ${node.state}`}><span className="node-ring" /><strong>{node.state === 'RINGING' ? '☎' : node.state === 'CLAIMED' ? '✓' : node.state === 'CONTESTED' ? '!' : '×'}</strong><small>{node.id}</small></button>)}
            <div className="event-zone"><span /><b>ANOMALY ZONE</b><small>0.8 MI RADIUS</small></div>
            <div className="map-coords">NO LOCATION LOCKED<br />SCAN TO START A FRESH GAME</div><div className="map-key"><span className="legend-ring" /> RINGING <span className="legend-you" /> YOU <span className="legend-zone" /> WORLD EVENT</div>
          </div>
          <div className="map-footer"><span><Crosshair /> GPS SIMULATION ACTIVE</span><span>{nodes.length} SIGNALS IN RANGE</span><span className="footer-right">PAYPHONE DATA: TELSTRA DIRECTORY · 2022 SNAPSHOT <span className="green-text">●</span></span></div>
          <section className="context-panel"><div className="section-head"><span className="eyebrow">REAL-WORLD CONTEXT // LOCATION LOCKED</span><span className="context-lock">SOURCES VERIFIED / FIXTURES LABELED</span></div><div className="context-grid">{localContext.length === 0 ? <p className="empty-copy">No local context loaded. Scan a real location to pull in verified events, news, and pop culture.</p> : localContext.map((item) => <article className="context-card" key={item.place}><div className="context-card-top"><span className={`context-status ${item.status.toLowerCase()}`}>{item.status}</span><span>{item.tag}</span></div><p className="eyebrow">{item.place} · {item.landmark}</p><h3>{item.headline}</h3><p>{item.detail}</p><div className="context-source"><span>{item.source} · {item.time}</span><a href={item.href} target="_blank" rel="noreferrer">OPEN SOURCE ↗</a></div></article>)}</div></section>
        </section>

        <aside className="side-panel">
          <div className="operator-row"><div><p className="eyebrow">OPERATIVE 0042</p><h2>RAVEN<span className="green-text">_</span></h2></div><div className="level">LVL <b>07</b><small>2,840 XP</small></div></div>
          <div className="stats"><div><strong>{xp.toLocaleString()}</strong><span>XP TOTAL</span></div><div><strong>{streak}<i>×</i></strong><span>STREAK</span></div><div><strong>12</strong><span>CLAIMED</span></div></div>
          <div className="phone-card"><div className="card-top"><span className={`status-dot ${phase === 'claimed' ? 'green' : ''}`} /> {status}<span className="signal-bars"><i /><i /><i /></span></div><div className="phone-title"><div className="phone-icon">☎</div><div><p className="eyebrow">{selected ? `${selected.rarity} SIGNAL // ${selected.distance}` : 'NO SIGNAL LOCKED'}</p><h3>{selected?.name ?? 'NO SIGNAL LOCKED'}</h3><span>{selected?.area ?? 'Scan a real location to begin'}</span></div></div><p className="clue">“{selected?.clue ?? 'Scan a real location to discover your first signal.'}”</p>{selected?.state === 'CONTESTED' && <div className="warning"><Zap /> ANOTHER OPERATIVE IS TRACING THIS SIGNAL</div>}{selected?.state === 'JAMMED' && <div className="warning">WORLD EVENT INTERFERENCE — TRY ANOTHER SECTOR</div>}<button className="trace-button" disabled={!selected || selected?.state === 'JAMMED' || phase === 'claimed'} onClick={phase === 'connected' ? claimNode : traceSignal}>{phase === 'connected' ? 'ANSWER & CLAIM' : phase === 'claimed' ? 'CLAIMED ✓' : selected?.state === 'JAMMED' ? 'SIGNAL UNAVAILABLE' : 'TRACE SIGNAL'}<ChevronRight data-icon="inline-end" /></button><div className="phone-meta"><span><MapPin /> {selected?.distance} away</span><span><Zap /> +{selected?.xp ?? 0} XP</span></div></div>

          <div className="mission"><div className="section-head"><span className="eyebrow">DAILY HUNT // 04:13:22 LEFT</span><span className="mission-count">2 / 3</span></div><h3>Answer 3 ringing phones</h3><div className="progress"><span style={{ width: '66%' }} /></div><p>Bonus: <b>+500 XP</b> and a rare signal radar</p></div>
          <div className="events-list"><div className="section-head"><span className="eyebrow">LIVE WORLD FEED</span><button aria-label="Refresh events" onClick={() => setEventTick(129)}>↻</button></div>{events.map((event) => <div className="feed-item" key={event.title}><span className={`feed-icon ${event.color}`}>{event.kind === 'WEATHER' ? '≋' : event.kind === 'TRANSIT' ? '→' : '✦'}</span><div><b>{event.title}</b><p>{event.detail}</p></div><time>{event.time}</time></div>)}</div>
          <div className="leaderboard"><div className="section-head"><span className="eyebrow">NEARBY OPERATIVES</span><span className="eyebrow">XP</span></div>{[['01','NOVA','3,920'],['02','RAVEN','2,840'],['03','KITE','2,610']].map(([rank, name, score]) => <div className="rank" key={name}><span>{rank}</span><b>{name}{name === 'RAVEN' && <i> YOU</i>}</b><strong>{score}</strong></div>)}</div>
          <div className="safety"><Shield /> <span>Stay aware. Payphones are fiction.<br /><b>Play responsibly in the real world.</b></span></div>
        </aside>
      </div>
    </main>
  )
}
