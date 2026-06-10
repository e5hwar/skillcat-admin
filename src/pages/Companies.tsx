import { useState } from 'react'
import { Building2, Gift } from 'lucide-react'
import { useStore } from '../lib/store'
import { PageHead, Badge, SearchInput, Modal, Field } from '../components/ui'
import { accessStateLabel, accessStateBadge } from '../lib/utils'

const LIMITS: Record<string, { certs: number; tasks: number }> = {
  essentials: { certs: 1, tasks: 1 },
  growth: { certs: 5, tasks: 5 },
  pro: { certs: 25, tasks: 100 },
  'b2b-trial': { certs: 25, tasks: 100 },
  courtesy: { certs: 25, tasks: 100 },
  'no-subscription': { certs: 0, tasks: 0 },
}

export default function Companies() {
  const { db, update, toast } = useStore()
  const [q, setQ] = useState('')
  const [courtesyFor, setCourtesyFor] = useState<string | null>(null)

  const list = db.tenants.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="page wide">
      <PageHead
        title="Companies"
        sub="B2B tenants. Trade and Partnership on the tenant profile drive content visibility; the tier drives features and custom-content limits."
      />
      <div className="toolbar"><SearchInput value={q} onChange={setQ} placeholder="Search companies…" /></div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Tier</th>
              <th className="num">Seats</th>
              <th>Trades</th>
              <th>Partnerships</th>
              <th>Custom content usage</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => {
              const lim = LIMITS[t.tier]
              const overCert = t.customCertsUsed > lim.certs
              const users = db.users.filter((u) => u.tenantId === t.id).length
              return (
                <tr key={t.id}>
                  <td>
                    <div className="row">
                      <span className="task-type-ic" style={{ width: 28, height: 28, background: 'var(--surface-3)', color: 'var(--text-2)' }}><Building2 size={14} /></span>
                      <div>
                        <div className="main-cell">{t.name}</div>
                        <div className="sub-cell">{users} users in directory{t.courtesyExpiry ? ` · courtesy until ${t.courtesyExpiry}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone={accessStateBadge[t.tier]} dot>{accessStateLabel[t.tier]}</Badge></td>
                  <td className="num">{t.seats}</td>
                  <td>
                    <div className="row wrap" style={{ gap: 4 }}>
                      {t.trades.length ? t.trades.map((tr) => <Badge key={tr} tone="blue">{tr}</Badge>) : <span className="muted">—</span>}
                    </div>
                  </td>
                  <td>
                    <div className="row wrap" style={{ gap: 4 }}>
                      {t.partnerships.length ? t.partnerships.map((p) => <Badge key={p} tone="purple">{p}</Badge>) : <span className="muted">—</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5 }}>
                    <span style={{ color: overCert ? 'var(--red)' : undefined, fontWeight: overCert ? 600 : 400 }}>
                      {t.customCertsUsed}/{lim.certs} certs
                    </span>
                    <span className="muted"> · {t.customTasksUsed}/{lim.tasks} hands-on</span>
                    {overCert && <Badge tone="red" >Over limit</Badge>}
                  </td>
                  <td className="actions">
                    <button className="btn ghost sm" onClick={() => setCourtesyFor(t.id)}><Gift size={12} /> Courtesy period</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 12, maxWidth: 760 }}>
        Custom content limits per tier — Essentials: 1 · Growth: 5 · Pro: 25 custom certifications (Pro allows 100
        custom hands-on tasks). Free Trial companies get Pro-level limits for {db.settings.b2bTrialDays} days. The B2B
        dashboard itself locks when a company has no active subscription.
      </p>

      {courtesyFor && (
        <Modal
          title={`Grant courtesy period — ${db.tenants.find((t) => t.id === courtesyFor)?.name}`}
          onClose={() => setCourtesyFor(null)}
          footer={
            <>
              <button className="btn" onClick={() => setCourtesyFor(null)}>Cancel</button>
              <button
                className="btn primary"
                onClick={() => {
                  update((d) => ({ ...d, tenants: d.tenants.map((t) => (t.id === courtesyFor ? { ...t, tier: 'courtesy', courtesyExpiry: '2026-09-10' } : t)) }))
                  toast('Courtesy period granted — full access until expiry; a new grant replaces any old one')
                  setCourtesyFor(null)
                }}
              >
                Grant access
              </button>
            </>
          }
        >
          <Field label="Expires" required hint="Free full access for the company until this date. Multiple grants are allowed over time — each new grant replaces the previous one.">
            <input className="input" type="date" defaultValue="2026-09-10" />
          </Field>
        </Modal>
      )}
    </div>
  )
}
