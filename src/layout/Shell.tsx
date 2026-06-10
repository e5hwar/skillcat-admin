import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, GraduationCap, Layers, DatabaseZap, FolderTree, Sparkles, Medal,
  MessageSquareText, Megaphone, Video, ClipboardCheck, UploadCloud, Users, Building2,
  Settings, Search, Zap, ListChecks,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { en, initials, avatarColor } from '../lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  end?: boolean
  countKey?: string
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: '',
    items: [{ to: '/', label: 'Overview', icon: LayoutGrid, end: true }],
  },
  {
    group: 'Content',
    items: [
      { to: '/certifications', label: 'Certifications', icon: GraduationCap },
      { to: '/tasks', label: 'Tasks', icon: Layers },
      { to: '/question-bank', label: 'Question Bank', icon: DatabaseZap },
      { to: '/industries', label: 'Industries', icon: FolderTree },
      { to: '/skills', label: 'Skills', icon: Sparkles },
      { to: '/awards', label: 'Awards', icon: Medal },
    ],
  },
  {
    group: 'Review',
    items: [
      { to: '/proctoring', label: 'Proctoring', icon: Video, countKey: 'proctoring' },
      { to: '/reviews', label: 'Hands-On Reviews', icon: ClipboardCheck, countKey: 'reviews' },
    ],
  },
  {
    group: 'Engage',
    items: [
      { to: '/spotlights', label: 'Spotlight', icon: Megaphone, countKey: 'spotlights' },
      { to: '/feedback-forms', label: 'Feedback Forms', icon: MessageSquareText },
    ],
  },
  {
    group: 'Operations',
    items: [
      { to: '/automations', label: 'Automations', icon: UploadCloud },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/companies', label: 'Companies', icon: Building2 },
      { to: '/settings', label: 'Platform Settings', icon: Settings },
    ],
  },
]

function CommandPalette({ onClose }: { onClose: () => void }) {
  const { db } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  const results = useMemo(() => {
    const needle = q.toLowerCase().trim()
    const pages = NAV.flatMap((g) => g.items).map((i) => ({
      kind: 'Page', label: i.label, to: i.to, icon: i.icon,
    }))
    const certs = db.certifications.map((c) => ({
      kind: 'Certification', label: en(c.name), to: `/certifications/${c.id}`, icon: GraduationCap,
    }))
    const tasks = db.tasks.map((t) => ({
      kind: 'Task', label: en(t.name), to: `/tasks/${t.id}`, icon: t.type === 'quiz' ? ListChecks : Layers,
    }))
    const users = db.users.map((u) => ({ kind: 'User', label: u.name, to: `/users/${u.id}`, icon: Users }))
    const all = [...pages, ...certs, ...tasks, ...users]
    if (!needle) return all.slice(0, 9)
    return all.filter((r) => r.label.toLowerCase().includes(needle)).slice(0, 9)
  }, [q, db])

  useEffect(() => setSel(0), [q])

  const go = (to: string) => {
    nav(to)
    onClose()
  }

  return (
    <div className="overlay" style={{ paddingTop: '14vh' }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmdk">
        <div className="cmdk-input">
          <Search size={16} style={{ color: 'var(--text-3)' }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, certifications, tasks, users…"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
              if (e.key === 'Enter' && results[sel]) go(results[sel].to)
              if (e.key === 'Escape') onClose()
            }}
          />
          <span className="kbd">esc</span>
        </div>
        <div className="cmdk-list">
          {results.length === 0 && <div className="empty" style={{ padding: 24 }}><p>No results for “{q}”</p></div>}
          {results.map((r, i) => {
            const Icon = r.icon
            return (
              <div key={r.to + r.label} className={`cmdk-item ${i === sel ? 'sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => go(r.to)}>
                <Icon size={15} />
                {r.label}
                <span className="hint">{r.kind}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Shell() {
  const { db } = useStore()
  const [palette, setPalette] = useState(false)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const counts: Record<string, { n: number; alert?: boolean }> = {
    proctoring: { n: db.proctoring.filter((p) => p.status === 'in-review' || (p.status === 'id-reupload' && p.reuploadReady)).length, alert: true },
    reviews: { n: db.submissions.filter((s) => s.status === 'pending').length, alert: true },
    spotlights: { n: db.spotlights.filter((s) => s.status === 'pending').length },
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Zap size={14} strokeWidth={2.6} /></div>
          <div>
            <div className="brand-name">SkillCat Studio</div>
            <div className="brand-env">Production · LMS v1</div>
          </div>
        </div>
        <div className="sidebar-search" onClick={() => setPalette(true)}>
          <Search size={13} />
          <span>Search</span>
          <span className="kbd">⌘K</span>
        </div>
        <nav className="nav">
          {NAV.map((g) => (
            <div className="nav-group" key={g.group}>
              {g.group && <div className="nav-group-label">{g.group}</div>}
              {g.items.map((i) => {
                const Icon = i.icon
                const c = i.countKey ? counts[i.countKey] : undefined
                return (
                  <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Icon size={15} strokeWidth={2} />
                    {i.label}
                    {c && c.n > 0 && <span className={`count ${c.alert ? 'alert' : ''}`}>{c.n}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar" style={{ background: avatarColor('adriana') }}>{initials('Adriana Cole')}</div>
          <div className="who">
            <b>Adriana Cole</b>
            <span>Content Admin</span>
          </div>
        </div>
      </aside>
      <main className="main">
        <div className="content">
          <Outlet />
        </div>
      </main>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  )
}
