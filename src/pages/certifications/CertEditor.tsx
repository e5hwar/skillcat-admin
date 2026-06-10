import React, { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Plus, GripVertical, EyeOff, Lock, Trash2, Archive, Save, ExternalLink, FolderPlus,
  BookOpen, Link2, ArrowRight, ArrowLeftRight, GitBranch, Medal, MessageSquareText,
  DownloadCloud, UploadCloud, AlertTriangle, Eye, ShieldAlert, X, ChevronDown,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import {
  PageHead, Badge, StatusBadge, Tabs, Modal, Drawer, LangInput, Field, Switch, SwitchRow,
  Seg, Callout, TaskTypeIcon, useConfirm, SearchInput,
} from '../../components/ui'
import { en, fmtNum, taskUsage, uid, fmtTime } from '../../lib/utils'
import type { Certification, ConditionSet, ContentLink, LinkType, Task } from '../../lib/types'

const TABS = [
  { id: 'structure', label: 'Structure' },
  { id: 'details', label: 'Details' },
  { id: 'completion', label: 'Completion' },
  { id: 'access', label: 'Access & Pricing' },
  { id: 'links', label: 'Content Links' },
  { id: 'lifecycle', label: 'Lifecycle' },
]

export default function CertEditor() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const cert = db.certifications.find((c) => c.id === id)
  const [tab, setTab] = useState('structure')
  const { confirm, element: confirmEl } = useConfirm()

  if (!cert) return <div className="page"><PageHead title="Certification not found" /></div>

  const patch = (p: Partial<Certification>) =>
    update((d) => ({ ...d, certifications: d.certifications.map((c) => (c.id === cert.id ? { ...c, ...p } : c)) }))

  const award = db.awards.find((a) => a.id === cert.awardId)
  const fbForm = db.feedbackForms.find((f) => f.id === cert.feedbackFormId)

  return (
    <div className="page wide">
      <PageHead
        crumbs={[{ label: 'Certifications', to: '/certifications' }, { label: en(cert.name) }]}
        title={
          <>
            <span className="cert-thumb" style={{ background: cert.graphic, width: 44, height: 32, fontSize: 16 }}>{cert.emoji}</span>
            {en(cert.name)}
          </>
        }
        badge={<StatusBadge status={cert.visibility} />}
        sub={
          <span className="row wrap" style={{ gap: 6 }}>
            <span className="mono" style={{ fontSize: 11.5 }}>skillcat.app/{cert.slug}</span>
            <ExternalLink size={11} style={{ color: 'var(--text-3)' }} />
            <span>· {fmtNum(cert.enrolled)} enrolled · {fmtNum(cert.completed)} completed</span>
            {cert.owner !== 'skillcat' && <Badge tone="neutral">Tenant-created · {db.tenants.find((t) => t.id === cert.owner)?.name}</Badge>}
          </span>
        }
        actions={
          <>
            <select
              className="select"
              style={{ width: 130 }}
              value={cert.visibility}
              onChange={(e) => {
                const v = e.target.value as Certification['visibility']
                if (v === 'archived') { setTab('lifecycle'); toast('Use the archive flow below to archive with replacements', 'error'); return }
                patch({ visibility: v })
                toast(v === 'visible' ? 'Certification is now visible to matching users' : 'Certification hidden from all users')
              }}
            >
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="archived">Archived</option>
            </select>
            <button className="btn primary" onClick={() => toast('All changes saved')}><Save size={14} /> Save</button>
          </>
        }
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'structure' && <StructureTab cert={cert} patch={patch} />}
      {tab === 'details' && <DetailsTab cert={cert} patch={patch} />}
      {tab === 'completion' && <CompletionTab cert={cert} patch={patch} />}
      {tab === 'access' && <AccessTab cert={cert} patch={patch} />}
      {tab === 'links' && <LinksTab cert={cert} />}
      {tab === 'lifecycle' && <LifecycleTab cert={cert} patch={patch} award={award} fbForm={fbForm} confirm={confirm} />}
      {confirmEl}
    </div>
  )
}

