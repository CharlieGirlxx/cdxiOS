'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Bell, ChevronRight, Crosshair, MapPin, Radio, Shield, Signal, Zap } from 'lucide-react'

type NodeState = 'RINGING' | 'JAMMED' | 'CLAIMED' | 'CONTESTED'
type EventKind = 'WEATHER' | 'TRANSIT' | 'CROWD' | 'ANOMALY'

type Payphone = { id: string; name: string; area: string; distance: string; xp: number; rarity: string; state: NodeState; x: number; y: number; clue: string }
type WorldEvent = { kind: EventKind; title: string; detail: string; modifier: string; time: string; color: string }

const initialNodes: Payphone[] = [
  { id: '01', name: 'THE SWITCHBOARD', area: 'Mason & 4th', distance: '0.3 mi', xp: 240, rarity: 'EPIC', state: 'RINGING', x: 27, y: 33, clue: 'A voice is asking for the red door.' },
  { id: '02', name: 'BLUE HOUR', area: 'Union Square', distance: '0.7 mi', xp: 120, rarity: 'RARE', state: 'CONTESTED', x: 61, y: 24, clue: 'Look up. The city is watching back.' },
  { id: '03', name: 'DEAD DROP 09', area: 'Civic Center', distance: '1.1 mi', xp: 80, rarity: 'COMMON', state: 'JAMMED', x: 77, y: 66, clue: 'Signal buried under the moving noise.' },
  { id: '04', name: 'NIGHT CRAWLER', area: 'Market Street', distance: '1.5 mi', xp: 180, rarity: 'RARE', state: 'RINGING', x: 36, y: 76, clue: 'Do not answer after the third ring.' },
  { id: '05', name: 'GHOST LINE', area: 'Tenderloin', distance: '1.9 mi', xp: 300, rarity: 'LEGENDARY', state: 'CLAIMED', x: 76, y: 37, clue: 'The last operative left a trace.' },
]

const events: WorldEvent[] = [
  { kind: 'WEATHER', title: 'FOG FRONT MOVING IN', detail: 'Visibility dropping across downtown', modifier: '+2× rare signals', time: '18:42', color: 'cyan' },
  { kind: 'TRANSIT', title: 'BART DELAY // CIVIC', detail: 'Crowd density rerouting signal paths', modifier: '3 nodes rerouted', time: '08:16', color: 'amber' },
  { kind: 'ANOMALY', title: 'UNKNOWN TRANSMISSION', detail: 'Origin unverified · 0.8 mi radius', modifier: 'LIMITED-TIME RING', time: '02:09', color: 'green' },
]

