// ui.jsx — reusable UI components

export const inp = "w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-slate-100 font-mono outline-none focus:border-violet-500 placeholder:text-slate-600 transition-all"
export const lbl = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5"

export function Btn({ onClick, disabled, color = 'primary', children, className = '' }) {
  const colors = {
    primary  : 'bg-violet-600 hover:bg-violet-500 text-white border-transparent',
    secondary: 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 border-white/[0.1]',
    green    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30',
    red      : 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/30',
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]} ${className}`}>
      {children}
    </button>
  )
}

export function ResultBox({ data, type = 'info' }) {
  if (!data) return null
  const colors = {
    ok  : 'border-emerald-500/25 bg-emerald-500/5 text-emerald-300',
    err : 'border-red-500/25    bg-red-500/5    text-red-300',
    info: 'border-blue-500/25   bg-blue-500/5   text-blue-300',
    warn: 'border-yellow-500/25 bg-yellow-500/5 text-yellow-300',
  }
  return (
    <div className={`mt-3 p-4 rounded-xl border text-xs font-mono whitespace-pre-wrap break-all leading-relaxed ${colors[type]}`}>
      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
    </div>
  )
}

export function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-200">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function Badge({ children, color = 'default' }) {
  const colors = {
    ok     : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
    err    : 'border-red-500/25    bg-red-500/10    text-red-400',
    violet : 'border-violet-500/25 bg-violet-500/10 text-violet-400',
    default: 'border-white/[0.1]   bg-white/[0.04]  text-slate-500',
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[color]}`}>
      {children}
    </span>
  )
}

export function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return <Btn onClick={copy} color="secondary">{copied ? '✓ Copied' : '📋 Copy'}</Btn>
}

import { useState } from 'react'
