import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MessageSquareText, Copy } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, SearchInput } from '../../components/ui'
import { uid } from '../../lib/utils'

export default function FeedbackForms() {
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')

  const list = db.feedbackForms.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()))

  const duplicate = (id: string) => {
    const src = db.feedbackForms.find((f) => f.id === id)!
    const newId = `fb-${uid()}`
    update((d) => ({
      ...d,
      feedbackForms: [
        ...d.feedbackForms,
        { ...src, id: newId, name: `${src.name} (copy)`, status: 'draft', version: 1, triggers: [], responses: [], versionHistory: [{ version: 1, date: '2026-06-10', by: 'Adriana Cole', note: `Duplicated from ${src.name}` }] },
      ],
    }))
    toast('Form duplicated — fully independent from the original')
    nav(`/feedback-forms/${newId}`)
  }

  return (
    <div className="page wide">
      <PageHead
        title="Feedback Forms"
        sub="Optional feedback collected at milestones. A user submits a given form at most once; dismissing keeps it eligible for the next trigger."
        actions={
          <button
            className="btn primary"
            onClick={() => {
              const id = `fb-${uid()}`
              update((d) => ({
                ...d,
                feedbackForms: [...d.feedbackForms, { id, name: 'Untitled form', status: 'draft', version: 1, questions: [], triggers: [], responses: [], versionHistory: [{ version: 1, date: '2026-06-10', by: 'Adriana Cole', note: 'Initial version' }] }],
              }))
              nav(`/feedback-forms/${id}`)
            }}
          >
            <Plus size={14} /> New form
          </button>
        }
      />
      <div className="toolbar"><SearchInput value={q} onChange={setQ} /></div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Form</th>
              <th>Status</th>
              <th className="num">Version</th>
              <th>Triggers</th>
              <th className="num">Questions</th>
              <th className="num" style={{ textAlign: 'right' }}>Responses</th>
              <th className="actions" />
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className="click" onClick={() => nav(`/feedback-forms/${f.id}`)}>
                <td><div className="main-cell">{f.name}</div><div className="sub-cell">Internal name — never shown to users</div></td>
                <td><StatusBadge status={f.status} /></td>
                <td className="num">v{f.version}</td>
                <td>
                  {f.triggers.length === 0 ? <span className="muted">No triggers</span> : (
                    <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{f.triggers.length} completion trigger{f.triggers.length > 1 ? 's' : ''}</span>
                  )}
                </td>
                <td className="num">{f.questions.length}</td>
                <td className="num" style={{ textAlign: 'right' }}>{f.responses.length}</td>
                <td className="actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn ghost sm" onClick={() => duplicate(f.id)}><Copy size={12} /> Duplicate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="empty">
            <div className="ic"><MessageSquareText size={18} /></div>
            <b>No feedback forms</b>
          </div>
        )}
      </div>
    </div>
  )
}