export default function Page() {
  const [nodes, setNodes] = useState(initialNodes)
  const [selectedId, setSelectedId] = useState('01')
  const [phase, setPhase] = useState<'idle' | 'tracing' | 'connected' | 'claimed'>('idle')
  const [xp, setXp] = useState(2840)
  const [streak, setStreak] = useState(3)
  const [eventTick, setEventTick] = useState(129)
  const selected = useMemo(() => nodes.find((node) => node.id === selectedId) ?? nodes[0], [nodes, selectedId])

  useEffect(() => {
    const timer = window.setInterval(() => setEventTick((value) => (value > 0 ? value - 1 : 129)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function traceSignal() {
    if (selected.state === 'JAMMED' || phase === 'tracing' || phase === 'connected' || phase === 'claimed') return
    setPhase('tracing')
    window.setTimeout(() => setPhase('connected'), 1400)
  }

  function claimNode() {
    setPhase('claimed')
    setXp((value) => value + selected.xp)
    setStreak((value) => value + 1)
    setNodes((current) => current.map((node) => node.id === selected.id ? { ...node, state: 'CLAIMED' } : node))
  }

  const status = phase === 'tracing' ? 'TRACING SIGNAL...' : phase === 'connected' ? 'LINE CONNECTED' : phase === 'claimed' ? 'PAYPHONE CLAIMED' : selected.state === 'JAMMED' ? 'SIGNAL JAMMED' : 'READY TO TRACE'

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">///</span><span>PAYPHONE<br /><b>TAG</b></span><small>FIELD SYSTEM v0.4</small></div>
        <div className="live"><span className="live-dot" /> LIVE WORLD SYNC <span className="divider" /> SAN FRANCISCO // 21:47</div>
        <button className="icon-button" aria-label="Notifications"><Bell /></button>
      </header>

      <section className="ticker"><div className="ticker-label"><Radio /> WORLD EVENTS</div><div className="ticker-event"><span className="event-pulse" /> {events[0].title} <span>{events[0].modifier}</span></div><div className="ticker-event muted">{events[1].title} <span>{events[1].modifier}</span></div><div className="ticker-clock">NEXT SYNC 00:{String(eventTick).padStart(2, '0')}</div></section>

      <div className="layout">
        <section className="map-panel">
          <div className="map-heading"><div><p className="eyebrow">SECTOR 07 / DOWNTOWN</p><h1>Find the <em>ringing</em> phone.</h1></div><button className="scan-button" onClick={() => setEventTick(129)}><Activity data-icon="inline-start" /> SCAN CITY</button></div>
          <div className="map-canvas" aria-label="Signal map showing nearby payphones">
            <div className="map-label label-one">MASON ST <span>→</span></div><div className="map-label label-two">MARKET ST <span>↓</span></div><div className="map-label label-three">UNION SQ.</div>
            <div className="street street-a" /><div className="street street-b" /><div className="street street-c" /><div className="street street-d" />
            <div className="player"><span /><b>YOU</b></div>
            {nodes.map((node) => <button key={node.id} className={`node node-${node.state.toLowerCase()} ${selectedId === node.id ? 'selected' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => { setSelectedId(node.id); setPhase('idle') }} aria-label={`${node.name}, ${node.state}`}><span className="node-ring" /><strong>{node.state === 'RINGING' ? '☎' : node.state === 'CLAIMED' ? '✓' : node.state === 'CONTESTED' ? '!' : '×'}</strong><small>{node.id}</small></button>)}
            <div className="event-zone"><span /><b>ANOMALY ZONE</b><small>0.8 MI RADIUS</small></div>
            <div className="map-coords">37.7749° N<br />122.4194° W</div><div className="map-key"><span className="legend-ring" /> RINGING <span className="legend-you" /> YOU <span className="legend-zone" /> WORLD EVENT</div>
          </div>
          <div className="map-footer"><span><Crosshair /> GPS SIMULATION ACTIVE</span><span>5 SIGNALS IN RANGE</span><span className="footer-right">EVENT DATA: SIMULATED <span className="green-text">●</span></span></div>
        </section>

        <aside className="side-panel">
          <div className="operator-row"><div><p className="eyebrow">OPERATIVE 0042</p><h2>RAVEN<span className="green-text">_</span></h2></div><div className="level">LVL <b>07</b><small>2,840 XP</small></div></div>
          <div className="stats"><div><strong>{xp.toLocaleString()}</strong><span>XP TOTAL</span></div><div><strong>{streak}<i>×</i></strong><span>STREAK</span></div><div><strong>12</strong><span>CLAIMED</span></div></div>
          <div className="phone-card"><div className="card-top"><span className={`status-dot ${phase === 'claimed' ? 'green' : ''}`} /> {status}<span className="signal-bars"><i /><i /><i /></span></div><div className="phone-title"><div className="phone-icon">☎</div><div><p className="eyebrow">{selected.rarity} SIGNAL // {selected.distance}</p><h3>{selected.name}</h3><span>{selected.area}</span></div></div><p className="clue">“{selected.clue}”</p>{selected.state === 'CONTESTED' && <div className="warning"><Zap /> ANOTHER OPERATIVE IS TRACING THIS SIGNAL</div>}{selected.state === 'JAMMED' && <div className="warning">WORLD EVENT INTERFERENCE — TRY ANOTHER SECTOR</div>}<button className="trace-button" disabled={selected.state === 'JAMMED' || phase === 'claimed'} onClick={phase === 'connected' ? claimNode : traceSignal}>{phase === 'connected' ? 'ANSWER & CLAIM' : phase === 'claimed' ? 'CLAIMED ✓' : selected.state === 'JAMMED' ? 'SIGNAL UNAVAILABLE' : 'TRACE SIGNAL'}<ChevronRight data-icon="inline-end" /></button><div className="phone-meta"><span><MapPin /> {selected.distance} away</span><span><Zap /> +{selected.xp} XP</span></div></div>

          <div className="mission"><div className="section-head"><span className="eyebrow">DAILY HUNT // 04:13:22 LEFT</span><span className="mission-count">2 / 3</span></div><h3>Answer 3 ringing phones</h3><div className="progress"><span style={{ width: '66%' }} /></div><p>Bonus: <b>+500 XP</b> and a rare signal radar</p></div>
          <div className="events-list"><div className="section-head"><span className="eyebrow">LIVE WORLD FEED</span><button aria-label="Refresh events" onClick={() => setEventTick(129)}>↻</button></div>{events.map((event) => <div className="feed-item" key={event.title}><span className={`feed-icon ${event.color}`}>{event.kind === 'WEATHER' ? '≋' : event.kind === 'TRANSIT' ? '→' : '✦'}</span><div><b>{event.title}</b><p>{event.detail}</p></div><time>{event.time}</time></div>)}</div>
          <div className="leaderboard"><div className="section-head"><span className="eyebrow">NEARBY OPERATIVES</span><span className="eyebrow">XP</span></div>{[['01','NOVA','3,920'],['02','RAVEN','2,840'],['03','KITE','2,610']].map(([rank, name, score]) => <div className="rank" key={name}><span>{rank}</span><b>{name}{name === 'RAVEN' && <i> YOU</i>}</b><strong>{score}</strong></div>)}</div>
          <div className="safety"><Shield /> <span>Stay aware. Payphones are fiction.<br /><b>Play responsibly in the real world.</b></span></div>
        </aside>
      </div>
    </main>
  )
}
