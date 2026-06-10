import type { DB, LText, Task, TaskType, TimeEstimate, AccessState, MeritTier } from './types'

export const en = (t?: LText) => t?.en ?? ''
export const hasEs = (t?: LText) => !!t?.es && t.es.trim().length > 0

export const fmtTime = (t?: TimeEstimate) => (t ? `${t.value} ${t.value === 1 ? t.unit.slice(0, -1) : t.unit}` : '—')

export const fmtNum = (n: number) => n.toLocaleString('en-US')

export const taskTypeLabel: Record<TaskType, string> = {
  xapi: 'xAPI',
  quiz: 'Quiz',
  'hands-on': 'Hands-On',
  'id-upload': 'ID Upload',
  url: 'URL',
  file: 'File',
  deeplink: 'Deep Link',
}

export const taskTypeColor: Record<TaskType, { bg: string; fg: string }> = {
  xapi: { bg: '#e9f1fc', fg: '#2563c4' },
  quiz: { bg: '#f4ebfc', fg: '#793aaf' },
  'hands-on': { bg: '#e7f6ef', fg: '#18794e' },
  'id-upload': { bg: '#fdf3da', fg: '#9a6c00' },
  url: { bg: '#e2f6f4', fg: '#067a6f' },
  file: { bg: '#f1f1f3', fg: '#5d5f6d' },
  deeplink: { bg: '#fdeeee', fg: '#cd2b31' },
}

export const accessStateLabel: Record<AccessState, string> = {
  'free-trial': 'Free Trial',
  subscriber: 'Subscriber',
  scholarship: 'Scholarship',
  starter: 'Starter',
  'b2b-trial': 'Free Trial (B2B)',
  essentials: 'Essentials',
  growth: 'Growth',
  pro: 'Pro',
  courtesy: 'Courtesy Period',
  'no-subscription': 'No Subscription',
}

export const accessStateBadge: Record<AccessState, string> = {
  'free-trial': 'blue',
  subscriber: 'green',
  scholarship: 'purple',
  starter: 'neutral',
  'b2b-trial': 'blue',
  essentials: 'teal',
  growth: 'teal',
  pro: 'green',
  courtesy: 'purple',
  'no-subscription': 'neutral',
}

export const tierLabel: Record<MeritTier, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
}

export const completionLabel: Record<string, string> = {
  none: 'No completion tracking',
  'on-view': 'Completion upon viewing',
  'manual-by-user': 'User manually marks completion',
  'xapi-statement': 'xAPI completion statement',
  'passing-grade': 'Passing grade',
  'submission-made': 'Submission made',
  'reviewer-grade': 'Passing grade from reviewer',
  'admin-approved': 'Approved by SkillCat Admin',
}

/** Certifications (and paths) a task is used in */
export function taskUsage(db: DB, taskId: string): { certIds: string[]; pathCount: number } {
  const certIds = db.certifications
    .filter((c) =>
      c.courses.some((crs) =>
        crs.items.some((i) => (i.kind === 'task' ? i.taskId === taskId : i.lesson.taskIds.includes(taskId)))
      )
    )
    .map((c) => c.id)
  const pathCount = db.users.filter((u) =>
    [...u.pathAssigned, ...u.pathSelf].some((p) => p.kind === 'task' && p.refId === taskId)
  ).length
  return { certIds, pathCount }
}

export function isTaskRestricted(db: DB, taskId: string): boolean {
  return db.certifications.some(
    (c) => Object.keys(c.restrictions).includes(taskId) || Object.values(c.restrictions).some((r) => r.requires.includes(taskId))
  )
}

export function questionCount(t: Task): number {
  if (!t.quiz) return 0
  if (t.quiz.sections.length > 0)
    return t.quiz.sections.reduce((acc, s) => acc + s.staticQuestionIds.length + (s.randomPool?.draw ?? 0), 0)
  return t.quiz.staticQuestionIds.length + (t.quiz.randomPool?.draw ?? 0)
}

export function certTaskCount(db: DB, certId: string): number {
  const c = db.certifications.find((x) => x.id === certId)
  if (!c) return 0
  const set = new Set<string>()
  c.courses.forEach((crs) =>
    crs.items.forEach((i) => {
      if (i.kind === 'task') set.add(i.taskId)
      else i.lesson.taskIds.forEach((t) => set.add(t))
    })
  )
  return set.size
}

export function relTime(date: string): string {
  const d = new Date(date.replace(' ', 'T'))
  const now = new Date('2026-06-10T10:00:00')
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

const AVATAR_COLORS = ['#5b5bd6', '#0e9f6e', '#d97706', '#dc2626', '#2563eb', '#7c3aed', '#0d9488', '#be185d']
export const avatarColor = (id: string) => {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export const uid = () => Math.random().toString(36).slice(2, 9)
