import { useState } from 'react'
import Sidebar     from './components/Sidebar.jsx'
import KeyManager  from './components/KeyManager.jsx'
import Encryptor   from './components/Encryptor.jsx'
import Decryptor   from './components/Decryptor.jsx'
import AuthTester  from './components/AuthTester.jsx'

const PAGES = [
  { id: 'key',     label: 'Key manager',      icon: '🔑' },
  { id: 'encrypt', label: 'Encrypt payload',  icon: '🔒' },
  { id: 'decrypt', label: 'Decrypt & verify', icon: '🔓' },
  { id: 'auth',    label: 'Auth flow test',   icon: '✅' },
]

const DEFAULT_STATE = {
  apiUrl      : localStorage.getItem('cd_api_url') || 'http://localhost:8001',
  publicKey   : null,
  publicKeyPem: '',
  fingerprint : '',
  encrypted   : null,
  sessionToken: '',
}

export default function App() {
  const [page,  setPage]  = useState('key')
  const [state, setState] = useState(DEFAULT_STATE)

  const update  = (patch) => setState(p => ({ ...p, ...patch }))
  const saveUrl = (url)   => { localStorage.setItem('cd_api_url', url); update({ apiUrl: url }) }
  const current = PAGES.find(p => p.id === page)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar pages={PAGES} active={page} onSelect={setPage} apiUrl={state.apiUrl} onSaveUrl={saveUrl} />

      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#0a0a14]/90 backdrop-blur border-b border-white/[0.07] px-6 py-3 flex items-center gap-3">
          <span className="text-xl">{current?.icon}</span>
          <h1 className="text-sm font-bold text-slate-200">{current?.label}</h1>
          <div className="ml-auto flex items-center gap-3">
            {state.publicKey && (
              <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-bold">KEY LOADED</span>
            )}
            {state.sessionToken && (
              <span className="text-[10px] px-2 py-0.5 rounded border border-violet-500/25 bg-violet-500/10 text-violet-400 font-bold">AUTHENTICATED</span>
            )}
            <a href={`${state.apiUrl}/docs`} target="_blank" rel="noreferrer"
              className="text-[10px] px-2 py-1 rounded border border-white/[0.1] bg-white/[0.04] text-slate-500 hover:text-slate-300 transition-colors">
              📋 Swagger docs →
            </a>
          </div>
        </div>

        <div className="p-6">
          {page === 'key'     && <KeyManager state={state} update={update} />}
          {page === 'encrypt' && <Encryptor  state={state} update={update} />}
          {page === 'decrypt' && <Decryptor  state={state} update={update} />}
          {page === 'auth'    && <AuthTester state={state} update={update} />}
        </div>
      </main>
    </div>
  )
}
