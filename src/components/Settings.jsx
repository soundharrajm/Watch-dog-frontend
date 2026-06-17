import { useState } from 'react'
import { apiFetch } from '../api.js'
import { encryptPayload, clearKeyCache } from '../crypto.js'

const inp  = "inp mb-3"
const lbl  = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5"
const sec  = "section mb-4"
const TABS = ['Backend','Clouds','Detection']

function Toggle({ checked, onChange, label: lbl }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div onClick={()=>onChange(!checked)} className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked?'bg-violet-600':'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${checked?'left-[18px]':'left-0.5'}`}/>
      </div>
      <span className="text-xs text-slate-400">{lbl}</span>
    </label>
  )
}

function SaveBtn({ onClick, saving, saved }) {
  return (
    <button onClick={onClick} disabled={saving}
      className={`btn px-4 py-2 text-sm font-bold border-none transition-all ${saved?'bg-emerald-600 text-white':saving?'bg-violet-600/40 text-white cursor-not-allowed':'bg-violet-600 hover:bg-violet-500 text-white'}`}>
      {saving?'⏳ Saving…':saved?'✓ Saved':'Save'}
    </button>
  )
}

export default function Settings({ apiUrl: initUrl, onClose, onUrlSaved }) {
  const [tab,        setTab]        = useState(0)
  const [secret,     setSecret]     = useState('')
  const [sessionTok, setSessionTok] = useState('')
  const [authed,     setAuthed]     = useState(false)
  const [authErr,    setAuthErr]    = useState('')
  const [cfg,        setCfg]        = useState(null)
  const [backendUrl, setBackendUrl] = useState(initUrl)
  const [testing,    setTesting]    = useState(false)
  const [testOk,     setTestOk]     = useState(null)
  const [saving,     setSaving]     = useState({})
  const [saved,      setSaved]      = useState({})
  const [newAgent,   setNewAgent]   = useState('')
  const [newSecret,  setNewSecret]  = useState('')
  const [secretErr,  setSecretErr]  = useState('')

  const API = backendUrl

  const authenticate = async () => {
    setAuthErr('')
    try {
      clearKeyCache()
      const encrypted = await encryptPayload({ secret }, API)
      const r = await apiFetch(`${API}/config/auth`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(encrypted)
      })
      if (r.status===401) { setAuthErr('Key mismatch — try again'); return }
      if (!r.ok)          { setAuthErr('Invalid secret'); return }
      const d = await r.json()
      const tok = d.session_token
      setSessionTok(tok); setAuthed(true); setSecret('')
      const c = await apiFetch(`${API}/config/?secret=${tok}`).then(r=>r.json())
      setCfg(c)
    } catch { setAuthErr('Cannot reach backend') }
  }

  const testBackend = async () => {
    setTesting(true); setTestOk(null)
    try { const r=await apiFetch(`${backendUrl}/health`,{signal:AbortSignal.timeout(5000)}); setTestOk(r.ok) }
    catch { setTestOk(false) } finally { setTesting(false) }
  }

  const saveUrl = () => { localStorage.setItem('wd_backend_url',backendUrl); onUrlSaved(backendUrl); markSaved('url') }

  const saveCloud = async (p) => {
    markSaving(p)
    const r = await apiFetch(`${API}/config/cloud?secret=${sessionTok}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider:p,config:cfg.clouds[p]})})
    r.ok?markSaved(p):markSaving(p,false)
  }

  const saveDet = async () => {
    markSaving('det')
    const r = await apiFetch(`${API}/config/detection?secret=${sessionTok}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(cfg.detection)})
    r.ok?markSaved('det'):markSaving('det',false)
  }

  const changeSecret = async () => {
    setSecretErr(''); markSaving('secret')
    try {
      const r = await apiFetch(`${API}/config/change-secret`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({current_secret:sessionTok,new_secret:newSecret})})
      if (!r.ok) { setSecretErr('Failed'); markSaving('secret',false); return }
      setNewSecret(''); markSaved('secret')
    } catch { setSecretErr('Cannot reach backend'); markSaving('secret',false) }
  }

  const markSaving=(k,v=true)=>setSaving(p=>({...p,[k]:v}))
  const markSaved=(k)=>{setSaving(p=>({...p,[k]:false}));setSaved(p=>({...p,[k]:true}));setTimeout(()=>setSaved(p=>({...p,[k]:false})),2000)}
  const setCloud=(p,k,v)=>setCfg(c=>({...c,clouds:{...c.clouds,[p]:{...c.clouds[p],[k]:v}}}))
  const setDet=(k,v)=>setCfg(c=>({...c,detection:{...c.detection,[k]:v}}))

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-[#12121f] border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-red-600 flex items-center justify-center text-lg">⚙</div>
            <div>
              <p className="text-sm font-bold">Watchdog Settings</p>
              <p className="text-[10px] text-slate-500">Backend · Cloud credentials · Detection rules</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg border border-white/[0.1] text-slate-500 hover:text-slate-300 flex items-center justify-center transition-colors">✕</button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-white/[0.07] px-5">
          {TABS.map((t,i)=>(
            <button key={t} onClick={()=>setTab(i)} disabled={i>0&&!authed}
              className={`px-4 py-3 text-xs font-semibold transition-all border-b-2 -mb-px ${tab===i?'border-violet-500 text-violet-300':'border-transparent text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed'}`}>
              {t}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 0 — Backend */}
          {tab===0&&(
            <>
              <p className={lbl}>Backend URL</p>
              <div className="flex gap-2 mb-4">
                <input value={backendUrl} onChange={e=>setBackendUrl(e.target.value)} placeholder="http://localhost:8001" className="inp flex-1 mb-0"/>
                <button onClick={testBackend} disabled={testing} className={`btn flex-shrink-0 ${testOk===true?'border-emerald-500/30 text-emerald-400':testOk===false?'border-red-500/30 text-red-400':'border-white/[0.1] text-slate-400'}`}>
                  {testing?'⏳':testOk===true?'✓ OK':testOk===false?'✗ Fail':'🔌 Test'}
                </button>
                <SaveBtn onClick={saveUrl} saving={saving.url} saved={saved.url}/>
              </div>
              <div className="border-t border-white/[0.06] pt-4">
                <p className={lbl}>Admin unlock</p>
                {!authed?(
                  <>
                    <div className="flex gap-2">
                      <input type="password" value={secret} onChange={e=>setSecret(e.target.value)} onKeyDown={e=>e.key==='Enter'&&authenticate()} placeholder="Admin secret" className="inp flex-1 mb-0"/>
                      <button onClick={authenticate} className="btn bg-violet-600 hover:bg-violet-500 text-white border-none font-bold px-4">Unlock</button>
                    </div>
                    {authErr&&<p className="text-xs text-red-400 mt-2">{authErr}</p>}
                    <p className="text-[10px] text-slate-600 mt-2">Default: <code className="text-violet-400">watchdog-admin</code></p>
                  </>
                ):(
                  <>
                    <div className="px-3 py-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 text-sm text-emerald-400">✓ Unlocked — configure clouds and rules in other tabs</div>
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <p className={lbl}>Change admin secret</p>
                      <div className="flex gap-2">
                        <input type="password" value={newSecret} onChange={e=>setNewSecret(e.target.value)} onKeyDown={e=>e.key==='Enter'&&newSecret.trim()&&changeSecret()} placeholder="New secret" className="inp flex-1 mb-0"/>
                        <button onClick={changeSecret} disabled={!newSecret.trim()||saving.secret}
                          className={`btn bg-violet-600 hover:bg-violet-500 text-white border-none font-bold px-4 disabled:opacity-40`}>
                          {saving.secret?'⏳':saved.secret?'✓':'Update'}
                        </button>
                      </div>
                      {secretErr&&<p className="text-xs text-red-400 mt-1.5">{secretErr}</p>}
                      <p className="text-[10px] text-slate-600 mt-1.5">Only the current admin can change this</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {/* TAB 1 — Clouds */}
          {tab===1&&cfg&&['gcp','aws','azure','cdn'].map(p=>(
            <div key={p} className={sec}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-300">{p}</p>
                <Toggle checked={cfg.clouds[p].enabled} onChange={v=>setCloud(p,'enabled',v)} label="Enabled"/>
              </div>
              {p==='gcp'&&<>
                <label className={lbl}>Project ID</label>
                <input value={cfg.clouds.gcp.project_id} onChange={e=>setCloud('gcp','project_id',e.target.value)} placeholder="ott-platform-prod" className={inp}/>
                <label className={lbl}>Service Account JSON</label>
                <textarea value={cfg.clouds.gcp.service_account_json} onChange={e=>setCloud('gcp','service_account_json',e.target.value)} rows={4} placeholder={'{\n  "type": "service_account",\n  ...\n}'} className="inp font-mono text-[11px] resize-y"/>
                <label className={lbl}>Log filter</label>
                <input value={cfg.clouds.gcp.log_filter} onChange={e=>setCloud('gcp','log_filter',e.target.value)} className={inp}/>
                <label className={lbl}>Pub/Sub subscription</label>
                <input value={cfg.clouds.gcp.pubsub_subscription||''} onChange={e=>setCloud('gcp','pubsub_subscription',e.target.value)} placeholder="watchdog-sub" className={inp}/>
                <label className={lbl}>Pull interval (sec)</label>
                <input type="number" value={cfg.clouds.gcp.pull_interval_sec} onChange={e=>setCloud('gcp','pull_interval_sec',+e.target.value)} className="inp w-28"/>
                <p className="text-[10px] text-slate-600 mt-2 mb-3">pip install google-cloud-logging google-cloud-pubsub</p>
              </>}
              {p==='aws'&&<>
                <label className={lbl}>Access Key ID</label>
                <input value={cfg.clouds.aws.access_key_id} onChange={e=>setCloud('aws','access_key_id',e.target.value)} placeholder="AKIAIOSFODNN7EXAMPLE" className={inp}/>
                <label className={lbl}>Secret Access Key</label>
                <input type="password" value={cfg.clouds.aws.secret_access_key} onChange={e=>setCloud('aws','secret_access_key',e.target.value)} className={inp}/>
                <label className={lbl}>Region</label>
                <input value={cfg.clouds.aws.region} onChange={e=>setCloud('aws','region',e.target.value)} placeholder="us-east-1" className={inp}/>
                <label className={lbl}>CloudWatch Log Group</label>
                <input value={cfg.clouds.aws.log_group} onChange={e=>setCloud('aws','log_group',e.target.value)} placeholder="/aws/alb/access-logs" className={inp}/>
                <label className={lbl}>Kinesis Stream</label>
                <input value={cfg.clouds.aws.kinesis_stream||''} onChange={e=>setCloud('aws','kinesis_stream',e.target.value)} placeholder="watchdog-logs" className={inp}/>
                <p className="text-[10px] text-slate-600 mb-3">pip install boto3</p>
              </>}
              {p==='azure'&&<>
                <label className={lbl}>Tenant ID</label>
                <input value={cfg.clouds.azure.tenant_id} onChange={e=>setCloud('azure','tenant_id',e.target.value)} className={inp}/>
                <label className={lbl}>Client ID</label>
                <input value={cfg.clouds.azure.client_id} onChange={e=>setCloud('azure','client_id',e.target.value)} className={inp}/>
                <label className={lbl}>Client Secret</label>
                <input type="password" value={cfg.clouds.azure.client_secret} onChange={e=>setCloud('azure','client_secret',e.target.value)} className={inp}/>
                <label className={lbl}>Workspace ID</label>
                <input value={cfg.clouds.azure.workspace_id} onChange={e=>setCloud('azure','workspace_id',e.target.value)} className={inp}/>
                <label className={lbl}>Event Hub Connection String</label>
                <input type="password" value={cfg.clouds.azure.eventhub_connection_string||''} onChange={e=>setCloud('azure','eventhub_connection_string',e.target.value)} placeholder="Endpoint=sb://..." className={inp}/>
                <label className={lbl}>Event Hub Name</label>
                <input value={cfg.clouds.azure.eventhub_name||''} onChange={e=>setCloud('azure','eventhub_name',e.target.value)} className={inp}/>
                <p className="text-[10px] text-slate-600 mb-3">pip install azure-monitor-query azure-identity azure-eventhub</p>
              </>}
              {p==='cdn'&&<>
                <label className={lbl}>Provider</label>
                <select value={cfg.clouds.cdn.provider} onChange={e=>setCloud('cdn','provider',e.target.value)} className="inp mb-3 cursor-pointer">
                  {['cloudflare','akamai','fastly'].map(x=><option key={x} value={x}>{x}</option>)}
                </select>
                <label className={lbl}>API Key</label>
                <input type="password" value={cfg.clouds.cdn.api_key} onChange={e=>setCloud('cdn','api_key',e.target.value)} className={inp}/>
                <label className={lbl}>Zone ID</label>
                <input value={cfg.clouds.cdn.zone_id} onChange={e=>setCloud('cdn','zone_id',e.target.value)} className={inp}/>
              </>}
              <SaveBtn onClick={()=>saveCloud(p)} saving={saving[p]} saved={saved[p]}/>
            </div>
          ))}
          {/* TAB 2 — Detection */}
          {tab===2&&cfg&&(
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[['Max concurrent IPs','max_concurrent_ips'],['Max tokens/IP (30s)','max_tokens_per_ip'],['Dedup window (sec)','dedup_window_sec'],['Spray window (sec)','token_spray_window']].map(([l,k])=>(
                  <div key={k}>
                    <label className={lbl}>{l}</label>
                    <input type="number" value={cfg.detection[k]||''} onChange={e=>setDet(k,+e.target.value)} className="inp"/>
                  </div>
                ))}
              </div>
              <label className={lbl}>Suspicious user-agents</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(cfg.detection.suspicious_agents||[]).map(a=>(
                  <span key={a} className="badge border border-red-500/25 bg-red-500/10 text-red-400 font-mono">
                    {a}<button onClick={()=>setDet('suspicious_agents',cfg.detection.suspicious_agents.filter(x=>x!==a))} className="ml-1 text-slate-500 hover:text-red-400">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input value={newAgent} onChange={e=>setNewAgent(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&newAgent.trim()){setDet('suspicious_agents',[...(cfg.detection.suspicious_agents||[]),newAgent.trim()]);setNewAgent('')}}} placeholder="Add keyword e.g. hlsdump" className="inp flex-1 mb-0"/>
                <button onClick={()=>{if(newAgent.trim()){setDet('suspicious_agents',[...(cfg.detection.suspicious_agents||[]),newAgent.trim()]);setNewAgent('')}}} className="btn border-violet-500/30 text-violet-400 hover:bg-violet-500/10">+ Add</button>
              </div>
              <SaveBtn onClick={saveDet} saving={saving.det} saved={saved.det}/>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
