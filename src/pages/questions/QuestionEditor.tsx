import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Save, Plus, X, Shuffle, Image, Video, Bold, Italic, Underline, List, ListOrdered, Link2 } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, Tabs, LangInput, Field, Seg, SwitchRow, Callout } from '../../components/ui'
import { en, uid } from '../../lib/utils'
import type { Question } from '../../lib/types'

function RichToolbar() {
  return (
    <div className="row" style={{ gap: 2, padding: '4px 6px', border: '1px solid var(--border-2)', borderBottom: 'none', borderRadius: '6px 6px 0 0', background: 'var(--surface-2)' }}>
      {[Bold, Italic, Underline, List, ListOrdered, Link2, Image, Video].map((Icon, i) => (
        <button key={i} className="btn ghost btn-icon sm" style={{ width: 24, height: 24 }}><Icon size={13} /></button>
      ))}
      <span className="muted" style={{ fontSize: 10.5, marginLeft: 'auto', paddingRight: 4 }}>Rich text + media</span>
    </div>
  )
}

export default function QuestionEditor() {
  const { id } = useParams()
  const { db, update, toast } = useStore()
  const question = db.questions.find((x) => x.id === id)

  if (!question) return <div className="page"><PageHead title="Question not found" /></div>

  const patch = (p: Partial<Question>) =>
    update((d) => ({ ...d, questions: d.questions.map((x) => (x.id === question.id ? { ...x, ...p } : x)) }))

  const cat = db.questionCategories.find((c) => c.id === question.categoryId)
  const parent = cat?.parentId ? db.questionCategories.find((c) => c.id === cat.parentId) : undefined
  const gradeSum = question.options.filter((o) => o.gradePct > 0).reduce((a, o) => a + o.gradePct, 0)

  const save = () => {
    patch({ version: question.version + 1, updatedAt: '2026-06-10' })
    toast(
      question.usedInQuizzes > 0
        ? `Saved as v${question.version + 1} — in-progress attempts keep v${question.version}; new attempts get the update`
        : 'Saved'
    )
  }

  return (
    <div className="page">
      <PageHead
        crumbs={[{ label: 'Question Bank', to: '/question-bank' }, { label: `${parent ? parent.name + ' › ' : ''}${cat?.name ?? ''}` }]}
        title={<span style={{ fontSize: 17 }}>{en(question.text) || 'Untitled question'}</span>}
        badge={
          <span className="row" style={{ gap: 6 }}>
            <Badge tone="purple">{question.type === 'truefalse' ? 'True / False' : question.type === 'multichoice' ? 'Multiple Choice' : 'Match the Following'}</Badge>
            <Badge tone="neutral">v{question.version}</Badge>
          </span>
        }
        sub={question.usedInQuizzes > 0 ? `Used in ${question.usedInQuizzes} quizzes — editing creates a new version; past attempts and scores are unaffected.` : 'Not used in any quiz yet.'}
        actions={
          <>
            <select className="select" style={{ width: 120 }} value={question.status} onChange={(e) => patch({ status: e.target.value as any })}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <button className="btn primary" onClick={save}><Save size={14} /> Save as v{question.version + 1}</button>
          </>
        }
      />

      <div className="two-col">
        <div>
          <div className="section-title">Question</div>
          <RichToolbar />
          <div style={{ marginTop: -17 }}>
            <LangInput label="" value={question.text} onChange={(v) => patch({ text: v })} multiline required />
          </div>

          {question.type !== 'matching' && (
            <>
              <div className="section-title">Options & grades</div>
              <div className="section-desc">
                Grade per option from −100% to 100%. Positive grades across correct options should sum to 100%. Negative
                grades enable penalty marking — a question (and quiz) score can go below zero.
              </div>
              {question.options.map((o, i) => (
                <div className="opt-row" key={o.id}>
                  <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                  <input
                    className="input"
                    value={o.text.en}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    onChange={(e) => patch({ options: question.options.map((x) => (x.id === o.id ? { ...x, text: { ...x.text, en: e.target.value } } : x)) })}
                  />
                  <div className="row">
                    <input
                      className="input sm"
                      type="number"
                      min={-100}
                      max={100}
                      style={{ width: 70, color: o.gradePct > 0 ? 'var(--green)' : o.gradePct < 0 ? 'var(--red)' : undefined, fontWeight: 600 }}
                      value={o.gradePct}
                      onChange={(e) => patch({ options: question.options.map((x) => (x.id === o.id ? { ...x, gradePct: +e.target.value } : x)) })}
                    />
                    <span className="muted" style={{ fontSize: 12 }}>%</span>
                  </div>
                  <button
                    className="btn ghost btn-icon sm"
                    disabled={question.type === 'truefalse'}
                    onClick={() => patch({ options: question.options.filter((x) => x.id !== o.id) })}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {question.type === 'multichoice' && (
                <button
                  className="btn sm"
                  disabled={question.options.length >= 10}
                  onClick={() => patch({ options: [...question.options, { id: uid(), text: { en: '' }, gradePct: 0 }] })}
                >
                  <Plus size={12} /> Add option {question.options.length >= 10 && '(max 10)'}
                </button>
              )}
              {gradeSum !== 100 && question.options.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <Callout tone="warn">Positive grades sum to <b>{gradeSum}%</b> — they should total 100% so a fully correct answer earns full credit.</Callout>
                </div>
              )}
            </>
          )}

          {question.type === 'matching' && (
            <>
              <div className="section-title">Pairs</div>
              <div className="section-desc">
                Right-side items are shuffled for the user. Add an extra wrong answer by providing a right-side item with
                a blank left side.
              </div>
              {question.pairs.map((p, i) => (
                <div className="row" key={i} style={{ marginBottom: 7 }}>
                  <span className="opt-letter">{i + 1}</span>
                  <input className="input" placeholder="Left item (question)" value={p.left.en} onChange={(e) => patch({ pairs: question.pairs.map((x, j) => (j === i ? { ...x, left: { ...x.left, en: e.target.value } } : x)) })} />
                  <span className="muted">→</span>
                  <input className="input" placeholder="Right item (match)" value={p.right.en} onChange={(e) => patch({ pairs: question.pairs.map((x, j) => (j === i ? { ...x, right: { ...x.right, en: e.target.value } } : x)) })} />
                  <button className="btn ghost btn-icon sm" onClick={() => patch({ pairs: question.pairs.filter((_, j) => j !== i) })}><X size={12} /></button>
                </div>
              ))}
              <button className="btn sm" disabled={question.pairs.length >= 10} onClick={() => patch({ pairs: [...question.pairs, { left: { en: '' }, right: { en: '' } }] })}>
                <Plus size={12} /> Add pair
              </button>
              <Field label="Scoring" hint="Partial credit awards proportional credit per correct match. All-or-nothing requires every pair correct.">
                <Seg
                  options={[{ value: 'partial', label: 'Partial credit' }, { value: 'all-or-nothing', label: 'All-or-nothing' }]}
                  value={question.matchingScoring}
                  onChange={(v) => patch({ matchingScoring: v })}
                />
              </Field>
            </>
          )}

          <div className="section-title">Combined feedback</div>
          <div className="section-desc">Shown after submission based on the quiz's review settings.</div>
          <LangInput label="For a correct response" value={question.feedback.correct ?? { en: '' }} onChange={(v) => patch({ feedback: { ...question.feedback, correct: v } })} />
          <LangInput label="For a partially correct response" value={question.feedback.partial ?? { en: '' }} onChange={(v) => patch({ feedback: { ...question.feedback, partial: v } })} />
          <LangInput label="For an incorrect response" value={question.feedback.incorrect ?? { en: '' }} onChange={(v) => patch({ feedback: { ...question.feedback, incorrect: v } })} />
        </div>

        <div className="side-card">
          <div className="card pad">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Behaviour</div>
            {question.type !== 'truefalse' && (
              <SwitchRow
                label="Randomise options"
                desc="Each attempt shows options in a different order. Set per question, not per quiz."
                checked={question.randomise}
                onChange={(v) => patch({ randomise: v })}
              />
            )}
            <Field label="Category">
              <select className="select" value={question.categoryId} onChange={(e) => patch({ categoryId: e.target.value })}>
                {db.questionCategories.map((c) => {
                  const p = c.parentId ? db.questionCategories.find((x) => x.id === c.parentId) : undefined
                  return <option key={c.id} value={c.id}>{p ? `${p.name} › ` : ''}{c.name}</option>
                })}
              </select>
            </Field>
          </div>
          <div className="card pad" style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Versioning</div>
            <div className="muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
              Editing creates <b>v{question.version + 1}</b>. Users mid-attempt keep v{question.version}; new attempts get
              the latest. Once a question has been used in any attempt it can only be archived, never deleted.
            </div>
            <hr className="divider" />
            <div className="stack" style={{ gap: 6, fontSize: 12 }}>
              {Array.from({ length: question.version }, (_, i) => question.version - i).map((v) => (
                <div className="row" key={v}>
                  <Badge tone={v === question.version ? 'accent' : 'neutral'}>v{v}</Badge>
                  <span className="muted">{v === question.version ? 'Current' : 'Retained for past attempts'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
