import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, GraduationCap, Lock, Globe2, Building2 } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, SearchInput, Modal, LangInput, Field } from '../../components/ui'
import { en, fmtNum, certTaskCount, uid } from '../../lib/utils'
import type { Certification, LText } from '../../lib/types'

const FILTERS = ['All', 'Visible', 'Hidden', 'Archived', 'Paid', 'Tenant-created'] as const

export default function CertsList() {
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState<LText>({ en: '', es: '' })

  const list = useMemo(() => {
    let l = db.certifications
    if (filter === 'Visible') l = l.filter((c) => c.visibility === 'visible')
    if (filter === 'Hidden') l = l.filter((c) => c.visibility === 'hidden')
    if (filter === 'Archived') l = l.filter((c) => c.visibility === 'archived')
    if (filter === 'Paid') l = l.filter((c) => c.paywall.kind !== 'free')
    if (filter === 'Tenant-created') l = l.filter((c) => c.owner !== 'skillcat')
    if (q) l = l.filter((c) => en(c.name).toLowerCase().includes(q.toLowerCase()) || c.keywords.join(' ').includes(q.toLowerCase()))
    return l
  }, [db, q, filter])

  const create = () => {
    if (!newName.en.trim()) return
    const id = `c-${uid()}`
    const cert: Certification = {
      id, name: { ...newName }, visibility: 'hidden', graphic: 'linear-gradient(135deg, #94a3b8, #64748b)', emoji: '📘',
      replacementIds: [], keywords: [], slug: newName.en.replace(/[^a-zA-Z0-9]/g, ''),
      industryIds: [], subIndustryIds: [], trades: [], partnerships: [], userType: 'all',
      paywall: { kind: 'free' }, forceOrder: false,
      courses: [{ id: `crs-${uid()}`, name: { en: 'Course 1' }, items: [] }],
      restrictions: {}, conditionSets: [], enrolled: 0, completed: 0, owner: 'skillcat', updatedAt: '2026-06-10',
    }
    update((d) => ({ ...d, certifications: [cert, ...d.certifications] }))
    toast('Certification created as Hidden — configure it, then make it visible')
    nav(`/certifications/${id}`)
  }

  return (
    <div className="page wide">
      <PageHead
        title="Certifications"
        sub="The top-level containers users browse, purchase and complete. Certification → Course → Lesson (optional) → Task."
        actions={<button className="btn primary" onClick={() => setCreating(true)}><Plus size={14} /> New certification</button>}
      />

      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name or keyword…" />
        <div className="spacer" />
        {FILTERS.map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '32%' }}>Certification</th>
              <th>Status</th>
              <th>Access</th>
              <th>Visibility scope</th>
              <th className="num">Tasks</th>
              <th className="num" style={{ textAlign: 'right' }}>Enrolled</th>
              <th className="num" style={{ textAlign: 'right' }}>Completed</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const tenant = c.owner !== 'skillcat' ? db.tenants.find((t) => t.id === c.owner) : null
              return (
                <tr key={c.id} className="click" onClick={() => nav(`/certifications/${c.id}`)}>
                  <td>
                    <div className="row">
                      <span className="cert-thumb" style={{ background: c.graphic }}>{c.emoji}</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="main-cell">{en(c.name)}</div>
                        <div className="sub-cell">
                          {c.certType ?? 'unit'} · /{c.slug}
                          {c.ceu ? ` · ${c.ceu} CEU` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={c.visibility} /></td>
                  <td>
                    {c.paywall.kind === 'free' && <Badge tone="green">Free</Badge>}
                    {c.paywall.kind === 'non-consumable' && <Badge tone="accent"><Lock size={10} /> ${c.paywall.priceStripe} one-time</Badge>}
                    {c.paywall.kind === 'consumable' && <Badge tone="amber"><Lock size={10} /> ${c.paywall.priceStripe} consumable</Badge>}
                  </td>
                  <td>
                    {tenant ? (
                      <Badge tone="neutral"><Building2 size={10} /> {tenant.name}</Badge>
                    ) : c.trades.length || c.partnerships.length || c.userType === 'b2b' ? (
                      <Badge tone="blue">{[...c.trades, ...c.partnerships, c.userType === 'b2b' ? 'B2B only' : ''].filter(Boolean).join(' · ')}</Badge>
                    ) : (
                      <Badge tone="neutral"><Globe2 size={10} /> All users</Badge>
                    )}
                  </td>
                  <td className="num">{certTaskCount(db, c.id)}</td>
                  <td className="num" style={{ textAlign: 'right' }}>{fmtNum(c.enrolled)}</td>
                  <td className="num" style={{ textAlign: 'right' }}>{fmtNum(c.completed)}</td>
                  <td className="muted">{c.updatedAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="empty">
            <div className="ic"><GraduationCap size={18} /></div>
            <b>No certifications match</b>
            <p>Try a different search or filter.</p>
          </div>
        )}
      </div>

      {creating && (
        <Modal
          title="New certification"
          onClose={() => setCreating(false)}
          footer={
            <>
              <button className="btn" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn primary" disabled={!newName.en.trim()} onClick={create}>Create certification</button>
            </>
          }
        >
          <LangInput label="Name" required value={newName} onChange={setNewName} placeholder="e.g. EPA 609 MVAC" />
          <Field label="What happens next">
            <div className="field-hint" style={{ marginTop: 0 }}>
              The certification is created in a <b>Hidden</b> state with one empty Course. Add structure, completion
              criteria and metadata, then switch it to Visible. English is required; Spanish can be added per field and
              falls back to English when missing.
            </div>
          </Field>
        </Modal>
      )}
    </div>
  )
}
