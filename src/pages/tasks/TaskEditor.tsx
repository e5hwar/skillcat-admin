import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Save, UploadCloud, Plus, Trash2, X, Lock, Users, GraduationCap, Clock, AlertTriangle,
  FileText, ExternalLink, Link2, Timer, DollarSign, Mail, ShieldCheck, ListChecks,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import {
  PageHead, Badge, StatusBadge, Tabs, LangInput, Field, Seg, SwitchRow, Callout,
  TaskTypeBadge, TaskTypeIcon, Modal, SearchInput,
} from '../../components/ui'
import { en, taskUsage, completionLabel, uid, fmtNum, questionCount } from '../../lib/utils'
import type { Task, QuizConfig, QuizSection, CompletionCriteria } from '../../lib/types'

export default function TaskEditor() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const task = db.tasks.find((t) => t.id === id)
  const [tab, setTab] = useState('settings')

  if (!task) return <div className="page"><PageHead title="Task not found" /></div>

  const patch = (p: Partial<Task>) =>
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, ...p } : t)) }))

  const usage = taskUsage(db, task.id)

  const tabs = [
    { id: 'settings', label: 'Settings' },
    ...(task.type === 'quiz' ? [
      { id: 'composition', label: 'Questions & Sections' },
      { id: 'attempts', label: 'Attempts & Timing' },
      { id: 'grading', label: 'Grading & Review' },
      { id: 'payments', label: 'Paywall & NATE' },
    ] : []),
    ...(task.type === 'hands-on' ? [{ id: 'handson', label: 'Submission & Review' }] : []),
    { id: 'users', label: 'User Management' },
  ]

  return (
    <div className="page wide">
      <PageHead
        crumbs={[{ label: 'Tasks', to: '/tasks' }, { label: en(task.name) }]}
        title={<><TaskTypeIcon type={task.type} size={32} /> {en(task.name)}</>}
        badge={
          <span className="row" style={{ gap: 6 }}>
            <TaskTypeBadge type={task.type} />
            <StatusBadge status={task.visibility} />
            {task.quiz?.proctored && <Badge tone="red">Proctored</Badge>}
            {task.quiz?.nate && <Badge tone="purple">NATE Exam</Badge>}
          </span>
        }
        sub={
          usage.certIds.length > 0 ? (
            <span>
              Used in{' '}
              {usage.certIds.map((cid, i) => (
                <React.Fragment key={cid}>
                  {i > 0 && ', '}
                  <Link to={`/certifications/${cid}`} style={{ color: 'var(--accent)', fontWeight: 550 }}>
                    {en(db.certifications.find((c) => c.id === cid)?.name)}
                  </Link>
                </React.Fragment>
              ))}
              {usage.pathCount > 0 && ` and ${usage.pathCount} user path${usage.pathCount > 1 ? 's' : ''}`}
              . Edits here update every instance.
            </span>
          ) : (
            'Not used in any certification yet.'
          )
        }
        actions={
          <>
            <select className="select" style={{ width: 120 }} value={task.visibility} onChange={(e) => { patch({ visibility: e.target.value as any }); toast(e.target.value === 'hidden' ? 'Hidden from every certification and path' : 'Task is visible again') }}>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
            <button className="btn primary" onClick={() => toast(usage.certIds.length > 1 ? `Saved — change reflected in ${usage.certIds.length} certifications` : 'All changes saved')}><Save size={14} /> Save</button>
          </>
        }
      />

      {usage.certIds.length > 1 && tab === 'settings' && (
        <Callout tone="info">
          This task is reused in <b>{usage.certIds.length} certifications</b>. Content, settings, and per-user completion
          stay identical everywhere it appears.
        </Callout>
      )}

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {tab === 'settings' && <SettingsTab task={task} patch={patch} />}
      {tab === 'composition' && task.quiz && <CompositionTab task={task} patch={patch} />}
      {tab === 'attempts' && task.quiz && <AttemptsTab task={task} patch={patch} />}
      {tab === 'grading' && task.quiz && <GradingTab task={task} patch={patch} />}
      {tab === 'payments' && task.quiz && <PaymentsTab task={task} patch={patch} />}
      {tab === 'handson' && task.handsOn && <HandsOnTab task={task} patch={patch} />}
      {tab === 'users' && <UserMgmtTab task={task} />}
    </div>
  )
}

