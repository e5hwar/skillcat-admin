import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Save, Plus, X, GripVertical, CircleDot, CheckSquare, Type, Upload, SlidersHorizontal,
  Asterisk, Trash2, GitCommitHorizontal,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, Tabs, LangInput, Field, Switch, Callout, Modal, Seg } from '../../components/ui'
import { en, uid, initials, avatarColor } from '../../lib/utils'
import type { FeedbackForm, FBQuestion, FBQuestionType } from '../../lib/types'

const TYPE_META: Record<FBQuestionType, { label: string; icon: any }> = {
  single: { label: 'Multiple choice — single select', icon: CircleDot },
  multi: { label: 'Multiple choice — multi select', icon: CheckSquare },
  short: { label: 'Short answer (512 chars)', icon: Type },
  file: { label: 'File upload', icon: Upload },
  scale: { label: 'Linear scale', icon: SlidersHorizontal },
}

export default function FormEditor() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const form = db.feedbackForms.find((f) => f.id === id)
  const [tab, setTab] = useState('builder')
  const [addTrigger, setAddTrigger] = useState(false)

  if (!form) return <div className="page"><PageHead title="Form not found" /></div>

  const patch = (p: Partial<FeedbackForm>) =>
    update((d) => ({ ...d, feedbackForms: d.feedbackForms.map((f) => (f.id === form.id ? { ...f, ...p } : f)) }))

  const patchQ = (qid: string, p: Partial<FBQuestion>) =>
    patch({ questions: form.questions.map((q) => (q.id === qid ? { ...q, ...p } : q)) })

  const save = () => {
    patch({ version: form.version + 1, versionHistory: [{ version: form.version + 1, date: '2026-06-10', by: 'Adriana Cole', note: 'Edited via builder' }, ...form.versionHistory] })
    toast(`Saved as v${form.version + 1} — responses to earlier versions stay linked to the version they answered`)
  }

  return (
    <div className="page wide">
      <PageHead
        crumbs={[{ label: 'Feedback Forms', to: '/feedback-forms' }, { label: form.name }]}
        title={
          <input
            className="input"
            style={{ fontSize: 17, fontWeight: 650, border: 'none', boxShadow: 'none', padding: 0, height: 'auto', background: 'transparent', width: 380 }}
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        }
        badge={<StatusBadge status={form.status} />}
        sub="Submitting is always optional — users can dismiss without answering. Mandatory questions only apply if they choose to submit."
        actions={
          <>
            <select
              className="select" style={{ width: 120 }} value={form.status}
              onChange={(e) => {
                const v = e.target.value as FeedbackForm['status']
                patch({ status: v })
                toast(v === 'active' ? 'Form active — triggers can now fire' : v === 'archived' ? 'Archived — triggers preserved but inactive; responses retained' : 'Moved to draft')
              }}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <button className="btn primary" onClick={save}><Save size={14} /> Save as v{form.version + 1}</button>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: 'builder', label: 'Questions', count: form.questions.length },
          { id: 'triggers', label: 'Triggers', count: form.triggers.length },
          { id: 'responses', label: 'Responses', count: form.responses.length },
          { id: 'versions', label: 'Version History', count: form.versionHistory.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'builder' && (
        <div style={{ maxWidth: 760 }}>
          {form.questions.map((q, i) => {
            const Icon = TYPE_META[q.type].icon
            return (
              <div className="card" key={q.id} style={{ marginBottom: 12 }}>
                <div className="card-head" style={{ padding: '10px 14px' }}>
                  <GripVertical size={14} style={{ color: 'var(--text-3)', cursor: 'grab' }} />
                  <span className="opt-letter">{i + 1}</span>
                  <Icon size={14} style={{ color: 'var(--accent)' }} />
                  <select className="select" style={{ width: 280, height: 28 }} value={q.type} onChange={(e) => patchQ(q.id, { type: e.target.value as FBQuestionType })}>
                    {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <div className="spacer" />
                  <label className="row" style={{ fontSize: 12, gap: 6, cursor: 'pointer' }}>
                    <Asterisk size={12} style={{ color: q.mandatory ? 'var(--red)' : 'var(--text-3)' }} />
                    Mandatory
                    <Switch checked={q.mandatory} onChange={(v) => patchQ(q.id, { mandatory: v })} />
                  </label>
                  <button className="btn ghost btn-icon sm" onClick={() => patch({ questions: form.questions.filter((x) => x.id !== q.id) })}><Trash2 size={13} /></button>
                </div>
                <div className="card-body" style={{ padding: '12px 16px' }}>
                  <LangInput label="Question text" required value={q.text} onChange={(v) => patchQ(q.id, { text: v })} hint="Supports media attachments (images, videos) alongside the text." />
                  {(q.type === 'single' || q.type === 'multi') && (
                    <>
                      {q.options.map((o, j) => (
                        <div className="row" key={j} style={{ marginBottom: 6 }}>
                          {q.type === 'single' ? <CircleDot size={13} style={{ color: 'var(--text-3)' }} /> : <CheckSquare size={13} style={{ color: 'var(--text-3)' }} />}
                          <input className="input sm" value={o.en} onChange={(e) => patchQ(q.id, { options: q.options.map((x, k) => (k === j ? { ...x, en: e.target.value } : x)) })} />
                          <button className="btn ghost btn-icon sm" onClick={() => patchQ(q.id, { options: q.options.filter((_, k) => k !== j) })}><X size={11} /></button>
                        </div>
                      ))}
                      <div className="row">
                        <button className="btn sm" onClick={() => patchQ(q.id, { options: [...q.options, { en: '' }] })}><Plus size={11} /> Option</button>
                        <label className="row" style={{ fontSize: 12, gap: 6, cursor: 'pointer' }}>
                          <Switch checked={!!q.allowOther} onChange={(v) => patchQ(q.id, { allowOther: v })} />
                          Allow “Other” with free text
                        </label>
                      </div>
                    </>
                  )}
                  {q.type === 'scale' && (
                    <div className="field-row-3">
                      <Field label="Range">
                        <div className="row">
                          <input className="input sm" type="number" style={{ width: 56 }} value={q.scale?.min ?? 1} onChange={(e) => patchQ(q.id, { scale: { ...(q.scale ?? { min: 1, max: 10 }), min: +e.target.value } })} />
                          <span className="muted">to</span>
                          <input className="input sm" type="number" style={{ width: 56 }} value={q.scale?.max ?? 10} onChange={(e) => patchQ(q.id, { scale: { ...(q.scale ?? { min: 1, max: 10 }), max: +e.target.value } })} />
                        </div>
                      </Field>
                      <Field label="Low label" optional><input className="input sm" value={q.scale?.minLabel?.en ?? ''} onChange={(e) => patchQ(q.id, { scale: { ...(q.scale ?? { min: 1, max: 10 }), minLabel: { en: e.target.value } } })} /></Field>
                      <Field label="High label" optional><input className="input sm" value={q.scale?.maxLabel?.en ?? ''} onChange={(e) => patchQ(q.id, { scale: { ...(q.scale ?? { min: 1, max: 10 }), maxLabel: { en: e.target.value } } })} /></Field>
                    </div>
                  )}
                  {q.type === 'file' && (
                    <div className="field-row">
                      <Field label="Max files"><input className="input sm" type="number" value={q.file?.maxFiles ?? 1} onChange={(e) => patchQ(q.id, { file: { ...(q.file ?? { maxFiles: 1, maxSizeMb: 10 }), maxFiles: +e.target.value } })} /></Field>
                      <Field label="Max size per file (MB)"><input className="input sm" type="number" value={q.file?.maxSizeMb ?? 10} onChange={(e) => patchQ(q.id, { file: { ...(q.file ?? { maxFiles: 1, maxSizeMb: 10 }), maxSizeMb: +e.target.value } })} /></Field>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <button
            className="btn"
            onClick={() => patch({ questions: [...form.questions, { id: `fq-${uid()}`, text: { en: '' }, type: 'single', mandatory: false, options: [{ en: '' }] }] })}
          >
            <Plus size={14} /> Add question
          </button>
        </div>
      )}

      {tab === 'triggers' && (
        <div style={{ maxWidth: 700 }}>
          {form.status !== 'active' && <Callout tone="warn">The form must be <b>Active</b> before triggers fire.</Callout>}
          <div className="section-desc">
            Fires on completion of the mapped Task or Certification. A single Task/Certification can map to at most one
            form. For proctored quizzes, feedback is collected when the user passes — even while In-Review — so the
            experience is fresh; if the attempt is later rejected the response is kept.
          </div>
          <div className="card">
            {form.triggers.map((t, i) => {
              const label = t.kind === 'certification' ? en(db.certifications.find((c) => c.id === t.refId)?.name) : en(db.tasks.find((x) => x.id === t.refId)?.name)
              return (
                <div className="row" key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                  <Badge tone={t.kind === 'certification' ? 'teal' : 'blue'}>{t.kind === 'certification' ? 'Certification' : 'Task'} completion</Badge>
                  <span style={{ fontWeight: 550, fontSize: 13, flex: 1 }}>{label}</span>
                  <button className="btn ghost btn-icon sm" onClick={() => patch({ triggers: form.triggers.filter((_, j) => j !== i) })}><X size={12} /></button>
                </div>
              )
            })}
            {form.triggers.length === 0 && <div className="muted" style={{ padding: '14px 16px', fontSize: 12.5 }}>No triggers mapped.</div>}
          </div>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setAddTrigger(true)}><Plus size={14} /> Map a trigger</button>
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Editing triggers doesn't create a new version. Queuing: multiple different forms triggered in quick
            succession show one at a time; the same form triggered twice shows once.
          </p>
        </div>
      )}

      {tab === 'responses' && (
        <div>
          <div className="toolbar">
            <span className="muted" style={{ fontSize: 12.5 }}>
              Only SkillCat admins can view responses — B2B companies never see feedback data. Responses are retained
              forever; deleted accounts are de-identified.
            </span>
          </div>
          {form.responses.map((r) => {
            const u = db.users.find((x) => x.id === r.userId)
            return (
              <div className="card" key={r.id} style={{ marginBottom: 12 }}>
                <div className="card-head" style={{ padding: '10px 16px' }}>
                  <div className="avatar" style={{ width: 24, height: 24, fontSize: 9.5, background: avatarColor(r.userId) }}>{u ? initials(u.name) : '??'}</div>
                  <b style={{ fontSize: 12.5 }}>{u?.name ?? 'De-identified user'}</b>
                  <Badge tone="neutral">v{r.version}{r.version !== form.version ? ' (older version)' : ''}</Badge>
                  <span className="muted" style={{ fontSize: 12 }}>via {r.trigger}</span>
                  <div className="spacer" />
                  <span className="muted" style={{ fontSize: 11.5 }}>{r.submittedAt}</span>
                </div>
                <div className="card-body" style={{ padding: '10px 16px', display: 'grid', gap: 8 }}>
                  {r.answers.map((a) => {
                    const q = form.questions.find((x) => x.id === a.q)
                    return (
                      <div key={a.q} style={{ fontSize: 12.5 }}>
                        <span className="muted">{q ? en(q.text) : a.q}</span>
                        <div style={{ fontWeight: 550 }}>{a.value}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {form.responses.length === 0 && <div className="empty"><b>No responses yet</b><p>Responses appear as users submit the form.</p></div>}
        </div>
      )}

      {tab === 'versions' && (
        <div style={{ maxWidth: 600 }}>
          {form.versionHistory.map((v) => (
            <div className="row" key={v.version} style={{ padding: '12px 4px', borderBottom: '1px solid var(--border)' }}>
              <GitCommitHorizontal size={15} style={{ color: 'var(--text-3)' }} />
              <Badge tone={v.version === form.version ? 'accent' : 'neutral'}>v{v.version}</Badge>
              <span style={{ fontSize: 13, flex: 1 }}>{v.note}</span>
              <span className="muted" style={{ fontSize: 12 }}>{v.by} · {v.date}</span>
            </div>
          ))}
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            One active version at a time. Previous versions are retained so responses keep referencing the version that
            was live when the user submitted.
          </p>
        </div>
      )}

      {addTrigger && <TriggerPicker form={form} onClose={() => setAddTrigger(false)} patch={patch} />}
    </div>
  )
}

function TriggerPicker({ form, onClose, patch }: { form: FeedbackForm; onClose: () => void; patch: (p: Partial<FeedbackForm>) => void }) {
  const { db, toast } = useStore()
  const [kind, setKind] = useState<'certification' | 'task'>('certification')
  const [refId, setRefId] = useState('')

  const takenCerts = db.feedbackForms.flatMap((f) => f.triggers.filter((t) => t.kind === 'certification').map((t) => t.refId))
  const takenTasks = db.feedbackForms.flatMap((f) => f.triggers.filter((t) => t.kind === 'task').map((t) => t.refId))

  return (
    <Modal
      title="Map a completion trigger"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn primary"
            disabled={!refId}
            onClick={() => {
              patch({ triggers: [...form.triggers, { kind, refId }] })
              toast('Trigger mapped')
              onClose()
            }}
          >
            Add trigger
          </button>
        </>
      }
    >
      <Field label="Trigger event">
        <Seg options={[{ value: 'certification', label: 'Certification completion' }, { value: 'task', label: 'Task completion' }]} value={kind} onChange={(v) => { setKind(v); setRefId('') }} />
      </Field>
      <Field label={kind === 'certification' ? 'Certification' : 'Task'} required hint="Items already mapped to another form are disabled — one form per item.">
        <select className="select" value={refId} onChange={(e) => setRefId(e.target.value)}>
          <option value="">Select…</option>
          {kind === 'certification'
            ? db.certifications.filter((c) => c.owner === 'skillcat').map((c) => (
                <option key={c.id} value={c.id} disabled={takenCerts.includes(c.id)}>{en(c.name)}{takenCerts.includes(c.id) ? ' — already mapped' : ''}</option>
              ))
            : db.tasks.map((t) => (
                <option key={t.id} value={t.id} disabled={takenTasks.includes(t.id)}>{en(t.name)}{takenTasks.includes(t.id) ? ' — already mapped' : ''}</option>
              ))}
        </select>
      </Field>
    </Modal>
  )
}
