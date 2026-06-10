import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, XCircle, CheckCircle2, Download, ArrowRight, ArrowLeft } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, Callout } from '../../components/ui'

const ERRORS = [
  { row: 12, col: 'Correct Answer', msg: 'References option “E” but only options A–D are provided' },
  { row: 27, col: 'Type', msg: '“multi-choice” is not a valid type — use truefalse, multichoice, or matching' },
  { row: 31, col: 'Option B', msg: 'Matching question: Option A has 4 lines but Option B has 3 — counts must match' },
]

const PREVIEW = [
  { cat: 'EPA 608 › Type 2', type: 'multichoice', q: 'What is the maximum factory-set pressure for a high-pressure appliance relief valve?', es: true },
  { cat: 'EPA 608 › Type 2', type: 'truefalse', q: 'A reclaimed refrigerant must meet ARI 700 purity standards before resale.', es: true },
  { cat: 'EPA 608 › Type 2', type: 'matching', q: 'Match the recovery method to the appliance condition.', es: false },
  { cat: 'EPA 608 › Core', type: 'multichoice', q: 'Which gas is used to pressurize a system for leak detection?', es: true },
]

export default function QuestionUploadWizard() {
  const { toast } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0) // 0 upload, 1 errors, 2 valid preview, 3 done
  const [withErrors, setWithErrors] = useState(true)

  const steps = ['Upload file', 'Validate', 'Review & confirm']
  const stepIdx = step === 0 ? 0 : step === 1 || step === 2 ? 1 : 2

  return (
    <div className="page">
      <PageHead
        crumbs={[{ label: 'Automations', to: '/automations' }, { label: 'Bulk Quiz Question Upload' }]}
        title="Bulk Quiz Question Upload"
        sub="The whole file is validated before any questions are created — a single error blocks the entire import."
        actions={<button className="btn"><Download size={14} /> Download CSV template</button>}
      />

      <div className="steps">
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'contents' }}>
            {i > 0 && <div className="step-line" />}
            <div className={`step ${i === stepIdx ? 'active' : i < stepIdx ? 'done' : ''}`}>
              <span className="n">{i < stepIdx ? '✓' : i + 1}</span>
              {s}
            </div>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ maxWidth: 640 }}>
          <div className="dropzone" onClick={() => setStep(withErrors ? 1 : 2)}>
            <UploadCloud size={28} style={{ margin: '0 auto' }} />
            <b>Drop a CSV here, or click to browse</b>
            <p>One row per question · headers in row 1 · UTF-8 · pipe-delimited also accepted</p>
          </div>
          <div className="row" style={{ marginTop: 14, fontSize: 12.5 }}>
            <label className="row" style={{ cursor: 'pointer', gap: 6 }}>
              <input type="checkbox" checked={withErrors} onChange={(e) => setWithErrors(e.target.checked)} />
              <span className="muted">Demo: simulate a file containing validation errors</span>
            </label>
          </div>
          <div className="section-title" style={{ marginTop: 26 }}>Expected columns</div>
          <div className="card pad" style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8 }}>
            <span className="mono">Category*</span> · <span className="mono">Sub-Category</span> · <span className="mono">Question (EN)*</span> · <span className="mono">Question (ES)</span> · <span className="mono">Type*</span> (truefalse / multichoice / matching) · <span className="mono">Option A–J (EN/ES)</span> · <span className="mono">Correct Answer</span> (e.g. “A, C” or “A:50;C:50”) · <span className="mono">Correct/Incorrect/Partially Correct Feedback (EN/ES)</span> · <span className="mono">Randomise Options</span>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ maxWidth: 720 }}>
          <Callout tone="danger">
            <b>Validation failed — no questions were created.</b> Fix the rows below and re-upload the file.
          </Callout>
          <div className="card">
            <div className="card-head"><FileText size={14} style={{ color: 'var(--text-3)' }} /><h3>epa-type2-questions-june.csv · 87 rows</h3><Badge tone="red">{ERRORS.length} errors</Badge></div>
            {ERRORS.map((e, i) => (
              <div key={i} className="row" style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                <XCircle size={15} style={{ color: 'var(--red)', marginTop: 1 }} />
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--red)', width: 64 }}>Row {e.row}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{e.col}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{e.msg}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(0)}><ArrowLeft size={14} /> Upload a fixed file</button>
            <button className="btn ghost" onClick={() => { setWithErrors(false); setStep(2) }}>Demo: continue with a valid file</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: 760 }}>
          <Callout tone="info">
            <b>Validation passed.</b> 84 questions are ready to create. Review the summary and confirm — nothing has been
            written yet.
          </Callout>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
            <div className="stat"><div className="k">Questions</div><div className="v">84</div></div>
            <div className="stat"><div className="k">Multiple choice</div><div className="v">61</div></div>
            <div className="stat"><div className="k">True / False</div><div className="v">17</div></div>
            <div className="stat"><div className="k">Matching</div><div className="v">6</div></div>
          </div>
          <div className="card" style={{ marginBottom: 6 }}>
            <div className="card-head"><h3>Preview — first rows</h3><span className="muted" style={{ fontSize: 12 }}>New sub-category “Type 2 (June)” will be created automatically</span></div>
            <table className="table">
              <thead><tr><th>Category</th><th>Type</th><th style={{ width: '55%' }}>Question</th><th>ES</th></tr></thead>
              <tbody>
                {PREVIEW.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 12 }} className="muted-2">{p.cat}</td>
                    <td><Badge tone="purple">{p.type}</Badge></td>
                    <td style={{ fontSize: 12.5 }}>{p.q}</td>
                    <td>{p.es ? <Badge tone="green">✓</Badge> : <Badge tone="amber">EN only</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setStep(0)}>Cancel</button>
            <button className="btn primary" onClick={() => setStep(3)}>Create 84 questions <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: 560, textAlign: 'center', padding: '40px 0' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--green)', margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>84 questions created</h2>
          <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
            All imported as <b>Active</b> in EPA 608 › Type 2 (June). They behave exactly like questions created through
            the GUI — versioned, reusable across quizzes, and editable in the Question Bank.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => { setStep(0); setWithErrors(true) }}>Upload another file</button>
            <button className="btn primary" onClick={() => { toast('84 questions added to the bank'); nav('/question-bank') }}>Open Question Bank</button>
          </div>
        </div>
      )}
    </div>
  )
}
