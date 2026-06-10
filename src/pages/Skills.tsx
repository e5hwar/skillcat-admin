import { useState } from 'react'
import { Plus, Sparkles, Archive, Trash2, X } from 'lucide-react'
import { useStore } from '../lib/store'
import { PageHead, Badge, Tabs, SearchInput, Drawer, LangInput, Field, Seg, Callout, useConfirm, TaskTypeIcon } from '../components/ui'
import { en, fmtNum, uid } from '../lib/utils'
import type { Skill, MasterySkill } from '../lib/types'

export default function Skills() {
  const { db, update, toast } = useStore()
  const [tab, setTab] = useState('skills')
  const [q, setQ] = useState('')
  const [editSkill, setEditSkill] = useState<Skill | 'new' | null>(null)
  const [editMastery, setEditMastery] = useState<MasterySkill | 'new' | null>(null)
  const { confirm, element } = useConfirm()

  const skills = db.skills.filter((s) => en(s.name).toLowerCase().includes(q.toLowerCase()))
  const masteries = db.masterySkills.filter((s) => en(s.name).toLowerCase().includes(q.toLowerCase()))

  const masteriesUsing = (skillId: string) => db.masterySkills.filter((m) => m.skillIds.includes(skillId))

  const archiveSkill = (s: Skill) => {
    const affected = masteriesUsing(s.id).filter((m) => m.status === 'active')
    confirm({
      title: `Archive “${en(s.name)}”?`,
      confirmLabel: 'Archive skill',
      body: (
        <>
          <p style={{ marginBottom: 8 }}>New users can no longer earn it; {fmtNum(s.holders)} existing holders keep it.</p>
          {affected.length > 0 && (
            <Callout tone="warn">
              <b>{affected.length} Mastery Skill{affected.length > 1 ? 's' : ''} will become unearnable</b> for new users:{' '}
              {affected.map((m) => en(m.name)).join(', ')}. Consider removing this skill from their criteria first.
            </Callout>
          )}
        </>
      ),
      onConfirm: () => {
        update((d) => ({ ...d, skills: d.skills.map((x) => (x.id === s.id ? { ...x, status: 'archived' } : x)) }))
        toast('Skill archived')
      },
    })
  }

  const deleteSkill = (s: Skill) => {
    const linked = masteriesUsing(s.id)
    if (linked.length > 0) {
      confirm({
        title: 'Cannot delete this skill',
        confirmLabel: 'OK',
        body: (
          <>
            <b>{en(s.name)}</b> is referenced by {linked.length} Mastery Skill{linked.length > 1 ? 's' : ''}:{' '}
            {linked.map((m) => en(m.name)).join(', ')}. Remove it from their criteria first, then delete.
          </>
        ),
        onConfirm: () => {},
      })
      return
    }
    confirm({
      title: `Delete “${en(s.name)}”?`,
      danger: true,
      confirmLabel: 'Delete permanently',
      body: <>The skill is removed from all {fmtNum(s.holders)} users who hold it. This cannot be undone.</>,
      onConfirm: () => {
        update((d) => ({ ...d, skills: d.skills.filter((x) => x.id !== s.id) }))
        toast('Skill deleted and removed from all holders')
      },
    })
  }

  return (
    <div className="page wide">
      <PageHead
        title="Skills"
        sub="A parallel recognition system outside the content hierarchy. Skills are awarded on Task completion; Mastery Skills roll up Skills. Both are awarded retroactively — without firing events."
        actions={
          <button className="btn primary" onClick={() => (tab === 'skills' ? setEditSkill('new') : setEditMastery('new'))}>
            <Plus size={14} /> New {tab === 'skills' ? 'skill' : 'mastery skill'}
          </button>
        }
      />
      <Tabs
        tabs={[
          { id: 'skills', label: 'Skills', count: db.skills.length },
          { id: 'mastery', label: 'Mastery Skills', count: db.masterySkills.length },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="toolbar"><SearchInput value={q} onChange={setQ} /></div>

      {tab === 'skills' ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Skill</th><th>Status</th><th>Criteria</th><th>In mastery skills</th><th className="num" style={{ textAlign: 'right' }}>Holders</th><th className="actions" /></tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.id} className="click" onClick={() => setEditSkill(s)}>
                  <td>
                    <div className="row">
                      <span className="task-type-ic" style={{ width: 30, height: 30, background: `${s.color}22`, color: s.color, fontSize: 15 }}>{s.emoji}</span>
                      <div>
                        <div className="main-cell">{en(s.name)}</div>
                        <div className="sub-cell">{s.name.es ? 'ES ✓' : 'EN only'} · updated {s.updatedAt}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.status === 'active' ? <Badge tone="green" dot>Active</Badge> : <Badge tone="neutral" dot>Archived</Badge>}</td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                    Complete {s.criteria.mode === 'all' ? 'all' : 'any'} of {s.criteria.taskIds.length} task{s.criteria.taskIds.length > 1 ? 's' : ''}
                  </td>
                  <td style={{ fontSize: 12.5 }}>
                    {masteriesUsing(s.id).length > 0 ? masteriesUsing(s.id).map((m) => <Badge key={m.id} tone="purple">{en(m.name)}</Badge>) : <span className="muted">—</span>}
                  </td>
                  <td className="num" style={{ textAlign: 'right' }}>{fmtNum(s.holders)}</td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    {s.status === 'active' && <button className="btn ghost btn-icon sm" title="Archive" onClick={() => archiveSkill(s)}><Archive size={13} /></button>}
                    <button className="btn ghost btn-icon sm" title="Delete" onClick={() => deleteSkill(s)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Mastery Skill</th><th>Status</th><th>Required skills</th><th className="num" style={{ textAlign: 'right' }}>Holders</th><th className="actions" /></tr>
            </thead>
            <tbody>
              {masteries.map((m) => {
                const unearnable = m.skillIds.some((sid) => db.skills.find((s) => s.id === sid)?.status === 'archived')
                return (
                  <tr key={m.id} className="click" onClick={() => setEditMastery(m)}>
                    <td>
                      <div className="row">
                        <span className="task-type-ic" style={{ width: 30, height: 30, background: `${m.color}22`, color: m.color, fontSize: 15 }}>{m.emoji}</span>
                        <div className="main-cell">{en(m.name)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 4 }}>
                        {m.status === 'active' ? <Badge tone="green" dot>Active</Badge> : <Badge tone="neutral" dot>Archived</Badge>}
                        {unearnable && <Badge tone="amber">Unearnable — includes archived skill</Badge>}
                      </div>
                    </td>
                    <td>
                      <div className="row wrap" style={{ gap: 4 }}>
                        {m.skillIds.map((sid) => {
                          const s = db.skills.find((x) => x.id === sid)
                          return <Badge key={sid} tone={s?.status === 'archived' ? 'amber' : 'neutral'}>{s?.emoji} {en(s?.name)}</Badge>
                        })}
                      </div>
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>{fmtNum(m.holders)}</td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn ghost btn-icon sm"
                        onClick={() =>
                          confirm({
                            title: `Delete “${en(m.name)}”?`,
                            danger: true,
                            confirmLabel: 'Delete permanently',
                            body: <>Removed from all {fmtNum(m.holders)} holders. The constituent Skills are not affected.</>,
                            onConfirm: () => {
                              update((d) => ({ ...d, masterySkills: d.masterySkills.filter((x) => x.id !== m.id) }))
                              toast('Mastery skill deleted')
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

      {editSkill && <SkillDrawer skill={editSkill === 'new' ? null : editSkill} onClose={() => setEditSkill(null)} />}
      {editMastery && <MasteryDrawer mastery={editMastery === 'new' ? null : editMastery} onClose={() => setEditMastery(null)} />}
      {element}
    </div>
  )
}

function SkillDrawer({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  const { db, update, toast } = useStore()
  const [name, setName] = useState(skill?.name ?? { en: '' })
  const [desc, setDesc] = useState(skill?.description ?? { en: '' })
  const [mode, setMode] = useState<'any' | 'all'>(skill?.criteria.mode ?? 'all')
  const [taskIds, setTaskIds] = useState<string[]>(skill?.criteria.taskIds ?? [])
  const [taskSearch, setTaskSearch] = useState('')

  const save = () => {
    if (!name.en.trim() || taskIds.length === 0) return
    if (skill) {
      update((d) => ({ ...d, skills: d.skills.map((s) => (s.id === skill.id ? { ...s, name, description: desc, criteria: { taskIds, mode } } : s)) }))
      toast('Skill updated — existing holders keep it; new criteria apply going forward')
    } else {
      update((d) => ({
        ...d,
        skills: [...d.skills, { id: `sk-${uid()}`, name, description: desc, status: 'active', color: '#5b5bd6', emoji: '✦', criteria: { taskIds, mode }, holders: 0, updatedAt: '2026-06-10' }],
      }))
      toast('Skill created — awarded retroactively to all users who already qualify (no events fired)')
    }
    onClose()
  }

  return (
    <Drawer
      title={skill ? 'Edit skill' : 'New skill'}
      onClose={onClose}
      width={520}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!name.en.trim() || taskIds.length === 0} onClick={save}>{skill ? 'Save changes' : 'Create skill'}</button>
        </>
      }
    >
      <LangInput label="Name" required value={name} onChange={setName} />
      <LangInput label="Description" multiline value={desc} onChange={setDesc} />
      <Field label="Image" required hint="Complete (full-colour) state; the greyed-out incomplete version is auto-generated.">
        <div className="row">
          <span className="task-type-ic" style={{ width: 44, height: 44, background: `${skill?.color ?? '#5b5bd6'}22`, color: skill?.color ?? '#5b5bd6', fontSize: 22 }}>{skill?.emoji ?? '✦'}</span>
          <span className="task-type-ic" style={{ width: 44, height: 44, background: '#f1f1f3', color: '#c5c7cf', fontSize: 22 }}>{skill?.emoji ?? '✦'}</span>
          <button className="btn sm">Upload image</button>
        </div>
      </Field>
      <Field label="Awarding criteria" required hint="Binary task completion only in V1 — no score thresholds.">
        <Seg options={[{ value: 'all', label: 'Complete ALL selected tasks' }, { value: 'any', label: 'Complete ANY selected task' }]} value={mode} onChange={setMode} />
      </Field>
      <Field label={`Trigger tasks (${taskIds.length} selected)`}>
        <SearchInput value={taskSearch} onChange={setTaskSearch} placeholder="Filter tasks…" />
        <div style={{ maxHeight: 240, overflowY: 'auto', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {db.tasks
            .filter((t) => en(t.name).toLowerCase().includes(taskSearch.toLowerCase()))
            .map((t) => {
              const on = taskIds.includes(t.id)
              return (
                <label key={t.id} className="row" style={{ padding: '6px 9px', border: '1px solid', borderColor: on ? 'var(--accent-border)' : 'var(--border)', background: on ? 'var(--accent-soft)' : '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 12.5 }}>
                  <input type="checkbox" checked={on} onChange={(e) => setTaskIds(e.target.checked ? [...taskIds, t.id] : taskIds.filter((x) => x !== t.id))} />
                  <TaskTypeIcon type={t.type} size={20} />
                  {en(t.name)}
                </label>
              )
            })}
        </div>
      </Field>
      {skill && (
        <Callout tone="info">
          Updating criteria never revokes the skill from existing holders. Only future earners follow the new rules.
        </Callout>
      )}
    </Drawer>
  )
}

function MasteryDrawer({ mastery, onClose }: { mastery: MasterySkill | null; onClose: () => void }) {
  const { db, update, toast } = useStore()
  const [name, setName] = useState(mastery?.name ?? { en: '' })
  const [skillIds, setSkillIds] = useState<string[]>(mastery?.skillIds ?? [])

  const save = () => {
    if (!name.en.trim() || skillIds.length === 0) return
    if (mastery) {
      update((d) => ({ ...d, masterySkills: d.masterySkills.map((m) => (m.id === mastery.id ? { ...m, name, skillIds } : m)) }))
      toast('Mastery skill updated — existing holders keep it')
    } else {
      update((d) => ({
        ...d,
        masterySkills: [...d.masterySkills, { id: `ms-${uid()}`, name, status: 'active', color: '#7c3aed', emoji: '◆', skillIds, holders: 0 }],
      }))
      toast('Mastery skill created — awarded retroactively to qualifying users')
    }
    onClose()
  }

  return (
    <Drawer
      title={mastery ? 'Edit mastery skill' : 'New mastery skill'}
      onClose={onClose}
      width={480}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!name.en.trim() || skillIds.length === 0} onClick={save}>{mastery ? 'Save changes' : 'Create'}</button>
        </>
      }
    >
      <LangInput label="Name" required value={name} onChange={setName} />
      <Field label={`Required skills (${skillIds.length})`} hint="Awarded automatically the moment a user holds every linked skill. No additional criteria.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {db.skills.map((s) => {
            const on = skillIds.includes(s.id)
            return (
              <label key={s.id} className="row" style={{ padding: '6px 9px', border: '1px solid', borderColor: on ? 'var(--accent-border)' : 'var(--border)', background: on ? 'var(--accent-soft)' : '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 12.5 }}>
                <input type="checkbox" checked={on} onChange={(e) => setSkillIds(e.target.checked ? [...skillIds, s.id] : skillIds.filter((x) => x !== s.id))} />
                <span style={{ fontSize: 15 }}>{s.emoji}</span>
                {en(s.name)}
                {s.status === 'archived' && <Badge tone="amber">Archived — makes this unearnable</Badge>}
              </label>
            )
          })}
        </div>
      </Field>
    </Drawer>
  )
}
