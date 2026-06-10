import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Image, Video, Music, CheckSquare, AlertTriangle, Download, History } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, Callout, Field } from '../../components/ui'
import { en, relTime, initials, avatarColor } from '../../lib/utils'

export default function SubmissionReview() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const sub = db.submissions.find((s) => s.id === id)
  const [score, setScore] = useState(sub?.score ?? 7)
  const [feedback, setFeedback] = useState(sub?.feedback ?? '')

  if (!sub) return <div className="page"><PageHead title="Submission not found" /></div>

  const user = db.users.find((u) => u.id === sub.userId)!
  const task = db.tasks.find((t) => t.id === sub.taskId)!
  const passing = task.handsOn?.passingScore ?? 7
  const passed = score >= passing
  const history = db.submissions.filter((s) => s.userId === sub.userId && s.taskId === sub.taskId && s.id !== sub.id)

  const submitReview = () => {
    update((d) => ({
      ...d,
      submissions: d.submissions.map((s) =>
        s.id === sub.id ? { ...s, status: 'reviewed', score, passed, feedback, reviewer: 'Adriana Cole' } : s
      ),
    }))
    toast(passed ? `Scored ${score}/10 — passed. Task completes everywhere it's used; skills will be awarded.` : `Scored ${score}/10 — below the passing score of ${passing}. The user can resubmit if attempts remain.`)
    nav('/reviews')
  }

  const mediaIcon = { image: Image, video: Video, audio: Music }

  return (
    <div className="page wide">
      <PageHead
        crumbs={[{ label: 'Hands-On Reviews', to: '/reviews' }, { label: sub.id.toUpperCase() }]}
        title={`${en(task.name)} — attempt ${sub.attempt}`}
        badge={<StatusBadge status={sub.status} />}
        sub={
          <>
            Submitted by <Link to={`/users/${user.id}`} style={{ color: 'var(--accent)', fontWeight: 550 }}>{user.name}</Link> {relTime(sub.submittedAt)} · attempt {sub.attempt} of {sub.maxAttempts === 'unlimited' ? 'unlimited' : sub.maxAttempts} · passing score {passing}/10
          </>
        }
      />

      {sub.staleInstructions && (
        <Callout tone="warn">
          <b>The task's instructions changed after this submission.</b> The user submitted against the previous
          instructions — keep that in mind while scoring.
        </Callout>
      )}

      <div className="two-col" style={{ gridTemplateColumns: '1fr 380px' }}>
        <div>
          <div className="section-title">Project description</div>
          <div className="card pad" style={{ fontSize: 13.5, lineHeight: 1.65 }}>{sub.description}</div>

          <div className="section-title">Media evidence · {sub.media.length} files</div>
          <div className="frames-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {sub.media.map((m, i) => {
              const Icon = mediaIcon[m.kind]
              return (
                <div key={i} className="frame" style={{ aspectRatio: '4/3', background: m.kind === 'image' ? 'linear-gradient(150deg, #3d4254, #262a38)' : m.kind === 'video' ? 'linear-gradient(150deg, #4a3654, #2b2138)' : 'linear-gradient(150deg, #36544a, #213830)' }}>
                  <Icon size={26} />
                  <span className="t">{m.label}</span>
                </div>
              )
            })}
          </div>

          {history.length > 0 && (
            <>
              <div className="section-title"><History size={15} /> Previous attempts</div>
              <div className="card">
                {history.map((h) => (
                  <div key={h.id} className="row" style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600 }}>Attempt {h.attempt}</span>
                    <span className="muted">{relTime(h.submittedAt)}</span>
                    <div className="spacer" />
                    {h.status === 'reviewed' ? (
                      h.passed ? <Badge tone="green">{h.score}/10 · Passed</Badge> : <Badge tone="red">{h.score}/10 · Failed</Badge>
                    ) : (
                      <Badge tone="amber">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>Previous submissions are always preserved — never overwritten.</p>
            </>
          )}
        </div>

        <div className="side-card">
          {task.handsOn?.reviewerChecklist?.en && (
            <div className="card pad" style={{ marginBottom: 14, background: 'var(--blue-soft)', borderColor: '#cfe0f7' }}>
              <div className="row" style={{ marginBottom: 6 }}>
                <CheckSquare size={14} style={{ color: 'var(--blue)' }} />
                <b style={{ fontSize: 12.5, color: '#1d4d99' }}>Reviewer checklist</b>
                <span className="muted" style={{ fontSize: 11 }}>· never shown to the user</span>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: '#1d4d99' }}>{task.handsOn.reviewerChecklist.en}</div>
            </div>
          )}

          <div className="card pad">
            {sub.status === 'reviewed' ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Review outcome</div>
                <div className="row" style={{ marginBottom: 8 }}>
                  {sub.passed ? <Badge tone="green">Passed · {sub.score}/10</Badge> : <Badge tone="red">Failed · {sub.score}/10</Badge>}
                  <span className="muted" style={{ fontSize: 12 }}>by {sub.reviewer}</span>
                </div>
                {sub.feedback && <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{sub.feedback}</div>}
                <hr className="divider" />
                <div className="muted" style={{ fontSize: 11.5 }}>This attempt is locked. The user can submit a new attempt if any remain.</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Score this submission</div>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: passed ? 'var(--green)' : 'var(--red)' }}>
                    {score}<span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>/10</span>
                  </span>
                  {passed ? <Badge tone="green">Pass · ≥ {passing}</Badge> : <Badge tone="red">Below passing score</Badge>}
                </div>
                <input type="range" min={0} max={10} step={1} value={score} onChange={(e) => setScore(+e.target.value)} style={{ width: '100%', accentColor: passed ? 'var(--green)' : 'var(--red)' }} />
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-3)', marginBottom: 14 }}>
                  <span>0</span><span>passing: {passing}</span><span>10</span>
                </div>
                <Field label="Feedback to the user" optional hint="Informational only — doesn't affect completion.">
                  <textarea className="textarea" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What was done well, what to improve…" />
                </Field>
                <button className={`btn lg ${passed ? 'success-solid' : 'danger-solid'}`} style={{ width: '100%' }} onClick={submitReview}>
                  Submit review — {passed ? 'Pass' : 'Fail'} ({score}/10)
                </button>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 10, lineHeight: 1.5 }}>
                  Once submitted, this attempt locks. {passed ? 'Passing completes the task everywhere it is reused and triggers any linked Skills and Awards.' : 'The user keeps their preserved submission and can try again if attempts remain.'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
