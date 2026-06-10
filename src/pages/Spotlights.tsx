import { useState } from 'react'
import { ArrowUp, ArrowDown, Plus, Megaphone, Check, X, Power, Eye, MousePointerClick } from 'lucide-react'
import { useStore } from '../lib/store'
import { PageHead, Badge, StatusBadge, Tabs, Drawer, LangInput, Field, Callout } from '../components/ui'
import { en, fmtNum, uid } from '../lib/utils'
import type { Spotlight } from '../lib/types'

export default function Spotlights() {
  const { db, update, toast } = useStore()
  const [tab, setTab] = useState('queue')
  const [editing, setEditing] = useState<Spotlight | 'new' | null>(null)

  const active = db.spotlights.filter((s) => s.status === 'active').sort((a, b) => a.position - b.position)
  const pending = db.spotlights.filter((s) => s.status === 'pending').sort((a, b) => a.position - b.position)
  const past = db.spotlights.filter((s) => s.status === 'deactivated' || s.status === 'rejected')

  const move = (id: string, dir: -1 | 1) => {
    const idx = active.findIndex((s) => s.id === id)
    const swap = active[idx + dir]
    if (!swap) return
    update((d) => ({
      ...d,
      spotlights: d.spotlights.map((s) =>
        s.id === id ? { ...s, position: swap.position } : s.id === swap.id ? { ...s, position: active[idx].position } : s
      ),
    }))
  }

  const setStatus = (id: string, status: Spotlight['status'], msg: string) => {
    update((d) => ({ ...d, spotlights: d.spotlights.map((s) => (s.id === id ? { ...s, status } : s)) }))
    toast(msg)
  }

  const SpotCard = ({ s, queue }: { s: Spotlight; queue: boolean }) => (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="row" style={{ padding: '12px 16px', alignItems: 'flex-start' }}>
        {queue && s.status === 'active' && (
          <div className="stack" style={{ gap: 2, alignItems: 'center', marginRight: 2 }}>
            <button className="btn ghost btn-icon sm" onClick={() => move(s.id, -1)}><ArrowUp size={13} /></button>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{active.findIndex((x) => x.id === s.id) + 1}</span>
            <button className="btn ghost btn-icon sm" onClick={() => move(s.id, 1)}><ArrowDown size={13} /></button>
          </div>
        )}
        <div
          style={{
            width: 120, height: 64, borderRadius: 8, flexShrink: 0,
            background: s.background ?? 'linear-gradient(135deg, #5b5bd6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)',
          }}
        >
          <Megaphone size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row">
            <b style={{ fontSize: 13.5 }}>{en(s.heading)}</b>
            <StatusBadge status={s.status} />
            {!s.heading.es && <Badge tone="amber">ES missing</Badge>}
          </div>
          {s.description && <div className="muted-2" style={{ fontSize: 12.5, marginTop: 2 }}>{en(s.description)}</div>}
          <div className="row" style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-3)', gap: 12 }}>
            <span>Requested by {s.requestedBy}</span>
            <span>Ends {s.endDate}</span>
            {s.ctaText && <span>CTA: “{en(s.ctaText)}” → {s.ctaRedirect}</span>}
            {s.views != null && <span className="row" style={{ gap: 3 }}><Eye size={11} /> {fmtNum(s.views)}</span>}
            {s.clicks != null && <span className="row" style={{ gap: 3 }}><MousePointerClick size={11} /> {fmtNum(s.clicks)}</span>}
          </div>
        </div>
        <div className="row" style={{ flexShrink: 0 }}>
          {s.status === 'pending' && (
            <>
              <button className="btn sm" onClick={() => setEditing(s)}>Review</button>
              <button className="btn success-solid sm" onClick={() => setStatus(s.id, 'active', 'Approved — entered the queue at the requested position')}><Check size={12} /> Approve</button>
              <button className="btn danger sm" onClick={() => setStatus(s.id, 'rejected', 'Spotlight rejected')}><X size={12} /> Reject</button>
            </>
          )}
          {s.status === 'active' && (
            <>
              <button className="btn ghost sm" onClick={() => setEditing(s)}>Edit</button>
              <button className="btn ghost sm" onClick={() => setStatus(s.id, 'deactivated', 'Deactivated — removed from all user queues')}><Power size={12} /> Deactivate</button>
            </>
          )}
          {(s.status === 'deactivated' || s.status === 'rejected') && (
            <button className="btn ghost sm" onClick={() => setStatus(s.id, 'pending', 'Resubmitted for approval')}>Resubmit</button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <PageHead
        title="Spotlight"
        sub="The promoted block on the app's Home Screen. Position 1 shows first; dismissing reveals the next. In V1 every user sees every active spotlight."
        actions={<button className="btn primary" onClick={() => setEditing('new')}><Plus size={14} /> New spotlight</button>}
      />
      <Tabs
        tabs={[
          { id: 'queue', label: 'Active queue', count: active.length },
          { id: 'pending', label: 'Awaiting approval', count: pending.length, alert: true },
          { id: 'past', label: 'Past', count: past.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'queue' && (
        <>
          <div className="section-desc">
            Queue positions are relative — if a neighbour expires or is removed, order is maintained automatically.
            Reordering never re-shows a spotlight a user already dismissed.
          </div>
          {active.map((s) => <SpotCard key={s.id} s={s} queue />)}
          {active.length === 0 && <div className="empty"><b>No active spotlights</b></div>}
        </>
      )}
      {tab === 'pending' && (
        <>
          <div className="section-desc">
            Approval requires the “Approve Spotlights” permission — separate from creating. Approvers can adjust the
            requested queue position before approving.
          </div>
          {pending.map((s) => <SpotCard key={s.id} s={s} queue={false} />)}
          {pending.length === 0 && <div className="empty"><b>Nothing awaiting approval</b></div>}
        </>
      )}
      {tab === 'past' && past.map((s) => <SpotCard key={s.id} s={s} queue={false} />)}

      {editing && <SpotlightDrawer spot={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function SpotlightDrawer({ spot, onClose }: { spot: Spotlight | null; onClose: () => void }) {
  const { db, update, toast } = useStore()
  const [heading, setHeading] = useState(spot?.heading ?? { en: '' })
  const [description, setDescription] = useState(spot?.description ?? { en: '' })
  const [ctaText, setCtaText] = useState(spot?.ctaText ?? { en: '' })
  const [ctaRedirect, setCtaRedirect] = useState(spot?.ctaRedirect ?? '')
  const [endDate, setEndDate] = useState(spot?.endDate ?? '2026-09-10')
  const [afterId, setAfterId] = useState('end')

  const active = db.spotlights.filter((s) => s.status === 'active').sort((a, b) => a.position - b.position)
  const ctaInvalid = !!ctaText.en.trim() && !ctaRedirect.trim()

  const save = () => {
    if (!heading.en.trim() || ctaInvalid) return
    if (spot) {
      update((d) => ({
        ...d,
        spotlights: d.spotlights.map((s) => (s.id === spot.id ? { ...s, heading, description, ctaText: ctaText.en ? ctaText : undefined, ctaRedirect: ctaRedirect || undefined, endDate } : s)),
      }))
      toast('Spotlight updated')
    } else {
      const pos = afterId === 'end' ? (active.at(-1)?.position ?? 0) + 1 : (active.find((s) => s.id === afterId)?.position ?? 0) + 0.5
      update((d) => ({
        ...d,
        spotlights: [
          ...d.spotlights,
          { id: `sp-${uid()}`, heading, description: description.en ? description : undefined, ctaText: ctaText.en ? ctaText : undefined, ctaRedirect: ctaRedirect || undefined, endDate, status: 'pending', requestedBy: 'Adriana Cole', createdAt: '2026-06-10', position: pos },
        ],
      }))
      toast('Submitted for approval — visible to all spotlight creators in the pending queue')
    }
    onClose()
  }

  return (
    <Drawer
      title={spot ? 'Edit spotlight' : 'New spotlight'}
      onClose={onClose}
      width={500}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!heading.en.trim() || ctaInvalid} onClick={save}>{spot ? 'Save changes' : 'Submit for approval'}</button>
        </>
      }
    >
      <LangInput label="Heading" required value={heading} onChange={setHeading} />
      <LangInput label="Description" value={description} onChange={setDescription} multiline />
      <LangInput label="CTA button text" value={ctaText} onChange={setCtaText} />
      <Field label="CTA redirect" required={!!ctaText.en.trim()} hint={ctaInvalid ? <span style={{ color: 'var(--red)' }}>Required when CTA text is set.</span> : 'URL or deep link — a certification, task, or app page.'}>
        <input className="input mono" value={ctaRedirect} onChange={(e) => setCtaRedirect(e.target.value)} placeholder="https://skillcat.app/…" />
      </Field>
      <div className="field-row">
        <Field label="End date" required hint="Auto-deactivates after this date. Max 6 months out.">
          <input className="input" type="date" value={endDate} max="2026-12-10" onChange={(e) => setEndDate(e.target.value)} />
        </Field>
        <Field label="Background image" optional>
          <button className="btn" style={{ width: '100%' }}>Upload image</button>
        </Field>
      </div>
      {!spot && (
        <Field label="Requested queue position" hint="Relative to the current queue. Approvers can adjust before approving.">
          <select className="select" value={afterId} onChange={(e) => setAfterId(e.target.value)}>
            {active.map((s, i) => <option key={s.id} value={s.id}>After #{i + 1} — {en(s.heading)}</option>)}
            <option value="end">At the end of the queue</option>
          </select>
        </Field>
      )}
      {!spot && (
        <Callout tone="info">
          Creating submits for review — it won't show to users until an approver with the “Approve Spotlights” permission
          approves it.
        </Callout>
      )}
    </Drawer>
  )
}
