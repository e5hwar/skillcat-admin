import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, Tabs, SearchInput } from '../../components/ui'
import { en, relTime } from '../../lib/utils'

export default function Proctoring() {
  const { db } = useStore()
  const nav = useNavigate()
  const [tab, setTab] = useState('proctored')
  const [q, setQ] = useState('')

  const proctored = db.proctoring.filter((p) => p.category === 'proctored' && p.status === 'in-review')
  const idVerif = db.proctoring.filter((p) => p.category === 'id-verification' && p.status === 'in-review')
  const reuploads = db.proctoring.filter((p) => p.status === 'id-reupload')
  const resolved = db.proctoring.filter((p) => p.status === 'approved' || p.status === 'rejected')

  const list = useMemo(() => {
    const base = tab === 'proctored' ? proctored : tab === 'id' ? idVerif : tab === 'reuploads' ? reuploads : resolved
    if (!q) return base
    return base.filter((p) => {
      const u = db.users.find((x) => x.id === p.userId)
      return u?.name.toLowerCase().includes(q.toLowerCase()) || u?.email.toLowerCase().includes(q.toLowerCase())
    })
  }, [tab, q, db])

  return (
    <div className="page wide">
      <PageHead
        title="Proctoring Dashboard"
        sub="Entries appear only when human review is the last thing between a user and a Certification completion. All decisions are made by a human — AI only assists."
        actions={<Badge tone="neutral"><Clock size={11} /> Webcam capture: every {db.settings.webcamFrequencySec}s</Badge>}
      />

      <Tabs
        tabs={[
          { id: 'proctored', label: 'Proctored Quizzes', count: proctored.length, alert: true },
          { id: 'id', label: 'ID Verification', count: idVerif.length, alert: true },
          { id: 'reuploads', label: 'ID Re-Uploads', count: reuploads.length },
          { id: 'resolved', label: 'Resolved', count: resolved.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search by user…" />
        <div className="spacer" />
        {tab === 'proctored' && <span className="muted" style={{ fontSize: 12 }}>ID + footage reviewed together; backend keeps them independent.</span>}
        {tab === 'id' && <span className="muted" style={{ fontSize: 12 }}>Quiz already completed — only the ID gates the certification. Previously-approved IDs auto-approve and never appear here.</span>}
        {tab === 'reuploads' && <span className="muted" style={{ fontSize: 12 }}>Waiting on users. Auto follow-up notification after 3 days.</span>}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Quiz</th>
              <th>Gating certification</th>
              <th className="num">Score</th>
              <th>AI signals</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const u = db.users.find((x) => x.id === p.userId)
              const quiz = db.tasks.find((t) => t.id === p.quizTaskId)
              const cert = db.certifications.find((c) => c.id === p.certificationId)
              return (
                <tr key={p.id} className="click" onClick={() => nav(`/proctoring/${p.id}`)}>
                  <td>
                    <div className="main-cell">{u?.name} {u?.integrityNote && <ShieldAlert size={13} style={{ color: 'var(--red)', verticalAlign: -2 }} />}</div>
                    <div className="sub-cell">{u?.email} · {p.language.toUpperCase()}</div>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{en(quiz?.name)}</td>
                  <td style={{ fontSize: 12.5 }}>
                    <span className="row" style={{ gap: 6 }}>
                      <span className="cert-thumb" style={{ background: cert?.graphic, width: 26, height: 20, fontSize: 10 }}>{cert?.emoji}</span>
                      {en(cert?.name)}
                    </span>
                  </td>
                  <td className="num"><b>{p.scorePct}%</b></td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {p.ai.flaggedFrames.length > 0 && <Badge tone="red">{p.ai.flaggedFrames.length} flagged frames</Badge>}
                      {!p.ai.nameMatch && <Badge tone="amber">Name mismatch</Badge>}
                      {p.ai.idConfidence < 0.7 && <Badge tone="amber">Low ID confidence</Badge>}
                      {p.idPreviouslyVerified && <Badge tone="green">ID previously verified</Badge>}
                      {p.status === 'id-reupload' && p.reuploadReady && <Badge tone="blue" dot>New ID uploaded — ready</Badge>}
                      {p.ai.flaggedFrames.length === 0 && p.ai.nameMatch && p.ai.idConfidence >= 0.7 && p.status === 'in-review' && !p.idPreviouslyVerified && (
                        <span className="muted" style={{ fontSize: 12 }}><CheckCircle2 size={12} style={{ verticalAlign: -2, color: 'var(--green)' }} /> No flags</span>
                      )}
                    </div>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="muted">{relTime(p.submittedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="empty">
            <div className="ic"><Video size={18} /></div>
            <b>Queue is clear</b>
            <p>Nothing waiting on review here. Entries are created only when a certification is gated on human review.</p>
          </div>
        )}
      </div>
    </div>
  )
}
