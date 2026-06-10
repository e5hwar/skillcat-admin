import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, CheckCircle2, ArrowRight, FileSpreadsheet, BookOpen, Download } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, Callout, TaskTypeIcon } from '../../components/ui'
import type { TaskType } from '../../lib/types'

const SHEET1 = [
  ['Name (EN)', 'Domestic Refrigerators Basics'],
  ['Name (ES)', 'Fundamentos de refrigeradores domésticos'],
  ['Career Stage', 'Apprentice'],
  ['Time to Complete', '4 hours'],
  ['Industries', 'Appliance Repair'],
  ['Sub-Industries', 'Appliance Repair > Refrigeration'],
  ['Prerequisities', 'Intro to HVAC'],
  ['Recommended', 'Using a Multimeter v2'],
]

const SHEET2: { course: string; lesson?: string; task: string; type: TaskType; detail: string }[] = [
  { course: 'How Refrigerators Work', task: 'Refrigerator Anatomy', type: 'xapi', detail: 'xAPI · EN + ES packages' },
  { course: 'How Refrigerators Work', task: 'The Sealed System', type: 'xapi', detail: 'xAPI · EN + ES packages' },
  { course: 'How Refrigerators Work', task: 'Anatomy Checkpoint', type: 'quiz', detail: 'Quiz · pulls Appliance Repair > Refrigeration · draw 8 · pass 80%' },
  { course: 'Diagnostics', lesson: 'Temperature Diagnostics', task: 'Reading Compartment Temps', type: 'xapi', detail: 'xAPI · EN only' },
  { course: 'Diagnostics', lesson: 'Temperature Diagnostics', task: 'Diagnose a Warm Fridge', type: 'hands-on', detail: 'Hands-On · pass 7/10 · images + videos' },
  { course: 'Diagnostics', task: 'Final Exam', type: 'quiz', detail: 'Quiz · draw 12 · pass 80%' },
]

export default function CertImportWizard() {
  const { toast } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)

  const steps = ['Upload workbook', 'Validate & preview', 'Create']
  const stepIdx = step

  return (
    <div className="page">
      <PageHead
        crumbs={[{ label: 'Automations', to: '/automations' }, { label: 'Certification Creation' }]}
        title="Certification Creation from Spreadsheet"
        sub="Turns the Content Team's planning workbook into a full certification — courses, lessons and tasks included."
        actions={<button className="btn"><Download size={14} /> Download .xlsx template</button>}
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
          <div className="dropzone" onClick={() => setStep(1)}>
            <FileSpreadsheet size={28} style={{ margin: '0 auto' }} />
            <b>Drop a two-sheet .xlsx here, or click to browse</b>
            <p>Sheet 1: Certification metadata + content links · Sheet 2: one row per Task</p>
          </div>
          <div className="section-title" style={{ marginTop: 26 }}>How rows become structure</div>
          <div className="card pad" style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Rows sharing a <b>Course (EN)</b> value group into the same Course; an optional <b>Lesson (EN)</b> nests tasks
            inside a Lesson. Row order defines task order. Task types supported: <b>xAPI, Quiz, Hands-On</b>. Defaults:
            quiz completion = Passing Grade (8/10), hands-on = Passing Grade from Reviewer (7/10), xAPI = Completion
            Statement. Quiz questions are pulled from Question Bank categories via <span className="mono">Category &gt; Sub-Category</span>.
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ maxWidth: 860 }}>
          <Callout tone="info">
            <b>Validation passed.</b> Career stages, industries, content-link targets and question-bank sources all match
            existing entities. Review everything below — nothing is created until you confirm.
          </Callout>

          <div className="two-col" style={{ gridTemplateColumns: '320px 1fr' }}>
            <div>
              <div className="section-title" style={{ fontSize: 13 }}>Sheet 1 — Certification</div>
              <div className="card">
                {SHEET1.map(([k, v]) => (
                  <div key={k} className="row" style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: 12.5 }}>
                    <span className="muted" style={{ width: 120, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="section-title" style={{ fontSize: 13 }}>Sheet 2 — {SHEET2.length} tasks → 2 courses, 1 lesson</div>
              <div className="tree">
                {['How Refrigerators Work', 'Diagnostics'].map((course) => (
                  <div className="tree-course" key={course}>
                    <div className="tree-course-head">
                      <BookOpen size={13} style={{ color: 'var(--text-3)' }} />
                      <span className="nm">{course}</span>
                    </div>
                    <div className="tree-items">
                      {SHEET2.filter((r) => r.course === course).map((r, i) => (
                        <div className="tree-task" key={i} style={r.lesson ? { paddingLeft: 28 } : undefined}>
                          <TaskTypeIcon type={r.type} size={22} />
                          <span className="nm">{r.lesson ? `${r.lesson} · ` : ''}{r.task}</span>
                          <span className="muted" style={{ fontSize: 11 }}>{r.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setStep(0)}>Back</button>
            <button className="btn primary" onClick={() => setStep(2)}>Create certification <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: 580, textAlign: 'center', padding: '40px 0' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--green)', margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>“Domestic Refrigerators Basics” created</h2>
          <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
            2 courses · 1 lesson · 6 tasks · 2 content links. Created in a <Badge tone="neutral">Hidden</Badge> state.
          </p>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 22 }}>
            Next: review the structure in the GUI, set the completion criteria and an award, then flip it to Visible.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => setStep(0)}>Import another</button>
            <button className="btn primary" onClick={() => { toast('Certification imported as Hidden'); nav('/certifications') }}>Open certifications</button>
          </div>
        </div>
      )}
    </div>
  )
}
