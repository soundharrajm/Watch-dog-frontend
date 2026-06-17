import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from './api.js'
import AlertFeed   from './components/AlertFeed.jsx'
import EventStream from './components/EventStream.jsx'
import GcpUpload   from './components/GcpUpload.jsx'
import SimBar      from './components/SimBar.jsx'
import StatCards   from './components/StatCards.jsx'
import TopBar      from './components/TopBar.jsx'
import Settings    from './components/Settings.jsx'

const SAVED_URL = localStorage.getItem('wd_backend_url')
const API_INIT  = SAVED_URL || import.meta.env.VITE_API_URL || 'http://localhost:8001'

const TABS = ['Alerts','Stream events','Log upload']

export default function App() {
  const [apiUrl,       setApiUrl]       = useState(API_INIT)
  const [showSettings, setShowSettings] = useState(false)
  const [summary,      setSummary]      = useState(null)
  const [alerts,       setAlerts]       = useState([])
  const [events,       setEvents]       = useState([])
  const [tab,          setTab]          = useState(0)
  const [filter,       setFilter]       = useState('all')
  const [liveAlerts,   setLiveAlerts]   = useState([])
  const wsRef = useRef(null)

  const API = apiUrl
  const WS  = apiUrl.replace(/^http/, 'ws') + '/ws/alerts'

  const [backendOk, setBackendOk] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const [s, a, e] = await Promise.all([
        apiFetch(`${API}/streams/summary`).then(r => r.json()),
        apiFetch(`${API}/alerts/`).then(r => r.json()),
        apiFetch(`${API}/streams/?limit=80`).then(r => r.json()),
      ])
      setBackendOk(true)
      setSummary(s); setAlerts(a.alerts||[]); setEvents(e.events||[])
    } catch {
      setBackendOk(false)
    }
  }, [API])

  useEffect(() => { refresh() }, [])
  useEffect(() => {
    // Only poll when backend is reachable — stop hammering when it's down
    if (backendOk === false) return
    const t = setInterval(refresh, 10000)
    return () => clearInterval(t)
  }, [refresh, backendOk])

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS); wsRef.current = ws
        ws.onmessage = (e) => {
          try {
            const alert = JSON.parse(e.data)
            setLiveAlerts(prev => [alert, ...prev].slice(0,5))
            setAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)])
          } catch {}
        }
        ws.onclose = () => setTimeout(connect, 3000)
        ws.onerror = () => ws.close()
      } catch {}
    }
    connect()
    return () => wsRef.current?.close()
  }, [WS])

  const resolveAlert = async (id) => {
    await apiFetch(`${API}/alerts/${id}/resolve`, { method:'POST' })
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved:true } : a))
  }

  const threat = !summary ? 'UNKNOWN'
    : summary.critical_alerts > 0 ? 'CRITICAL'
    : summary.high_alerts     > 0 ? 'HIGH'
    : summary.total_alerts    > 0 ? 'MEDIUM' : 'CLEAR'

  const filtered = alerts.filter(a => {
    if (filter==='all')        return true
    if (filter==='unresolved') return !a.resolved
    return a.severity === filter
  })

  return (
    <div className="min-h-screen bg-base">

      <TopBar threat={threat} liveAlerts={liveAlerts} apiUrl={API} backendOk={backendOk} onOpenSettings={() => setShowSettings(true)} onRetry={refresh} />

      <main className="max-w-screen-2xl mx-auto px-4 py-5">
        <StatCards summary={summary} />

        {/* Sim bar */}
        <div className="card p-3 mb-4">
          <SimBar apiUrl={API} onDone={refresh} />
        </div>

        {/* Main panel */}
        <div className="card overflow-hidden">
          {/* Tab headers */}
          <div className="flex border-b border-white/[0.07] px-4">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={`px-4 py-3.5 text-xs font-semibold transition-all border-b-2 -mb-px mr-1
                  ${tab===i ? 'border-violet-500 text-violet-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                {t}{i===0 ? ` (${alerts.length})` : i===1 ? ` (${events.length})` : ''}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab===0 && <AlertFeed alerts={filtered} filter={filter} onFilter={setFilter} onResolve={resolveAlert} onClear={async () => { await apiFetch(`${API}/alerts/clear`,{method:'DELETE'}); setAlerts([]); refresh() }} />}
            {tab===1 && <EventStream events={events} />}
            {tab===2 && <GcpUpload apiUrl={API} onDone={refresh} />}
          </div>
        </div>
      </main>

      {showSettings && (
        <Settings apiUrl={API} onClose={() => setShowSettings(false)} onUrlSaved={url => { setApiUrl(url); setShowSettings(false) }} />
      )}
    </div>
  )
}
