import React, { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Search, X, AlertTriangle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LText, TaskType } from '../lib/types'
import { hasEs, taskTypeColor, taskTypeLabel } from '../lib/utils'
import { MonitorPlay, ListChecks, Wrench, BadgeCheck, Link2, FileText, ExternalLink } from 'lucide-react'

/* ---------- Page header ---------- */
export function PageHead({
  title, sub, actions, badge, crumbs,
}: {
  title: React.ReactNode
  sub?: React.ReactNode
  actions?: React.ReactNode
  badge?: React.ReactNode
  crumbs?: { label: string; to?: string }[]
}) {
  return (
    <>
      {crumbs && (
        <div className="crumbs">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={12} />}
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="page-head">
        <div className="titles">
          <div className="page-title">
            {title}
            {badge}
          </div>
          {sub && <div className="page-sub">{sub}</div>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </>
  )
}

/* ---------- Badge ---------- */
export function Badge({ tone = 'neutral', children, dot }: { tone?: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={`badge ${tone}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    visible: { tone: 'green', label: 'Visible' },
    hidden: { tone: 'neutral', label: 'Hidden' },
    archived: { tone: 'amber', label: 'Archived' },
    active: { tone: 'green', label: 'Active' },
    draft: { tone: 'blue', label: 'Draft' },
    pending: { tone: 'amber', label: 'Pending approval' },
    deactivated: { tone: 'neutral', label: 'Deactivated' },
    rejected: { tone: 'red', label: 'Rejected' },
    'in-review': { tone: 'amber', label: 'In review' },
    approved: { tone: 'green', label: 'Approved' },
    'id-reupload': { tone: 'red', label: 'ID reupload requested' },
    reviewed: { tone: 'green', label: 'Reviewed' },
    'not-started': { tone: 'neutral', label: 'Not started' },
    completed: { tone: 'green', label: 'Completed' },
    'reupload-requested': { tone: 'red', label: 'Reupload requested' },
  }
  const m = map[status] ?? { tone: 'neutral', label: status }
  return <Badge tone={m.tone} dot>{m.label}</Badge>
}

/* ---------- Task type icon ---------- */
export function TaskTypeIcon({ type, size = 24 }: { type: TaskType; size?: number }) {
  const c = taskTypeColor[type]
  const icons: Record<TaskType, React.ReactNode> = {
    xapi: <MonitorPlay size={size * 0.58} />,
    quiz: <ListChecks size={size * 0.58} />,
    'hands-on': <Wrench size={size * 0.58} />,
    'id-upload': <BadgeCheck size={size * 0.58} />,
    url: <ExternalLink size={size * 0.58} />,
    file: <FileText size={size * 0.58} />,
    deeplink: <Link2 size={size * 0.58} />,
  }
  return (
    <span className="task-type-ic" style={{ background: c.bg, color: c.fg, width: size, height: size }} title={taskTypeLabel[type]}>
      {icons[type]}
    </span>
  )
}

export function TaskTypeBadge({ type }: { type: TaskType }) {
  const c = taskTypeColor[type]
  return (
    <span className="badge" style={{ background: c.bg, color: c.fg }}>
      {taskTypeLabel[type]}
    </span>
  )
}

/* ---------- Field ---------- */
export function Field({
  label, required, optional, hint, children, trailing,
}: {
  label: React.ReactNode
  required?: boolean
  optional?: boolean
  hint?: React.ReactNode
  children: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <div className="field">
      <div className="field-label">
        {label}
        {required && <span className="req">*</span>}
        {optional && <span className="opt">Optional</span>}
        {trailing}
      </div>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

/* ---------- Translatable input (EN/ES) ---------- */
export function LangInput({
  label, value, onChange, required, multiline, hint, placeholder,
}: {
  label: React.ReactNode
  value: LText
  onChange: (v: LText) => void
  required?: boolean
  multiline?: boolean
  hint?: React.ReactNode
  placeholder?: string
}) {
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const esMissing = !hasEs(value)
  const cur = lang === 'en' ? value.en : value.es ?? ''
  const set = (s: string) => onChange(lang === 'en' ? { ...value, en: s } : { ...value, es: s })
  return (
    <div className="field">
      <div className="field-label">
        {label}
        {required && <span className="req">*</span>}
        <div className="lang-tabs">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} type="button">EN</button>
          <button className={`${lang === 'es' ? 'active' : ''} ${esMissing ? 'missing' : ''}`} onClick={() => setLang('es')} type="button">ES</button>
        </div>
      </div>
      {multiline ? (
        <textarea className="textarea" value={cur} placeholder={placeholder ?? (lang === 'es' ? 'Traducción al español…' : '')} onChange={(e) => set(e.target.value)} />
      ) : (
        <input className="input" value={cur} placeholder={placeholder ?? (lang === 'es' ? 'Traducción al español…' : '')} onChange={(e) => set(e.target.value)} />
      )}
      {lang === 'es' && esMissing && (
        <div className="field-hint" style={{ color: 'var(--amber)' }}>
          Spanish missing — users with Spanish preference will see the English text.
        </div>
      )}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

/* ---------- Switch ---------- */
export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
    </label>
  )
}

export function SwitchRow({
  label, desc, checked, onChange,
}: { label: string; desc?: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="switch-row">
      <Switch checked={checked} onChange={onChange} />
      <div>
        <div className="lbl">{label}</div>
        {desc && <div className="desc">{desc}</div>}
      </div>
    </div>
  )
}

/* ---------- Segmented ---------- */
export function Seg<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)} type="button">
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Tabs ---------- */
export function Tabs({
  tabs, value, onChange,
}: { tabs: { id: string; label: string; count?: number; alert?: boolean }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.id} className={value === t.id ? 'active' : ''} onClick={() => onChange(t.id)} type="button">
          {t.label}
          {t.count !== undefined && <span className="count" style={t.alert && t.count > 0 ? { background: 'var(--red-soft)', color: 'var(--red)' } : undefined}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

/* ---------- Search ---------- */
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="search-box">
      <Search size={14} />
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? 'Search…'} />
    </div>
  )
}

/* ---------- Modal ---------- */
export function Modal({
  title, onClose, children, footer, wide,
}: { title: React.ReactNode; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'lg' : ''}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn ghost btn-icon sm" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* ---------- Drawer ---------- */
export function Drawer({
  title, onClose, children, footer, width,
}: { title: React.ReactNode; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; width?: number }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" style={width ? { width } : undefined}>
        <div className="drawer-head">
          <h3>{title}</h3>
          <button className="btn ghost btn-icon sm" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </>
  )
}

/* ---------- Callout ---------- */
export function Callout({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'danger'; children: React.ReactNode }) {
  const Icon = tone === 'info' ? Info : AlertTriangle
  return (
    <div className={`callout ${tone}`}>
      <Icon size={15} />
      <div>{children}</div>
    </div>
  )
}

/* ---------- Empty state ---------- */
export function Empty({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="ic">{icon}</div>
      <b>{title}</b>
      {desc && <p>{desc}</p>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  )
}

/* ---------- Confirm modal hook ---------- */
export function useConfirm() {
  const [state, setState] = useState<{
    title: string
    body: React.ReactNode
    danger?: boolean
    confirmLabel?: string
    onConfirm: () => void
  } | null>(null)

  const confirm = (opts: NonNullable<typeof state>) => setState(opts)

  const element = useMemo(
    () =>
      state ? (
        <Modal
          title={state.title}
          onClose={() => setState(null)}
          footer={
            <>
              <button className="btn" onClick={() => setState(null)}>Cancel</button>
              <button
                className={`btn ${state.danger ? 'danger-solid' : 'primary'}`}
                onClick={() => {
                  state.onConfirm()
                  setState(null)
                }}
              >
                {state.confirmLabel ?? 'Confirm'}
              </button>
            </>
          }
        >
          <div style={{ fontSize: 13, lineHeight: 1.55 }}>{state.body}</div>
        </Modal>
      ) : null,
    [state]
  )

  return { confirm, element }
}
