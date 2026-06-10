export interface LText {
  en: string
  es?: string
}

export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
export interface TimeEstimate { value: number; unit: TimeUnit }

export type TaskType = 'xapi' | 'quiz' | 'hands-on' | 'id-upload' | 'url' | 'file' | 'deeplink'

export type CompletionCriteria =
  | 'none'
  | 'on-view'
  | 'manual-by-user'
  | 'xapi-statement'
  | 'passing-grade'
  | 'submission-made'
  | 'reviewer-grade'
  | 'admin-approved'

export interface AccessRestriction {
  requires: string[] // task ids within the same certification
  mode: 'any' | 'all'
}

export interface QuizSection {
  id: string
  name: LText
  requiredToPass: boolean
  passingGrade?: number // pct, when section-level grading
  staticQuestionIds: string[]
  randomPool?: { poolSize: number; draw: number }
}

export interface QuizConfig {
  sections: QuizSection[] // empty = single block
  staticQuestionIds: string[] // used when no sections
  randomPool?: { poolSize: number; draw: number }
  questionOrder: 'fixed' | 'shuffle-within-section' | 'shuffle-all'
  maxAttempts: number | 'unlimited'
  cooldownMinutes: number
  variableCooldowns: { betweenAttempts: string; minutes: number }[]
  autoAdditionalAttempts?: { count: number; requiredTasks: number }
  timeLimitMinutes?: number
  resources: { name: string; kind: 'pdf' | 'image' | 'video' | 'webview' | 'custom' }[]
  gradeLevel: 'quiz' | 'section'
  quizPassingGrade?: number // pct
  review: {
    attempt: boolean
    quizResult: boolean
    quizScore: boolean
    whetherCorrect: boolean
    perQuestionFeedback: boolean
    perSectionResults: boolean
  }
  proctored: boolean
  paywall: { kind: 'free' } | { kind: 'consumable'; firstAttempt: number; subsequent: number }
  nate?: { externalIdEn: string; externalIdEs: string }
}

export interface HandsOnConfig {
  instructions?: LText
  toolsMaterials?: LText
  reviewerChecklist?: LText
  referenceFiles: { name: string; lang: 'en' | 'es' }[]
  passingScore: number // out of 10
  maxAttempts: number | 'unlimited'
  descriptionCharLimit: number
  maxMediaFiles: number
  mediaTypes: ('images' | 'videos' | 'audio')[]
}

export interface Task {
  id: string
  type: TaskType
  name: LText
  description?: LText
  visibility: 'visible' | 'hidden'
  timeToComplete?: TimeEstimate
  completion: CompletionCriteria
  discoverable?: boolean
  owner: 'skillcat' | string // tenant id
  updatedAt: string
  // type-specific
  xapi?: {
    packageEn?: string
    packageEs?: string
    scoreCapture: boolean
    allowRotation: boolean
    lockedOrientation: 'portrait' | 'landscape'
    thirdParty?: string
  }
  quiz?: QuizConfig
  handsOn?: HandsOnConfig
  url?: { url: string; openIn: 'in-app' | 'external'; allowRotation: boolean; lockedOrientation: 'portrait' | 'landscape' }
  file?: { fileName: string; sizeMb: number; openIn: 'in-app' | 'external' }
  deeplink?: { url: string }
}

export interface Lesson {
  id: string
  name: LText
  hidden?: boolean
  taskIds: string[]
}

export type CourseItem = { kind: 'task'; taskId: string } | { kind: 'lesson'; lesson: Lesson }

export interface Course {
  id: string
  name: LText
  description?: LText
  hidden?: boolean
  items: CourseItem[]
}

export type ConditionItemKind = 'task' | 'quiz-section' | 'certification'
export interface ConditionSet {
  id: string
  items: { kind: ConditionItemKind; refId: string; label: string }[]
}

export type LinkType = 'prerequisite' | 'recommended-next' | 'related'
export interface ContentLink {
  id: string
  sourceId: string
  targetId: string
  type: LinkType
  strength: number // 0–100
}

