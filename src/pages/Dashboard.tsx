import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap, Layers, Users, Medal, Video, ClipboardCheck, Megaphone, ArrowRight,
  ArrowUpRight, UploadCloud, Plus, History,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { PageHead, Badge, StatusBadge } from '../components/ui'
import { en, fmtNum, relTime, initials, avatarColor } from '../lib/utils'

export default function Dashboard() {
  const { db } = useStore()
  const nav = useNavigate()

  const proctorQueue = db.proctoring.filter((p) => p.status === 'in-review' || (p.status === 'id-reupload' && p.reuploadReady))
  const handsOnQueue = db.submissions.filter((s) => s.status === 'pending')
  const spotlightQueue = db.spotlights.filter((s) => s.status === 'pending')
  const awardsIssued = db.awards.reduce((a, b) => a + b.issued, 0)

  const queues = [
    {
      to: '/proctoring', icon: Video, label: 'Proctoring review', count: proctorQueue.length,
      desc: 'Attempts gating a Certification completion', tone: '#cd2b31', bg: 'var(--red-soft)',
    },
    {
      to: '/reviews', icon: ClipboardCheck, label: 'Hands-On submissions', count: handsOnQueue.length,
      desc: 'Awaiting a score from a SkillCat reviewer', tone: '#18794e', bg: 'var(--green-soft)',
    },
    {
      to: '/spotlights', icon: Megaphone, label: 'Spotlight approvals', count: spotlightQueue.length,
      desc: 'Submitted and waiting for an approver', tone: '#9a6c00', bg: 'var(--amber-soft)',
    },
  ]

  return (
    <div className="page">
      <PageHead
        title="Good morning, Adriana"
        sub="Tuesday, June 10 — here's what needs attention across the platform."
        actions={
          <>
            <button className="btn" onClick={() => nav('/automations')}><UploadCloud size={14} /> Import content</button>
            <button className="btn primary" onClick={() => nav('/certifications')}><Plus size={14} /> New certification</button>
          </>
        }
      />

      <div className="stats">
        <Link className="stat" to="/certifications">
          <div className="k"><GraduationCap size={13} /> Certifications</div>
          <div className="v">{db.certifications.filter((c) => c.visibility === 'visible').length} <span className="unit">live</span></div>
          <div className="d">{db.certifications.filter((c) => c.visibility !== 'visible').length} hidden or archived</div>
        </Link>
        <Link className="stat" to="/tasks">
          <div className="k"><Layers size={13} /> Tasks</div>
          <div className="v">{db.tasks.length}</div>
          <div className="d">{db.tasks.filter((t) => t.type === 'quiz').length} quizzes · {db.questions.length} bank questions</div>
        </Link>
        <Link className="stat" to="/users">
          <div className="k"><Users size={13} /> Learners</div>
          <div className="v">38,412</div>
          <div className="d"><span style={{ color: 'var(--green)', fontWeight: 600 }}>↑ 4.2%</span> vs. last 30 days</div>
        </Link>
        <Link className="stat" to="/awards">
          <div className="k"><Medal size={13} /> Awards issued</div>
          <div className="v">{fmtNum(awardsIssued)}</div>
          <div className="d">All time, across {db.awards.length} awards</div>
        </Link>
      </div>

      <div className="section-title" style={{ marginTop: 28 }}>Review queues</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {queues.map((q) => {
          const Icon = q.icon
          return (
            <Link to={q.to} key={q.to} className="card pad" style={{ display: 'flex', gap: 13, alignItems: 'flex-start', transition: 'box-shadow .12s' }}>
              <span className="task-type-ic" style={{ width: 34, height: 34, background: q.bg, color: q.tone }}>
                <Icon size={17} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {q.label}
                  <span style={{ fontSize: 16, fontWeight: 650, marginLeft: 'auto', color: q.count > 0 ? q.tone : 'var(--text-3)' }}>{q.count}</span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{q.desc}</div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="two-col" style={{ marginTop: 28, gridTemplateColumns: '1fr 380px' }}>
        <div>
          <div className="section-title">Top certifications</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Certification</th><th>Status</th><th style={{ textAlign: 'right' }}>Enrolled</th><th style={{ width: 160 }}>Completion</th></tr>
              </thead>
              <tbody>
                {[...db.certifications]
                  .filter((c) => c.owner === 'skillcat')
                  .sort((a, b) => b.enrolled - a.enrolled)
                  .slice(0, 6)
                  .map((c) => {
                    const pct = Math.round((c.completed / Math.max(c.enrolled, 1)) * 100)
                    return (
                      <tr key={c.id} className="click" onClick={() => nav(`/certifications/${c.id}`)}>
                        <td>
                          <div className="row">
                            <span className="cert-thumb" style={{ background: c.graphic }}>{c.emoji}</span>
                            <div>
                              <div className="main-cell">{en(c.name)}</div>
                              <div className="sub-cell">{c.certType ?? 'unit'}</div>
                            </div>
                          </div>
                        </td>
                        <td><StatusBadge status={c.visibility} /></td>
                        <td className="num" style={{ textAlign: 'right' }}>{fmtNum(c.enrolled)}</td>
                        <td>
                          <div className="row">
                            <div className="prog" style={{ flex: 1 }}><div style={{ width: `${pct}%` }} /></div>
                            <span className="muted" style={{ fontSize: 11.5, width: 32, textAlign: 'right' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="section-title"><History size={15} style={{ color: 'var(--text-3)' }} /> Recent activity</div>
          <div className="card">
            {db.audit.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: i < db.audit.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="avatar" style={{ width: 24, height: 24, fontSize: 9.5, background: avatarColor(e.actor) }}>{initials(e.actor)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                    <b style={{ fontWeight: 600 }}>{e.actor}</b> <span className="muted-2">{e.action.toLowerCase()}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.target}</div>
                </div>
                <span className="muted" style={{ fontSize: 11, flexShrink: 0 }}>{relTime(e.at)}</span>
              </div>
            ))}
          </div>

          <div className="card pad" style={{ marginTop: 14, background: 'linear-gradient(140deg, #f6f6fe, #efeffc)', border: '1px solid var(--accent-border)' }}>
            <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--accent)' }}>
              <Megaphone size={14} /> Spanish coverage
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: '6px 0 10px' }}>
              87% of live content metadata has Spanish translations. 14 fields fall back to English.
            </p>
            <Link to="/certifications" className="btn sm" style={{ background: '#fff' }}>Review gaps <ArrowRight size={12} /></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
