import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShieldAlert, GripVertical, Lock, GraduationCap, Layers, Medal, Sparkles, QrCode,
  UploadCloud, BadgeCheck, Gift, Calendar, CreditCard, Trash2,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, Tabs, Modal, Field, Seg, Callout, TaskTypeIcon } from '../../components/ui'
import { en, accessStateLabel, accessStateBadge, initials, avatarColor, tierLabel } from '../../lib/utils'

export default function UserDetail() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const user = db.users.find((u) => u.id === id)
  const [tab, setTab] = useState('path')
  const [scholarship, setScholarship] = useState(false)
  const [idAction, setIdAction] = useState(false)
  const [idOutcome, setIdOutcome] = useState<'approved' | 'in-review'>('in-review')

  if (!user) return <div className="page"><PageHead title="User not found" /></div>

  const tenant = user.tenantId ? db.tenants.find((t) => t.id === user.tenantId) : null

  const pathItem = (item: typeof user.pathSelf[number], i: number, assigned: boolean) => {
    const entity = item.kind === 'certification' ? db.certifications.find((c) => c.id === item.refId) : db.tasks.find((t) => t.id === item.refId)
    if (!entity) return null
    const isCert = item.kind === 'certification'
    return (
      <div className="path-item" key={`${item.refId}-${i}`}>
        <span className="path-pos">{i + 1}</span>
        <GripVertical size={13} style={{ color: 'var(--text-3)', cursor: assigned ? 'not-allowed' : 'grab', opacity: assigned ? 0.35 : 1 }} />
        {isCert ? (
          <span className="cert-thumb" style={{ background: (entity as any).graphic, width: 30, height: 22, fontSize: 11 }}>{(entity as any).emoji}</span>
        ) : (
          <TaskTypeIcon type={(entity as any).type} size={24} />
        )}
        <Link to={isCert ? `/certifications/${item.refId}` : `/tasks/${item.refId}`} style={{ fontWeight: 550, fontSize: 13, flex: 1, color: 'inherit' }}>
          {en(entity.name)}
        </Link>
        {item.dueDate && <Badge tone="amber"><Calendar size={10} /> Due {item.dueDate}</Badge>}
        {assigned && <Badge tone="blue"><Lock size={10} /> Assigned by {tenant?.name}</Badge>}
        {!assigned && (
          <button
            className="btn ghost btn-icon sm"
            title="Remove from path (progress is preserved)"
            onClick={() => {
              update((d) => ({
                ...d,
                users: d.users.map((u) => (u.id === user.id ? { ...u, pathSelf: u.pathSelf.filter((_, j) => j !== i) } : u)),
              }))
              toast('Removed from path — completion data and awards are untouched')
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="page wide">
      <PageHead
        crumbs={[{ label: 'Users', to: '/users' }, { label: user.name }]}
        title={
          <>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: avatarColor(user.id) }}>{initials(user.name)}</div>
            {user.name}
          </>
        }
        badge={
          <span className="row" style={{ gap: 6 }}>
            <Badge tone={user.userType === 'b2c' ? 'neutral' : 'blue'}>{user.userType.toUpperCase()}</Badge>
            <Badge tone={accessStateBadge[user.accessState]} dot>{accessStateLabel[user.accessState]}</Badge>
          </span>
        }
        sub={
          <>
            {user.email} · joined {user.joinedAt} · prefers {user.language === 'es' ? 'Spanish' : 'English'} · industry: {user.industryPreference ?? '—'}
            {tenant && <> · <b>{tenant.name}</b> ({accessStateLabel[tenant.tier]} · {tenant.seats} seats)</>}
            {user.nateConnectId && <> · NATE Connect ID <span className="mono">{user.nateConnectId}</span></>}
          </>
        }
        actions={
          <>
            {user.userType === 'b2c' && <button className="btn" onClick={() => setScholarship(true)}><Gift size={14} /> Issue scholarship</button>}
            <button className="btn" onClick={() => setIdAction(true)}><UploadCloud size={14} /> Replace ID</button>
          </>
        }
      />

      {user.integrityNote && (
        <Callout tone="danger">
          <b><ShieldAlert size={13} style={{ verticalAlign: -2 }} /> Integrity note</b> — {user.integrityNote.text}
          <span className="muted" style={{ marginLeft: 6 }}>({user.integrityNote.by}, {user.integrityNote.at})</span>
        </Callout>
      )}
      {user.accessState === 'scholarship' && user.scholarshipExpiry && (
        <Callout tone="info">Scholarship active — full access until <b>{user.scholarshipExpiry}</b>. Issued by an admin; expires automatically.</Callout>
      )}

      <div className="stats" style={{ marginBottom: 22 }}>
        <div className="stat"><div className="k"><GraduationCap size={13} /> Path items</div><div className="v">{user.pathAssigned.length + user.pathSelf.length}</div><div className="d">{user.pathAssigned.length} assigned · {user.pathSelf.length} self-added</div></div>
        <div className="stat"><div className="k"><Medal size={13} /> Awards</div><div className="v">{user.awards.length}</div></div>
        <div className="stat"><div className="k"><Sparkles size={13} /> Skills</div><div className="v">{user.skillIds.length}<span className="unit"> + {user.masteryIds.length} mastery</span></div></div>
        <div className="stat"><div className="k"><BadgeCheck size={13} /> ID status</div><div className="v" style={{ fontSize: 15, marginTop: 8 }}><StatusBadge status={user.idStatus} /></div></div>
      </div>

      <Tabs
        tabs={[
          { id: 'path', label: 'Path' },
          { id: 'awards', label: 'Awards & Skills' },
          { id: 'purchases', label: 'Entitlements' },
          { id: 'quiz', label: 'Quiz States' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'path' && (
        <div style={{ maxWidth: 760 }}>
          {user.pathAssigned.length > 0 && (
            <>
              <div className="section-title" style={{ fontSize: 13 }}>Assigned training <span className="muted" style={{ fontWeight: 450, fontSize: 12 }}>· always on top, only the company can remove or reorder</span></div>
              {user.pathAssigned.map((p, i) => pathItem(p, i, true))}
            </>
          )}
          <div className="section-title" style={{ fontSize: 13, marginTop: user.pathAssigned.length ? 22 : 0 }}>Self-added training</div>
          {user.pathSelf.map((p, i) => pathItem(p, i, false))}
          {user.pathSelf.length === 0 && <div className="muted" style={{ fontSize: 12.5 }}>Nothing self-added yet.</div>}
          <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>
            One Path per user; an item can appear once. If a company assigns something the user already self-added, the
            entry moves to Assigned Training. Removing from the Path never deletes progress.
          </p>
        </div>
      )}

      {tab === 'awards' && (
        <div className="two-col">
          <div>
            <div className="section-title" style={{ fontSize: 13 }}>Awards (portfolio order: Platinum → Bronze)</div>
            {user.awards.length === 0 && <div className="muted" style={{ fontSize: 12.5 }}>No awards earned yet.</div>}
            {user.awards.map((a) => {
              const award = db.awards.find((x) => x.id === a.awardId)
              const cert = award && db.certifications.find((c) => c.id === award.certificationId)
              const design = award && db.designs.find((d) => d.id === award.cardDesignId)
              return (
                <div className="card" key={a.number} style={{ marginBottom: 10, overflow: 'hidden' }}>
                  <div className="row" style={{ padding: '12px 16px' }}>
                    <div style={{ width: 76, height: 48, borderRadius: 7, background: design?.background ?? 'var(--surface-3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
                      {cert?.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="row">
                        <b style={{ fontSize: 13 }}>{en(cert?.name)}</b>
                        {award && <Badge tone={`tier-${award.tier}`}>{tierLabel[award.tier]}</Badge>}
                      </div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                        <span className="mono">{a.number}</span> · earned {a.date} · {award?.certificateDesignId ? 'Card + Certificate' : 'Card only'}
                      </div>
                    </div>
                    <button className="btn ghost sm" onClick={() => toast(`Public verification: skillcat.app/verify?code=${a.number} — no login required`)}><QrCode size={13} /> Verify</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div>
            <div className="section-title" style={{ fontSize: 13 }}>Skills</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {user.skillIds.map((sid) => {
                const s = db.skills.find((x) => x.id === sid)
                return s ? <Badge key={sid} tone="neutral"><span>{s.emoji}</span> {en(s.name)}</Badge> : null
              })}
              {user.skillIds.length === 0 && <span className="muted" style={{ fontSize: 12.5 }}>None yet.</span>}
            </div>
            <div className="section-title" style={{ fontSize: 13, marginTop: 20 }}>Mastery skills</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {user.masteryIds.map((mid) => {
                const m = db.masterySkills.find((x) => x.id === mid)
                return m ? <Badge key={mid} tone="purple">{m.emoji} {en(m.name)}</Badge> : null
              })}
              {user.masteryIds.length === 0 && <span className="muted" style={{ fontSize: 12.5 }}>None yet.</span>}
            </div>
          </div>
        </div>
      )}

      {tab === 'purchases' && (
        <div style={{ maxWidth: 700 }}>
          <div className="section-desc">
            Purchases create permanent entitlements immune to Access State changes — a lapsed subscriber keeps purchased
            certifications and unused quiz attempts. Refunds revoke the entitlement.
          </div>
          {user.entitlements.length === 0 && <div className="empty"><b>No purchases</b><p>Paid certifications and quiz attempts will show here.</p></div>}
          {user.entitlements.map((e, i) => (
            <div className="card" key={i} style={{ marginBottom: 10 }}>
              <div className="row" style={{ padding: '12px 16px' }}>
                <span className="task-type-ic" style={{ width: 32, height: 32, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <CreditCard size={15} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{e.label}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{e.detail}</div>
                </div>
                <Badge tone={e.kind === 'certification' ? 'teal' : 'accent'}>{e.kind === 'certification' ? 'Certification' : 'Quiz attempts'}</Badge>
                <button className="btn ghost sm" onClick={() => toast('Entitlement revoked (refund flow) — access removed')}>Revoke</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'quiz' && (
        <div style={{ maxWidth: 800 }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Quiz</th><th className="num">Attempts used</th><th className="num">Granted</th><th className="num">Best score</th><th>Cooldown</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
              </thead>
              <tbody>
                {user.quizState.map((qs) => {
                  const quiz = db.tasks.find((t) => t.id === qs.taskId)
                  return (
                    <tr key={qs.taskId}>
                      <td><Link to={`/tasks/${qs.taskId}`} className="main-cell" style={{ color: 'var(--accent)' }}>{en(quiz?.name)}</Link></td>
                      <td className="num">{qs.used}{quiz?.quiz?.maxAttempts !== 'unlimited' ? ` / ${quiz?.quiz?.maxAttempts}` : ''}</td>
                      <td className="num">{qs.granted > 0 ? `+${qs.granted}` : '—'}</td>
                      <td className="num">{qs.bestScore != null ? `${qs.bestScore}%` : '—'}</td>
                      <td>{qs.cooldownUntil ? <Badge tone="amber">until {qs.cooldownUntil}</Badge> : <span className="muted">—</span>}</td>
                      <td className="actions">
                        <button className="btn ghost sm" onClick={() => toast('Granted +1 attempt (audit-logged)')}>Grant attempt</button>
                        <button className="btn ghost sm" onClick={() => toast('Free attempt granted for this paid quiz')}>Free attempt</button>
                        <button className="btn ghost sm" onClick={() => toast('Marked complete — score recorded; bypasses proctoring review')}>Mark complete…</button>
                      </td>
                    </tr>
                  )
                })}
                {user.quizState.length === 0 && <tr><td colSpan={6}><div className="empty"><p>No quiz activity.</p></div></td></tr>}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Per-user overrides from the Admin Settings spec: grant additional attempts (including free attempts for paid
            quizzes), delete attempts, reset cooldowns, set completion with a score, and bypass a paid certification's
            paywall.
          </p>
        </div>
      )}

      {scholarship && (
        <Modal
          title="Issue scholarship"
          onClose={() => setScholarship(false)}
          footer={
            <>
              <button className="btn" onClick={() => setScholarship(false)}>Cancel</button>
              <button
                className="btn primary"
                onClick={() => {
                  update((d) => ({ ...d, users: d.users.map((u) => (u.id === user.id ? { ...u, accessState: 'scholarship', scholarshipExpiry: '2026-12-10' } : u)) }))
                  toast('Scholarship issued — full access, purchases allowed, final exams unlocked')
                  setScholarship(false)
                }}
              >
                Issue scholarship
              </button>
            </>
          }
        >
          <Field label="Expiry" required hint="Admin-issued override for B2C users only. The user moves to the Scholarship access state until expiry, then falls back to Starter.">
            <input className="input" type="date" defaultValue="2026-12-10" />
          </Field>
        </Modal>
      )}

      {idAction && (
        <Modal
          title="Upload replacement ID (Support)"
          onClose={() => setIdAction(false)}
          footer={
            <>
              <button className="btn" onClick={() => setIdAction(false)}>Cancel</button>
              <button
                className="btn primary"
                onClick={() => {
                  update((d) => ({ ...d, users: d.users.map((u) => (u.id === user.id ? { ...u, idStatus: idOutcome === 'approved' ? 'completed' : 'in-review' } : u)) }))
                  toast(idOutcome === 'approved' ? 'ID replaced & marked approved — dependent certifications stay completed' : 'ID replaced — left In-Review for the Proctoring Team')
                  setIdAction(false)
                }}
              >
                Upload & apply
              </button>
            </>
          }
        >
          <Callout tone="warn">
            Users can't replace an approved ID themselves — that would revert the ID-Upload task across every
            certification. Support uploads on their behalf; the previous ID is deleted and the upload is logged.
          </Callout>
          <div className="dropzone" style={{ padding: 22, marginBottom: 14 }}>
            <UploadCloud size={20} style={{ margin: '0 auto' }} />
            <b>Drop the new ID image</b>
            <p>JPEG or PNG</p>
          </div>
          <Field label="Outcome">
            <Seg
              options={[
                { value: 'approved', label: 'Mark as Approved' },
                { value: 'in-review', label: 'Leave as In-Review' },
              ]}
              value={idOutcome}
              onChange={setIdOutcome}
            />
          </Field>
          <div className="field-hint">
            “Mark as Approved” keeps the task Completed throughout — dependent certifications never flicker. “Leave as
            In-Review” queues it for the Proctoring Team if and when needed.
          </div>
        </Modal>
      )}
    </div>
  )
}
