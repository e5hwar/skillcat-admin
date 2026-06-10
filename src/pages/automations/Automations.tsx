import { Link } from 'react-router-dom'
import { FileSpreadsheet, DatabaseZap, ArrowRight, History } from 'lucide-react'
import { PageHead, Badge } from '../../components/ui'

export default function Automations() {
  return (
    <div className="page">
      <PageHead
        title="Content Automations"
        sub="Bulk-create content from the Content Team's existing spreadsheets. Everything imported follows the same rules as GUI-created content — validation runs fully before anything is created."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Link to="/automations/questions" className="card pad" style={{ display: 'block' }}>
          <div className="row" style={{ marginBottom: 10 }}>
            <span className="task-type-ic" style={{ width: 38, height: 38, background: 'var(--purple-soft)', color: 'var(--purple)' }}>
              <DatabaseZap size={19} />
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Bulk Quiz Question Upload</div>
              <div className="muted" style={{ fontSize: 12 }}>CSV → Question Bank</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
            One row per question — True/False, Multiple Choice, and Match the Following, with EN/ES text, per-option
            grades, and feedback. Categories are created automatically if they don't exist.
          </p>
          <div className="row" style={{ marginTop: 12, color: 'var(--accent)', fontSize: 12.5, fontWeight: 550 }}>
            Start upload <ArrowRight size={13} />
          </div>
        </Link>

        <Link to="/automations/certification" className="card pad" style={{ display: 'block' }}>
          <div className="row" style={{ marginBottom: 10 }}>
            <span className="task-type-ic" style={{ width: 38, height: 38, background: 'var(--teal-soft)', color: 'var(--teal)' }}>
              <FileSpreadsheet size={19} />
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Certification Creation</div>
              <div className="muted" style={{ fontSize: 12 }}>Two-sheet Excel → full certification</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
            Sheet 1 holds certification metadata and content links; Sheet 2 holds one row per Task with courses, lessons
            and type-specific settings (xAPI, Quiz, Hands-On). Created Hidden for review before publishing.
          </p>
          <div className="row" style={{ marginTop: 12, color: 'var(--accent)', fontSize: 12.5, fontWeight: 550 }}>
            Start import <ArrowRight size={13} />
          </div>
        </Link>
      </div>

      <div className="section-title" style={{ marginTop: 30 }}><History size={15} style={{ color: 'var(--text-3)' }} /> Recent imports</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Import</th><th>Type</th><th>Result</th><th>By</th><th>When</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="main-cell">epa-type2-questions-june.csv</td>
              <td><Badge tone="purple">Questions</Badge></td>
              <td><Badge tone="green">84 questions created</Badge></td>
              <td>Adriana Cole</td>
              <td className="muted">2026-06-08 16:40</td>
            </tr>
            <tr>
              <td className="main-cell">multimeter-v2.xlsx</td>
              <td><Badge tone="teal">Certification</Badge></td>
              <td><Badge tone="green">1 cert · 2 courses · 9 tasks</Badge></td>
              <td>Adriana Cole</td>
              <td className="muted">2026-04-21 11:05</td>
            </tr>
            <tr>
              <td className="main-cell">nate-question-pool.csv</td>
              <td><Badge tone="purple">Questions</Badge></td>
              <td><Badge tone="red">Failed validation — 3 errors</Badge></td>
              <td>Priya Raman</td>
              <td className="muted">2026-04-02 09:18</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