/* ================= Structure ================= */
function StructureTab({ cert, patch }: { cert: Certification; patch: (p: Partial<Certification>) => void }) {
  const { db, toast } = useStore()
  const [pickerFor, setPickerFor] = useState<string | null>(null) // course id
  const [restrictTask, setRestrictTask] = useState<string | null>(null)

  const addCourse = () =>
    patch({ courses: [...cert.courses, { id: `crs-${uid()}`, name: { en: `Course ${cert.courses.length + 1}` }, items: [] }] })

  const addTaskTo = (courseId: string, taskId: string) => {
    patch({
      courses: cert.courses.map((c) => (c.id === courseId ? { ...c, items: [...c.items, { kind: 'task', taskId }] } : c)),
    })
    setPickerFor(null)
    toast('Task added — completion is shared with every other place it is used')
  }

  const removeItem = (courseId: string, idx: number) =>
    patch({ courses: cert.courses.map((c) => (c.id === courseId ? { ...c, items: c.items.filter((_, i) => i !== idx) } : c)) })

  const taskRow = (taskId: string, courseId: string, idx: number, inLesson?: boolean) => {
    const t = db.tasks.find((x) => x.id === taskId)
    if (!t) return null
    const usage = taskUsage(db, taskId)
    const restriction = cert.restrictions[taskId]
    const isFinal = cert.conditionSets.some((cs) => cs.items.some((i) => i.kind === 'task' && i.refId === taskId && t.type === 'quiz'))
    return (
      <div className="tree-task" key={`${taskId}-${idx}`} style={inLesson ? { paddingLeft: 4 } : undefined}>
        <GripVertical size={13} className="grip" />
        <TaskTypeIcon type={t.type} />
        <Link to={`/tasks/${t.id}`} className="nm" style={{ color: 'inherit' }}>{en(t.name)}</Link>
        {isFinal && <Badge tone="purple">Final Exam</Badge>}
        {restriction && (
          <Badge tone="amber">
            <Lock size={10} /> Requires {restriction.requires.map((r) => en(db.tasks.find((x) => x.id === r)?.name)).join(restriction.mode === 'any' ? ' or ' : ' and ')}
          </Badge>
        )}
        {t.visibility === 'hidden' && <Badge tone="neutral"><EyeOff size={10} /> Hidden</Badge>}
        {usage.certIds.length > 1 && (
          <span className="muted" style={{ fontSize: 11.5, flexShrink: 0 }} title={`Also used in: ${usage.certIds.filter((c) => c !== cert.id).map((cid) => en(db.certifications.find((x) => x.id === cid)?.name)).join(', ')}`}>
            reused ×{usage.certIds.length}
          </span>
        )}
        <span className="muted" style={{ fontSize: 11.5, flexShrink: 0 }}>{fmtTime(t.timeToComplete)}</span>
        <button className="btn ghost btn-icon sm" title="Access restriction" onClick={() => setRestrictTask(taskId)}><Lock size={12} /></button>
        <button className="btn ghost btn-icon sm" title="Remove from this certification" onClick={() => removeItem(courseId, idx)}><X size={12} /></button>
      </div>
    )
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 16, gap: 16 }}>
        <SwitchRow
          label="Force Order"
          desc="Users must complete every Task in sequence across all Courses. Only the first Task is initially accessible."
          checked={cert.forceOrder}
          onChange={(v) => patch({ forceOrder: v })}
        />
        <div className="spacer" />
        <button className="btn" onClick={addCourse}><FolderPlus size={14} /> Add course</button>
      </div>

      <div className="tree">
        {cert.courses.map((course) => (
          <div className="tree-course" key={course.id}>
            <div className="tree-course-head">
              <BookOpen size={14} style={{ color: 'var(--text-3)' }} />
              <span className="nm">{en(course.name)}</span>
              {course.hidden && <Badge tone="neutral"><EyeOff size={10} /> Hidden</Badge>}
              <span className="muted" style={{ fontSize: 11.5 }}>
                {course.items.reduce((n, i) => n + (i.kind === 'task' ? 1 : i.lesson.taskIds.length), 0)} tasks
              </span>
              <button className="btn sm" onClick={() => setPickerFor(course.id)}><Plus size={12} /> Add task</button>
            </div>
            <div className="tree-items">
              {course.items.length === 0 && <div className="muted" style={{ fontSize: 12.5, padding: '8px 10px' }}>No tasks yet — add reusable Tasks from the library.</div>}
              {course.items.map((item, idx) =>
                item.kind === 'task' ? (
                  taskRow(item.taskId, course.id, idx)
                ) : (
                  <div className="tree-lesson" key={item.lesson.id}>
                    <div className="tree-lesson-head">
                      <GitBranch size={12} />
                      Lesson · {en(item.lesson.name)}
                    </div>
                    {item.lesson.taskIds.map((tid, i2) => taskRow(tid, course.id, idx, true))}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ fontSize: 12, marginTop: 14, maxWidth: 700 }}>
        Courses and Lessons are UI groupings only — they carry no tracking or dependencies. All completion is tracked at
        the Task and Certification level. Tasks are reused in their entirety: edits and completion sync everywhere.
      </p>

      {pickerFor && (
        <TaskPicker
          exclude={[]}
          onPick={(t) => addTaskTo(pickerFor, t.id)}
          onClose={() => setPickerFor(null)}
        />
      )}

      {restrictTask && (
        <RestrictionDrawer
          cert={cert}
          taskId={restrictTask}
          patch={patch}
          onClose={() => setRestrictTask(null)}
        />
      )}
    </div>
  )
}

function TaskPicker({ onPick, onClose, exclude }: { onPick: (t: Task) => void; onClose: () => void; exclude: string[] }) {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const list = db.tasks.filter(
    (t) => !exclude.includes(t.id) && en(t.name).toLowerCase().includes(q.toLowerCase())
  )
  return (
    <Modal title="Add a task from the library" onClose={onClose} wide>
      <SearchInput value={q} onChange={setQ} placeholder="Search all tasks…" />
      <div style={{ marginTop: 12, maxHeight: 380, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        {list.map((t) => {
          const usage = taskUsage(db, t.id)
          return (
            <div
              key={t.id}
              className="tree-task"
              style={{ borderBottom: '1px solid var(--border)', borderRadius: 0, cursor: 'pointer', padding: '9px 12px' }}
              onClick={() => onPick(t)}
            >
              <TaskTypeIcon type={t.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 550, fontSize: 13 }}>{en(t.name)}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>
                  {usage.certIds.length > 0 ? `Used in ${usage.certIds.length} certification${usage.certIds.length > 1 ? 's' : ''}` : 'Not used anywhere yet'}
                  {t.owner !== 'skillcat' && ' · tenant-created'}
                </div>
              </div>
              <button className="btn sm">Add</button>
            </div>
          )
        })}
        {list.length === 0 && <div className="empty"><p>No tasks match.</p></div>}
      </div>
    </Modal>
  )
}

function RestrictionDrawer({
  cert, taskId, patch, onClose,
}: { cert: Certification; taskId: string; patch: (p: Partial<Certification>) => void; onClose: () => void }) {
  const { db, toast } = useStore()
  const task = db.tasks.find((t) => t.id === taskId)!
  const existing = cert.restrictions[taskId]
  const [enabled, setEnabled] = useState(!!existing)
  const [mode, setMode] = useState<'any' | 'all'>(existing?.mode ?? 'any')
  const [requires, setRequires] = useState<string[]>(existing?.requires ?? [])

  const allCertTasks: string[] = []
  cert.courses.forEach((c) => c.items.forEach((i) => (i.kind === 'task' ? allCertTasks.push(i.taskId) : allCertTasks.push(...i.lesson.taskIds))))
  const candidates = allCertTasks.filter((t) => t !== taskId)

  const save = () => {
    const r = { ...cert.restrictions }
    if (enabled && requires.length > 0) r[taskId] = { requires, mode }
    else delete r[taskId]
    patch({ restrictions: r })
    toast(enabled && requires.length ? 'Access restriction saved — task is now non-discoverable' : 'Access restriction removed')
    onClose()
  }

  return (
    <Drawer
      title={<span className="row"><Lock size={14} /> Access restriction</span>}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Save restriction</button>
        </>
      }
    >
      <div style={{ fontSize: 13, marginBottom: 14 }}>
        Restricting <b>{en(task.name)}</b> within <b>{en(cert.name)}</b>. Restrictions are local to this Certification —
        the same Task stays fully accessible elsewhere.
      </div>
      <SwitchRow label="Require other tasks to be completed first" desc="The task stays visible; users see what unlocks it." checked={enabled} onChange={setEnabled} />
      {enabled && (
        <>
          <Field label="The user must complete">
            <Seg
              options={[{ value: 'any', label: 'Any one of' }, { value: 'all', label: 'All of' }]}
              value={mode}
              onChange={setMode}
            />
          </Field>
          <Field label="Required tasks" hint="Only tasks within this Certification can be selected. ID-Upload tasks satisfy the restriction when In-Review or Completed.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {candidates.map((tid) => {
                const t = db.tasks.find((x) => x.id === tid)!
                const on = requires.includes(tid)
                return (
                  <label key={tid} className="row" style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: on ? 'var(--accent-soft)' : '#fff', borderColor: on ? 'var(--accent-border)' : 'var(--border)' }}>
                    <input type="checkbox" checked={on} onChange={(e) => setRequires(e.target.checked ? [...requires, tid] : requires.filter((x) => x !== tid))} />
                    <TaskTypeIcon type={t.type} size={20} />
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{en(t.name)}</span>
                  </label>
                )
              })}
            </div>
          </Field>
          <Callout tone="info">
            Tasks in a restriction chain become <b>non-discoverable</b>: hidden from search, can't be added to Paths
            directly, and deep links redirect to the Certification. This reverses automatically if the restriction is removed.
          </Callout>
        </>
      )}
    </Drawer>
  )
}

