import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Layers, Lock, EyeOff, Compass } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, SearchInput, Modal, LangInput, TaskTypeIcon, TaskTypeBadge, Field } from '../../components/ui'
import { en, taskUsage, isTaskRestricted, taskTypeLabel, fmtTime, completionLabel, uid } from '../../lib/utils'
import type { Task, TaskType, LText } from '../../lib/types'

const TYPES: (TaskType | 'all')[] = ['all', 'xapi', 'quiz', 'hands-on', 'id-upload', 'url', 'file', 'deeplink']

export default function TasksList() {
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState<TaskType | 'all'>('all')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState<LText>({ en: '', es: '' })
  const [newType, setNewType] = useState<TaskType>('xapi')

  const list = useMemo(() => {
    let l = db.tasks
    if (type !== 'all') l = l.filter((t) => t.type === type)
    if (q) l = l.filter((t) => en(t.name).toLowerCase().includes(q.toLowerCase()))
    return l
  }, [db, q, type])

  const create = () => {
    if (!newName.en.trim()) return
    const id = `t-${uid()}`
    const base: Task = {
      id, type: newType, name: { ...newName }, visibility: 'hidden', owner: 'skillcat',
      completion: newType === 'quiz' ? 'passing-grade' : newType === 'hands-on' ? 'reviewer-grade' : newType === 'xapi' ? 'xapi-statement' : newType === 'id-upload' ? 'admin-approved' : 'on-view',
      updatedAt: '2026-06-10',
    }
    if (newType === 'xapi') base.xapi = { scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' }
    if (newType === 'quiz')
      base.quiz = {
        sections: [], staticQuestionIds: [], questionOrder: 'fixed', maxAttempts: 'unlimited', cooldownMinutes: 0,
        variableCooldowns: [], resources: [], gradeLevel: 'quiz', quizPassingGrade: 80,
        review: { attempt: true, quizResult: true, quizScore: true, whetherCorrect: true, perQuestionFeedback: true, perSectionResults: false },
        proctored: false, paywall: { kind: 'free' },
      }
    if (newType === 'hands-on')
      base.handsOn = { referenceFiles: [], passingScore: 7, maxAttempts: 3, descriptionCharLimit: 500, maxMediaFiles: 4, mediaTypes: ['images'] }
    if (newType === 'url') base.url = { url: '', openIn: 'external', allowRotation: true, lockedOrientation: 'portrait' }
    if (newType === 'file') base.file = { fileName: '', sizeMb: 0, openIn: 'external' }
    if (newType === 'deeplink') base.deeplink = { url: 'https://skillcat.app/' }
    update((d) => ({ ...d, tasks: [base, ...d.tasks] }))
    toast('Task created as Hidden')
    nav(`/tasks/${id}`)
  }

  return (
    <div className="page wide">
      <PageHead
        title="Tasks"
        sub="The smallest unit of training — reusable across Certifications and Paths. Data, settings and per-user completion live on the Task itself."
        actions={<button className="btn primary" onClick={() => setCreating(true)}><Plus size={14} /> New task</button>}
      />

      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search tasks…" />
        <div className="spacer" />
        {TYPES.map((t) => (
          <button key={t} className={`filter-chip ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>
            {t === 'all' ? 'All types' : taskTypeLabel[t]}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '36%' }}>Task</th>
              <th>Type</th>
              <th>Completion criteria</th>
              <th>Used in</th>
              <th>Est. time</th>
              <th>Flags</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => {
              const usage = taskUsage(db, t.id)
              const restricted = isTaskRestricted(db, t.id)
              return (
                <tr key={t.id} className="click" onClick={() => nav(`/tasks/${t.id}`)}>
                  <td>
                    <div className="row">
                      <TaskTypeIcon type={t.type} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div className="main-cell">{en(t.name)}</div>
                        <div className="sub-cell">{t.owner === 'skillcat' ? 'SkillCat' : db.tenants.find((x) => x.id === t.owner)?.name ?? t.owner}{t.name.es ? ' · ES ✓' : ' · EN only'}</div>
                      </div>
                    </div>
                  </td>
                  <td><TaskTypeBadge type={t.type} /></td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{completionLabel[t.completion]}</td>
                  <td className="num">
                    {usage.certIds.length > 0 ? (
                      <span title={usage.certIds.map((c) => en(db.certifications.find((x) => x.id === c)?.name)).join(', ')}>
                        {usage.certIds.length} cert{usage.certIds.length > 1 ? 's' : ''}
                        {usage.pathCount > 0 ? ` · ${usage.pathCount} paths` : ''}
                      </span>
                    ) : (
                      <span className="muted">standalone</span>
                    )}
                  </td>
                  <td className="muted">{fmtTime(t.timeToComplete)}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {t.visibility === 'hidden' && <Badge tone="neutral"><EyeOff size={10} /> Hidden</Badge>}
                      {restricted && <Badge tone="amber"><Lock size={10} /> In restriction chain</Badge>}
                      {t.discoverable && <Badge tone="teal"><Compass size={10} /> Discoverable</Badge>}
                      {t.quiz?.proctored && <Badge tone="red">Proctored</Badge>}
                      {t.quiz?.nate && <Badge tone="purple">NATE</Badge>}
                      {t.quiz?.paywall.kind === 'consumable' && <Badge tone="accent">Paid attempts</Badge>}
                    </div>
                  </td>
                  <td className="muted">{t.updatedAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="empty">
            <div className="ic"><Layers size={18} /></div>
            <b>No tasks match</b>
          </div>
        )}
      </div>

      {creating && (
        <Modal
          title="New task"
          onClose={() => setCreating(false)}
          footer={
            <>
              <button className="btn" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn primary" disabled={!newName.en.trim()} onClick={create}>Create task</button>
            </>
          }
        >
          <Field label="Task type" required hint="Each type has its own creation flow and settings.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {(['xapi', 'quiz', 'hands-on', 'id-upload', 'url', 'file', 'deeplink'] as TaskType[]).map((t) => (
                <button
                  key={t}
                  className="btn"
                  style={newType === t ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', justifyContent: 'flex-start' } : { justifyContent: 'flex-start' }}
                  onClick={() => setNewType(t)}
                >
                  <TaskTypeIcon type={t} size={20} /> {taskTypeLabel[t]}
                </button>
              ))}
            </div>
          </Field>
          <LangInput label="Name" required value={newName} onChange={setNewName} />
        </Modal>
      )}
    </div>
  )
}
