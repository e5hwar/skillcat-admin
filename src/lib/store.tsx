import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { DB } from './types'
import { seed } from './seed'

interface Toast { id: number; msg: string; kind: 'ok' | 'error' }

interface Store {
  db: DB
  update: (fn: (db: DB) => DB) => void
  toast: (msg: string, kind?: 'ok' | 'error') => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(seed)
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const toast = useCallback((msg: string, kind: 'ok' | 'error' = 'ok') => {
    const id = ++idRef.current
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400)
  }, [])

  const update = useCallback((fn: (db: DB) => DB) => setDb((d) => fn(d)), [])

  const value = useMemo(() => ({ db, update, toast }), [db, update, toast])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind === 'error' ? 'error' : ''}`}>
            {t.kind === 'error' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