/* ================= Details ================= */
function DetailsTab({ cert, patch }: { cert: Certification; patch: (p: Partial<Certification>) => void }) {
  const { db, toast } = useStore()
  const [slug, setSlug] = useState(cert.slug)
  const slugValid = /^[a-zA-Z0-9_-]+$/.test(slug)
  const slugTaken = db.certifications.some((c) => c.id !== cert.id && c.slug.toLowerCase() === slug.toLowerCase())

  return (
    <div className="two-col">
      <div>
        <div className="section-title">Identity</div>
        <LangInput label="Name" required value={cert.name} onChange={(v) => patch({ name: v })} />
        <LangInput label="Description" multiline value={cert.description ?? { en: '' }} onChange={(v) => patch({ description: v })} hint="Rich text. What the certification covers, learning objectives, outcomes." />
        <LangInput
          label="Announcement"
          multiline
          value={cert.announcement ?? { en: '' }}
          onChange={(v) => patch({ announcement: v })}
          hint="Important updates for users currently going through the certification."
        />
        <div className="field-row">
          <Field label="Type" optional>
            <select className="select" value={cert.certType ?? ''} onChange={(e) => patch({ certType: (e.target.value || undefined) as any })}>
              <option value="">—</option>
              <option value="unit">Unit — short and focused</option>
              <option value="credential">Credential — industry-recognised</option>
              <option value="program">Program — multi-week track</option>
              <option value="bundle">Bundle — B2B grouping</option>
            </select>
          </Field>
          <Field label="Career stage" optional>
            <select className="select" value={cert.careerStage ?? ''} onChange={(e) => patch({ careerStage: (e.target.value || undefined) as any })}>
              <option value="">—</option>
              <option value="apprentice">Apprentice</option>
              <option value="journeyman">Journeyman</option>
              <option value="master">Master</option>
            </select>
          </Field>
        </div>
        <div className="field-row">
          <Field label="Time to complete" optional>
            <div className="row">
              <input
                className="input" type="number" style={{ width: 90 }}
                value={cert.timeToComplete?.value ?? ''}
                onChange={(e) => patch({ timeToComplete: { value: +e.target.value, unit: cert.timeToComplete?.unit ?? 'hours' } })}
              />
              <select
                className="select"
                value={cert.timeToComplete?.unit ?? 'hours'}
                onChange={(e) => patch({ timeToComplete: { value: cert.timeToComplete?.value ?? 1, unit: e.target.value as any } })}
              >
                {['minutes', 'hours', 'days', 'weeks', 'months'].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </Field>
          <Field label="CEUs awarded" optional hint="Continuing Education Units on completion.">
            <input className="input" type="number" step="0.1" value={cert.ceu ?? ''} onChange={(e) => patch({ ceu: e.target.value ? +e.target.value : undefined })} />
          </Field>
        </div>
        <Field label="Keywords" optional hint="Comma-separated. Improves search and discovery. Translatable.">
          <input className="input" value={cert.keywords.join(', ')} onChange={(e) => patch({ keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
        </Field>

        <div className="section-title">Deep link</div>
        <Field
          label="Custom URL slug"
          hint={
            slugTaken ? <span style={{ color: 'var(--red)' }}>This slug is already used by another certification.</span> :
            !slugValid ? <span style={{ color: 'var(--red)' }}>Alphanumeric, dashes and underscores only.</span> :
            'Changing the slug breaks previously shared links — there is no redirect history. Reserved keywords (Login, Home, Portfolio…) are blocked.'
          }
        >
          <div className="row">
            <span className="mono muted" style={{ fontSize: 12.5 }}>skillcat.app/</span>
            <input className="input mono" style={{ maxWidth: 260 }} value={slug} onChange={(e) => setSlug(e.target.value)} />
            <button
              className="btn sm"
              disabled={!slugValid || slugTaken || slug === cert.slug}
              onClick={() => { patch({ slug }); toast('Slug updated — old links no longer redirect') }}
            >
              Update slug
            </button>
          </div>
        </Field>

        <div className="section-title">Browse taxonomy</div>
        <Field label="Industries & sub-industries" hint="How users discover this certification when browsing. Independent from the access-scoping Trade filter.">
          <div className="row wrap">
            {db.industries.map((ind) => (
              <React.Fragment key={ind.id}>
                <button
                  className={`filter-chip ${cert.industryIds.includes(ind.id) ? 'on' : ''}`}
                  onClick={() =>
                    patch({ industryIds: cert.industryIds.includes(ind.id) ? cert.industryIds.filter((i) => i !== ind.id) : [...cert.industryIds, ind.id] })
                  }
                >
                  {ind.name}
                </button>
                {ind.subs.map((s) => (
                  <button
                    key={s.id}
                    className={`filter-chip ${cert.subIndustryIds.includes(s.id) ? 'on' : ''}`}
                    onClick={() =>
                      patch({ subIndustryIds: cert.subIndustryIds.includes(s.id) ? cert.subIndustryIds.filter((i) => i !== s.id) : [...cert.subIndustryIds, s.id] })
                    }
                  >
                    {ind.name} › {s.name}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </Field>
      </div>

      <div className="side-card">
        <div className="card pad">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Graphic</div>
          <div className="cert-thumb" style={{ background: cert.graphic, width: '100%', height: 140, fontSize: 44, borderRadius: 10 }}>{cert.emoji}</div>
          <div className="muted" style={{ fontSize: 12, margin: '10px 0' }}>Thumbnail shown in the library — like YouTube or Netflix covers.</div>
          <button className="btn" style={{ width: '100%' }}><UploadCloud size={14} /> Upload image</button>
        </div>
        <div className="card pad" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Translation status</div>
          {[
            ['Name', !!cert.name.es],
            ['Description', !!cert.description?.es],
            ['Announcement', !!cert.announcement?.es],
          ].map(([label, ok]) => (
            <div className="row" key={label as string} style={{ padding: '5px 0', fontSize: 12.5 }}>
              <span style={{ flex: 1 }}>{label}</span>
              {ok ? <Badge tone="green">ES ✓</Badge> : <Badge tone="amber">Falls back to EN</Badge>}
            </div>
          ))}
          <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
            English is required to publish. Missing Spanish never blocks publishing — it only warns.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= Completion ================= */
function CompletionTab({ cert, patch }: { cert: Certification; patch: (p: Partial<Certification>) => void }) {
  const { db, toast } = useStore()
  const [adding, setAdding] = useState<string | null>(null) // condition set id

  const addSet = () => patch({ conditionSets: [...cert.conditionSets, { id: `cs-${uid()}`, items: [] }] })
  const removeSet = (csId: string) => patch({ conditionSets: cert.conditionSets.filter((c) => c.id !== csId) })
  const removeItem = (csId: string, idx: number) =>
    patch({ conditionSets: cert.conditionSets.map((c) => (c.id === csId ? { ...c, items: c.items.filter((_, i) => i !== idx) } : c)) })

  const addItem = (csId: string, item: ConditionSet['items'][number]) => {
    patch({ conditionSets: cert.conditionSets.map((c) => (c.id === csId ? { ...c, items: [...c.items, item] } : c)) })
    setAdding(null)
  }

  const kindIcon = (k: string) =>
    k === 'task' ? <Badge tone="blue">Task</Badge> : k === 'quiz-section' ? <Badge tone="purple">Quiz Section</Badge> : <Badge tone="teal">Certification</Badge>

  return (
    <div style={{ maxWidth: 760 }}>
      <Callout tone="warn">
        <b>Editing completion criteria recalculates completion for every user.</b> Users who no longer meet the new
        criteria revert to incomplete. Already-issued Awards are never revoked, and retroactive completions do not fire
        Rudderstack events.
      </Callout>

      <div className="section-desc" style={{ marginTop: 16 }}>
        The certification completes when <b>any one Condition Set</b> is fully satisfied (OR across sets). Within a set,
        <b> every item</b> must be completed (AND). Quiz Tasks referenced here are treated as the Final Exam — locked for
        Free Trial and Starter users.
      </div>

      {cert.conditionSets.map((cs, i) => (
        <React.Fragment key={cs.id}>
          {i > 0 && <div className="or-pill">OR</div>}
          <div className="condset">
            <div className="condset-head">
              Condition Set {i + 1}
              <span className="muted" style={{ fontWeight: 450 }}>· all items required</span>
              <div className="spacer" />
              <button className="btn ghost sm" onClick={() => setAdding(cs.id)}><Plus size={12} /> Add item</button>
              <button className="btn ghost btn-icon sm" onClick={() => removeSet(cs.id)}><Trash2 size={12} /></button>
            </div>
            <div className="condset-body">
              {cs.items.length === 0 && <div className="muted" style={{ fontSize: 12.5, padding: '6px 0' }}>Empty — add Tasks, Quiz Sections, or other Certifications.</div>}
              {cs.items.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <div className="cond-and">AND</div>}
                  <div className="cond-item">
                    {kindIcon(item.kind)}
                    <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
                    <button className="btn ghost btn-icon sm" onClick={() => removeItem(cs.id, idx)}><X size={12} /></button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </React.Fragment>
      ))}

      <button className="btn" style={{ marginTop: 14 }} onClick={addSet}><Plus size={14} /> Add condition set</button>

      <div className="section-title" style={{ marginTop: 30 }}>Manual completion</div>
      <div className="card pad" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, fontSize: 12.5, color: 'var(--text-2)' }}>
          Admins can mark this certification complete for a specific user regardless of criteria — e.g. issuing EPA
          Universal to a user who earned Types 1–2 elsewhere. Done from the user's profile page.
        </div>
        <Link className="btn" to="/users">Open users <ArrowRight size={13} /></Link>
      </div>

      {adding && (
        <ConditionItemPicker
          cert={cert}
          onPick={(item) => { addItem(adding, item); toast('Condition added') }}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
  )
}

function ConditionItemPicker({
  cert, onPick, onClose,
}: { cert: Certification; onPick: (i: ConditionSet['items'][number]) => void; onClose: () => void }) {
  const { db } = useStore()
  const [kind, setKind] = useState<'task' | 'quiz-section' | 'certification'>('task')
  const [q, setQ] = useState('')

  const certTaskIds: string[] = []
  cert.courses.forEach((c) => c.items.forEach((i) => (i.kind === 'task' ? certTaskIds.push(i.taskId) : certTaskIds.push(...i.lesson.taskIds))))

  const options: { refId: string; label: string }[] =
    kind === 'task'
      ? db.tasks.filter((t) => certTaskIds.includes(t.id)).map((t) => ({ refId: t.id, label: `${en(t.name)} — Completed` }))
      : kind === 'quiz-section'
        ? db.tasks
            .filter((t) => t.quiz && t.quiz.sections.length > 0)
            .flatMap((t) => t.quiz!.sections.map((s) => ({ refId: `${t.id}:${s.id}`, label: `${en(t.name)} — “${en(s.name)}” Section completed` })))
        : db.certifications.filter((c) => c.id !== cert.id).map((c) => ({ refId: c.id, label: `${en(c.name)} — Completed` }))

  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))

  return (
    <Modal title="Add completion condition" onClose={onClose} wide>
      <div className="row" style={{ marginBottom: 12 }}>
        <Seg
          options={[
            { value: 'task', label: 'Task' },
            { value: 'quiz-section', label: 'Quiz Section' },
            { value: 'certification', label: 'Certification' },
          ]}
          value={kind}
          onChange={(v) => setKind(v)}
        />
        <div className="spacer" />
        <div style={{ width: 220 }}><SearchInput value={q} onChange={setQ} /></div>
      </div>
      {kind === 'task' && <div className="field-hint" style={{ marginBottom: 10 }}>Showing Tasks within this certification. Referencing outside Tasks is possible via the database but discouraged.</div>}
      {kind === 'quiz-section' && <div className="field-hint" style={{ marginBottom: 10 }}>Intended for EPA-style requirements — e.g. completing the “Type 1” Section of the Universal Quiz.</div>}
      <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        {filtered.map((o) => (
          <div key={o.refId} className="tree-task" style={{ borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '9px 12px', cursor: 'pointer' }} onClick={() => onPick({ kind, refId: o.refId, label: o.label })}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{o.label}</span>
            <button className="btn sm">Add</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty"><p>Nothing matches.</p></div>}
      </div>
    </Modal>
  )
}

/* ================= Access & Pricing ================= */
function AccessTab({ cert, patch }: { cert: Certification; patch: (p: Partial<Certification>) => void }) {
  const { db } = useStore()
  const ALL_TRADES = ['Residential HVAC', 'Commercial HVAC', 'Plumbing', 'Electrical', 'Appliance Repair']
  const ALL_PARTNERSHIPS = ['Nexstar', 'EGIA']
  const pw = cert.paywall

  const b2cVisible = cert.trades.length === 0 && cert.partnerships.length === 0 && cert.userType === 'all'

  return (
    <div className="two-col">
      <div>
        <div className="section-title">Visibility filters</div>
        <div className="section-desc">
          Computed at query time against each Tenant's profile — no manual assignment. Across filters: AND. Within a
          filter: OR. Unset filters match everyone.
        </div>
        <Field label="Trade" hint="Tagging any Trade removes this content from B2C (B2C tenants have no Trade).">
          <div className="row wrap">
            {ALL_TRADES.map((t) => (
              <button key={t} className={`filter-chip ${cert.trades.includes(t) ? 'on' : ''}`}
                onClick={() => patch({ trades: cert.trades.includes(t) ? cert.trades.filter((x) => x !== t) : [...cert.trades, t] })}>
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Partnership" hint="Only tenants holding the partnership see this content.">
          <div className="row wrap">
            {ALL_PARTNERSHIPS.map((p) => (
              <button key={p} className={`filter-chip ${cert.partnerships.includes(p) ? 'on' : ''}`}
                onClick={() => patch({ partnerships: cert.partnerships.includes(p) ? cert.partnerships.filter((x) => x !== p) : [...cert.partnerships, p] })}>
                {p}
              </button>
            ))}
          </div>
        </Field>
        <Field label="User type">
          <Seg
            options={[{ value: 'all', label: 'All users' }, { value: 'b2b', label: 'B2B only' }]}
            value={cert.userType}
            onChange={(v) => patch({ userType: v })}
          />
        </Field>

        <div className="section-title" style={{ marginTop: 26 }}>Paywall</div>
        <Field label="Pricing model">
          <Seg
            options={[
              { value: 'free', label: 'Free' },
              { value: 'non-consumable', label: 'Non-consumable' },
              { value: 'consumable', label: 'Consumable' },
            ]}
            value={pw.kind}
            onChange={(v) => {
              if (v === 'free') patch({ paywall: { kind: 'free' } })
              if (v === 'non-consumable') patch({ paywall: { kind: 'non-consumable', priceStripe: 99, priceApple: 109, priceGoogle: 109 } })
              if (v === 'consumable') patch({ paywall: { kind: 'consumable', priceStripe: 89, priceApple: 99, priceGoogle: 99, triggers: ['manual'], progressOnConsumption: 'preserve' } })
            }}
          />
        </Field>
        {pw.kind === 'free' && (
          <div className="field-hint">
            Free for any user who can see it. How much they can access depends on their Access State — Starter users get
            the first {db.settings.initialTasksCount} tasks with Final Exams locked.
          </div>
        )}
        {pw.kind !== 'free' && (
          <>
            <div className="field-row-3">
              <Field label="Stripe (Web)"><div className="row"><span className="muted">$</span><input className="input" type="number" value={pw.priceStripe} onChange={(e) => patch({ paywall: { ...pw, priceStripe: +e.target.value } })} /></div></Field>
              <Field label="Apple App Store"><div className="row"><span className="muted">$</span><input className="input" type="number" value={pw.priceApple} onChange={(e) => patch({ paywall: { ...pw, priceApple: +e.target.value } })} /></div></Field>
              <Field label="Google Play"><div className="row"><span className="muted">$</span><input className="input" type="number" value={pw.priceGoogle} onChange={(e) => patch({ paywall: { ...pw, priceGoogle: +e.target.value } })} /></div></Field>
            </div>
            <div className="field-hint" style={{ marginTop: -6, marginBottom: 14 }}>
              Per-platform prices compensate for store fees on third-party content. Same price for B2C and B2B.
              Purchases create permanent entitlements that survive Access State changes; refunds revoke them.
            </div>
          </>
        )}
        {pw.kind === 'consumable' && (
          <>
            <Field label="Consumption triggers" hint="The certification is consumed when any trigger fires; the user repurchases at the same price.">
              {[
                { id: 'manual', label: 'Manual revocation by a SkillCat Admin (audit-logged)' },
                { id: 'xapi-statement', label: 'Consumption xAPI statement from content (e.g. ClickSafety)' },
              ].map((t) => (
                <label key={t.id} className="row" style={{ padding: '6px 0', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={pw.triggers.includes(t.id as any)}
                    onChange={(e) =>
                      patch({ paywall: { ...pw, triggers: e.target.checked ? [...pw.triggers, t.id as any] : pw.triggers.filter((x) => x !== t.id) } })
                    }
                  />
                  {t.label}
                </label>
              ))}
            </Field>
            <Field label="Progress on consumption">
              <Seg
                options={[{ value: 'preserve', label: 'Preserve progress' }, { value: 'reset', label: 'Reset progress' }]}
                value={pw.progressOnConsumption}
                onChange={(v) => patch({ paywall: { ...pw, progressOnConsumption: v } })}
              />
            </Field>
          </>
        )}

        <div className="section-title" style={{ marginTop: 26 }}>Non-discoverable tasks</div>
        <div className="card pad" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
          {cert.paywall.kind !== 'free' ? (
            <span><ShieldAlert size={13} style={{ verticalAlign: -2, color: 'var(--amber)' }} /> This certification is paid — every task inside it is automatically <b>non-discoverable</b> so paid content can't be reached outside the paywall.</span>
          ) : Object.keys(cert.restrictions).length > 0 ? (
            <span>{Object.keys(cert.restrictions).length} task(s) are in access-restriction chains and therefore non-discoverable. All other tasks follow Version 1 defaults (not independently discoverable).</span>
          ) : (
            <span>No restriction chains or paywall here — tasks follow the Version 1 default (not independently discoverable).</span>
          )}
        </div>
      </div>

      <div className="side-card">
        <div className="card pad">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Who sees this?</div>
          <div className="stack" style={{ gap: 8, fontSize: 12.5 }}>
            <div className="row">
              <Badge tone={b2cVisible && cert.visibility === 'visible' ? 'green' : 'neutral'}>B2C</Badge>
              <span className="muted-2">{b2cVisible ? 'Visible to self-learners' : cert.userType === 'b2b' ? 'Hidden — B2B only' : 'Hidden — trade/partnership scoped'}</span>
            </div>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <Badge tone="blue">B2B</Badge>
              <span className="muted-2">
                {cert.owner !== 'skillcat'
                  ? `Only ${db.tenants.find((t) => t.id === cert.owner)?.name}`
                  : cert.trades.length === 0 && cert.partnerships.length === 0
                    ? 'All companies'
                    : `Companies matching: ${[...cert.trades, ...cert.partnerships].join(' + ')}`}
              </span>
            </div>
          </div>
          <hr className="divider" />
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Matching tenants today:{' '}
            <b style={{ color: 'var(--text)' }}>
              {cert.owner !== 'skillcat'
                ? 1
                : db.tenants.filter(
                    (t) =>
                      (cert.trades.length === 0 || cert.trades.some((tr) => t.trades.includes(tr))) &&
                      (cert.partnerships.length === 0 || cert.partnerships.some((p) => t.partnerships.includes(p)))
                  ).length}
            </b>{' '}
            of {db.tenants.length} companies
            {b2cVisible && cert.owner === 'skillcat' ? ' + all B2C users' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= Content links ================= */
function LinksTab({ cert }: { cert: Certification }) {
  const { db, update, toast } = useStore()
  const [editing, setEditing] = useState<ContentLink | 'new' | null>(null)

  const links = db.contentLinks.filter((l) => l.sourceId === cert.id)
  const byType = (t: LinkType) => links.filter((l) => l.type === t).sort((a, b) => b.strength - a.strength)

  const TYPES: { type: LinkType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'prerequisite', label: 'Prerequisites', icon: <ArrowLeftRight size={14} style={{ transform: 'rotate(90deg)' }} />, desc: 'Advised before starting. Completed ones show a “Completed” indicator.' },
    { type: 'recommended-next', label: 'Recommended Next', icon: <ArrowRight size={14} />, desc: 'Vertical progression after completion. Hidden once completed.' },
    { type: 'related', label: 'Related', icon: <ArrowLeftRight size={14} />, desc: 'Two-way horizontal discovery. The reverse link is managed automatically.' },
  ]

  const remove = (l: ContentLink) => {
    update((d) => ({ ...d, contentLinks: d.contentLinks.filter((x) => x.id !== l.id) }))
    toast(l.type === 'related' ? 'Link deleted — reverse Related link removed too' : 'Content link deleted')
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="row" style={{ marginBottom: 16 }}>
        <div className="section-desc" style={{ margin: 0 }}>
          Advisory connections only — they never block access. Strength (0–100) ranks display order within each type.
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={() => setEditing('new')}><Plus size={14} /> Add link</button>
      </div>

      {TYPES.map(({ type, label, icon, desc }) => (
        <div key={type} style={{ marginBottom: 22 }}>
          <div className="section-title" style={{ margin: '0 0 4px', fontSize: 13.5 }}>{icon} {label} <span className="muted" style={{ fontWeight: 450, fontSize: 12 }}>· {byType(type).length}</span></div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{desc}</div>
          <div className="card">
            {byType(type).length === 0 && <div className="muted" style={{ padding: '12px 16px', fontSize: 12.5 }}>None yet.</div>}
            {byType(type).map((l) => {
              const target = db.certifications.find((c) => c.id === l.targetId)
              return (
                <div key={l.id} className="row" style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <span className="cert-thumb" style={{ background: target?.graphic }}>{target?.emoji}</span>
                  <Link to={`/certifications/${l.targetId}`} style={{ fontWeight: 550, fontSize: 13, flex: 1 }}>{en(target?.name)}</Link>
                  {target?.visibility === 'archived' && <Badge tone="amber">Archived</Badge>}
                  <div className="row" style={{ width: 170 }}>
                    <div className="prog" style={{ flex: 1 }}><div style={{ width: `${l.strength}%` }} /></div>
                    <span className="mono muted" style={{ fontSize: 11, width: 26, textAlign: 'right' }}>{l.strength}</span>
                  </div>
                  <button className="btn ghost sm" onClick={() => setEditing(l)}>Edit</button>
                  <button className="btn ghost btn-icon sm" onClick={() => remove(l)}><Trash2 size={12} /></button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {editing && (
        <LinkEditor
          cert={cert}
          link={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function LinkEditor({ cert, link, onClose }: { cert: Certification; link: ContentLink | null; onClose: () => void }) {
  const { db, update, toast } = useStore()
  const [type, setType] = useState<LinkType>(link?.type ?? 'recommended-next')
  const [target, setTarget] = useState(link?.targetId ?? '')
  const [strength, setStrength] = useState(link?.strength ?? 50)

  const save = () => {
    if (!target) return
    if (link) {
      update((d) => ({ ...d, contentLinks: d.contentLinks.map((l) => (l.id === link.id ? { ...l, type, targetId: target, strength } : l)) }))
      toast(type === 'related' ? 'Link updated — reverse link strength synced' : 'Content link updated')
    } else {
      update((d) => ({ ...d, contentLinks: [...d.contentLinks, { id: `cl-${uid()}`, sourceId: cert.id, targetId: target, type, strength }] }))
      toast(type === 'related' ? 'Related link created in both directions' : 'Content link created')
    }
    onClose()
  }

  return (
    <Modal
      title={link ? 'Edit content link' : 'Add content link'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!target} onClick={save}>{link ? 'Save changes' : 'Create link'}</button>
        </>
      }
    >
      <Field label="Link type">
        <Seg
          options={[
            { value: 'prerequisite', label: 'Prerequisite' },
            { value: 'recommended-next', label: 'Recommended Next' },
            { value: 'related', label: 'Related' },
          ]}
          value={type}
          onChange={setType}
        />
      </Field>
      <Field label="Target certification" required>
        <select className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Select…</option>
          {db.certifications.filter((c) => c.id !== cert.id && c.owner === 'skillcat').map((c) => (
            <option key={c.id} value={c.id}>{en(c.name)}{c.visibility === 'archived' ? ' (archived)' : ''}</option>
          ))}
        </select>
      </Field>
      <Field label={`Link strength — ${strength}`} hint="Higher strength appears first in the UI. Independent per link.">
        <input type="range" min={1} max={100} value={strength} onChange={(e) => setStrength(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
      </Field>
      {type === 'related' && <Callout tone="info">Related is two-way: the reverse link is created automatically with the same strength, and edits/deletes stay in sync.</Callout>}
    </Modal>
  )
}

/* ================= Lifecycle ================= */
function LifecycleTab({
  cert, patch, award, fbForm, confirm,
}: {
  cert: Certification
  patch: (p: Partial<Certification>) => void
  award?: { id: string; tier: string; issued: number }
  fbForm?: { id: string; name: string }
  confirm: (o: any) => void
}) {
  const { db, update, toast } = useStore()
  const [archiving, setArchiving] = useState(false)
  const [replacements, setReplacements] = useState<string[]>(cert.replacementIds)
  const [alert, setAlert] = useState(cert.replacementAlert ?? { en: '' })

  const doArchive = () => {
    patch({ visibility: 'archived', replacementIds: replacements, replacementAlert: alert })
    setArchiving(false)
    toast('Archived — removed from discovery surfaces, kept on personal surfaces')
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="section-title">Connected systems</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card pad">
          <div className="row" style={{ marginBottom: 8 }}>
            <Medal size={15} style={{ color: 'var(--amber)' }} />
            <b style={{ fontSize: 13 }}>Award</b>
          </div>
          {award ? (
            <div style={{ fontSize: 12.5 }}>
              <Badge tone={`tier-${award.tier}`}>{award.tier[0].toUpperCase() + award.tier.slice(1)}</Badge>
              <span className="muted"> · {fmtNum(award.issued)} issued</span>
              <div style={{ marginTop: 10 }}><Link className="btn sm" to="/awards">Manage award</Link></div>
            </div>
          ) : (
            <div style={{ fontSize: 12.5 }} className="muted">
              No award linked. Completion won't issue anything.
              <div style={{ marginTop: 10 }}><Link className="btn sm" to="/awards">Create one</Link></div>
            </div>
          )}
        </div>
        <div className="card pad">
          <div className="row" style={{ marginBottom: 8 }}>
            <MessageSquareText size={15} style={{ color: 'var(--blue)' }} />
            <b style={{ fontSize: 13 }}>Feedback form</b>
          </div>
          {fbForm ? (
            <div style={{ fontSize: 12.5 }}>
              {fbForm.name}
              <div style={{ marginTop: 10 }}><Link className="btn sm" to={`/feedback-forms/${fbForm.id}`}>Open form</Link></div>
            </div>
          ) : (
            <div style={{ fontSize: 12.5 }} className="muted">
              No form fires on completion.
              <div style={{ marginTop: 10 }}><Link className="btn sm" to="/feedback-forms">Map a form</Link></div>
            </div>
          )}
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 28 }}>Backup & restore</div>
      <div className="card pad row">
        <div style={{ flex: 1, fontSize: 12.5, color: 'var(--text-2)' }}>
          Move this certification between environments (Planning → Dev → Staging → Production). Choose whether user data
          is included, like Moodle backups.
        </div>
        <button className="btn" onClick={() => toast('Backup created: epa-608-universal-2026-06-10.scbak')}><DownloadCloud size={14} /> Create backup</button>
        <button className="btn"><UploadCloud size={14} /> Restore</button>
      </div>

      <div className="section-title" style={{ marginTop: 28 }}>Archive</div>
      {cert.visibility === 'archived' ? (
        <div className="card pad">
          <div className="row"><Badge tone="amber" dot>Archived</Badge>
            <span className="muted" style={{ fontSize: 12.5 }}>Hidden from discovery; users midway or completed still see it on personal surfaces.</span>
          </div>
          {cert.replacementIds.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12.5 }}>
              Replacements:{' '}
              {cert.replacementIds.map((r) => (
                <Link key={r} to={`/certifications/${r}`} style={{ color: 'var(--accent)', fontWeight: 550 }}>
                  {en(db.certifications.find((c) => c.id === r)?.name)}{' '}
                </Link>
              ))}
              <div className="muted" style={{ marginTop: 6 }}>
                Content Links to these replacements are suppressed for users who completed this version. Remember the
                manual steps: announcements, award on the new cert, industry tags, completion dependencies, skills.
              </div>
            </div>
          )}
          <button className="btn" style={{ marginTop: 12 }} onClick={() => { patch({ visibility: 'visible' }); toast('Certification restored to visible') }}>
            <Eye size={14} /> Unarchive
          </button>
        </div>
      ) : !archiving ? (
        <div className="card pad row">
          <div style={{ flex: 1, fontSize: 12.5, color: 'var(--text-2)' }}>
            Retire this certification. New users can't find it; users who completed it or are midway keep access. B2B
            managers with assignments are notified and choose per employee whether to switch.
          </div>
          <button className="btn" onClick={() => setArchiving(true)}><Archive size={14} /> Archive…</button>
        </div>
      ) : (
        <div className="card pad">
          <Field label="Replacement certifications" optional hint="List replacements only when they cover the same material — completed users then stop seeing them in Content Links. One-to-many is supported.">
            <div className="row wrap">
              {db.certifications.filter((c) => c.id !== cert.id && c.visibility === 'visible' && c.owner === 'skillcat').map((c) => (
                <button key={c.id} className={`filter-chip ${replacements.includes(c.id) ? 'on' : ''}`}
                  onClick={() => setReplacements(replacements.includes(c.id) ? replacements.filter((x) => x !== c.id) : [...replacements, c.id])}>
                  {c.emoji} {en(c.name)}
                </button>
              ))}
            </div>
          </Field>
          <LangInput label="Replacement alert" multiline value={alert} onChange={setAlert} hint="Shown to users midway through, directing them to the replacements. Active only while archived." />
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setArchiving(false)}>Cancel</button>
            <button className="btn primary" onClick={doArchive}><Archive size={14} /> Archive certification</button>
          </div>
        </div>
      )}

      <div className="section-title" style={{ marginTop: 28, color: 'var(--red)' }}>Danger zone</div>
      <div className="card pad row" style={{ borderColor: '#f3cbcb' }}>
        <div style={{ flex: 1, fontSize: 12.5, color: 'var(--text-2)' }}>
          Deleting silently removes this certification from every user's Path. Tasks inside it and all user progress on
          them survive — tasks are independent entities. <b>This cannot be undone.</b>
        </div>
        <button
          className="btn danger"
          onClick={() =>
            confirm({
              title: 'Delete certification?',
              danger: true,
              confirmLabel: 'Delete permanently',
              body: (
                <>
                  <p style={{ marginBottom: 10 }}>
                    <b>{en(cert.name)}</b> will be permanently deleted and silently removed from {fmtNum(cert.enrolled)}{' '}
                    user paths. Content Links to and from it are removed. Tasks and user progress are preserved.
                  </p>
                  <p className="muted">To remove it temporarily, use Hidden instead — hiding is reversible.</p>
                </>
              ),
              onConfirm: () => {
                update((d) => ({
                  ...d,
                  certifications: d.certifications.filter((c) => c.id !== cert.id),
                  contentLinks: d.contentLinks.filter((l) => l.sourceId !== cert.id && l.targetId !== cert.id),
                }))
                toast('Certification deleted')
                history.back()
              },
            })
          }
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  )
}
