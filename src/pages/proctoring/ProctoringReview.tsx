import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Check, X, RefreshCcw, User, ShieldAlert, BadgeCheck, Camera, Languages,
  Sparkles, AlertTriangle, Paperclip, CreditCard,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, Modal, Field, Callout, SwitchRow } from '../../components/ui'
import { en, relTime, initials, avatarColor } from '../../lib/utils'

const REJECT_TEMPLATES = [
  'Eyes were not focused on the camera',
  'Camera was not clear',
  'Camera wasn’t recording',
  'Custom reason…',
]

export default function ProctoringReview() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const entry = db.proctoring.find((p) => p.id === id)
  const [rejecting, setRejecting] = useState(false)
  const [requestingId, setRequestingId] = useState(false)
  const [template, setTemplate] = useState(REJECT_TEMPLATES[0])
  const [customMsg, setCustomMsg] = useState('')
  const [attachFrames, setAttachFrames] = useState(true)
  const [integrityNote, setIntegrityNote] = useState('')
  const [frameFilter, setFrameFilter] = useState<'all' | 'flagged'>('all')

  if (!entry) return <div className="page"><PageHead title="Entry not found" /></div>

  const user = db.users.find((u) => u.id === entry.userId)!
  const quiz = db.tasks.find((t) => t.id === entry.quizTaskId)
  const cert = db.certifications.find((c) => c.id === entry.certificationId)
  const isProctored = entry.category === 'proctored'
  const open = entry.status === 'in-review' || entry.status === 'id-reupload'

  const setStatus = (status: typeof entry.status, msg: string) => {
    update((d) => ({
      ...d,
      proctoring: d.proctoring.map((p) => (p.id === entry.id ? { ...p, status, resolvedBy: 'Adriana Cole', resolvedAt: '2026-06-10 10:00' } : p)),
      users:
        status === 'approved'
          ? d.users.map((u) => (u.id === user.id ? { ...u, idStatus: 'completed' } : u))
          : status === 'id-reupload'
            ? d.users.map((u) => (u.id === user.id ? { ...u, idStatus: 'reupload-requested' } : u))
            : d.users,
    }))
    toast(msg)
    nav('/proctoring')
  }

  const saveIntegrityNote = () => {
    if (!integrityNote.trim()) return
    update((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === user.id ? { ...u, integrityNote: { text: integrityNote, by: 'Adriana Cole', at: '2026-06-10' } } : u)),
    }))
  }

  const flaggedIdx = new Set(entry.ai.flaggedFrames.map((f) => f.index))
  const framesToShow = Array.from({ length: Math.min(entry.frameCount, 24) }, (_, i) => i)
    .filter((i) => frameFilter === 'all' || flaggedIdx.has(i + (entry.ai.flaggedFrames[0]?.index ?? 0) - (entry.ai.flaggedFrames[0] ? 0 : 0)) || (frameFilter === 'flagged' && entry.ai.flaggedFrames.some((f) => f.index % 24 === i)))

  return (
    <div className="page wide">
      <PageHead
        crumbs={[{ label: 'Proctoring', to: '/proctoring' }, { label: entry.id.toUpperCase() }]}
        title={`Review — ${user.name}`}
        badge={<StatusBadge status={entry.status} />}
        sub={
          <>
            {en(quiz?.name)} · scored <b>{entry.scorePct}%</b> · taken in {entry.language === 'es' ? 'Spanish' : 'English'} · submitted {relTime(entry.submittedAt)} — gating{' '}
            <Link to={`/certifications/${cert?.id}`} style={{ color: 'var(--accent)', fontWeight: 550 }}>{en(cert?.name)}</Link>
          </>
        }
        actions={
          open ? (
            <>
              <button className="btn" onClick={() => setRequestingId(true)}><RefreshCcw size={14} /> Request ID reupload</button>
              {isProctored && <button className="btn danger" onClick={() => setRejecting(true)}><X size={14} /> Reject attempt</button>}
              <button
                className="btn success-solid"
                onClick={() =>
                  setStatus(
                    'approved',
                    isProctored
                      ? 'Approved — ID verified, completions recorded, footage deleted, certification re-evaluated'
                      : 'ID approved — dependent certifications re-evaluated, awards issued'
                  )
                }
              >
                <Check size={14} /> {isProctored ? 'Accept attempt' : 'Approve ID'}
              </button>
            </>
          ) : (
            <Badge tone="neutral">Resolved by {entry.resolvedBy} · {entry.resolvedAt}</Badge>
          )
        }
      />

      {user.integrityNote && (
        <Callout tone="danger">
          <b><ShieldAlert size={13} style={{ verticalAlign: -2 }} /> Integrity note on this user</b> — {user.integrityNote.text}
          <span className="muted" style={{ marginLeft: 6 }}>({user.integrityNote.by}, {user.integrityNote.at})</span>
        </Callout>
      )}
      {entry.status === 'id-reupload' && (
        <Callout tone={entry.reuploadReady ? 'info' : 'warn'}>
          {entry.reuploadReady
            ? 'The user has uploaded a new ID — this entry is ready for re-review. The proctoring footage was retained.'
            : 'Waiting on the user to upload a new ID. They were notified with a deep link to skillcat.app/reupload-id; an automatic follow-up goes out after 3 days.'}
        </Callout>
      )}

      <div className="two-col" style={{ gridTemplateColumns: '1fr 360px' }}>
        <div>
          {isProctored ? (
            <>
              <div className="section-title">
                <Camera size={15} /> Proctoring footage
                <span className="muted" style={{ fontWeight: 450, fontSize: 12 }}>· {entry.frameCount} frames @ every {db.settings.webcamFrequencySec}s</span>
                <div className="spacer" />
                <div className="seg">
                  <button className={frameFilter === 'all' ? 'active' : ''} onClick={() => setFrameFilter('all')}>All frames</button>
                  <button className={frameFilter === 'flagged' ? 'active' : ''} onClick={() => setFrameFilter('flagged')}>
                    Flagged ({entry.ai.flaggedFrames.length})
                  </button>
                </div>
              </div>
              {entry.ai.flaggedFrames.length > 0 && (
                <Callout tone="warn">
                  <b>AI flagged {entry.ai.flaggedFrames.length} frames for review.</b> Flags are advisory only — they never trigger automatic action.
                </Callout>
              )}
              <div className="frames-grid">
                {(frameFilter === 'flagged'
                  ? entry.ai.flaggedFrames.map((f) => ({ i: f.index, flag: f }))
                  : framesToShow.map((i) => ({ i, flag: entry.ai.flaggedFrames.find((f) => f.index === i) }))
                ).map(({ i, flag }) => (
                  <div key={i} className={`frame ${flag ? 'flagged' : ''}`} title={flag ? flag.reason : `Frame ${i}`}>
                    {flag && <span className="flag-label">{flag.reason}</span>}
                    <User size={26} />
                    <span className="t">{flag?.time ?? `00:${String(Math.floor((i * db.settings.webcamFrequencySec) / 60)).padStart(2, '0')}:${String((i * db.settings.webcamFrequencySec) % 60).padStart(2, '0')}`}</span>
                  </div>
                ))}
                {frameFilter === 'all' && entry.frameCount > 24 && (
                  <div className="frame" style={{ background: 'var(--surface-3)', border: '1px dashed var(--border-2)', color: 'var(--text-3)', cursor: 'pointer' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>+{entry.frameCount - 24} more</span>
                  </div>
                )}
              </div>
              <p className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>
                Footage is deleted automatically on approval or rejection (with a short misclick buffer). While an ID
                reupload is pending, footage is retained until the entry is resolved.
              </p>
            </>
          ) : (
            <>
              <div className="section-title"><BadgeCheck size={15} /> ID verification</div>
              <Callout tone="info">
                This quiz isn't proctored — the passing attempt and its completions are already recorded. Only the ID is
                under review, and only the certification completion is waiting on it. There is no Reject action for
                ID-verification entries; an unacceptable ID is resolved through reupload.
              </Callout>
            </>
          )}

          {entry.sectionBreakdown && (
            <>
              <div className="section-title" style={{ marginTop: 26 }}>Section breakdown</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Section</th><th className="num">Score</th><th>Result</th><th>On approval</th></tr>
                  </thead>
                  <tbody>
                    {entry.sectionBreakdown.map((s) => (
                      <tr key={s.name}>
                        <td className="main-cell">{s.name}</td>
                        <td className="num">{s.scorePct}%</td>
                        <td>{s.passed ? <Badge tone="green" dot>Passed</Badge> : <Badge tone="red" dot>Failed</Badge>}</td>
                        <td style={{ fontSize: 12.5 }} className="muted-2">
                          {s.atStake ? 'Section completion will be recorded' : s.passed ? 'Already recorded / not needed' : 'Nothing recorded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="side-card">
          <div className="card pad">
            <div className="row" style={{ marginBottom: 12 }}>
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 12.5, background: avatarColor(user.id) }}>{initials(user.name)}</div>
              <div>
                <Link to={`/users/${user.id}`} style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--accent)' }}>{user.name}</Link>
                <div className="muted" style={{ fontSize: 11.5 }}>{user.email}</div>
              </div>
            </div>
            <div className="id-card">
              <div className="id-photo"><User size={30} /></div>
              <div style={{ flex: 1, fontSize: 12 }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <CreditCard size={13} style={{ color: 'var(--text-3)' }} />
                  <b style={{ fontSize: 12.5 }}>{entry.ai.idType}</b>
                </div>
                <div className="muted">Name on ID</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{entry.ai.idName}</div>
                {entry.idPreviouslyVerified ? (
                  <Badge tone="green"><BadgeCheck size={11} /> Previously verified</Badge>
                ) : (
                  <Badge tone="amber" dot>First-time review</Badge>
                )}
              </div>
            </div>
            {entry.idPreviouslyVerified && (
              <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
                The ID was approved earlier — you can skip ID checks and focus on the footage. All actions stay available.
              </div>
            )}

            <hr className="divider" />
            <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} style={{ color: 'var(--accent)' }} /> AI assistance <span className="muted" style={{ fontWeight: 450 }}>(advisory)</span>
            </div>
            <div className="stack" style={{ gap: 8, fontSize: 12.5 }}>
              <div className="row">
                <span style={{ flex: 1 }}>ID validity confidence</span>
                <b style={{ color: entry.ai.idConfidence >= 0.7 ? 'var(--green)' : 'var(--red)' }}>{Math.round(entry.ai.idConfidence * 100)}%</b>
              </div>
              <div className="prog green" style={{ marginTop: -4 }}>
                <div style={{ width: `${entry.ai.idConfidence * 100}%`, background: entry.ai.idConfidence >= 0.7 ? 'var(--green)' : 'var(--red)' }} />
              </div>
              <div className="row">
                <span style={{ flex: 1 }}>Name matches profile</span>
                {entry.ai.nameMatch ? <Badge tone="green">Match</Badge> : <Badge tone="red">Mismatch</Badge>}
              </div>
              {!entry.ai.nameMatch && (
                <div className="card" style={{ padding: 10, fontSize: 12, background: 'var(--amber-soft)', border: '1px solid #f0dfae' }}>
                  Profile: <b>{user.name}</b> · ID: <b>{entry.ai.idName}</b>
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="btn sm" onClick={() => toast(`SkillCat profile name updated to “${entry.ai.idName}”`)}>Use ID name</button>
                    <button className="btn sm">Edit manually</button>
                  </div>
                </div>
              )}
            </div>
            <hr className="divider" />
            <div className="stack" style={{ gap: 6, fontSize: 12.5 }}>
              <div className="row"><Languages size={13} style={{ color: 'var(--text-3)' }} /><span style={{ flex: 1 }}>Attempt language</span><b>{entry.language.toUpperCase()}</b></div>
              <div className="row"><span style={{ flex: 1 }}>ID status on profile</span><StatusBadge status={user.idStatus} /></div>
              {quiz?.quiz?.nate && <div className="row"><span style={{ flex: 1 }}>NATE</span><Badge tone="purple">Result sent on resolution</Badge></div>}
            </div>
          </div>
        </div>
      </div>

      {rejecting && (
        <Modal
          title="Reject proctored attempt"
          onClose={() => setRejecting(false)}
          footer={
            <>
              <button className="btn" onClick={() => setRejecting(false)}>Cancel</button>
              <button
                className="btn danger-solid"
                onClick={() => {
                  saveIntegrityNote()
                  setStatus('rejected', 'Attempt rejected & deleted — user regains the attempt and is notified with the reason')
                }}
              >
                Reject & notify user
              </button>
            </>
          }
        >
          <Callout tone="danger">
            The passing attempt is <b>deleted</b> — the user regains one attempt and no completions are recorded. Prior
            attempts are unaffected. The ID status doesn't change. The proctoring report is deleted after rejection.
          </Callout>
          <Field label="Reason template" required>
            <select className="select" value={template} onChange={(e) => setTemplate(e.target.value)}>
              {REJECT_TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          {template === 'Custom reason…' && (
            <Field label="Custom message" required>
              <textarea className="textarea" value={customMsg} onChange={(e) => setCustomMsg(e.target.value)} placeholder="Explain why the attempt was rejected…" />
            </Field>
          )}
          <SwitchRow
            label="Attach flagged frames"
            desc={`Include ${entry.ai.flaggedFrames.length || 'selected'} footage images in the notification so the user sees why.`}
            checked={attachFrames}
            onChange={setAttachFrames}
          />
          <Field label="Integrity note" optional hint="Internal only — attached to the user, shown prominently to future reviewers. Replaces any existing note.">
            <textarea className="textarea" value={integrityNote} onChange={(e) => setIntegrityNote(e.target.value)} placeholder="e.g. Second person visible at 00:09:40…" />
          </Field>
        </Modal>
      )}

      {requestingId && (
        <Modal
          title="Request ID reupload"
          onClose={() => setRequestingId(false)}
          footer={
            <>
              <button className="btn" onClick={() => setRequestingId(false)}>Cancel</button>
              <button
                className="btn primary"
                onClick={() => {
                  saveIntegrityNote()
                  setStatus('id-reupload', 'ID rejected & deleted — user notified with a deep link to the reupload screen')
                }}
              >
                Request reupload
              </button>
            </>
          }
        >
          <Callout tone="warn">
            The current ID is <b>deleted from the system</b> and the ID-Upload task moves to Incomplete (Reupload
            Requested). The user gets an in-app notification, email and SMS with a deep link to{' '}
            <span className="mono">skillcat.app/reupload-id</span>. {isProctored && 'The footage is retained until this is resolved.'}{' '}
            This entry moves to the ID Re-Uploads tab; a follow-up reminder goes out automatically after 3 days.
          </Callout>
          <Field label="Integrity note" optional hint="Internal only. Replaces any existing note on the user.">
            <textarea className="textarea" value={integrityNote} onChange={(e) => setIntegrityNote(e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}
