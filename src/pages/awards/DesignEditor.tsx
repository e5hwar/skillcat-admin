import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Save, UploadCloud, QrCode, Plus, X } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, Field, Callout } from '../../components/ui'
import { en } from '../../lib/utils'
import type { AwardDesign } from '../../lib/types'

const FIELD_LABELS: Record<string, string> = {
  userName: 'User’s Name',
  certName: 'Certification Name',
  date: 'Completion Date',
  number: 'Unique Number',
  qr: 'QR',
}

const SAMPLE: Record<string, string> = {
  userName: 'Marcus J. Webb',
  certName: 'EPA 608 Universal',
  date: 'June 10, 2026',
  number: 'SC-7Q4N-58LM',
  qr: 'QR',
}

export default function DesignEditor() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const design = db.designs.find((d) => d.id === id)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  if (!design) return <div className="page"><PageHead title="Design not found" /></div>

  const patch = (p: Partial<AwardDesign>) =>
    update((d) => ({ ...d, designs: d.designs.map((x) => (x.id === design.id ? { ...x, ...p } : x)) }))

  const usedBy = db.awards.filter((a) => a.cardDesignId === design.id || a.certificateDesignId === design.id)

  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.min(97, Math.max(3, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(95, Math.max(5, ((e.clientY - rect.top) / rect.height) * 100))
    patch({ fields: design.fields.map((f) => (f.key === dragging ? { ...f, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } : f)) })
  }

  const unused = (Object.keys(FIELD_LABELS) as AwardDesign['fields'][number]['key'][]).filter(
    (k) => !design.fields.some((f) => f.key === k)
  )

  return (
    <div className="page wide">
      <PageHead
        crumbs={[{ label: 'Awards', to: '/awards' }, { label: design.name }]}
        title={
          <input
            className="input"
            style={{ fontSize: 17, fontWeight: 650, border: 'none', boxShadow: 'none', padding: 0, height: 'auto', background: 'transparent', width: 360 }}
            value={design.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        }
        sub={usedBy.length > 0 ? `Used by ${usedBy.length} award(s): ${usedBy.map((a) => en(db.certifications.find((c) => c.id === a.certificationId)?.name)).join(', ')}` : 'Not used by any award yet.'}
        actions={
          <>
            <div className="seg">
              <button className={!preview ? 'active' : ''} onClick={() => setPreview(false)}>Edit</button>
              <button className={preview ? 'active' : ''} onClick={() => setPreview(true)}>Preview</button>
            </div>
            <button className="btn primary" onClick={() => toast(usedBy.length > 0 ? `Design saved — updated across ${usedBy.length} award(s), including already-issued ones` : 'Design saved')}>
              <Save size={14} /> Save design
            </button>
          </>
        }
      />

      {usedBy.length > 0 && (
        <Callout tone="warn">
          Changes to this design apply to <b>every award that uses it — including awards already issued</b>. This is how
          bulk visual updates work.
        </Callout>
      )}

      <div className="two-col" style={{ gridTemplateColumns: '1fr 300px' }}>
        <div>
          <div
            ref={canvasRef}
            className="design-canvas"
            style={{ aspectRatio: '16/10', background: design.background, cursor: dragging ? 'grabbing' : undefined }}
            onPointerMove={onMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          >
            {design.fields.map((f) =>
              preview ? (
                <span
                  key={f.key}
                  style={{
                    position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%,-50%)',
                    color: design.background.includes('#fdfcf8') || design.background.includes('#f4efe2') ? '#3a3325' : '#fff',
                    fontWeight: f.key === 'userName' ? 700 : 500,
                    fontSize: f.key === 'userName' ? 26 : f.key === 'certName' ? 16 : 11,
                    fontFamily: f.key === 'number' ? 'var(--mono)' : undefined,
                    textAlign: 'center', whiteSpace: 'nowrap',
                  }}
                >
                  {f.key === 'qr' ? (
                    <span style={{ display: 'flex', width: 52, height: 52, background: '#fff', borderRadius: 6, alignItems: 'center', justifyContent: 'center', color: '#111' }}><QrCode size={38} /></span>
                  ) : (
                    SAMPLE[f.key]
                  )}
                </span>
              ) : (
                <div
                  key={f.key}
                  className={`design-field ${f.key === 'qr' ? 'qr' : ''} ${dragging === f.key ? 'drag' : ''}`}
                  style={{ left: `${f.x}%`, top: `${f.y}%` }}
                  onPointerDown={(e) => { e.preventDefault(); setDragging(f.key) }}
                  title="Drag to position"
                >
                  {f.key === 'qr' ? <QrCode size={26} /> : FIELD_LABELS[f.key]}
                </div>
              )
            )}
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Drag the dynamic fields into position over the background. When a user earns an award using this design,
            their details render into these positions to produce the finished Card or Certificate.
          </p>
        </div>

        <div className="side-card">
          <div className="card pad">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Background</div>
            <button className="btn" style={{ width: '100%' }}><UploadCloud size={14} /> Upload background image</button>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>JPEG or PNG. The gradient is a placeholder until artwork is uploaded.</div>
            <hr className="divider" />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Dynamic fields</div>
            <div className="stack" style={{ gap: 6 }}>
              {design.fields.map((f) => (
                <div key={f.key} className="row" style={{ fontSize: 12.5, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 7 }}>
                  <span style={{ flex: 1, fontWeight: 550 }}>{FIELD_LABELS[f.key]}</span>
                  <span className="mono muted" style={{ fontSize: 10.5 }}>{f.x}%, {f.y}%</span>
                  <button className="btn ghost btn-icon sm" onClick={() => patch({ fields: design.fields.filter((x) => x.key !== f.key) })}><X size={11} /></button>
                </div>
              ))}
              {unused.map((k) => (
                <button key={k} className="filter-chip" style={{ justifyContent: 'center' }} onClick={() => patch({ fields: [...design.fields, { key: k, x: 50, y: 50 }] })}>
                  <Plus size={11} /> Add {FIELD_LABELS[k]}
                </button>
              ))}
            </div>
          </div>
          <div className="card pad" style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Used by</div>
            {usedBy.length === 0 && <div className="muted" style={{ fontSize: 12 }}>No awards reference this design — it can be deleted.</div>}
            {usedBy.map((a) => {
              const cert = db.certifications.find((c) => c.id === a.certificationId)
              return (
                <div key={a.id} className="row" style={{ padding: '5px 0', fontSize: 12.5 }}>
                  <span className="cert-thumb" style={{ background: cert?.graphic, width: 26, height: 20, fontSize: 10 }}>{cert?.emoji}</span>
                  <span style={{ flex: 1 }}>{en(cert?.name)}</span>
                  <Badge tone="neutral">{a.cardDesignId === design.id ? 'Card' : 'Certificate'}</Badge>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
