import { useState } from 'react'
import { ArrowUp, ArrowDown, Plus, EyeOff, Eye, Trash2, FolderTree, GripVertical } from 'lucide-react'
import { useStore } from '../lib/store'
import { PageHead, Badge, Modal, Field, useConfirm } from '../components/ui'
import { en, uid } from '../lib/utils'
import type { Industry } from '../lib/types'

export default function Industries() {
  const { db, update, toast } = useStore()
  const [creating, setCreating] = useState<{ parentId?: string } | null>(null)
  const [name, setName] = useState('')
  const { confirm, element } = useConfirm()

  const sorted = [...db.industries].sort((a, b) => a.order - b.order)

  const move = (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((i) => i.id === id)
    const swap = sorted[idx + dir]
    if (!swap) return
    update((d) => ({
      ...d,
      industries: d.industries.map((i) =>
        i.id === id ? { ...i, order: swap.order } : i.id === swap.id ? { ...i, order: sorted[idx].order } : i
      ),
    }))
  }

  const moveSub = (indId: string, subId: string, dir: -1 | 1) => {
    update((d) => ({
      ...d,
      industries: d.industries.map((ind) => {
        if (ind.id !== indId) return ind
        const subs = [...ind.subs].sort((a, b) => a.order - b.order)
        const idx = subs.findIndex((s) => s.id === subId)
        const swap = subs[idx + dir]
        if (!swap) return ind
        return {
          ...ind,
          subs: ind.subs.map((s) =>
            s.id === subId ? { ...s, order: swap.order } : s.id === swap.id ? { ...s, order: subs[idx].order } : s
          ),
        }
      }),
    }))
  }

  const certCount = (indId: string, subId?: string) =>
    db.certifications.filter((c) => (subId ? c.subIndustryIds.includes(subId) : c.industryIds.includes(indId))).length

  const create = () => {
    if (!name.trim()) return
    if (creating?.parentId) {
      update((d) => ({
        ...d,
        industries: d.industries.map((i) =>
          i.id === creating.parentId ? { ...i, subs: [...i.subs, { id: `sub-${uid()}`, name, order: i.subs.length + 1 }] } : i
        ),
      }))
      toast('Sub-industry created')
    } else {
      const ind: Industry = { id: `ind-${uid()}`, name, visibility: 'visible', order: db.industries.length + 1, subs: [] }
      update((d) => ({ ...d, industries: [...d.industries, ind] }))
      toast('Industry created')
    }
    setCreating(null)
    setName('')
  }

  return (
    <div className="page">
      <PageHead
        title="Industries"
        sub="The browse and discovery taxonomy for all users — separate from the access-scoping Trade filter, which is invisible to end users. Order here controls the browse view."
        actions={<button className="btn primary" onClick={() => setCreating({})}><Plus size={14} /> New industry</button>}
      />

      <div className="tree">
        {sorted.map((ind, i) => (
          <div className="tree-course" key={ind.id}>
            <div className="tree-course-head">
              <span className="mono muted" style={{ fontSize: 11, width: 16 }}>{i + 1}</span>
              <FolderTree size={14} style={{ color: 'var(--text-3)' }} />
              <span className="nm">{ind.name}</span>
              {ind.visibility === 'hidden' && <Badge tone="neutral"><EyeOff size={10} /> Hidden from browsing</Badge>}
              <span className="muted" style={{ fontSize: 11.5 }}>{certCount(ind.id)} certifications tagged</span>
              <div className="spacer" />
              <button className="btn ghost btn-icon sm" disabled={i === 0} onClick={() => move(ind.id, -1)}><ArrowUp size={13} /></button>
              <button className="btn ghost btn-icon sm" disabled={i === sorted.length - 1} onClick={() => move(ind.id, 1)}><ArrowDown size={13} /></button>
              <button
                className="btn ghost btn-icon sm"
                title={ind.visibility === 'visible' ? 'Hide' : 'Show'}
                onClick={() => {
                  update((d) => ({ ...d, industries: d.industries.map((x) => (x.id === ind.id ? { ...x, visibility: x.visibility === 'visible' ? 'hidden' : 'visible' } : x)) }))
                  toast(ind.visibility === 'visible' ? 'Hidden — content keeps its tags, grouping is not surfaced' : 'Industry visible again')
                }}
              >
                {ind.visibility === 'visible' ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button className="btn sm" onClick={() => setCreating({ parentId: ind.id })}><Plus size={12} /> Sub-industry</button>
              <button
                className="btn ghost btn-icon sm"
                onClick={() =>
                  confirm({
                    title: `Delete “${ind.name}”?`,
                    danger: true,
                    confirmLabel: 'Delete industry',
                    body: (
                      <>
                        All {ind.subs.length} sub-industries are deleted with it. The {certCount(ind.id)} tagged
                        certifications simply lose the tag — they aren't hidden or modified. This is immediate and permanent.
                      </>
                    ),
                    onConfirm: () => {
                      update((d) => ({ ...d, industries: d.industries.filter((x) => x.id !== ind.id) }))
                      toast('Industry deleted — tagged content unaffected')
                    },
                  })
                }
              >
                <Trash2 size={13} />
              </button>
            </div>
            {ind.subs.length > 0 && (
              <div className="tree-items">
                {[...ind.subs].sort((a, b) => a.order - b.order).map((s, j, arr) => (
                  <div className="tree-task" key={s.id}>
                    <GripVertical size={13} className="grip" />
                    <span className="mono muted" style={{ fontSize: 11 }}>{i + 1}.{j + 1}</span>
                    <span className="nm">{s.name}</span>
                    <span className="muted" style={{ fontSize: 11.5 }}>{certCount(ind.id, s.id)} certifications</span>
                    <button className="btn ghost btn-icon sm" disabled={j === 0} onClick={() => moveSub(ind.id, s.id, -1)}><ArrowUp size={12} /></button>
                    <button className="btn ghost btn-icon sm" disabled={j === arr.length - 1} onClick={() => moveSub(ind.id, s.id, 1)}><ArrowDown size={12} /></button>
                    <button
                      className="btn ghost btn-icon sm"
                      onClick={() => {
                        update((d) => ({ ...d, industries: d.industries.map((x) => (x.id === ind.id ? { ...x, subs: x.subs.filter((y) => y.id !== s.id) } : x)) }))
                        toast('Sub-industry deleted — tagged content keeps working')
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="muted" style={{ fontSize: 12, marginTop: 16, maxWidth: 720 }}>
        Sub-industry names must be unique within their parent but can repeat across industries (HVAC › Safety and
        Plumbing › Safety can coexist). Tagging a certification with a sub-industry does not auto-tag the parent. New
        certifications append to the end of each display order. Certification ordering within an industry is managed on
        the certification's Details tab.
      </p>

      {creating && (
        <Modal
          title={creating.parentId ? `New sub-industry in ${db.industries.find((i) => i.id === creating.parentId)?.name}` : 'New industry'}
          onClose={() => setCreating(null)}
          footer={
            <>
              <button className="btn" onClick={() => setCreating(null)}>Cancel</button>
              <button className="btn primary" disabled={!name.trim()} onClick={create}>Create</button>
            </>
          }
        >
          <Field label="Name" required hint={creating.parentId ? 'Unique within this industry.' : 'Industry names are globally unique.'}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
        </Modal>
      )}
      {element}
    </div>
  )
}
