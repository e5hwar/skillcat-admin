import { useState } from 'react'
import { Save, Clock, Lock, Video, Mail, Languages, Ticket } from 'lucide-react'
import { useStore } from '../lib/store'
import { PageHead, Field, Callout } from '../components/ui'

export default function SettingsPage() {
  const { db, update, toast } = useStore()
  const [s, setS] = useState(db.settings)

  const save = () => {
    update((d) => ({ ...d, settings: s }))
    toast('Platform settings saved')
  }

  return (
    <div className="page" style={{ maxWidth: 880 }}>
      <PageHead
        title="Platform Settings"
        sub="Global access-state and review configuration. Per-user overrides (scholarships, free attempts, paywall bypass) live on each user's profile."
        actions={<button className="btn primary" onClick={save}><Save size={14} /> Save settings</button>}
      />

      <div className="section-title"><Clock size={15} /> Free trials</div>
      <div className="card pad">
        <div className="field-row">
          <Field label="B2C free trial duration (days)" hint="Applies to users who start a trial after the change.">
            <input className="input" type="number" value={s.b2cTrialDays} onChange={(e) => setS({ ...s, b2cTrialDays: +e.target.value })} />
          </Field>
          <Field label="B2B free trial duration (days)" hint="Independent from B2C — companies typically get longer.">
            <input className="input" type="number" value={s.b2bTrialDays} onChange={(e) => setS({ ...s, b2bTrialDays: +e.target.value })} />
          </Field>
        </div>
        <div className="field-hint" style={{ marginTop: -6 }}>
          B2C trials: full content, no purchases, final exams locked. B2B trials: full access including purchases and
          Pro-level dashboard features.
        </div>
      </div>

      <div className="section-title"><Lock size={15} /> Starter access</div>
      <div className="card pad">
        <Field label="Initial tasks count" hint="How many tasks from the start of each certification the Starter state can access. Final Exams stay locked even if they fall within this count. Permanent entitlements always remain accessible.">
          <input className="input" style={{ maxWidth: 140 }} type="number" value={s.initialTasksCount} onChange={(e) => setS({ ...s, initialTasksCount: +e.target.value })} />
        </Field>
      </div>

      <div className="section-title"><Video size={15} /> Proctoring</div>
      <div className="card pad">
        <Field label="Webcam capture frequency (seconds)" hint="System-level. Changes apply to all future proctored attempts.">
          <input className="input" style={{ maxWidth: 140 }} type="number" value={s.webcamFrequencySec} onChange={(e) => setS({ ...s, webcamFrequencySec: +e.target.value })} />
        </Field>
      </div>

      <div className="section-title"><Mail size={15} /> NATE exam emails</div>
      <div className="card pad">
        <div className="section-desc" style={{ margin: '0 0 14px' }}>
          Common templates for every NATE exam. Sent by the platform directly (not Rudderstack) because they carry
          Connect IDs and section-wise breakdowns. Failed → sent on submission; Passed → sent once the quiz and the ID
          approval are both complete.
        </div>
        <Field label="Passed attempt — subject">
          <input className="input" value={s.natePassEmailSubject} onChange={(e) => setS({ ...s, natePassEmailSubject: e.target.value })} />
        </Field>
        <Field label="Failed attempt — subject">
          <input className="input" value={s.nateFailEmailSubject} onChange={(e) => setS({ ...s, nateFailEmailSubject: e.target.value })} />
        </Field>
        <button className="btn sm">Edit email bodies…</button>
      </div>

      <div className="section-title"><Languages size={15} /> Languages</div>
      <div className="card pad">
        <div className="row" style={{ marginBottom: 10 }}>
          <span className="badge green" style={{ fontSize: 12 }}>English — default, required</span>
          <span className="badge blue" style={{ fontSize: 12 }}>Spanish — optional per field</span>
          <button className="btn sm" onClick={() => toast('Adding languages is supported by the data model — coming post-V1')}>Add language…</button>
        </div>
        <div className="field-hint">
          Resolution chain: profile preference → device/browser language → English. Fallback is per field — a Spanish
          user sees Spanish wherever it exists and English elsewhere. Content can't publish with empty required English
          fields; missing Spanish only warns.
        </div>
      </div>

      <div className="section-title"><Ticket size={15} /> Offer codes</div>
      <Callout tone="info">
        Apple Offer Codes, Google Play Offers and Stripe Coupons are tracked on-platform — subscription counts by code
        are available here and in Metabase for commission and retention analysis, without opening the store consoles.
      </Callout>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Code</th><th>Platform</th><th className="num">Redemptions (30d)</th><th className="num">Active subs</th></tr></thead>
          <tbody>
            <tr><td className="mono">TRADESCHOOL40</td><td>Stripe</td><td className="num">312</td><td className="num">268</td></tr>
            <tr><td className="mono">NEXSTAR-TEAM</td><td>Apple</td><td className="num">141</td><td className="num">126</td></tr>
            <tr><td className="mono">VERANO26</td><td>Google Play</td><td className="num">96</td><td className="num">88</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
