import { useState, useEffect } from 'react'

const inp = {
  width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
  borderRadius:8, padding:'9px 12px', fontSize:13, color:'#e8e8f0', outline:'none',
  fontFamily:'monospace', boxSizing:'border-box',
}
const label = { fontSize:11, color:'#555', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5, display:'block' }
const section = { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:18, marginBottom:14 }

function Toggle({ value, onChange, label: lbl }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
      <div onClick={() => onChange(!value)} style={{ width:36, height:20, borderRadius:10, background:value?'#7c3aed':'rgba(255,255,255,0.15)', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
        <div style={{ width:14, height:14, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:value?19:3, transition:'left .2s' }} />
      </div>
      <span style={{ fontSize:13, color:'#94a3b8' }}>{lbl}</span>
    </label>
  )
}

function SaveBtn({ onClick, saving, saved }) {
  return (
    <button onClick={onClick} disabled={saving} style={{ padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', border:'none', background:saved?'#22c55e':saving?'rgba(124,58,237,0.4)':'#7c3aed', color:'#fff', transition:'background .2s' }}>
      {saving ? '⏳ Saving…' : saved ? '✓ Saved' : 'Save'}
    </button>
  )
}

export default function Settings({ apiUrl: initUrl, onClose, onUrlSaved }) {
  const [secret,   setSecret]   = useState(localStorage.getItem('wd_secret') || '')
  const [authed,   setAuthed]   = useState(false)
  const [authErr,  setAuthErr]  = useState('')
  const [cfg,      setCfg]      = useState(null)
  const [backendUrl, setBackendUrl] = useState(initUrl)
  const [testing,  setTesting]  = useState(false)
  const [testOk,   setTestOk]   = useState(null)
  const [saving,   setSaving]   = useState({})
  const [saved,    setSaved]    = useState({})
  const [newAgent, setNewAgent] = useState('')

  const API = backendUrl

  const authenticate = async () => {
    setAuthErr('')
    try {
      const r = await fetch(`${API}/config/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      if (!r.ok) { setAuthErr('Invalid secret'); return }
      localStorage.setItem('wd_secret', secret)
      setAuthed(true)
      const c = await fetch(`${API}/config/?secret=${secret}`).then(r => r.json())
      setCfg(c)
    } catch { setAuthErr('Cannot reach backend') }
  }

  const testBackend = async () => {
    setTesting(true); setTestOk(null)
    try {
      const r = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(5000) })
      setTestOk(r.ok)
    } catch { setTestOk(false) }
    finally { setTesting(false) }
  }

  const saveBackendUrl = () => {
    localStorage.setItem('wd_backend_url', backendUrl)
    onUrlSaved(backendUrl)
    markSaved('url')
  }

  const saveCloud = async (provider) => {
    markSaving(provider)
    const r = await fetch(`${API}/config/cloud?secret=${secret}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, config: cfg.clouds[provider] }),
    })
    if (r.ok) markSaved(provider)
    else markSaving(provider, false)
  }

  const saveDetection = async () => {
    markSaving('detection')
    const r = await fetch(`${API}/config/detection?secret=${secret}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg.detection),
    })
    if (r.ok) markSaved('detection')
    else markSaving('detection', false)
  }

  const markSaving = (k, v=true) => setSaving(p => ({ ...p, [k]: v }))
  const markSaved  = (k) => {
    setSaving(p => ({ ...p, [k]: false }))
    setSaved(p => ({ ...p, [k]: true }))
    setTimeout(() => setSaved(p => ({ ...p, [k]: false })), 2000)
  }

  const setCloud = (provider, key, val) =>
    setCfg(p => ({ ...p, clouds: { ...p.clouds, [provider]: { ...p.clouds[provider], [key]: val } } }))

  const setDetection = (key, val) =>
    setCfg(p => ({ ...p, detection: { ...p.detection, [key]: val } }))

  const addAgent = () => {
    if (!newAgent.trim()) return
    setDetection('suspicious_agents', [...(cfg.detection.suspicious_agents||[]), newAgent.trim().toLowerCase()])
    setNewAgent('')
  }

  const removeAgent = (a) =>
    setDetection('suspicious_agents', cfg.detection.suspicious_agents.filter(x => x !== a))

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'#0e0e1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto', padding:24 }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#7c3aed,#dc2626)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚙</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#e8e8f0' }}>Watchdog settings</div>
              <div style={{ fontSize:11, color:'#555' }}>Backend · Cloud credentials · Detection rules</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:7, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#555', fontSize:14, cursor:'pointer' }}>✕</button>
        </div>

        {/* ── Backend URL ── */}
        <div style={section}>
          <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:12 }}>Backend URL</div>
          <span style={label}>URL</span>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <input value={backendUrl} onChange={e => setBackendUrl(e.target.value)} placeholder="http://localhost:8000" style={{ ...inp, flex:1 }}/>
            <button onClick={testBackend} disabled={testing} style={{ padding:'9px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'inherit', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:testOk===true?'#22c55e':testOk===false?'#f87171':'#888' }}>
              {testing ? '⏳' : testOk===true ? '✓ OK' : testOk===false ? '✗ Fail' : '🔌 Test'}
            </button>
            <SaveBtn onClick={saveBackendUrl} saving={saving.url} saved={saved.url} />
          </div>
          <div style={{ fontSize:11, color:'#444' }}>Saved to localStorage — same as API Market approach</div>
        </div>

        {/* ── Auth ── */}
        {!authed ? (
          <div style={section}>
            <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:12 }}>Admin access</div>
            <span style={label}>Secret</span>
            <div style={{ display:'flex', gap:8 }}>
              <input type="password" value={secret} onChange={e => setSecret(e.target.value)}
                onKeyDown={e => e.key==='Enter' && authenticate()}
                placeholder="Enter admin secret" style={{ ...inp, flex:1 }}/>
              <button onClick={authenticate} style={{ padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', border:'none', background:'#7c3aed', color:'#fff' }}>Unlock</button>
            </div>
            {authErr && <div style={{ fontSize:12, color:'#f87171', marginTop:8 }}>{authErr}</div>}
            <div style={{ fontSize:11, color:'#444', marginTop:8 }}>Default secret: <code style={{color:'#a78bfa'}}>watchdog-admin</code> — change it after first login</div>
          </div>
        ) : cfg && (
          <>
            {/* ── Cloud Providers ── */}
            {['gcp','aws','azure','cdn'].map(provider => (
              <div key={provider} style={section}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', textTransform:'uppercase' }}>{provider}</div>
                  <Toggle value={cfg.clouds[provider].enabled} onChange={v => setCloud(provider, 'enabled', v)} label="Enabled" />
                </div>

                {provider === 'gcp' && (
                  <>
                    <span style={label}>GCP Project ID</span>
                    <input value={cfg.clouds.gcp.project_id} onChange={e => setCloud('gcp','project_id',e.target.value)} placeholder="ott-platform-prod" style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Service account JSON (paste full content)</span>
                    <textarea value={cfg.clouds.gcp.service_account_json} onChange={e => setCloud('gcp','service_account_json',e.target.value)}
                      placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "...",\n  ...\n}'}
                      style={{ ...inp, minHeight:100, resize:'vertical', marginBottom:8, fontFamily:'monospace', fontSize:11 }}/>
                    <span style={label}>Log filter</span>
                    <input value={cfg.clouds.gcp.log_filter} onChange={e => setCloud('gcp','log_filter',e.target.value)} style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Pull interval (seconds)</span>
                    <input type="number" value={cfg.clouds.gcp.pull_interval_sec} onChange={e => setCloud('gcp','pull_interval_sec',Number(e.target.value))} style={{ ...inp, width:120, marginBottom:8 }}/>
                    <div style={{ fontSize:11, color:'#444', marginBottom:10 }}>Install: <code style={{color:'#a78bfa'}}>pip install google-cloud-logging</code></div>
                  </>
                )}

                {provider === 'aws' && (
                  <>
                    <span style={label}>Access key ID</span>
                    <input value={cfg.clouds.aws.access_key_id} onChange={e => setCloud('aws','access_key_id',e.target.value)} placeholder="AKIAIOSFODNN7EXAMPLE" style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Secret access key</span>
                    <input type="password" value={cfg.clouds.aws.secret_access_key} onChange={e => setCloud('aws','secret_access_key',e.target.value)} placeholder="••••••••" style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Region</span>
                    <input value={cfg.clouds.aws.region} onChange={e => setCloud('aws','region',e.target.value)} placeholder="us-east-1" style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>CloudWatch log group</span>
                    <input value={cfg.clouds.aws.log_group} onChange={e => setCloud('aws','log_group',e.target.value)} placeholder="/aws/alb/access-logs" style={{ ...inp, marginBottom:8 }}/>
                    <div style={{ fontSize:11, color:'#444', marginBottom:10 }}>Install: <code style={{color:'#a78bfa'}}>pip install boto3</code></div>
                  </>
                )}

                {provider === 'azure' && (
                  <>
                    <span style={label}>Tenant ID</span>
                    <input value={cfg.clouds.azure.tenant_id} onChange={e => setCloud('azure','tenant_id',e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Client ID</span>
                    <input value={cfg.clouds.azure.client_id} onChange={e => setCloud('azure','client_id',e.target.value)} style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Client secret</span>
                    <input type="password" value={cfg.clouds.azure.client_secret} onChange={e => setCloud('azure','client_secret',e.target.value)} placeholder="••••••••" style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Log analytics workspace ID</span>
                    <input value={cfg.clouds.azure.workspace_id} onChange={e => setCloud('azure','workspace_id',e.target.value)} style={{ ...inp, marginBottom:8 }}/>
                    <div style={{ fontSize:11, color:'#444', marginBottom:10 }}>Install: <code style={{color:'#a78bfa'}}>pip install azure-monitor-query azure-identity</code></div>
                  </>
                )}

                {provider === 'cdn' && (
                  <>
                    <span style={label}>Provider</span>
                    <select value={cfg.clouds.cdn.provider} onChange={e => setCloud('cdn','provider',e.target.value)} style={{ ...inp, marginBottom:8, cursor:'pointer' }}>
                      {['cloudflare','akamai','fastly'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span style={label}>API key</span>
                    <input type="password" value={cfg.clouds.cdn.api_key} onChange={e => setCloud('cdn','api_key',e.target.value)} placeholder="••••••••" style={{ ...inp, marginBottom:8 }}/>
                    <span style={label}>Zone / Site ID</span>
                    <input value={cfg.clouds.cdn.zone_id} onChange={e => setCloud('cdn','zone_id',e.target.value)} style={{ ...inp, marginBottom:8 }}/>
                  </>
                )}

                <SaveBtn onClick={() => saveCloud(provider)} saving={saving[provider]} saved={saved[provider]} />
              </div>
            ))}

            {/* ── Detection rules ── */}
            <div style={section}>
              <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:12 }}>Detection rules</div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                {[
                  ['Max concurrent IPs', 'max_concurrent_ips'],
                  ['Max tokens per IP (30s)', 'max_tokens_per_ip'],
                  ['Dedup window (sec)', 'dedup_window_sec'],
                  ['Token spray window (sec)', 'token_spray_window'],
                ].map(([lbl, key]) => (
                  <div key={key}>
                    <span style={label}>{lbl}</span>
                    <input type="number" value={cfg.detection[key]||''} onChange={e => setDetection(key, Number(e.target.value))} style={{ ...inp, width:'100%' }}/>
                  </div>
                ))}
              </div>

              <span style={label}>Suspicious user-agents</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {(cfg.detection.suspicious_agents||[]).map(a => (
                  <span key={a} style={{ fontSize:11, fontFamily:'monospace', padding:'3px 8px', borderRadius:5, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', display:'flex', alignItems:'center', gap:5 }}>
                    {a}
                    <span style={{ cursor:'pointer', fontSize:12, color:'#666' }} onClick={() => removeAgent(a)}>✕</span>
                  </span>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <input value={newAgent} onChange={e => setNewAgent(e.target.value)} onKeyDown={e => e.key==='Enter' && addAgent()} placeholder="Add agent keyword e.g. hlsdump" style={{ ...inp, flex:1 }}/>
                <button onClick={addAgent} style={{ padding:'9px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'inherit', border:'1px solid rgba(124,58,237,0.3)', background:'rgba(124,58,237,0.1)', color:'#a78bfa' }}>+ Add</button>
              </div>

              <SaveBtn onClick={saveDetection} saving={saving.detection} saved={saved.detection} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