export type Paywall =
  | { kind: 'free' }
  | { kind: 'non-consumable'; priceStripe: number; priceApple: number; priceGoogle: number }
  | {
      kind: 'consumable'
      priceStripe: number
      priceApple: number
      priceGoogle: number
      triggers: ('manual' | 'xapi-statement')[]
      progressOnConsumption: 'reset' | 'preserve'
    }

export interface Certification {
  id: string
  name: LText
  description?: LText
  visibility: 'visible' | 'hidden' | 'archived'
  certType?: 'unit' | 'credential' | 'program' | 'bundle'
  careerStage?: 'apprentice' | 'journeyman' | 'master'
  timeToComplete?: TimeEstimate
  ceu?: number
  graphic: string // css gradient
  emoji: string
  announcement?: LText
  replacementIds: string[]
  replacementAlert?: LText
  keywords: string[]
  slug: string
  industryIds: string[]
  subIndustryIds: string[]
  trades: string[]
  partnerships: string[]
  userType: 'all' | 'b2b'
  paywall: Paywall
  forceOrder: boolean
  courses: Course[]
  restrictions: Record<string, AccessRestriction> // taskId -> restriction
  conditionSets: ConditionSet[]
  awardId?: string
  feedbackFormId?: string
  enrolled: number
  completed: number
  owner: 'skillcat' | string
  updatedAt: string
}

export interface SubIndustry { id: string; name: string; order: number }
export interface Industry {
  id: string
  name: string
  visibility: 'visible' | 'hidden'
  order: number
  subs: SubIndustry[]
}

export type QuestionType = 'truefalse' | 'multichoice' | 'matching'
export interface QuestionOption { id: string; text: LText; gradePct: number }
export interface Question {
  id: string
  type: QuestionType
  text: LText
  categoryId: string
  status: 'active' | 'draft' | 'archived'
  version: number
  options: QuestionOption[]
  pairs: { left: LText; right: LText }[]
  matchingScoring: 'all-or-nothing' | 'partial'
  feedback: { correct?: LText; partial?: LText; incorrect?: LText }
  randomise: boolean
  usedInQuizzes: number
  updatedAt: string
}

export interface QuestionCategory {
  id: string
  name: string
  parentId?: string
}

export interface Skill {
  id: string
  name: LText
  description?: LText
  status: 'active' | 'archived'
  color: string
  emoji: string
  criteria: { taskIds: string[]; mode: 'any' | 'all' }
  holders: number
  updatedAt: string
}

export interface MasterySkill {
  id: string
  name: LText
  description?: LText
  status: 'active' | 'archived'
  color: string
  emoji: string
  skillIds: string[]
  holders: number
}

export type MeritTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export interface AwardDesign {
  id: string
  name: string
  orientation: 'landscape' | 'portrait'
  background: string // css gradient placeholder
  fields: { key: 'userName' | 'certName' | 'date' | 'number' | 'qr'; x: number; y: number }[] // pct coords
}
export interface Award {
  id: string
  certificationId: string
  tier: MeritTier
  cardDesignId?: string
  certificateDesignId?: string
  status: 'active' | 'archived'
  issued: number
}

export type FBQuestionType = 'single' | 'multi' | 'short' | 'file' | 'scale'
export interface FBQuestion {
  id: string
  text: LText
  type: FBQuestionType
  mandatory: boolean
  options: LText[]
  allowOther?: boolean
  scale?: { min: number; max: number; minLabel?: LText; maxLabel?: LText }
  file?: { maxFiles: number; maxSizeMb: number }
}
export interface FBResponse {
  id: string
  userId: string
  version: number
  submittedAt: string
  trigger: string
  answers: { q: string; value: string }[]
}
export interface FeedbackForm {
  id: string
  name: string
  status: 'draft' | 'active' | 'archived'
  version: number
  questions: FBQuestion[]
  triggers: { kind: 'task' | 'certification'; refId: string }[]
  responses: FBResponse[]
  versionHistory: { version: number; date: string; by: string; note: string }[]
}

