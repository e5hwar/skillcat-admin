import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Image, Video, Music, AlertTriangle } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, Tabs, SearchInput } from '../../components/ui'
import { en, relTime } from '../../lib/utils'

export default function ReviewQueue() {
  const { db } = useStore()
  const nav = useNavigate()
  const [tab, setTab] = useState('pending')
  const [q, setQ] = useState('')

  const pending = db.submissions.filter((s) => s.status === 'pending')
  const reviewed = db.submissions.filter((s) => s.status === 'reviewed')

  const list = useMemo(() => {
    const base = tab === 'pending' ? pending : reviewed
    if (!q) return base
    return base.filter((s) => db.users.find((u) => u.id === s.userId)?.name.toLowerCase().includes(q.toLowerCase()))
  }, [tab, q, db])

  return (
    <div className="page wide">
      <PageHead
        title="Hands-On Reviews"
        sub="Submissions for SkillCat-created Hands-On Tasks. Scored on a 10-point scale against each task's passing score. Tenant-created tasks are reviewed by the company, not here."
      />
      <Tabs
        tabs={[
          { id: 'pending', label: 'Awaiting review', count: pending.length, alert: true },
          { id: 'reviewed', label: 'Reviewed', count: reviewed.length },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search by user…" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Task</th>
              <th>Attempt</th>
              <th>Evidence</th>
              {tab === 'reviewed' && <th>Score</th>}
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const u = db.users.find((x) => x.id === s.userId)
              const t = db.tasks.find((x) => x.id === s.taskId)
              const imgs = s.media.filter((m) => m.kind === 'image').length
              const vids = s.media.filter((m) => m.kind === 'video').length
              const auds = s.media.filter((m) => m.kind === 'audio').length
              return (
                <tr key={s.id} className="click" onClick={() => nav(`/reviews/${s.id}`)}>
                  <td>
                    <div className="main-cell">{u?.name}</div>
                    <div className="sub-cell">{u?.email}</div>
                  </td>
                  <td style={{ fontSize: 12.5 }}>
                    {en(t?.name)}
                    {s.staleInstructions && (
                      <div style={{ marginTop: 3 }}>
                        <Badge tone="amber"><AlertTriangle size={10} /> Submitted against older instructions</Badge>
                      </div>
                    )}
                  </td>
                  <td className="num">{s.attempt} of {s.maxAttempts === 'unlimited' ? '∞' : s.maxAttempts}</td>
                  <td>
                    <div className="row" style={{ gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
                      {imgs > 0 && <span className="row" style={{ gap: 3 }}><Image size={13} /> {imgs}</span>}
                      {vids > 0 && <span className="row" style={{ gap: 3 }}><Video size={13} /> {vids}</span>}
                      {auds > 0 && <span className="row" style={{ gap: 3 }}><Music size={13} /> {auds}</span>}
                    </div>
                  </td>
                  {tab === 'reviewed' && (
                    <td>
                      {s.passed ? <Badge tone="green">{s.score}/10 · Passed</Badge> : <Badge tone="red">{s.score}/10 · Failed</Badge>}
                    </td>
                  )}
                  <td className="muted">{relTime(s.submittedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="empty">
            <div className="ic"><ClipboardCheck size={18} /></div>
            <b>Nothing to review</b>
            <p>New submissions will appear here the moment users submit.</p>
          </div>
        )}
      </div>
    </div>
  )
}
