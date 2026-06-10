import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users as UsersIcon, ShieldAlert } from 'lucide-react'
import { useStore } from '../../lib/store'
import { PageHead, Badge, StatusBadge, SearchInput } from '../../components/ui'
import { accessStateLabel, accessStateBadge, initials, avatarColor, relTime } from '../../lib/utils'

const FILTERS = ['All', 'B2C', 'B2B', 'Scholarship', 'ID in review', 'Integrity notes'] as const

export default function UsersPage() {
  const { db } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')

  const list = useMemo(() => {
    let l = db.users
    if (filter === 'B2C') l = l.filter((u) => u.userType === 'b2c')
    if (filter === 'B2B') l = l.filter((u) => u.userType === 'b2b')
    if (filter === 'Scholarship') l = l.filter((u) => u.accessState === 'scholarship')
    if (filter === 'ID in review') l = l.filter((u) => u.idStatus === 'in-review')
    if (filter === 'Integrity notes') l = l.filter((u) => u.integrityNote)
    if (q) l = l.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
    return l
  }, [db, q, filter])

  return (
    <div className="page wide">
      <PageHead
        title="Users"
        sub="Every learner on the platform. A user in a single-user tenant is B2C; multi-user tenants are B2B. Access State governs content access and purchases."
      />
      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search name or email…" />
        <div className="spacer" />
        {FILTERS.map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Access state</th>
              <th>Company</th>
              <th>Language</th>
              <th>ID status</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => {
              const tenant = u.tenantId ? db.tenants.find((t) => t.id === u.tenantId) : null
              return (
                <tr key={u.id} className="click" onClick={() => nav(`/users/${u.id}`)}>
                  <td>
                    <div className="row">
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: avatarColor(u.id) }}>{initials(u.name)}</div>
                      <div>
                        <div className="main-cell">
                          {u.name} {u.integrityNote && <ShieldAlert size={13} style={{ color: 'var(--red)', verticalAlign: -2 }} />}
                        </div>
                        <div className="sub-cell">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone={u.userType === 'b2c' ? 'neutral' : 'blue'}>{u.userType.toUpperCase()}</Badge></td>
                  <td><Badge tone={accessStateBadge[u.accessState]} dot>{accessStateLabel[u.accessState]}</Badge></td>
                  <td style={{ fontSize: 12.5 }}>{tenant ? tenant.name : <span className="muted">—</span>}</td>
                  <td><Badge tone="neutral">{u.language.toUpperCase()}</Badge></td>
                  <td><StatusBadge status={u.idStatus} /></td>
                  <td className="muted">{relTime(u.lastActive + ' 12:00')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="empty">
            <div className="ic"><UsersIcon size={18} /></div>
            <b>No users match</b>
          </div>
        )}
      </div>
    </div>
  )
}