export interface Spotlight {
  id: string
  heading: LText
  description?: LText
  ctaText?: LText
  ctaRedirect?: string
  background?: string
  endDate: string
  status: 'pending' | 'active' | 'deactivated' | 'rejected'
  requestedBy: string
  createdAt: string
  position: number
  views?: number
  clicks?: number
}

export type ProctoringStatus = 'in-review' | 'id-reupload' | 'approved' | 'rejected'
export interface ProctoringEntry {
  id: string
  userId: string
  quizTaskId: string
  certificationId: string
  category: 'proctored' | 'id-verification'
  status: ProctoringStatus
  reuploadReady?: boolean
  submittedAt: string
  scorePct: number
  language: 'en' | 'es'
  sectionBreakdown?: { name: string; scorePct: number; passed: boolean; atStake: boolean }[]
  idPreviouslyVerified: boolean
  ai: {
    idConfidence: number
    idType: string
    idName: string
    nameMatch: boolean
    flaggedFrames: { index: number; time: string; reason: string }[]
  }
  frameCount: number
  resolvedBy?: string
  resolvedAt?: string
}

export interface HandsOnSubmission {
  id: string
  taskId: string
  userId: string
  attempt: number
  maxAttempts: number | 'unlimited'
  submittedAt: string
  status: 'pending' | 'reviewed'
  description: string
  media: { kind: 'image' | 'video' | 'audio'; label: string }[]
  score?: number
  passed?: boolean
  feedback?: string
  reviewer?: string
  staleInstructions?: boolean
}

export type AccessState =
  | 'free-trial' | 'subscriber' | 'scholarship' | 'starter' // b2c
  | 'b2b-trial' | 'essentials' | 'growth' | 'pro' | 'courtesy' | 'no-subscription' // b2b

export interface PathItem { kind: 'certification' | 'task'; refId: string; dueDate?: string }
export interface UserRec {
  id: string
  name: string
  email: string
  userType: 'b2c' | 'b2b'
  tenantId?: string
  accessState: AccessState
  language: 'en' | 'es'
  idStatus: 'not-started' | 'in-review' | 'completed' | 'reupload-requested'
  joinedAt: string
  lastActive: string
  industryPreference?: string
  integrityNote?: { text: string; by: string; at: string }
  scholarshipExpiry?: string
  nateConnectId?: string
  pathAssigned: PathItem[]
  pathSelf: PathItem[]
  skillIds: string[]
  masteryIds: string[]
  awards: { awardId: string; number: string; date: string }[]
  entitlements: { label: string; kind: 'certification' | 'quiz-attempts'; detail: string }[]
  quizState: { taskId: string; used: number; granted: number; bestScore?: number; cooldownUntil?: string }[]
}

export interface Tenant {
  id: string
  name: string
  tier: 'b2b-trial' | 'essentials' | 'growth' | 'pro' | 'courtesy' | 'no-subscription'
  seats: number
  trades: string[]
  partnerships: string[]
  customCertsUsed: number
  customTasksUsed: number
  courtesyExpiry?: string
}

export interface AuditEvent {
  id: string
  at: string
  actor: string
  action: string
  target: string
}

export interface Settings {
  b2cTrialDays: number
  b2bTrialDays: number
  initialTasksCount: number
  webcamFrequencySec: number
  natePassEmailSubject: string
  nateFailEmailSubject: string
}

export interface DB {
  tasks: Task[]
  certifications: Certification[]
  contentLinks: ContentLink[]
  industries: Industry[]
  questions: Question[]
  questionCategories: QuestionCategory[]
  skills: Skill[]
  masterySkills: MasterySkill[]
  awards: Award[]
  designs: AwardDesign[]
  feedbackForms: FeedbackForm[]
  spotlights: Spotlight[]
  proctoring: ProctoringEntry[]
  submissions: HandsOnSubmission[]
  users: UserRec[]
  tenants: Tenant[]
  audit: AuditEvent[]
  settings: Settings
}