/* ---------------- Settings (common + simple types) ---------------- */
function SettingsTab({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const { toast } = useStore()
  const completionOptions: { value: CompletionCriteria; types: string[] }[] = [
    { value: 'none', types: ['xapi', 'quiz', 'hands-on', 'id-upload', 'url', 'file', 'deeplink'] },
    { value: 'on-view', types: ['xapi', 'url', 'file', 'deeplink'] },
    { value: 'manual-by-user', types: ['xapi', 'url', 'file', 'deeplink'] },
    { value: 'xapi-statement', types: ['xapi'] },
    { value: 'passing-grade', types: ['quiz'] },
    { value: 'submission-made', types: ['hands-on'] },
    { value: 'reviewer-grade', types: ['hands-on'] },
    { value: 'admin-approved', types: ['id-upload'] },
  ]
  const opts = completionOptions.filter((o) => o.types.includes(task.type))

  return (
    <div className="two-col">
      <div>
        <div className="section-title">Metadata</div>
        <LangInput label="Name" required value={task.name} onChange={(v) => patch({ name: v })} />
        <LangInput label="Description" multiline value={task.description ?? { en: '' }} onChange={(v) => patch({ description: v })} />
        <div className="field-row">
          <Field label="Time to complete" hint="Shown to users. Supports minutes through months — OSHA needs hours, some hands-on tasks need weeks.">
            <div className="row">
              <input className="input" type="number" style={{ width: 90 }} value={task.timeToComplete?.value ?? ''} onChange={(e) => patch({ timeToComplete: { value: +e.target.value, unit: task.timeToComplete?.unit ?? 'minutes' } })} />
              <select className="select" value={task.timeToComplete?.unit ?? 'minutes'} onChange={(e) => patch({ timeToComplete: { value: task.timeToComplete?.value ?? 1, unit: e.target.value as any } })}>
                {['minutes', 'hours', 'days', 'weeks', 'months'].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Completion criteria" hint="Changing this resets and recalculates completion for all users. Retroactive completions don't fire events.">
            <select
              className="select"
              value={task.completion}
              onChange={(e) => { patch({ completion: e.target.value as CompletionCriteria }); toast('Completion will be recalculated for all users from existing data', 'error') }}
            >
              {opts.map((o) => <option key={o.value} value={o.value}>{completionLabel[o.value]}</option>)}
            </select>
          </Field>
        </div>

        {task.type === 'hands-on' && (
          <SwitchRow
            label="Discoverable to B2B companies"
            desc="Lets companies find this task on the Training Dashboard and assign it to employee Paths or Custom Certifications. Never shown to B2C. Overridden if the task joins a restriction chain or a paid certification."
            checked={!!task.discoverable}
            onChange={(v) => patch({ discoverable: v })}
          />
        )}

        {/* --- type specific --- */}
        {task.type === 'xapi' && task.xapi && <XapiSettings task={task} patch={patch} />}
        {task.type === 'url' && task.url && <UrlSettings task={task} patch={patch} />}
        {task.type === 'file' && task.file && <FileSettings task={task} patch={patch} />}
        {task.type === 'deeplink' && task.deeplink && (
          <>
            <div className="section-title">Deep link</div>
            <Field label="URL" required hint="Must be one of the platform's supported deep links (certification slugs or reserved app pages like /reupload-id).">
              <input className="input mono" value={task.deeplink.url} onChange={(e) => patch({ deeplink: { url: e.target.value } })} />
            </Field>
          </>
        )}
        {task.type === 'id-upload' && (
          <>
            <div className="section-title">ID Upload behaviour</div>
            <div className="card pad" style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              <b style={{ color: 'var(--text)' }}>One ID per user, platform-wide.</b> A new upload replaces the previous
              one. Submitting moves the task to <Badge tone="amber">In-Review</Badge> — which already satisfies access
              restrictions, so users can attempt gated quizzes before approval. Approval by the Proctoring Team marks it{' '}
              <Badge tone="green">Completed</Badge> everywhere it's reused. Users can't replace an approved ID themselves;
              Support uploads on their behalf. Manage individual IDs from a user's profile or the Proctoring Dashboard.
            </div>
          </>
        )}
      </div>

      <SideUsage task={task} />
    </div>
  )
}

function XapiSettings({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const x = task.xapi!
  const set = (p: Partial<typeof x>) => patch({ xapi: { ...x, ...p } })
  return (
    <>
      <div className="section-title">xAPI packages</div>
      {x.thirdParty && (
        <Callout tone="info">
          Third-party content from <b>{x.thirdParty}</b>, converted from SCORM via SCORM Cloud. Statements are forwarded
          to SkillCat's LRS; completion statements mark the task complete.
        </Callout>
      )}
      <div className="field-row">
        <Field label="English package" required>
          <div className="row">
            <input className="input mono" readOnly value={x.packageEn ?? ''} placeholder="No package uploaded" />
            <button className="btn"><UploadCloud size={14} /></button>
          </div>
        </Field>
        <Field label="Spanish package" optional hint={!x.packageEs ? 'Spanish users will see the English package.' : undefined}>
          <div className="row">
            <input className="input mono" readOnly value={x.packageEs ?? ''} placeholder="No package uploaded" />
            <button className="btn"><UploadCloud size={14} /></button>
          </div>
        </Field>
      </div>
      <SwitchRow
        label="Score capture"
        desc="Read scores from result-bearing statements and record them per user (e.g. OSHA 10 from ClickSafety). Informational in V1 — doesn't gate completion."
        checked={x.scoreCapture}
        onChange={(v) => set({ scoreCapture: v })}
      />
      <div className="section-title">Launch behaviour (mobile)</div>
      <SwitchRow label="Allow rotation" desc="When off, the content is locked to the orientation below. iPads, tablets and web always adapt responsively." checked={x.allowRotation} onChange={(v) => set({ allowRotation: v })} />
      {!x.allowRotation && (
        <Field label="Locked orientation">
          <Seg options={[{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} value={x.lockedOrientation} onChange={(v) => set({ lockedOrientation: v })} />
        </Field>
      )}
    </>
  )
}

function UrlSettings({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const u = task.url!
  const set = (p: Partial<typeof u>) => patch({ url: { ...u, ...p } })
  return (
    <>
      <div className="section-title">URL settings</div>
      <Field label="URL" required>
        <input className="input mono" value={u.url} onChange={(e) => set({ url: e.target.value })} />
      </Field>
      <Field label="Open in" hint="On web, In-App opens in an iframe; External opens a new tab.">
        <Seg options={[{ value: 'external', label: 'External browser' }, { value: 'in-app', label: 'In-app browser' }]} value={u.openIn} onChange={(v) => set({ openIn: v })} />
      </Field>
      {u.openIn === 'in-app' && (
        <>
          <SwitchRow label="Allow rotation (mobile)" checked={u.allowRotation} onChange={(v) => set({ allowRotation: v })} />
          {!u.allowRotation && (
            <Field label="Locked orientation">
              <Seg options={[{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} value={u.lockedOrientation} onChange={(v) => set({ lockedOrientation: v })} />
            </Field>
          )}
        </>
      )}
    </>
  )
}

function FileSettings({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const f = task.file!
  const set = (p: Partial<typeof f>) => patch({ file: { ...f, ...p } })
  return (
    <>
      <div className="section-title">File</div>
      <Field label="File" required>
        <div className="row">
          <FileText size={15} style={{ color: 'var(--text-3)' }} />
          <input className="input mono" readOnly value={f.fileName ? `${f.fileName} (${f.sizeMb} MB)` : ''} placeholder="No file uploaded" />
          <button className="btn"><UploadCloud size={14} /> Replace</button>
        </div>
      </Field>
      <Field label="Open in" hint="If a file type only supports one option (e.g. ZIP → external), only that option is offered.">
        <Seg options={[{ value: 'external', label: 'External application' }, { value: 'in-app', label: 'In-app viewer' }]} value={f.openIn} onChange={(v) => set({ openIn: v })} />
      </Field>
    </>
  )
}

function SideUsage({ task }: { task: Task }) {
  const { db } = useStore()
  const usage = taskUsage(db, task.id)
  const restricted = isRestrictedAnywhere(db, task.id)
  return (
    <div className="side-card">
      <div className="card pad">
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Usage & impact</div>
        <div className="stack" style={{ gap: 10, fontSize: 12.5 }}>
          <div className="row"><GraduationCap size={14} style={{ color: 'var(--text-3)' }} /><span style={{ flex: 1 }}>Certifications</span><b>{usage.certIds.length}</b></div>
          <div className="row"><Users size={14} style={{ color: 'var(--text-3)' }} /><span style={{ flex: 1 }}>Direct path adds</span><b>{usage.pathCount}</b></div>
          <div className="row"><Lock size={14} style={{ color: 'var(--text-3)' }} /><span style={{ flex: 1 }}>Restriction chains</span><b>{restricted ? 'Yes — non-global' : 'No — global'}</b></div>
        </div>
        <hr className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          {restricted
            ? 'Because this task is in a restriction chain, hide/remove actions skip the restricted instance to avoid breaking certifications. Completion still syncs everywhere.'
            : 'This task is global: hiding or removing it propagates to every instance, and completion syncs everywhere.'}
        </div>
      </div>
      {task.type === 'quiz' && (
        <div className="card pad" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Quiz at a glance</div>
          <div className="stack" style={{ gap: 8, fontSize: 12.5 }}>
            <div className="row"><span className="muted" style={{ flex: 1 }}>Questions / attempt</span><b>{questionCount(task)}</b></div>
            <div className="row"><span className="muted" style={{ flex: 1 }}>Sections</span><b>{task.quiz!.sections.length || '—'}</b></div>
            <div className="row"><span className="muted" style={{ flex: 1 }}>Grading</span><b>{task.quiz!.gradeLevel === 'section' ? 'Per-section' : `Quiz-level ${task.quiz!.quizPassingGrade}%`}</b></div>
            <div className="row"><span className="muted" style={{ flex: 1 }}>Time limit</span><b>{task.quiz!.timeLimitMinutes ? `${task.quiz!.timeLimitMinutes} min` : 'None'}</b></div>
            <div className="row"><span className="muted" style={{ flex: 1 }}>Attempts</span><b>{task.quiz!.maxAttempts === 'unlimited' ? 'Unlimited' : task.quiz!.maxAttempts}</b></div>
          </div>
        </div>
      )}
    </div>
  )
}

function isRestrictedAnywhere(db: ReturnType<typeof useStore>['db'], taskId: string) {
  return db.certifications.some(
    (c) => Object.keys(c.restrictions).includes(taskId) || Object.values(c.restrictions).some((r) => r.requires.includes(taskId))
  )
}

/* ---------------- Quiz: composition ---------------- */
function CompositionTab({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const { db, toast } = useStore()
  const quiz = task.quiz!
  const setQuiz = (p: Partial<QuizConfig>) => patch({ quiz: { ...quiz, ...p } })
  const hasSections = quiz.sections.length > 0
  const [pickFor, setPickFor] = useState<string | 'quiz' | null>(null)

  const addSection = () =>
    setQuiz({
      sections: [...quiz.sections, { id: `s-${uid()}`, name: { en: `Section ${quiz.sections.length + 1}` }, requiredToPass: false, passingGrade: 70, staticQuestionIds: [], randomPool: { poolSize: 0, draw: 0 } }],
    })

  const patchSection = (sid: string, p: Partial<QuizSection>) =>
    setQuiz({ sections: quiz.sections.map((s) => (s.id === sid ? { ...s, ...p } : s)) })

  const questionChip = (qid: string, onRemove: () => void) => {
    const q = db.questions.find((x) => x.id === qid)
    return (
      <span key={qid} className="badge outline" style={{ padding: '3px 8px', gap: 6 }}>
        <Link to={`/question-bank/${qid}`} style={{ color: 'var(--text-2)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q ? en(q.text) : qid}</Link>
        <X size={11} style={{ cursor: 'pointer' }} onClick={onRemove} />
      </span>
    )
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <Field label="Structure">
        <Seg
          options={[{ value: 'single', label: 'Single block of questions' }, { value: 'sections', label: 'Quiz with sections' }]}
          value={hasSections ? 'sections' : 'single'}
          onChange={(v) => {
            if (v === 'sections' && !hasSections) { addSection(); toast('Past attempts keep their original structure; section completion starts on the next attempt') }
            if (v === 'single' && hasSections) setQuiz({ sections: [] })
          }}
        />
      </Field>

      {!hasSections && (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Question list</div>
          <Field label="Static questions" hint="Hand-picked — every attempt shows these.">
            <div className="row wrap" style={{ gap: 6 }}>
              {quiz.staticQuestionIds.map((qid) => questionChip(qid, () => setQuiz({ staticQuestionIds: quiz.staticQuestionIds.filter((x) => x !== qid) })))}
              <button className="filter-chip" onClick={() => setPickFor('quiz')}><Plus size={11} /> Add from bank</button>
            </div>
          </Field>
          <Field label="Random pool" hint="A configurable number drawn randomly per attempt from a chosen pool.">
            <div className="row" style={{ fontSize: 13 }}>
              Draw
              <input className="input sm" type="number" style={{ width: 64 }} value={quiz.randomPool?.draw ?? 0} onChange={(e) => setQuiz({ randomPool: { poolSize: quiz.randomPool?.poolSize ?? 0, draw: +e.target.value } })} />
              from a pool of
              <input className="input sm" type="number" style={{ width: 64 }} value={quiz.randomPool?.poolSize ?? 0} onChange={(e) => setQuiz({ randomPool: { draw: quiz.randomPool?.draw ?? 0, poolSize: +e.target.value } })} />
              questions
            </div>
          </Field>
        </div>
      )}

      {hasSections && (
        <>
          <div className="section-desc">
            Each section has its own name, questions and (when section-level grading is on) its own passing grade. All
            other settings — time limit, proctoring, attempts, cooldowns, resources — stay at the quiz level.
          </div>
          <div className="tree">
            {quiz.sections.map((s, i) => (
              <div className="tree-course" key={s.id}>
                <div className="tree-course-head">
                  <span className="mono muted" style={{ fontSize: 11 }}>{i + 1}</span>
                  <input className="input sm" style={{ maxWidth: 200 }} value={s.name.en} onChange={(e) => patchSection(s.id, { name: { ...s.name, en: e.target.value } })} />
                  {quiz.gradeLevel === 'section' && (
                    <span className="row" style={{ fontSize: 12 }}>
                      pass at <input className="input sm" type="number" style={{ width: 56 }} value={s.passingGrade ?? 70} onChange={(e) => patchSection(s.id, { passingGrade: +e.target.value })} />%
                    </span>
                  )}
                  <label className="row" style={{ fontSize: 12, gap: 5, cursor: 'pointer' }} title="If this section fails, no section completions are recorded from the attempt — even passed ones.">
                    <input type="checkbox" checked={s.requiredToPass} onChange={(e) => patchSection(s.id, { requiredToPass: e.target.checked })} />
                    Required to pass
                  </label>
                  {s.requiredToPass && <Badge tone="red">Gates the attempt</Badge>}
                  <div className="spacer" />
                  <button className="btn ghost btn-icon sm" onClick={() => setQuiz({ sections: quiz.sections.filter((x) => x.id !== s.id) })}><Trash2 size={12} /></button>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>
                    {s.staticQuestionIds.map((qid) => questionChip(qid, () => patchSection(s.id, { staticQuestionIds: s.staticQuestionIds.filter((x) => x !== qid) })))}
                    <button className="filter-chip" onClick={() => setPickFor(s.id)}><Plus size={11} /> Static question</button>
                  </div>
                  <div className="row" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                    + draw
                    <input className="input sm" type="number" style={{ width: 60 }} value={s.randomPool?.draw ?? 0} onChange={(e) => patchSection(s.id, { randomPool: { poolSize: s.randomPool?.poolSize ?? 0, draw: +e.target.value } })} />
                    random from a pool of
                    <input className="input sm" type="number" style={{ width: 60 }} value={s.randomPool?.poolSize ?? 0} onChange={(e) => patchSection(s.id, { randomPool: { draw: s.randomPool?.draw ?? 0, poolSize: +e.target.value } })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn" style={{ marginTop: 10 }} onClick={addSection}><Plus size={14} /> Add section</button>
        </>
      )}

      <div className="section-title">Question order</div>
      <Field label="Presentation order">
        <Seg
          options={[
            { value: 'fixed', label: 'Fixed order' },
            ...(hasSections
              ? [{ value: 'shuffle-within-section' as const, label: 'Shuffle within section' }, { value: 'shuffle-all' as const, label: 'Shuffle all' }]
              : [{ value: 'shuffle-all' as const, label: 'Shuffled' }]),
          ]}
          value={quiz.questionOrder}
          onChange={(v) => setQuiz({ questionOrder: v })}
        />
      </Field>
      {quiz.questionOrder === 'shuffle-all' && hasSections && (
        <Callout tone="warn">Shuffle All mixes questions across sections — sections lose their visual grouping for the user.</Callout>
      )}

      {pickFor && (
        <QuestionPicker
          onClose={() => setPickFor(null)}
          onPick={(qid) => {
            if (pickFor === 'quiz') setQuiz({ staticQuestionIds: [...quiz.staticQuestionIds, qid] })
            else patchSection(pickFor, { staticQuestionIds: [...quiz.sections.find((s) => s.id === pickFor)!.staticQuestionIds, qid] })
            setPickFor(null)
          }}
        />
      )}
    </div>
  )
}

function QuestionPicker({ onPick, onClose }: { onPick: (qid: string) => void; onClose: () => void }) {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const list = db.questions.filter((x) => x.status === 'active' && en(x.text).toLowerCase().includes(q.toLowerCase()))
  return (
    <Modal title="Add question from the bank" onClose={onClose} wide>
      <SearchInput value={q} onChange={setQ} placeholder="Search active questions…" />
      <div style={{ marginTop: 12, maxHeight: 360, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        {list.map((question) => {
          const cat = db.questionCategories.find((c) => c.id === question.categoryId)
          const parent = cat?.parentId ? db.questionCategories.find((c) => c.id === cat.parentId) : undefined
          return (
            <div key={question.id} className="tree-task" style={{ borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '9px 12px', cursor: 'pointer' }} onClick={() => onPick(question.id)}>
              <ListChecks size={14} style={{ color: 'var(--purple)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{en(question.text)}</div>
                <div className="muted" style={{ fontSize: 11 }}>{parent ? `${parent.name} › ` : ''}{cat?.name} · {question.type} · v{question.version}</div>
              </div>
              <button className="btn sm">Add</button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

/* ---------------- Quiz: attempts & timing ---------------- */
function AttemptsTab({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const quiz = task.quiz!
  const setQuiz = (p: Partial<QuizConfig>) => patch({ quiz: { ...quiz, ...p } })

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="section-title"><Timer size={15} /> Attempts</div>
      <div className="field-row">
        <Field label="Maximum attempts" hint="1–10, or unlimited. Admins can grant extra attempts per user.">
          <select className="select" value={String(quiz.maxAttempts)} onChange={(e) => setQuiz({ maxAttempts: e.target.value === 'unlimited' ? 'unlimited' : +e.target.value })}>
            <option value="unlimited">Unlimited</option>
            {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select>
        </Field>
        <Field label="Cooldown between attempts (minutes)" hint="Starts at submission or when the timer runs out — whichever is first.">
          <input className="input" type="number" value={quiz.cooldownMinutes} onChange={(e) => setQuiz({ cooldownMinutes: +e.target.value })} />
        </Field>
      </div>

      <Field label="Variable cooldowns" optional hint="Override the cooldown between specific attempts — e.g. 4h between 1→2, 12h between 3→4. Encourages studying between EPA attempts.">
        {quiz.variableCooldowns.map((vc, i) => (
          <div className="row" key={i} style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, width: 130 }}>Attempts {vc.betweenAttempts}</span>
            <input className="input sm" type="number" style={{ width: 90 }} value={vc.minutes} onChange={(e) => setQuiz({ variableCooldowns: quiz.variableCooldowns.map((x, j) => (j === i ? { ...x, minutes: +e.target.value } : x)) })} />
            <span className="muted" style={{ fontSize: 12 }}>min</span>
            <button className="btn ghost btn-icon sm" onClick={() => setQuiz({ variableCooldowns: quiz.variableCooldowns.filter((_, j) => j !== i) })}><X size={12} /></button>
          </div>
        ))}
        <button
          className="btn sm"
          onClick={() => setQuiz({ variableCooldowns: [...quiz.variableCooldowns, { betweenAttempts: `${quiz.variableCooldowns.length + 1} → ${quiz.variableCooldowns.length + 2}`, minutes: 240 }] })}
        >
          <Plus size={12} /> Add override
        </button>
      </Field>

      <Field label="Automatic additional attempts" optional hint="Unlock extra attempts when the user completes selected tasks — required for EPA (e.g. +4 attempts after completing 50 tasks in the certification). Stacks with remaining and manually granted attempts.">
        {quiz.autoAdditionalAttempts ? (
          <div className="card pad row" style={{ padding: 12 }}>
            <span style={{ fontSize: 13 }}>
              Unlock <input className="input sm" type="number" style={{ width: 56, display: 'inline-block' }} value={quiz.autoAdditionalAttempts.count} onChange={(e) => setQuiz({ autoAdditionalAttempts: { ...quiz.autoAdditionalAttempts!, count: +e.target.value } })} /> attempts
              after completing <b>{quiz.autoAdditionalAttempts.requiredTasks} selected tasks</b>
            </span>
            <div className="spacer" />
            <button className="btn ghost sm">Edit task list</button>
            <button className="btn ghost btn-icon sm" onClick={() => setQuiz({ autoAdditionalAttempts: undefined })}><Trash2 size={12} /></button>
          </div>
        ) : (
          <button className="btn sm" onClick={() => setQuiz({ autoAdditionalAttempts: { count: 4, requiredTasks: 0 } })}><Plus size={12} /> Configure unlock rule</button>
        )}
      </Field>

      <div className="section-title"><Clock size={15} /> Time limit</div>
      <Field label="Time limit (minutes)" hint="Runs across the entire attempt, all sections, no pausing. Auto-submits when it ends — even if the user left the app. Leave 0 for no limit.">
        <input className="input" style={{ maxWidth: 160 }} type="number" value={quiz.timeLimitMinutes ?? 0} onChange={(e) => setQuiz({ timeLimitMinutes: +e.target.value || undefined })} />
      </Field>

      <div className="section-title">Proctoring</div>
      <SwitchRow
        label="Proctored quiz"
        desc="Captures timestamped webcam images at the system frequency (every 20s). Exiting mid-attempt auto-submits. Passing attempts enter In-Review until the Proctoring Team approves."
        checked={quiz.proctored}
        onChange={(v) => setQuiz({ proctored: v })}
      />
      {quiz.proctored && (
        <Callout tone="info">
          Completion from passing attempts is held until footage approval. ID verification is separate — add the ID-Upload
          Task as an access restriction in each certification that uses this quiz.
        </Callout>
      )}

      <div className="section-title">In-quiz resources</div>
      <div className="section-desc">Available to the user throughout the attempt — e.g. PT charts for EPA. Images, videos, PDFs, webviews and custom UIs.</div>
      {quiz.resources.map((r, i) => (
        <div className="row" key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
          <FileText size={14} style={{ color: 'var(--text-3)' }} />
          <span style={{ flex: 1 }}>{r.name}</span>
          <Badge tone="neutral">{r.kind}</Badge>
          <button className="btn ghost btn-icon sm" onClick={() => setQuiz({ resources: quiz.resources.filter((_, j) => j !== i) })}><X size={12} /></button>
        </div>
      ))}
      <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setQuiz({ resources: [...quiz.resources, { name: 'New resource.pdf', kind: 'pdf' }] })}><Plus size={12} /> Add resource</button>
    </div>
  )
}

/* ---------------- Quiz: grading & review ---------------- */
function GradingTab({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const { toast } = useStore()
  const quiz = task.quiz!
  const setQuiz = (p: Partial<QuizConfig>) => patch({ quiz: { ...quiz, ...p } })
  const hasSections = quiz.sections.length > 0

  const reviewOpts: { key: keyof QuizConfig['review']; label: string; desc: string; disabled?: boolean }[] = [
    { key: 'attempt', label: 'Attempt', desc: 'Questions and the user’s selected answers' },
    { key: 'quizResult', label: 'Quiz result', desc: 'Overall pass/fail — quiz-level grading only', disabled: quiz.gradeLevel === 'section' },
    { key: 'quizScore', label: 'Quiz score', desc: 'The overall score achieved' },
    { key: 'whetherCorrect', label: 'Whether correct', desc: 'Per question: correct / partially correct / incorrect' },
    { key: 'perQuestionFeedback', label: 'Per-question feedback', desc: 'Correct / partially correct / incorrect feedback fields' },
    { key: 'perSectionResults', label: 'Per-section results', desc: 'Section scores, pass/fail, and cumulative section completion record', disabled: !hasSections },
  ]

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="section-title">Passing grade</div>
      <Field label="Grading level">
        <Seg
          options={[
            { value: 'quiz', label: 'Quiz-level passing grade' },
            ...(hasSections ? [{ value: 'section' as const, label: 'Section-level passing grades' }] : []),
          ]}
          value={quiz.gradeLevel}
          onChange={(v) => { setQuiz({ gradeLevel: v }); toast('Past attempts keep the configuration they were taken under') }}
        />
      </Field>
      {quiz.gradeLevel === 'quiz' ? (
        <Field label="Passing grade (%)" hint={hasSections ? 'Sections become informational groupings — per-section scores display but don’t affect passing (NATE RTW model).' : 'The user passes when their overall score meets this threshold.'}>
          <input className="input" style={{ maxWidth: 140 }} type="number" value={quiz.quizPassingGrade ?? 70} onChange={(e) => setQuiz({ quizPassingGrade: +e.target.value })} />
        </Field>
      ) : (
        <Callout tone="info">
          Each section is independently evaluated against its own passing grade (set in Questions & Sections). Sections
          marked <b>Required To Pass</b> gate the whole attempt: if one fails, no section completions are recorded — the
          EPA Core rule. The quiz task completes when every section has been completed (across any attempts).
        </Callout>
      )}

      <div className="section-title">Score calculation</div>
      <div className="card pad" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
        <b style={{ color: 'var(--text)' }}>Highest grade</b> — the recorded score is the best across all attempts (per
        section too, when sections are graded). Average / most-recent are future considerations since they can toggle
        completion on and off.
      </div>

      <div className="section-title">Post-submission review</div>
      <div className="section-desc">What the user sees after submitting an attempt. Changes apply immediately, including to reviews of past attempts.</div>
      <div className="card" style={{ padding: '4px 16px' }}>
        {reviewOpts.map((o) => (
          <div key={o.key} className="switch-row" style={{ opacity: o.disabled ? 0.45 : 1, borderBottom: '1px solid var(--border)' }}>
            <ToggleMini checked={quiz.review[o.key]} disabled={o.disabled} onChange={(v) => setQuiz({ review: { ...quiz.review, [o.key]: v } })} />
            <div>
              <div className="lbl">{o.label}</div>
              <div className="desc">{o.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToggleMini({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
    </label>
  )
}

/* ---------------- Quiz: paywall & NATE ---------------- */
function PaymentsTab({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const quiz = task.quiz!
  const setQuiz = (p: Partial<QuizConfig>) => patch({ quiz: { ...quiz, ...p } })

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="section-title"><DollarSign size={15} /> Per-attempt paywall</div>
      <Field label="Attempt pricing">
        <Seg
          options={[{ value: 'free', label: 'Free attempts' }, { value: 'consumable', label: 'Paid per attempt (consumable)' }]}
          value={quiz.paywall.kind}
          onChange={(v) => setQuiz({ paywall: v === 'free' ? { kind: 'free' } : { kind: 'consumable', firstAttempt: 60, subsequent: 45 } })}
        />
      </Field>
      {quiz.paywall.kind === 'free' ? (
        <div className="field-hint">No additional payment — attempts are included with access to the parent certification.</div>
      ) : (
        <>
          <div className="field-row">
            <Field label="First attempt ($)">
              <input className="input" type="number" value={quiz.paywall.firstAttempt} onChange={(e) => setQuiz({ paywall: { ...quiz.paywall as any, firstAttempt: +e.target.value } })} />
            </Field>
            <Field label="Subsequent attempts ($)">
              <input className="input" type="number" value={quiz.paywall.subsequent} onChange={(e) => setQuiz({ paywall: { ...quiz.paywall as any, subsequent: +e.target.value } })} />
            </Field>
          </div>
          <Callout tone="info">
            Each price point maps to a Consumable product on Apple, Google and Stripe (e.g. “NATE Ready To Work: First
            Attempt”). Purchased attempts never expire, survive Access State changes, and aren't locked to the purchase
            platform. Refunds revoke the attempt. B2B companies can buy attempts for a chosen employee — non-transferable.
          </Callout>
        </>
      )}

      <div className="section-title"><ShieldCheck size={15} /> NATE integration</div>
      <SwitchRow
        label="This quiz is a NATE Exam"
        desc="Triggers NATE registration (the NATE Form before the first attempt), result submission via API, and pass/fail emails."
        checked={!!quiz.nate}
        onChange={(v) => setQuiz({ nate: v ? { externalIdEn: '', externalIdEs: '' } : undefined })}
      />
      {quiz.nate && (
        <>
          <div className="field-row">
            <Field label="External ID (EN)" required hint="NATE-assigned exam ID for English attempts.">
              <input className="input mono" value={quiz.nate.externalIdEn} onChange={(e) => setQuiz({ nate: { ...quiz.nate!, externalIdEn: e.target.value } })} />
            </Field>
            <Field label="External ID (ES)" required hint="NATE-assigned exam ID for Spanish attempts.">
              <input className="input mono" value={quiz.nate.externalIdEs} onChange={(e) => setQuiz({ nate: { ...quiz.nate!, externalIdEs: e.target.value } })} />
            </Field>
          </div>
          <div className="card pad" style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            <div className="row" style={{ marginBottom: 6 }}><Mail size={14} /> <b style={{ color: 'var(--text)' }}>Exam emails & API submission</b></div>
            • <b>Failed attempt</b> → email + API result sent immediately on submission.<br />
            • <b>Passed attempt</b> → sent once the quiz is completed <i>and</i> the ID-Upload task is approved (and footage approved, if proctored).<br />
            • The attempt's language is stored on the attempt record and sent to NATE — not the live profile preference.<br />
            • The NATE Form (name, email, DOB, gender) shows after payment; DOB and gender are sent to NATE only, never stored. Gender maps free text → M / F / N.
            <div style={{ marginTop: 8 }}><Link to="/settings" className="btn sm">Edit email templates</Link></div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- Hands-on tab ---------------- */
function HandsOnTab({ task, patch }: { task: Task; patch: (p: Partial<Task>) => void }) {
  const h = task.handsOn!
  const set = (p: Partial<typeof h>) => patch({ handsOn: { ...h, ...p } })
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="section-title">Guidance shown to the user</div>
      <LangInput label="Instructions" multiline value={h.instructions ?? { en: '' }} onChange={(v) => set({ instructions: v })} hint="Rich text + media. What the user needs to do." />
      <LangInput label="Tools / materials required" multiline value={h.toolsMaterials ?? { en: '' }} onChange={(v) => set({ toolsMaterials: v })} />
      <LangInput label="Reviewer checklist" multiline value={h.reviewerChecklist ?? { en: '' }} onChange={(v) => set({ reviewerChecklist: v })} hint="What the reviewer should look for. Never visible to the user." />
      <Field label="Reference files" optional hint="Downloadable by the user. Separate files per language.">
        {h.referenceFiles.map((f, i) => (
          <div className="row" key={i} style={{ padding: '6px 0', fontSize: 13 }}>
            <FileText size={14} style={{ color: 'var(--text-3)' }} />
            <span style={{ flex: 1 }} className="mono">{f.name}</span>
            <Badge tone="neutral">{f.lang.toUpperCase()}</Badge>
            <button className="btn ghost btn-icon sm" onClick={() => set({ referenceFiles: h.referenceFiles.filter((_, j) => j !== i) })}><X size={12} /></button>
          </div>
        ))}
        <button className="btn sm" onClick={() => set({ referenceFiles: [...h.referenceFiles, { name: 'reference.pdf', lang: 'en' }] })}><UploadCloud size={12} /> Upload file</button>
      </Field>

      <div className="section-title">Submission settings</div>
      <div className="field-row-3">
        <Field label="Maximum attempts">
          <select className="select" value={String(h.maxAttempts)} onChange={(e) => set({ maxAttempts: e.target.value === 'unlimited' ? 'unlimited' : +e.target.value })}>
            <option value="unlimited">Unlimited</option>
            {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select>
        </Field>
        <Field label="Passing score (of 10)" hint="Used when completion is “Passing grade from reviewer”.">
          <input className="input" type="number" min={1} max={10} value={h.passingScore} onChange={(e) => set({ passingScore: +e.target.value })} />
        </Field>
        <Field label="Description char limit" hint="0 hides the text field entirely.">
          <input className="input" type="number" value={h.descriptionCharLimit} onChange={(e) => set({ descriptionCharLimit: +e.target.value })} />
        </Field>
      </div>
      <div className="field-row">
        <Field label="Max media files per attempt" hint="0 disables media uploads (text only).">
          <input className="input" type="number" value={h.maxMediaFiles} onChange={(e) => set({ maxMediaFiles: +e.target.value })} />
        </Field>
        <Field label="Accepted media types">
          <div className="row">
            {(['images', 'videos', 'audio'] as const).map((m) => (
              <button key={m} className={`filter-chip ${h.mediaTypes.includes(m) ? 'on' : ''}`}
                onClick={() => set({ mediaTypes: h.mediaTypes.includes(m) ? h.mediaTypes.filter((x) => x !== m) : [...h.mediaTypes, m] })}>
                {m}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <Callout tone="info">
        Users edit freely until reviewed; one pending submission at a time; reviewed attempts lock. Previous submissions
        are always preserved. SkillCat-created tasks are reviewed by SkillCat admins even for B2B employees.
      </Callout>
    </div>
  )
}

/* ---------------- Per-user management ---------------- */
function UserMgmtTab({ task }: { task: Task }) {
  const { db, update, toast } = useStore()
  const [q, setQ] = useState('')

  const rows = db.users
    .filter((u) => u.name.toLowerCase().includes(q.toLowerCase()))
    .map((u) => ({ user: u, qs: u.quizState.find((s) => s.taskId === task.id) }))
    .filter((r) => task.type !== 'quiz' || r.qs || q)

  const grant = (uid2: string) => {
    update((d) => ({
      ...d,
      users: d.users.map((u) =>
        u.id === uid2
          ? { ...u, quizState: u.quizState.map((s) => (s.taskId === task.id ? { ...s, granted: s.granted + 1 } : s)) }
          : u
      ),
    }))
    toast('Granted +1 attempt — action logged for audit')
  }

  return (
    <div>
      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Find a user…" />
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 12 }}>All actions here are audit-logged and permission-gated.</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              {task.type === 'quiz' && <><th>Attempts used</th><th>Extra granted</th><th>Best score</th><th>Cooldown</th></>}
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ user, qs }) => (
              <tr key={user.id}>
                <td>
                  <Link to={`/users/${user.id}`} className="main-cell" style={{ color: 'var(--accent)' }}>{user.name}</Link>
                  <div className="sub-cell">{user.email}</div>
                </td>
                {task.type === 'quiz' && (
                  <>
                    <td className="num">{qs?.used ?? 0}{task.quiz?.maxAttempts !== 'unlimited' ? ` / ${task.quiz?.maxAttempts}` : ''}</td>
                    <td className="num">{qs?.granted ? `+${qs.granted}` : '—'}</td>
                    <td className="num">{qs?.bestScore != null ? `${qs.bestScore}%` : '—'}</td>
                    <td>{qs?.cooldownUntil ? <Badge tone="amber">until {qs.cooldownUntil.split(' ')[1]}</Badge> : <span className="muted">—</span>}</td>
                  </>
                )}
                <td className="actions">
                  {task.type === 'quiz' && (
                    <>
                      <button className="btn ghost sm" onClick={() => grant(user.id)}>Grant attempt</button>
                      <button className="btn ghost sm" onClick={() => toast('Cooldown reset for ' + user.name)}>Reset cooldown</button>
                      <button className="btn ghost sm" onClick={() => toast('Last attempt deleted — attempt returned to the user')}>Delete attempt</button>
                    </>
                  )}
                  <button className="btn ghost sm" onClick={() => toast(`Marked complete for ${user.name} — score recorded, bypasses proctoring review`)}>Mark complete…</button>
                  <button className="btn ghost sm" onClick={() => toast(`Marked incomplete for ${user.name} — underlying attempt data preserved`)}>Mark incomplete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={task.type === 'quiz' ? 6 : 2}><div className="empty"><p>No users with activity on this task yet. Search to manage anyone.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
