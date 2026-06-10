import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderPlus, Folder, FolderOpen, DatabaseZap, UploadCloud, ChevronRight } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, SearchInput, Modal, Field, LangInput } from '../../components/ui'
import { en, uid } from '../../lib/utils'
import type { Question, LText } from '../../lib/types'

export default function QuestionBank() {
  const { db, update, toast } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [catId, setCatId] = useState<string | null>(null)
  const [status, setStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [newCat, setNewCat] = useState(false)
  const [catName, setCatName] = useState('')
  const [catParent, setCatParent] = useState('')
  const [creating, setCreating] = useState(false)
  const [newText, setNewText] = useState<LText>({ en: '', es: '' })
  const [newType, setNewType] = useState<Question['type']>('multichoice')
  const [newCatId, setNewCatId] = useState('')

  const roots = db.questionCategories.filter((c) => !c.parentId)
  const childrenOf = (id: string) => db.questionCategories.filter((c) => c.parentId === id)

  const countFor = (id: string): number => {
    const direct = db.questions.filter((x) => x.categoryId === id).length
    return direct + childrenOf(id).reduce((a, c) => a + countFor(c.id), 0)
  }

  const list = useMemo(() => {
    let l = db.questions
    if (catId) {
      const ids = [catId, ...childrenOf(catId).map((c) => c.id)]
      l = l.filter((x) => ids.includes(x.categoryId))
    }
    if (status !== 'all') l = l.filter((x) => x.status === status)
    if (q) l = l.filter((x) => en(x.text).toLowerCase().includes(q.toLowerCase()))
    return l
  }, [db, q, catId, status])

  const typeLabel = { truefalse: 'True / False', multichoice: 'Multiple Choice', matching: 'Match the Following' }

  const createQuestion = () => {
    if (!newText.en.trim() || !newCatId) return
    const id = `q-${uid()}`
    const question: Question = {
      id, type: newType, text: { ...newText }, categoryId: newCatId, status: 'draft', version: 1,
      options:
        newType === 'truefalse'
          ? [{ id: 'a', text: { en: 'True' }, gradePct: 100 }, { id: 'b', text: { en: 'False' }, gradePct: 0 }]
          : newType === 'multichoice'
            ? [{ id: 'a', text: { en: '' }, gradePct: 100 }, { id: 'b', text: { en: '' }, gradePct: 0 }]
            : [],
      pairs: newType === 'matching' ? [{ left: { en: '' }, right: { en: '' } }, { left: { en: '' }, right: { en: '' } }] : [],
      matchingScoring: 'all-or-nothing', feedback: {}, randomise: newType !== 'truefalse', usedInQuizzes: 0, updatedAt: '2026-06-10',
    }
    update((d) => ({ ...d, questions: [question, ...d.questions] }))
    toast('Question created as Draft')
    nav(`/question-bank/${id}`)
  }

  return (
    <div className="page wide">
      <PageHead
        title="Question Bank"
        sub="All questions across all quizzes, grouped by category. Edits create new versions — past attempts always show the version they were answered against."
        actions={
          <>
            <button className="btn" onClick={() => nav('/automations/questions')}><UploadCloud size={14} /> Bulk upload CSV</button>
            <button className="btn primary" onClick={() => { setNewCatId(catId ?? roots[0]?.id ?? ''); setCreating(true) }}><Plus size={14} /> New question</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: 8 }}>
          <div
            className={`nav-item ${catId === null ? 'active' : ''}`}
            onClick={() => setCatId(null)}
          >
            <DatabaseZap size={14} /> All questions
            <span className="count">{db.questions.length}</span>
          </div>
          {roots.map((root) => (
            <div key={root.id}>
              <div className={`nav-item ${catId === root.id ? 'active' : ''}`} onClick={() => setCatId(root.id)}>
                {catId === root.id ? <FolderOpen size={14} /> : <Folder size={14} />}
                {root.name}
                <span className="count">{countFor(root.id)}</span>
              </div>
              {childrenOf(root.id).map((sub) => (
                <div key={sub.id} className={`nav-item ${catId === sub.id ? 'active' : ''}`} style={{ paddingLeft: 30 }} onClick={() => setCatId(sub.id)}>
                  {sub.name}
                  <span className="count">{countFor(sub.id)}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="nav-item" style={{ color: 'var(--accent)', marginTop: 6 }} onClick={() => setNewCat(true)}>
            <FolderPlus size={14} /> New category
          </div>
        </div>

        <div>
          <div className="toolbar">
            <SearchInput value={q} onChange={setQ} placeholder="Search question text…" />
            <div className="spacer" />
            {(['all', 'active', 'draft', 'archived'] as const).map((s) => (
              <button key={s} className={`filter-chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
                {s === 'all' ? 'All statuses' : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '46%' }}>Question</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="num">Version</th>
                  <th className="num">Used in</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {list.map((question) => {
                  const cat = db.questionCategories.find((c) => c.id === question.categoryId)
                  const parent = cat?.parentId ? db.questionCategories.find((c) => c.id === cat.parentId) : undefined
                  return (
                    <tr key={question.id} className="click" onClick={() => nav(`/question-bank/${question.id}`)}>
                      <td>
                        <div className="main-cell" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{en(question.text)}</div>
                        <div className="sub-cell">{parent ? `${parent.name} › ` : ''}{cat?.name}{question.text.es ? ' · ES ✓' : ''}</div>
                      </td>
                      <td><Badge tone="purple">{typeLabel[question.type]}</Badge></td>
                      <td>
                        {question.status === 'active' && <Badge tone="green" dot>Active</Badge>}
                        {question.status === 'draft' && <Badge tone="blue" dot>Draft</Badge>}
                        {question.status === 'archived' && <Badge tone="neutral" dot>Archived</Badge>}
                      </td>
                      <td className="num">v{question.version}</td>
                      <td className="num">{question.usedInQuizzes > 0 ? `${question.usedInQuizzes} quizzes` : '—'}</td>
                      <td className="muted">{question.updatedAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {list.length === 0 && (
              <div className="empty">
                <div className="ic"><DatabaseZap size={18} /></div>
                <b>No questions here</b>
                <p>Create one manually or bulk upload a CSV.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {newCat && (
        <Modal
          title="New category"
          onClose={() => setNewCat(false)}
          footer={
            <>
              <button className="btn" onClick={() => setNewCat(false)}>Cancel</button>
              <button
                className="btn primary"
                disabled={!catName.trim()}
                onClick={() => {
                  update((d) => ({ ...d, questionCategories: [...d.questionCategories, { id: `qc-${uid()}`, name: catName, parentId: catParent || undefined }] }))
                  setNewCat(false); setCatName(''); setCatParent('')
                  toast('Category created')
                }}
              >
                Create
              </button>
            </>
          }
        >
          <Field label="Name" required><input className="input" value={catName} onChange={(e) => setCatName(e.target.value)} /></Field>
          <Field label="Parent category" optional hint="Leave empty for a top-level category.">
            <select className="select" value={catParent} onChange={(e) => setCatParent(e.target.value)}>
              <option value="">— Top level —</option>
              {roots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
        </Modal>
      )}

      {creating && (
        <Modal
          title="New question"
          onClose={() => setCreating(false)}
          footer={
            <>
              <button className="btn" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn primary" disabled={!newText.en.trim() || !newCatId} onClick={createQuestion}>Create & edit</button>
            </>
          }
        >
          <Field label="Question type" required>
            <div className="row">
              {(['truefalse', 'multichoice', 'matching'] as const).map((t) => (
                <button key={t} className={`filter-chip ${newType === t ? 'on' : ''}`} onClick={() => setNewType(t)}>{typeLabel[t]}</button>
              ))}
            </div>
          </Field>
          <LangInput label="Question text" required value={newText} onChange={setNewText} multiline />
          <Field label="Category" required>
            <select className="select" value={newCatId} onChange={(e) => setNewCatId(e.target.value)}>
              <option value="">Select…</option>
              {db.questionCategories.map((c) => {
                const parent = c.parentId ? db.questionCategories.find((x) => x.id === c.parentId) : undefined
                return <option key={c.id} value={c.id}>{parent ? `${parent.name} › ` : ''}{c.name}</option>
              })}
            </select>
          </Field>
        </Modal>
      )}
    </div>
  )
}
