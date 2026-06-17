import { useState, useEffect, useCallback, useRef } from 'react'
import AlertFeed    from './components/AlertFeed.jsx'
import EventStream  from './components/EventStream.jsx'
import GcpUpload    from './components/GcpUpload.jsx'
import SimBar       from './components/SimBar.jsx'
import StatCards    from './components/StatCards.jsx'
import TopBar       from './components/TopBar.jsx'
import Settings     from './components/Settings.jsx'

const SAVED_URL = localStorage.getItem('wd_backend_url')
const API_INIT  = SAVED_URL || import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function App() {
  const [apiUrl,     setApiUrl]     = useState(API_INIT)
  const [showSettings, setShowSettings] = useState(false)
  const [summary,  setSummary]  = useState(null)
  const [alerts,   setAlerts]   = useState([])
  const [events,   setEvents]   = useState([])
  const [tab,      setTab]      = useState('alerts')
  const [filter,   setFilter]   = useState('all')
  const [liveAlerts, setLiveAlerts] = useState([])
  const wsRef = useRef(null)

  const API = apiUrl
  const WS  = apiUrl.replace(/^http/, 'ws') + '/ws/alerts'

  const refresh = useCallback(async () => {
    try {
      const [s, a, e] = await Promise.all([
        fetch(`${API}/streams/summary`).then(r => r.json()),
        fetch(`${API}/alerts/`).then(r => r.json()),
        fetch(`${API}/streams/?limit=80`).then(r => r.json()),
      ])
      setSummary(s)
      setAlerts(a.alerts || [])
      setEvents(e.events || [])
    } catch {}
  }, [])

  // Initial load + polling fallback every 10s
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    const t = setInterval(refresh, 10000)
    return () => clearInterval(t)
  }, [refresh])

  // WebSocket — live alert push
  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS)
        wsRef.current = ws
        ws.onmessage = (e) => {
          try {
            const alert = JSON.parse(e.data)
            setLiveAlerts(prev => [alert, ...prev].slice(0, 5))
            setAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)])
            setSummary(prev => prev ? {
              ...prev,
              total_alerts    : (prev.total_alerts || 0) + 1,
              [`${alert.severity}_alerts`]: ((prev[`${alert.severity}_alerts`]) || 0) + 1,
            } : prev)
          } catch {}
        }
        ws.onclose = () => { setTimeout(connect, 3000) }
        ws.onerror = () => { ws.close() }
      } catch {}
    }
    connect()
    return () => { wsRef.current?.close() }
  }, [])

  const resolveAlert = async (id) => {
    await fetch(`${API}/alerts/${id}/resolve`, { method: 'POST' })
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a))
  }

  const threat = !summary ? 'UNKNOWN'
    : summary.critical_alerts > 0 ? 'CRITICAL'
    : summary.high_alerts     > 0 ? 'HIGH'
    : summary.total_alerts    > 0 ? 'MEDIUM' : 'CLEAR'

  const filtered = alerts.filter(a => {
    if (filter === 'all')        return true
    if (filter === 'unresolved') return !a.resolved
    return a.severity === filter
  })

  return (
    <div style={{ minHeight:'100vh', background:'#080810', color:'#e8e8f0', fontFamily:"'Inter','Segoe UI',sans-serif", paddingBottom:60 }}>

      <TopBar threat={threat} liveAlerts={liveAlerts} apiUrl={API} onOpenSettings={() => setShowSettings(true)} />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 16px' }}>

        <StatCards summary={summary} />

        <div style={{ margin:'14px 0', padding:'10px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
          <SimBar apiUrl={API} onDone={refresh} />
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {[
            ['alerts', `Alerts (${alerts.length})`],
            ['events', `Stream events (${events.length})`],
            ['upload', 'Log upload'],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding:'6px 16px', borderRadius:8, fontSize:12, fontWeight:600,
              cursor:'pointer', fontFamily:'inherit',
              border:tab===key?'1px solid #7c3aed':'1px solid rgba(255,255,255,0.08)',
              background:tab===key?'rgba(124,58,237,0.2)':'rgba(255,255,255,0.03)',
              color:tab===key?'#a78bfa':'#555',
            }}>{label}</button>
          ))}
        </div>

        {tab === 'alerts' && (
          <AlertFeed
            alerts={filtered}
            filter={filter}
            onFilter={setFilter}
            onResolve={resolveAlert}
            onClear={async () => {
              await fetch(`${API}/alerts/clear`, { method:'DELETE' })
              setAlerts([])
              refresh()
            }}
          />
        )}

        {tab === 'events' && <EventStream events={events} />}

        {tab === 'upload' && <GcpUpload apiUrl={API} onDone={refresh} />}
      </div>

      {showSettings && (
        <Settings
          apiUrl={API}
          onClose={() => setShowSettings(false)}
          onUrlSaved={(url) => { setApiUrl(url); setShowSettings(false) }}
        />
      )}
    </div>
  )
}
