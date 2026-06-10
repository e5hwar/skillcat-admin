import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Medal, QrCode, Trash2, Archive, ExternalLink } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, Tabs, Drawer, Field, useConfirm } from '../../components/ui'
import { en, fmtNum, tierLabel, uid } from '../../lib/utils'
import type { Award, MeritTier } from '../../lib/types'

const TIER_ORDER: MeritTier[] = ['platinum', 'gold', 'silver', 'bronze']

export default function Awards() {
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const [tab, setTab] = useState('awards')
  const [editing, setEditing] = useState<Award | 'new' | null>(null)
  const { confirm, element } = useConfirm()

  const awards = [...db.awards].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))

  return (
    <div className="page wide">
      <PageHead
        title="Awards"
        sub="Proof of achievement — one award per certification, with Card and/or Certificate appearances rendered from reusable Designs. Verifiable publicly via QR code and unique number."
        actions={
          tab === 'awards' ? (
            <button className="btn primary" onClick={() => setEditing('new')}><Plus size={14} /> New award</button>
          ) : (
            <button className="btn primary" onClick={() => {
              const id = `dz-${uid()}`
              update((d) => ({ ...d, designs: [...d.designs, { id, name: 'Untitled design', orientation: 'landscape', background: 'linear-gradient(135deg, #64748b, #334155)', fields: [{ key: 'userName', x: 50, y: 50 }] }] }))
              nav(`/awards/designs/${id}`)
            }}><Plus size={14} /> New design</button>
          )
        }
      />
      <Tabs
        tabs={[
          { id: 'awards', label: 'Awards', count: db.awards.length },
          { id: 'designs', label: 'Designs', count: db.designs.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'awards' && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Linked certification</th>
                <th>Merit tier</th>
                <th>Appearances</th>
                <th>Status</th>
                <th className="num" style={{ textAlign: 'right' }}>Issued</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {awards.map((a) => {
                const cert = db.certifications.find((c) => c.id === a.certificationId)
                const card = db.designs.find((d) => d.id === a.cardDesignId)
                const certificate = db.designs.find((d) => d.id === a.certificateDesignId)
                return (
                  <tr key={a.id} className="click" onClick={() => setEditing(a)}>
                    <td>
                      <div className="row">
                        <span className="cert-thumb" style={{ background: cert?.graphic }}>{cert?.emoji}</span>
                        <div className="main-cell">{en(cert?.name)}</div>
                      </div>
                    </td>
                    <td><Badge tone={`tier-${a.tier}`}><Medal size={11} /> {tierLabel[a.tier]}</Badge></td>
                    <td>
                      <div className="row" style={{ gap: 4 }}>
                        {card && <Badge tone="neutral">Card · {card.name}</Badge>}
                        {certificate && <Badge tone="neutral">Certificate · {certificate.name}</Badge>}
                        {!card && !certificate && <span className="muted">No appearance configured</span>}
                      </div>
                    </td>
                    <td>{a.status === 'active' ? <Badge tone="green" dot>Active</Badge> : <Badge tone="neutral" dot>Archived</Badge>}</td>
                    <td className="num" style={{ textAlign: 'right' }}>{fmtNum(a.issued)}</td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn ghost btn-icon sm" title="Public verification page" onClick={() => toast('Opens skillcat.app/verify — no login required')}><QrCode size={13} /></button>
                      <button
                        className="btn ghost btn-icon sm" title="Delete"
                        onClick={() =>
                          confirm({
                            title: 'Delete award?',
                            danger: true,
                            confirmLabel: 'Delete from all users',
                            body: <>Deleting removes this award from all <b>{fmtNum(a.issued)}</b> users who earned it, and its verification pages start showing “no longer valid”. Archiving instead stops new issuance but lets holders keep it.</>,
                            onConfirm: () => {
                              update((d) => ({ ...d, awards: d.awards.filter((x) => x.id !== a.id) }))
                              toast('Award deleted and revoked from all holders')
                            },
                          })
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'designs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {db.designs.map((dz) => {
            const usedBy = db.awards.filter((a) => a.cardDesignId === dz.id || a.certificateDesignId === dz.id)
            return (
              <div key={dz.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => nav(`/awards/designs/${dz.id}`)}>
                <div style={{ aspectRatio: '16/10', background: dz.background, position: 'relative' }}>
                  {dz.fields.map((f) => (
                    <span key={f.key} style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%,-50%)', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.92)', background: 'rgba(0,0,0,0.25)', padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                      {f.key === 'qr' ? '⊞ QR' : f.key === 'userName' ? 'User Name' : f.key === 'certName' ? 'Certification' : f.key === 'date' ? 'Date' : 'Nº'}
                    </span>
                  ))}
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{dz.name}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    {usedBy.length > 0 ? `Used by ${usedBy.length} award${usedBy.length > 1 ? 's' : ''} — edits apply everywhere, including issued awards` : 'Not used by any award'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && <AwardDrawer award={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {element}
    </div>
  )
}

function AwardDrawer({ award, onClose }: { award: Award | null; onClose: () => void }) {
  const { db, update, toast } = useStore()
  const [certId, setCertId] = useState(award?.certificationId ?? '')
  const [tier, setTier] = useState<MeritTier>(award?.tier ?? 'bronze')
  const [cardId, setCardId] = useState(award?.cardDesignId ?? '')
  const [certDzId, setCertDzId] = useState(award?.certificateDesignId ?? '')

  const taken = db.awards.filter((a) => a.id !== award?.id).map((a) => a.certificationId)

  const save = () => {
    if (!certId) return
    if (award) {
      update((d) => ({
        ...d,
        awards: d.awards.map((a) => (a.id === award.id ? { ...a, certificationId: certId, tier, cardDesignId: cardId || undefined, certificateDesignId: certDzId || undefined } : a)),
      }))
      toast('Award updated — appearance changes apply to all issued instances immediately')
    } else {
      const newId = `aw-${uid()}`
      update((d) => ({
        ...d,
        awards: [...d.awards, { id: newId, certificationId: certId, tier, cardDesignId: cardId || undefined, certificateDesignId: certDzId || undefined, status: 'active', issued: 0 }],
        certifications: d.certifications.map((c) => (c.id === certId ? { ...c, awardId: newId } : c)),
      }))
      toast('Award created — issued retroactively to everyone who already completed the certification (no events fired)')
    }
    onClose()
  }

  return (
    <Drawer
      title={award ? 'Edit award' : 'New award'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!certId} onClick={save}>{award ? 'Save changes' : 'Create award'}</button>
        </>
      }
    >
      <Field label="Linked certification" required hint="One award per certification. Issued when the user completes it — held while proctoring review is pending.">
        <select className="select" value={certId} onChange={(e) => setCertId(e.target.value)}>
          <option value="">Select…</option>
          {db.certifications.filter((c) => c.owner === 'skillcat').map((c) => (
            <option key={c.id} value={c.id} disabled={taken.includes(c.id)}>
              {en(c.name)}{taken.includes(c.id) ? ' — already has an award' : ''}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Merit tier" hint="Fixed tiers control portfolio order: Platinum at the top, Bronze at the bottom. Users can't reorder.">
        <div className="row wrap">
          {(['platinum', 'gold', 'silver', 'bronze'] as MeritTier[]).map((t) => (
            <button key={t} className={`filter-chip ${tier === t ? 'on' : ''}`} onClick={() => setTier(t)}>
              <Medal size={12} /> {tierLabel[t]}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Card design" optional hint="Compact appearance for app surfaces. Most certifications have a card.">
        <select className="select" value={cardId} onChange={(e) => setCardId(e.target.value)}>
          <option value="">— None —</option>
          {db.designs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Certificate design" optional hint="Printable/PDF appearance for formal verification — Trade School diplomas, EPA, etc.">
        <select className="select" value={certDzId} onChange={(e) => setCertDzId(e.target.value)}>
          <option value="">— None —</option>
          {db.designs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <div className="card pad" style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
        The QR code and unique number are shared across both appearances — one identity per award. Dynamic fields (user
        name, certification name) always reflect current values, not issuance-time snapshots. QR codes resolve to the
        public verification page; for printed EPA cards the vector is shared with InstantCard via API.
      </div>
    </Drawer>
  )
}
