import type {
  DB, Task, Certification, Question, QuestionCategory, Industry, Skill, MasterySkill,
  Award, AwardDesign, FeedbackForm, Spotlight, ProctoringEntry, HandsOnSubmission,
  UserRec, Tenant, ContentLink, AuditEvent, LText,
} from './types'

const lt = (en: string, es?: string): LText => ({ en, es })

/* ---------------- Question bank ---------------- */
export const questionCategories: QuestionCategory[] = [
  { id: 'qc-epa', name: 'EPA 608' },
  { id: 'qc-epa-core', name: 'Core', parentId: 'qc-epa' },
  { id: 'qc-epa-t1', name: 'Type 1', parentId: 'qc-epa' },
  { id: 'qc-epa-t2', name: 'Type 2', parentId: 'qc-epa' },
  { id: 'qc-epa-t3', name: 'Type 3', parentId: 'qc-epa' },
  { id: 'qc-nate', name: 'NATE RTW' },
  { id: 'qc-nate-comp', name: 'Components', parentId: 'qc-nate' },
  { id: 'qc-nate-elec', name: 'Electrical Safety', parentId: 'qc-nate' },
  { id: 'qc-nate-tools', name: 'Tools', parentId: 'qc-nate' },
  { id: 'qc-nate-heat', name: 'Basic Heat Transfer', parentId: 'qc-nate' },
  { id: 'qc-nate-meas', name: 'Measurement & Units', parentId: 'qc-nate' },
  { id: 'qc-nate-safety', name: 'General Safety', parentId: 'qc-nate' },
  { id: 'qc-hvac', name: 'HVAC Basics' },
  { id: 'qc-hvac-cycle', name: 'Refrigeration Cycle', parentId: 'qc-hvac' },
  { id: 'qc-elec', name: 'Electrical' },
  { id: 'qc-elec-mm', name: 'Multimeter', parentId: 'qc-elec' },
]

export const questions: Question[] = [
  {
    id: 'q-101', type: 'multichoice', categoryId: 'qc-epa-core', status: 'active', version: 3,
    text: lt('Which refrigerant release is considered a violation of the Clean Air Act?', '¿Qué liberación de refrigerante se considera una violación de la Ley de Aire Limpio?'),
    options: [
      { id: 'a', text: lt('Venting R-410A during disposal', 'Ventear R-410A durante la eliminación'), gradePct: 100 },
      { id: 'b', text: lt('De minimis releases while making good-faith connections'), gradePct: 0 },
      { id: 'c', text: lt('Releasing nitrogen used as a trace gas'), gradePct: 0 },
      { id: 'd', text: lt('Releasing refrigerant recovered into a certified cylinder'), gradePct: -25 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing',
    feedback: { correct: lt('Correct — venting regulated refrigerants is prohibited.'), incorrect: lt('Review Section 608 venting prohibitions.') },
    randomise: true, usedInQuizzes: 5, updatedAt: '2026-05-28',
  },
  {
    id: 'q-102', type: 'truefalse', categoryId: 'qc-epa-core', status: 'active', version: 1,
    text: lt('A system-dependent recovery device captures refrigerant with the assistance of the appliance compressor.', 'Un equipo de recuperación dependiente del sistema captura refrigerante con ayuda del compresor del aparato.'),
    options: [
      { id: 'a', text: lt('True', 'Verdadero'), gradePct: 100 },
      { id: 'b', text: lt('False', 'Falso'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing',
    feedback: { correct: lt('Correct.'), incorrect: lt('System-dependent recovery relies on the appliance compressor.') },
    randomise: false, usedInQuizzes: 5, updatedAt: '2026-04-12',
  },
  {
    id: 'q-103', type: 'matching', categoryId: 'qc-epa-core', status: 'active', version: 2,
    text: lt('Match each refrigerant to its classification.'),
    options: [], matchingScoring: 'partial',
    pairs: [
      { left: lt('R-22'), right: lt('HCFC') },
      { left: lt('R-410A'), right: lt('HFC') },
      { left: lt('R-12'), right: lt('CFC') },
      { left: lt('R-290'), right: lt('Natural (Hydrocarbon)') },
    ],
    feedback: { correct: lt('All pairs matched.'), partial: lt('Some pairs correct — review refrigerant families.'), incorrect: lt('Review refrigerant classifications.') },
    randomise: true, usedInQuizzes: 4, updatedAt: '2026-05-02',
  },
  {
    id: 'q-104', type: 'multichoice', categoryId: 'qc-epa-t1', status: 'active', version: 1,
    text: lt('A Type 1 appliance contains how much refrigerant?'),
    options: [
      { id: 'a', text: lt('5 lbs or less'), gradePct: 100 },
      { id: 'b', text: lt('Less than 50 lbs'), gradePct: 0 },
      { id: 'c', text: lt('More than 50 lbs'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing',
    feedback: { correct: lt('Correct — small appliances hold 5 lbs or less.'), incorrect: lt('Type 1 covers small appliances: 5 lbs or less.') },
    randomise: true, usedInQuizzes: 2, updatedAt: '2026-03-19',
  },
  {
    id: 'q-105', type: 'multichoice', categoryId: 'qc-epa-t2', status: 'active', version: 1,
    text: lt('Before disposing of a high-pressure appliance, the refrigerant must be recovered to what level if the compressor is operational?'),
    options: [
      { id: 'a', text: lt('0 psig'), gradePct: 100 },
      { id: 'b', text: lt('4 inches Hg vacuum'), gradePct: 0 },
      { id: 'c', text: lt('10 inches Hg vacuum'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing', feedback: {},
    randomise: true, usedInQuizzes: 2, updatedAt: '2026-03-19',
  },
  {
    id: 'q-106', type: 'multichoice', categoryId: 'qc-epa-t3', status: 'active', version: 1,
    text: lt('Low-pressure appliances typically use which refrigerant?'),
    options: [
      { id: 'a', text: lt('R-123'), gradePct: 100 },
      { id: 'b', text: lt('R-410A'), gradePct: 0 },
      { id: 'c', text: lt('R-404A'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing', feedback: {},
    randomise: true, usedInQuizzes: 2, updatedAt: '2026-03-22',
  },
  {
    id: 'q-201', type: 'multichoice', categoryId: 'qc-nate-comp', status: 'active', version: 1,
    text: lt('Which component changes low-pressure vapor into high-pressure vapor?', '¿Qué componente convierte el vapor de baja presión en vapor de alta presión?'),
    options: [
      { id: 'a', text: lt('Compressor', 'Compresor'), gradePct: 100 },
      { id: 'b', text: lt('Evaporator', 'Evaporador'), gradePct: 0 },
      { id: 'c', text: lt('Metering device', 'Dispositivo de medición'), gradePct: 0 },
      { id: 'd', text: lt('Condenser', 'Condensador'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing',
    feedback: { correct: lt('Correct.'), incorrect: lt('The compressor raises vapor pressure and temperature.') },
    randomise: true, usedInQuizzes: 1, updatedAt: '2026-05-30',
  },
  {
    id: 'q-202', type: 'truefalse', categoryId: 'qc-nate-elec', status: 'active', version: 1,
    text: lt('Lockout/tagout must be applied before servicing electrical components.', 'Se debe aplicar bloqueo/etiquetado antes de dar servicio a componentes eléctricos.'),
    options: [
      { id: 'a', text: lt('True', 'Verdadero'), gradePct: 100 },
      { id: 'b', text: lt('False', 'Falso'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing', feedback: {},
    randomise: false, usedInQuizzes: 1, updatedAt: '2026-05-30',
  },
  {
    id: 'q-203', type: 'matching', categoryId: 'qc-nate-tools', status: 'active', version: 1,
    text: lt('Match the tool to its primary use.'),
    options: [], matchingScoring: 'all-or-nothing',
    pairs: [
      { left: lt('Manifold gauge set'), right: lt('Reading system pressures') },
      { left: lt('Vacuum pump'), right: lt('Evacuating a system') },
      { left: lt('Tubing cutter'), right: lt('Cutting copper line sets') },
    ],
    feedback: {}, randomise: true, usedInQuizzes: 1, updatedAt: '2026-05-11',
  },
  {
    id: 'q-204', type: 'multichoice', categoryId: 'qc-nate-heat', status: 'draft', version: 1,
    text: lt('Heat always flows from…'),
    options: [
      { id: 'a', text: lt('A warmer substance to a cooler substance'), gradePct: 100 },
      { id: 'b', text: lt('A cooler substance to a warmer substance'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing', feedback: {},
    randomise: true, usedInQuizzes: 0, updatedAt: '2026-06-04',
  },
  {
    id: 'q-301', type: 'multichoice', categoryId: 'qc-hvac-cycle', status: 'active', version: 4,
    text: lt('In the refrigeration cycle, where does the refrigerant absorb heat?', 'En el ciclo de refrigeración, ¿dónde absorbe calor el refrigerante?'),
    options: [
      { id: 'a', text: lt('Evaporator', 'Evaporador'), gradePct: 100 },
      { id: 'b', text: lt('Condenser', 'Condensador'), gradePct: 0 },
      { id: 'c', text: lt('Compressor', 'Compresor'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing',
    feedback: { correct: lt('Correct — the evaporator absorbs heat from the conditioned space.'), incorrect: lt('Review the four stages of the refrigeration cycle.') },
    randomise: true, usedInQuizzes: 3, updatedAt: '2026-05-21',
  },
  {
    id: 'q-302', type: 'multichoice', categoryId: 'qc-elec-mm', status: 'active', version: 1,
    text: lt('Which multimeter setting measures resistance?'),
    options: [
      { id: 'a', text: lt('Ohms (Ω)'), gradePct: 100 },
      { id: 'b', text: lt('Volts AC'), gradePct: 0 },
      { id: 'c', text: lt('Amps'), gradePct: 0 },
      { id: 'd', text: lt('Hertz'), gradePct: 0 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing', feedback: {},
    randomise: true, usedInQuizzes: 2, updatedAt: '2026-02-14',
  },
  {
    id: 'q-303', type: 'truefalse', categoryId: 'qc-elec-mm', status: 'archived', version: 2,
    text: lt('Continuity should be tested on a live circuit.'),
    options: [
      { id: 'a', text: lt('True'), gradePct: 0 },
      { id: 'b', text: lt('False'), gradePct: 100 },
    ],
    pairs: [], matchingScoring: 'all-or-nothing',
    feedback: { incorrect: lt('Never test continuity on an energized circuit.') },
    randomise: false, usedInQuizzes: 1, updatedAt: '2025-11-02',
  },
]

/* ---------------- Tasks ---------------- */
export const tasks: Task[] = [
  {
    id: 't-epa-core-intro', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('EPA Core: Introduction to Section 608', 'EPA Core: Introducción a la Sección 608'),
    description: lt('Interactive module covering ozone depletion, the Clean Air Act, and Section 608 requirements.'),
    timeToComplete: { value: 25, unit: 'minutes' }, completion: 'xapi-statement', updatedAt: '2026-05-22',
    xapi: { packageEn: 'epa-core-intro-en-v4.zip', packageEs: 'epa-core-intro-es-v3.zip', scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' },
  },
  {
    id: 't-epa-core-quiz', type: 'quiz', owner: 'skillcat', visibility: 'visible',
    name: lt('EPA Core: Checkpoint Quiz', 'EPA Core: Cuestionario de control'),
    timeToComplete: { value: 15, unit: 'minutes' }, completion: 'passing-grade', updatedAt: '2026-05-22',
    quiz: {
      sections: [], staticQuestionIds: ['q-101', 'q-102', 'q-103'], randomPool: { poolSize: 24, draw: 7 },
      questionOrder: 'fixed', maxAttempts: 'unlimited', cooldownMinutes: 0, variableCooldowns: [],
      resources: [], gradeLevel: 'quiz', quizPassingGrade: 80,
      review: { attempt: true, quizResult: true, quizScore: true, whetherCorrect: true, perQuestionFeedback: true, perSectionResults: false },
      proctored: false, paywall: { kind: 'free' },
    },
  },
  {
    id: 't-epa-t1-mod', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('Type 1: Small Appliances', 'Tipo 1: Electrodomésticos pequeños'),
    timeToComplete: { value: 40, unit: 'minutes' }, completion: 'xapi-statement', updatedAt: '2026-04-30',
    xapi: { packageEn: 'epa-t1-en-v2.zip', packageEs: 'epa-t1-es-v2.zip', scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' },
  },
  {
    id: 't-epa-t2-mod', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('Type 2: High-Pressure Appliances', 'Tipo 2: Equipos de alta presión'),
    timeToComplete: { value: 45, unit: 'minutes' }, completion: 'xapi-statement', updatedAt: '2026-04-30',
    xapi: { packageEn: 'epa-t2-en-v2.zip', scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' },
  },
  {
    id: 't-epa-t3-mod', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('Type 3: Low-Pressure Appliances', 'Tipo 3: Equipos de baja presión'),
    timeToComplete: { value: 45, unit: 'minutes' }, completion: 'xapi-statement', updatedAt: '2026-04-30',
    xapi: { packageEn: 'epa-t3-en-v2.zip', packageEs: 'epa-t3-es-v1.zip', scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' },
  },
  {
    id: 't-id-upload', type: 'id-upload', owner: 'skillcat', visibility: 'visible',
    name: lt('Government ID Upload', 'Carga de identificación oficial'),
    description: lt('Upload a photo of a government-issued ID. Reviewed by the Proctoring Team. Reused across EPA 608, EPA 609 and NATE RTW.'),
    completion: 'admin-approved', updatedAt: '2026-01-15',
  },
  {
    id: 't-epa-universal-exam', type: 'quiz', owner: 'skillcat', visibility: 'visible',
    name: lt('EPA 608 Universal: Final Exam', 'EPA 608 Universal: Examen final'),
    timeToComplete: { value: 3, unit: 'hours' }, completion: 'passing-grade', updatedAt: '2026-06-02',
    quiz: {
      sections: [
        { id: 's-core', name: lt('Core', 'Core'), requiredToPass: true, passingGrade: 70, staticQuestionIds: [], randomPool: { poolSize: 120, draw: 25 } },
        { id: 's-t1', name: lt('Type 1', 'Tipo 1'), requiredToPass: false, passingGrade: 70, staticQuestionIds: [], randomPool: { poolSize: 96, draw: 25 } },
        { id: 's-t2', name: lt('Type 2', 'Tipo 2'), requiredToPass: false, passingGrade: 70, staticQuestionIds: [], randomPool: { poolSize: 104, draw: 25 } },
        { id: 's-t3', name: lt('Type 3', 'Tipo 3'), requiredToPass: false, passingGrade: 70, staticQuestionIds: [], randomPool: { poolSize: 88, draw: 25 } },
      ],
      staticQuestionIds: [], questionOrder: 'shuffle-within-section', maxAttempts: 4, cooldownMinutes: 240,
      variableCooldowns: [
        { betweenAttempts: '1 → 2', minutes: 240 },
        { betweenAttempts: '2 → 3', minutes: 360 },
        { betweenAttempts: '3 → 4', minutes: 720 },
      ],
      autoAdditionalAttempts: { count: 4, requiredTasks: 50 },
      timeLimitMinutes: 180,
      resources: [
        { name: 'PT Chart — R-22 / R-410A', kind: 'pdf' },
        { name: 'Temperature Conversion Table', kind: 'image' },
      ],
      gradeLevel: 'section',
      review: { attempt: false, quizResult: false, quizScore: true, whetherCorrect: false, perQuestionFeedback: false, perSectionResults: true },
      proctored: true, paywall: { kind: 'free' },
    },
  },
  {
    id: 't-epa-t1-exam', type: 'quiz', owner: 'skillcat', visibility: 'visible',
    name: lt('EPA 608 Type 1: Final Exam', 'EPA 608 Tipo 1: Examen final'),
    timeToComplete: { value: 90, unit: 'minutes' }, completion: 'passing-grade', updatedAt: '2026-06-02',
    quiz: {
      sections: [
        { id: 's-core', name: lt('Core', 'Core'), requiredToPass: true, passingGrade: 70, staticQuestionIds: [], randomPool: { poolSize: 120, draw: 25 } },
        { id: 's-t1', name: lt('Type 1', 'Tipo 1'), requiredToPass: false, passingGrade: 70, staticQuestionIds: [], randomPool: { poolSize: 96, draw: 25 } },
      ],
      staticQuestionIds: [], questionOrder: 'shuffle-within-section', maxAttempts: 4, cooldownMinutes: 240, variableCooldowns: [],
      autoAdditionalAttempts: { count: 4, requiredTasks: 50 },
      timeLimitMinutes: 90, resources: [{ name: 'PT Chart — R-22 / R-410A', kind: 'pdf' }],
      gradeLevel: 'section',
      review: { attempt: false, quizResult: false, quizScore: true, whetherCorrect: false, perQuestionFeedback: false, perSectionResults: true },
      proctored: false, paywall: { kind: 'free' },
    },
  },
  {
    id: 't-nate-rtw-exam', type: 'quiz', owner: 'skillcat', visibility: 'visible',
    name: lt('NATE Ready To Work: Final Exam', 'NATE Ready To Work: Examen final'),
    timeToComplete: { value: 2, unit: 'hours' }, completion: 'passing-grade', updatedAt: '2026-05-18',
    quiz: {
      sections: [
        { id: 'n-comp', name: lt('Components', 'Componentes'), requiredToPass: false, staticQuestionIds: ['q-201'], randomPool: { poolSize: 40, draw: 8 } },
        { id: 'n-elec', name: lt('Electrical Safety', 'Seguridad eléctrica'), requiredToPass: false, staticQuestionIds: ['q-202'], randomPool: { poolSize: 36, draw: 8 } },
        { id: 'n-tools', name: lt('Tools', 'Herramientas'), requiredToPass: false, staticQuestionIds: ['q-203'], randomPool: { poolSize: 30, draw: 8 } },
        { id: 'n-heat', name: lt('Basic Heat Transfer', 'Transferencia de calor'), requiredToPass: false, staticQuestionIds: [], randomPool: { poolSize: 32, draw: 8 } },
        { id: 'n-meas', name: lt('Measurement & Units', 'Medición y unidades'), requiredToPass: false, staticQuestionIds: [], randomPool: { poolSize: 28, draw: 9 } },
        { id: 'n-safety', name: lt('General Safety', 'Seguridad general'), requiredToPass: false, staticQuestionIds: [], randomPool: { poolSize: 34, draw: 9 } },
      ],
      staticQuestionIds: [], questionOrder: 'shuffle-within-section', maxAttempts: 10, cooldownMinutes: 1440, variableCooldowns: [],
      timeLimitMinutes: 120, resources: [],
      gradeLevel: 'quiz', quizPassingGrade: 70,
      review: { attempt: false, quizResult: true, quizScore: true, whetherCorrect: false, perQuestionFeedback: false, perSectionResults: true },
      proctored: false,
      paywall: { kind: 'consumable', firstAttempt: 60, subsequent: 45 },
      nate: { externalIdEn: 'RTW-EN-2041', externalIdEs: 'RTW-ES-2042' },
    },
  },
  {
    id: 't-osha10-module', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('OSHA 10 — General Industry (ClickSafety)'),
    description: lt('Third-party xAPI content from ClickSafety, converted from SCORM via SCORM Cloud. Statements forwarded to the SkillCat LRS.'),
    timeToComplete: { value: 10, unit: 'hours' }, completion: 'xapi-statement', updatedAt: '2026-05-29',
    xapi: { packageEn: 'clicksafety-osha10-xapi.zip', scoreCapture: true, allowRotation: true, lockedOrientation: 'landscape', thirdParty: 'ClickSafety' },
  },
  {
    id: 't-intro-hvac-m1', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('What is HVAC?', '¿Qué es HVAC?'),
    timeToComplete: { value: 18, unit: 'minutes' }, completion: 'xapi-statement', updatedAt: '2026-03-08',
    xapi: { packageEn: 'intro-hvac-m1-en.zip', packageEs: 'intro-hvac-m1-es.zip', scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' },
  },
  {
    id: 't-intro-hvac-m2', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('The Refrigeration Cycle', 'El ciclo de refrigeración'),
    timeToComplete: { value: 30, unit: 'minutes' }, completion: 'xapi-statement', updatedAt: '2026-03-08',
    xapi: { packageEn: 'intro-hvac-m2-en.zip', packageEs: 'intro-hvac-m2-es.zip', scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' },
  },
  {
    id: 't-intro-hvac-final', type: 'quiz', owner: 'skillcat', visibility: 'visible',
    name: lt('Intro to HVAC: Final Exam', 'Intro a HVAC: Examen final'),
    timeToComplete: { value: 20, unit: 'minutes' }, completion: 'passing-grade', updatedAt: '2026-03-10',
    quiz: {
      sections: [], staticQuestionIds: ['q-301'], randomPool: { poolSize: 30, draw: 9 },
      questionOrder: 'shuffle-all', maxAttempts: 'unlimited', cooldownMinutes: 0, variableCooldowns: [],
      resources: [], gradeLevel: 'quiz', quizPassingGrade: 80,
      review: { attempt: true, quizResult: true, quizScore: true, whetherCorrect: true, perQuestionFeedback: true, perSectionResults: false },
      proctored: false, paywall: { kind: 'free' },
    },
  },
  {
    id: 't-multimeter-xapi', type: 'xapi', owner: 'skillcat', visibility: 'visible',
    name: lt('Using a Multimeter: Fundamentals', 'Uso del multímetro: Fundamentos'),
    timeToComplete: { value: 35, unit: 'minutes' }, completion: 'xapi-statement', updatedAt: '2026-02-11',
    xapi: { packageEn: 'multimeter-v2-en.zip', packageEs: 'multimeter-v2-es.zip', scoreCapture: false, allowRotation: false, lockedOrientation: 'landscape' },
  },
  {
    id: 't-multimeter-final', type: 'quiz', owner: 'skillcat', visibility: 'visible',
    name: lt('Using a Multimeter: Final Exam'),
    timeToComplete: { value: 15, unit: 'minutes' }, completion: 'passing-grade', updatedAt: '2026-02-11',
    quiz: {
      sections: [], staticQuestionIds: ['q-302'], randomPool: { poolSize: 18, draw: 7 },
      questionOrder: 'shuffle-all', maxAttempts: 'unlimited', cooldownMinutes: 0, variableCooldowns: [],
      resources: [], gradeLevel: 'quiz', quizPassingGrade: 80,
      review: { attempt: true, quizResult: true, quizScore: true, whetherCorrect: true, perQuestionFeedback: true, perSectionResults: false },
      proctored: false, paywall: { kind: 'free' },
    },
  },
  {
    id: 't-install-heat-pump', type: 'hands-on', owner: 'skillcat', visibility: 'visible', discoverable: true,
    name: lt('Install a Heat Pump', 'Instalar una bomba de calor'),
    description: lt('Demonstrate a complete residential heat pump installation.'),
    timeToComplete: { value: 2, unit: 'weeks' }, completion: 'reviewer-grade', updatedAt: '2026-05-14',
    handsOn: {
      instructions: lt('Document a full installation: pad placement, line set, electrical, charge, and commissioning readings.', 'Documente una instalación completa: base, líneas, conexión eléctrica, carga y lecturas de puesta en marcha.'),
      toolsMaterials: lt('Torque wrench, vacuum pump, micron gauge, manifold set, nitrogen rig.'),
      reviewerChecklist: lt('Verify: line set brazed with nitrogen flow, vacuum below 500 microns, correct subcooling for the metering device, breaker sizing matches nameplate.'),
      referenceFiles: [{ name: 'heat-pump-install-guide.pdf', lang: 'en' }, { name: 'guia-instalacion-bomba.pdf', lang: 'es' }],
      passingScore: 7, maxAttempts: 3, descriptionCharLimit: 800, maxMediaFiles: 8, mediaTypes: ['images', 'videos'],
    },
  },
  {
    id: 't-replace-thermostat', type: 'hands-on', owner: 'skillcat', visibility: 'visible', discoverable: true,
    name: lt('Replace a Thermostat', 'Reemplazar un termostato'),
    timeToComplete: { value: 3, unit: 'days' }, completion: 'reviewer-grade', updatedAt: '2026-04-02',
    handsOn: {
      instructions: lt('Remove an existing thermostat and install a replacement. Photograph the wiring before and after.'),
      reviewerChecklist: lt('Check: wire labelling, C-wire handling, level mounting, correct system type configuration.'),
      referenceFiles: [{ name: 'thermostat-wiring-chart.pdf', lang: 'en' }],
      passingScore: 7, maxAttempts: 5, descriptionCharLimit: 500, maxMediaFiles: 6, mediaTypes: ['images'],
    },
  },
  {
    id: 't-minisplit-design', type: 'hands-on', owner: 'tn-hudson', visibility: 'visible',
    name: lt('Design a Mini-Split Installation (Hudson)'),
    timeToComplete: { value: 1, unit: 'weeks' }, completion: 'reviewer-grade', updatedAt: '2026-05-26',
    handsOn: {
      instructions: lt('Produce a load calculation and equipment selection for an assigned residential job.'),
      referenceFiles: [], passingScore: 8, maxAttempts: 2, descriptionCharLimit: 1000, maxMediaFiles: 4, mediaTypes: ['images'],
    },
  },
  {
    id: 't-pt-chart', type: 'file', owner: 'skillcat', visibility: 'visible',
    name: lt('PT Chart Reference Pack', 'Tablas PT de referencia'),
    completion: 'on-view', updatedAt: '2026-01-20',
    file: { fileName: 'pt-chart-pack-2026.pdf', sizeMb: 4.2, openIn: 'in-app' },
  },
  {
    id: 't-osha-niosh-url', type: 'url', owner: 'skillcat', visibility: 'visible',
    name: lt('OSHA Heat Safety Guidelines', 'Pautas de seguridad térmica de OSHA'),
    completion: 'manual-by-user', updatedAt: '2026-03-30',
    url: { url: 'https://www.osha.gov/heat-exposure', openIn: 'external', allowRotation: true, lockedOrientation: 'portrait' },
  },
  {
    id: 't-lab-deeplink', type: 'deeplink', owner: 'skillcat', visibility: 'hidden',
    name: lt('Open the Lab Tab', 'Abrir la pestaña Lab'),
    completion: 'on-view', updatedAt: '2026-02-02',
    deeplink: { url: 'https://skillcat.app/lab' },
  },
]

/* ---------------- Certifications ---------------- */
const epaExamCourse = (examTaskId: string): Course[] => [
  {
    id: 'crs-core', name: lt('Core', 'Core'),
    description: lt('Required for all EPA 608 certification types.'),
    items: [
      { kind: 'task', taskId: 't-epa-core-intro' },
      { kind: 'task', taskId: 't-epa-core-quiz' },
      { kind: 'task', taskId: 't-pt-chart' },
    ],
  },
  {
    id: 'crs-exam', name: lt('Certification Exam', 'Examen de certificación'),
    items: [
      { kind: 'task', taskId: 't-id-upload' },
      { kind: 'task', taskId: examTaskId },
    ],
  },
]

type Course = Certification['courses'][number]

export const certifications: Certification[] = [
  {
    id: 'c-epa-universal',
    name: lt('EPA 608 Universal', 'EPA 608 Universal'),
    description: lt('Full Section 608 certification covering Core plus Types 1, 2 and 3. Proctored final exam with per-section grading.'),
    visibility: 'visible', certType: 'credential', careerStage: 'apprentice',
    timeToComplete: { value: 4, unit: 'weeks' }, ceu: 1.6,
    graphic: 'linear-gradient(135deg, #4f6df5, #3b4fd0)', emoji: '❄️',
    announcement: lt('Exam pools were refreshed in May 2026. Review the updated PT charts before attempting.'),
    replacementIds: [], keywords: ['epa', 'refrigerant', '608', 'universal'],
    slug: 'EPA608Universal', industryIds: ['ind-hvac'], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: [
      {
        id: 'crs-u-core', name: lt('Core', 'Core'), description: lt('Required for all EPA 608 types.'),
        items: [
          { kind: 'task', taskId: 't-epa-core-intro' },
          { kind: 'task', taskId: 't-epa-core-quiz' },
          { kind: 'task', taskId: 't-pt-chart' },
        ],
      },
      { id: 'crs-u-t1', name: lt('Type 1', 'Tipo 1'), items: [{ kind: 'task', taskId: 't-epa-t1-mod' }] },
      { id: 'crs-u-t2', name: lt('Type 2', 'Tipo 2'), items: [{ kind: 'task', taskId: 't-epa-t2-mod' }] },
      {
        id: 'crs-u-exam', name: lt('Type 3 & Exam', 'Tipo 3 y examen'),
        items: [
          { kind: 'task', taskId: 't-epa-t3-mod' },
          { kind: 'task', taskId: 't-id-upload' },
          { kind: 'task', taskId: 't-epa-universal-exam' },
        ],
      },
    ],
    restrictions: { 't-epa-universal-exam': { requires: ['t-id-upload'], mode: 'any' } },
    conditionSets: [
      {
        id: 'cs-1',
        items: [
          { kind: 'task', refId: 't-id-upload', label: 'Government ID Upload — Completed' },
          { kind: 'task', refId: 't-epa-universal-exam', label: 'EPA 608 Universal: Final Exam — Completed' },
        ],
      },
      {
        id: 'cs-2',
        items: [
          { kind: 'certification', refId: 'c-epa-type1', label: 'EPA 608 Type 1 — Completed' },
          { kind: 'certification', refId: 'c-epa-type2', label: 'EPA 608 Type 2 — Completed' },
          { kind: 'certification', refId: 'c-epa-type3', label: 'EPA 608 Type 3 — Completed' },
        ],
      },
    ],
    awardId: 'aw-epa-universal', feedbackFormId: 'fb-epa',
    enrolled: 12840, completed: 4317, owner: 'skillcat', updatedAt: '2026-06-02',
  },
  {
    id: 'c-epa-type1',
    name: lt('EPA 608 Type 1', 'EPA 608 Tipo 1'),
    description: lt('Certification for servicing small appliances (5 lbs or less of refrigerant).'),
    visibility: 'visible', certType: 'credential', careerStage: 'apprentice',
    timeToComplete: { value: 2, unit: 'weeks' },
    graphic: 'linear-gradient(135deg, #38bdf8, #2b7fd4)', emoji: '🧊',
    replacementIds: [], keywords: ['epa', 'type 1', 'small appliances'],
    slug: 'EPA608Type1', industryIds: ['ind-hvac'], subIndustryIds: ['sub-hvac-res'],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: epaExamCourse('t-epa-t1-exam'),
    restrictions: { 't-epa-t1-exam': { requires: ['t-id-upload'], mode: 'any' } },
    conditionSets: [
      {
        id: 'cs-1',
        items: [
          { kind: 'task', refId: 't-id-upload', label: 'Government ID Upload — Completed' },
          { kind: 'task', refId: 't-epa-t1-exam', label: 'EPA 608 Type 1: Final Exam — Completed' },
        ],
      },
      {
        id: 'cs-2',
        items: [
          { kind: 'task', refId: 't-id-upload', label: 'Government ID Upload — Completed' },
          { kind: 'quiz-section', refId: 't-epa-universal-exam:s-t1', label: 'Universal Quiz — "Type 1" Section completed' },
        ],
      },
    ],
    awardId: 'aw-epa-t1', feedbackFormId: 'fb-epa',
    enrolled: 6210, completed: 2954, owner: 'skillcat', updatedAt: '2026-06-02',
  },
  {
    id: 'c-epa-type2',
    name: lt('EPA 608 Type 2', 'EPA 608 Tipo 2'),
    description: lt('Certification for high-pressure appliance service and disposal.'),
    visibility: 'visible', certType: 'credential', careerStage: 'journeyman',
    timeToComplete: { value: 2, unit: 'weeks' },
    graphic: 'linear-gradient(135deg, #34d399, #0e9f6e)', emoji: '🌡️',
    replacementIds: [], keywords: ['epa', 'type 2'],
    slug: 'EPA608Type2', industryIds: ['ind-hvac'], subIndustryIds: ['sub-hvac-com'],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: epaExamCourse('t-epa-universal-exam'),
    restrictions: {},
    conditionSets: [
      {
        id: 'cs-1',
        items: [
          { kind: 'task', refId: 't-id-upload', label: 'Government ID Upload — Completed' },
          { kind: 'quiz-section', refId: 't-epa-universal-exam:s-t2', label: 'Universal Quiz — "Type 2" Section completed' },
        ],
      },
    ],
    awardId: 'aw-epa-t2',
    enrolled: 4480, completed: 1733, owner: 'skillcat', updatedAt: '2026-05-12',
  },
  {
    id: 'c-epa-type3',
    name: lt('EPA 608 Type 3', 'EPA 608 Tipo 3'),
    description: lt('Certification for low-pressure appliance service and disposal.'),
    visibility: 'visible', certType: 'credential', careerStage: 'journeyman',
    timeToComplete: { value: 2, unit: 'weeks' },
    graphic: 'linear-gradient(135deg, #a78bfa, #7c5cd6)', emoji: '🏭',
    replacementIds: [], keywords: ['epa', 'type 3'],
    slug: 'EPA608Type3', industryIds: ['ind-hvac'], subIndustryIds: ['sub-hvac-com'],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: epaExamCourse('t-epa-universal-exam'),
    restrictions: {},
    conditionSets: [
      {
        id: 'cs-1',
        items: [
          { kind: 'task', refId: 't-id-upload', label: 'Government ID Upload — Completed' },
          { kind: 'quiz-section', refId: 't-epa-universal-exam:s-t3', label: 'Universal Quiz — "Type 3" Section completed' },
        ],
      },
    ],
    awardId: 'aw-epa-t3',
    enrolled: 3170, completed: 1241, owner: 'skillcat', updatedAt: '2026-05-12',
  },
  {
    id: 'c-nate-rtw',
    name: lt('NATE Ready To Work', 'NATE Ready To Work'),
    description: lt('Entry-level NATE certification. 50 questions across six topic areas, 70% overall to pass. Results submitted to NATE via API.'),
    visibility: 'visible', certType: 'credential', careerStage: 'apprentice',
    timeToComplete: { value: 3, unit: 'weeks' },
    graphic: 'linear-gradient(135deg, #f59e0b, #d97706)', emoji: '🛠️',
    replacementIds: [], keywords: ['nate', 'rtw', 'ready to work'],
    slug: 'NATEReadyToWork', industryIds: ['ind-hvac'], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: [
      {
        id: 'crs-n1', name: lt('Exam Preparation', 'Preparación'),
        items: [
          { kind: 'task', taskId: 't-intro-hvac-m2' },
          {
            kind: 'lesson',
            lesson: { id: 'l-n1', name: lt('Safety Refreshers', 'Repasos de seguridad'), taskIds: ['t-osha-niosh-url'] },
          },
        ],
      },
      {
        id: 'crs-n2', name: lt('Certification Exam', 'Examen de certificación'),
        items: [
          { kind: 'task', taskId: 't-id-upload' },
          { kind: 'task', taskId: 't-nate-rtw-exam' },
        ],
      },
    ],
    restrictions: { 't-nate-rtw-exam': { requires: ['t-id-upload'], mode: 'any' } },
    conditionSets: [
      {
        id: 'cs-1',
        items: [
          { kind: 'task', refId: 't-id-upload', label: 'Government ID Upload — Completed' },
          { kind: 'task', refId: 't-nate-rtw-exam', label: 'NATE RTW: Final Exam — Completed' },
        ],
      },
    ],
    awardId: 'aw-nate', feedbackFormId: 'fb-nate',
    enrolled: 5320, completed: 1187, owner: 'skillcat', updatedAt: '2026-05-18',
  },
  {
    id: 'c-osha10',
    name: lt('OSHA 10 — General Industry'),
    description: lt('Delivered via ClickSafety xAPI content. Consumable purchase: access is revoked when the consumption trigger fires; repurchase at the same price.'),
    visibility: 'visible', certType: 'credential', careerStage: 'apprentice',
    timeToComplete: { value: 10, unit: 'hours' },
    graphic: 'linear-gradient(135deg, #f97316, #dc2626)', emoji: '⛑️',
    replacementIds: [], keywords: ['osha', 'safety', '10-hour'],
    slug: 'OSHA10', industryIds: ['ind-safety'], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'all',
    paywall: {
      kind: 'consumable', priceStripe: 89, priceApple: 99, priceGoogle: 99,
      triggers: ['manual'], progressOnConsumption: 'preserve',
    },
    forceOrder: true,
    courses: [
      { id: 'crs-o1', name: lt('OSHA 10 Course'), items: [{ kind: 'task', taskId: 't-osha10-module' }] },
    ],
    restrictions: {},
    conditionSets: [
      { id: 'cs-1', items: [{ kind: 'task', refId: 't-osha10-module', label: 'OSHA 10 module — Completed (xAPI statement)' }] },
    ],
    awardId: 'aw-osha',
    enrolled: 2110, completed: 1409, owner: 'skillcat', updatedAt: '2026-05-29',
  },
  {
    id: 'c-intro-hvac',
    name: lt('Intro to HVAC', 'Intro a HVAC'),
    description: lt('A first look at the HVAC trade: what technicians do, core components, and the refrigeration cycle.'),
    visibility: 'visible', certType: 'unit', careerStage: 'apprentice',
    timeToComplete: { value: 90, unit: 'minutes' },
    graphic: 'linear-gradient(135deg, #2dd4bf, #0d9488)', emoji: '🌀',
    replacementIds: [], keywords: ['hvac', 'intro', 'basics'],
    slug: 'IntroToHVAC', industryIds: ['ind-hvac'], subIndustryIds: ['sub-hvac-res'],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: [
      {
        id: 'crs-i1', name: lt('Foundations', 'Fundamentos'),
        items: [
          { kind: 'task', taskId: 't-intro-hvac-m1' },
          { kind: 'task', taskId: 't-intro-hvac-m2' },
          { kind: 'task', taskId: 't-intro-hvac-final' },
        ],
      },
    ],
    restrictions: {},
    conditionSets: [
      { id: 'cs-1', items: [{ kind: 'task', refId: 't-intro-hvac-final', label: 'Intro to HVAC: Final Exam — Completed' }] },
    ],
    awardId: 'aw-intro-hvac', feedbackFormId: 'fb-pulse',
    enrolled: 24190, completed: 16882, owner: 'skillcat', updatedAt: '2026-03-10',
  },
  {
    id: 'c-multimeter-v1',
    name: lt('Using a Multimeter'),
    description: lt('Retired 2026 — replaced by Using a Multimeter v2.'),
    visibility: 'archived', certType: 'unit', careerStage: 'apprentice',
    timeToComplete: { value: 60, unit: 'minutes' },
    graphic: 'linear-gradient(135deg, #94a3b8, #64748b)', emoji: '🔌',
    replacementIds: ['c-multimeter-v2'],
    replacementAlert: lt('This Certification has been retired. An updated version with new meter models is available — switch any time; your progress on shared Tasks carries over.'),
    keywords: ['multimeter', 'electrical'],
    slug: 'UsingAMultimeter', industryIds: ['ind-electrical'], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: [
      { id: 'crs-m1', name: lt('Multimeter Basics'), items: [{ kind: 'task', taskId: 't-multimeter-xapi' }, { kind: 'task', taskId: 't-multimeter-final' }] },
    ],
    restrictions: {},
    conditionSets: [
      { id: 'cs-1', items: [{ kind: 'task', refId: 't-multimeter-final', label: 'Multimeter Final Exam — Completed' }] },
    ],
    awardId: 'aw-multimeter',
    enrolled: 9420, completed: 7011, owner: 'skillcat', updatedAt: '2026-04-22',
  },
  {
    id: 'c-multimeter-v2',
    name: lt('Using a Multimeter v2', 'Uso del multímetro v2'),
    description: lt('Updated multimeter fundamentals with digital meter models and live-circuit safety.'),
    visibility: 'visible', certType: 'unit', careerStage: 'apprentice',
    timeToComplete: { value: 75, unit: 'minutes' },
    graphic: 'linear-gradient(135deg, #facc15, #ca8a04)', emoji: '⚡',
    replacementIds: [], keywords: ['multimeter', 'electrical', 'v2'],
    slug: 'UsingAMultimeterV2', industryIds: ['ind-electrical'], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: [
      { id: 'crs-m2', name: lt('Multimeter Fundamentals'), items: [{ kind: 'task', taskId: 't-multimeter-xapi' }, { kind: 'task', taskId: 't-multimeter-final' }] },
    ],
    restrictions: {},
    conditionSets: [
      { id: 'cs-1', items: [{ kind: 'task', refId: 't-multimeter-final', label: 'Multimeter Final Exam — Completed' }] },
    ],
    awardId: 'aw-multimeter-v2',
    enrolled: 3105, completed: 1518, owner: 'skillcat', updatedAt: '2026-04-22',
  },
  {
    id: 'c-key-hand-tools',
    name: lt('Key Hand Tools', 'Herramientas manuales clave'),
    description: lt('Identify and safely use the hand tools every tech carries.'),
    visibility: 'visible', certType: 'unit', careerStage: 'apprentice',
    timeToComplete: { value: 2, unit: 'hours' },
    graphic: 'linear-gradient(135deg, #fb7185, #e11d48)', emoji: '🧰',
    replacementIds: [], keywords: ['tools'],
    slug: 'KeyHandTools', industryIds: ['ind-hvac', 'ind-plumbing'], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: [
      { id: 'crs-k1', name: lt('Hand Tools'), items: [{ kind: 'task', taskId: 't-osha-niosh-url' }, { kind: 'task', taskId: 't-replace-thermostat' }] },
    ],
    restrictions: {},
    conditionSets: [
      { id: 'cs-1', items: [{ kind: 'task', refId: 't-replace-thermostat', label: 'Replace a Thermostat — Passing grade from reviewer' }] },
    ],
    enrolled: 8330, completed: 5126, owner: 'skillcat', updatedAt: '2026-04-02',
  },
  {
    id: 'c-hvac-trade-school',
    name: lt('HVAC Trade School', 'Escuela de Oficios HVAC'),
    description: lt('The complete program: from fundamentals to EPA 608 Universal. Completes when every constituent Certification is complete.'),
    visibility: 'visible', certType: 'program', careerStage: 'apprentice',
    timeToComplete: { value: 4, unit: 'months' }, ceu: 12,
    graphic: 'linear-gradient(135deg, #5b5bd6, #3f3fb8)', emoji: '🎓',
    replacementIds: [], keywords: ['trade school', 'program', 'hvac'],
    slug: 'HVACTradeSchool', industryIds: ['ind-hvac'], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'all',
    paywall: { kind: 'non-consumable', priceStripe: 180, priceApple: 199, priceGoogle: 199 },
    forceOrder: false,
    courses: [
      {
        id: 'crs-ts1', name: lt('Intro to HVAC'),
        items: [
          { kind: 'task', taskId: 't-intro-hvac-m1' },
          { kind: 'task', taskId: 't-intro-hvac-m2' },
          { kind: 'task', taskId: 't-intro-hvac-final' },
        ],
      },
      {
        id: 'crs-ts2', name: lt('Key Hand Tools'),
        items: [{ kind: 'task', taskId: 't-osha-niosh-url' }, { kind: 'task', taskId: 't-replace-thermostat' }],
      },
      {
        id: 'crs-ts3', name: lt('Field Skills'),
        items: [{ kind: 'task', taskId: 't-install-heat-pump' }],
      },
      {
        id: 'crs-ts4', name: lt('EPA 608'),
        items: [
          { kind: 'task', taskId: 't-epa-core-intro' },
          { kind: 'task', taskId: 't-epa-core-quiz' },
          { kind: 'task', taskId: 't-id-upload' },
          { kind: 'task', taskId: 't-epa-universal-exam' },
        ],
      },
    ],
    restrictions: { 't-epa-universal-exam': { requires: ['t-id-upload'], mode: 'any' } },
    conditionSets: [
      {
        id: 'cs-1',
        items: [
          { kind: 'certification', refId: 'c-intro-hvac', label: 'Intro to HVAC — Completed' },
          { kind: 'certification', refId: 'c-key-hand-tools', label: 'Key Hand Tools — Completed' },
          { kind: 'certification', refId: 'c-epa-universal', label: 'EPA 608 Universal — Completed' },
        ],
      },
    ],
    awardId: 'aw-trade-school',
    enrolled: 1840, completed: 312, owner: 'skillcat', updatedAt: '2026-05-30',
  },
  {
    id: 'c-hudson-newhire',
    name: lt('New Hire Training — Hudson Mechanical'),
    description: lt('Custom Certification assembled by Hudson Mechanical from Intro to HVAC, Key Hand Tools, and one custom Hands-On Task.'),
    visibility: 'visible', certType: 'bundle',
    graphic: 'linear-gradient(135deg, #64748b, #334155)', emoji: '🏗️',
    replacementIds: [], keywords: [],
    slug: 'HudsonNewHire', industryIds: [], subIndustryIds: [],
    trades: [], partnerships: [], userType: 'b2b',
    paywall: { kind: 'free' }, forceOrder: false,
    courses: [
      { id: 'crs-h1', name: lt('Intro to HVAC'), items: [{ kind: 'task', taskId: 't-intro-hvac-m1' }, { kind: 'task', taskId: 't-intro-hvac-m2' }, { kind: 'task', taskId: 't-intro-hvac-final' }] },
      { id: 'crs-h2', name: lt('Hudson Field Assessment'), items: [{ kind: 'task', taskId: 't-minisplit-design' }] },
    ],
    restrictions: {},
    conditionSets: [
      {
        id: 'cs-1',
        items: [
          { kind: 'certification', refId: 'c-intro-hvac', label: 'Intro to HVAC — Completed' },
          { kind: 'task', refId: 't-minisplit-design', label: 'Design a Mini-Split Installation — Passing grade' },
        ],
      },
    ],
    enrolled: 31, completed: 9, owner: 'tn-hudson', updatedAt: '2026-05-26',
  },
]

/* ---------------- Content links ---------------- */
export const contentLinks: ContentLink[] = [
  { id: 'cl-1', sourceId: 'c-epa-type1', targetId: 'c-intro-hvac', type: 'prerequisite', strength: 85 },
  { id: 'cl-2', sourceId: 'c-epa-universal', targetId: 'c-intro-hvac', type: 'prerequisite', strength: 90 },
  { id: 'cl-3', sourceId: 'c-intro-hvac', targetId: 'c-multimeter-v2', type: 'recommended-next', strength: 70 },
  { id: 'cl-4', sourceId: 'c-intro-hvac', targetId: 'c-epa-type1', type: 'recommended-next', strength: 95 },
  { id: 'cl-5', sourceId: 'c-intro-hvac', targetId: 'c-key-hand-tools', type: 'related', strength: 60 },
  { id: 'cl-6', sourceId: 'c-epa-type1', targetId: 'c-epa-universal', type: 'recommended-next', strength: 100 },
  { id: 'cl-7', sourceId: 'c-nate-rtw', targetId: 'c-epa-universal', type: 'related', strength: 55 },
]

/* ---------------- Industries ---------------- */
export const industries: Industry[] = [
  {
    id: 'ind-hvac', name: 'HVAC', visibility: 'visible', order: 1,
    subs: [
      { id: 'sub-hvac-res', name: 'Residential', order: 1 },
      { id: 'sub-hvac-com', name: 'Commercial', order: 2 },
      { id: 'sub-hvac-ref', name: 'Refrigeration', order: 3 },
    ],
  },
  {
    id: 'ind-plumbing', name: 'Plumbing', visibility: 'visible', order: 2,
    subs: [
      { id: 'sub-pl-res', name: 'Residential', order: 1 },
      { id: 'sub-pl-safety', name: 'Safety', order: 2 },
    ],
  },
  {
    id: 'ind-electrical', name: 'Electrical', visibility: 'visible', order: 3,
    subs: [{ id: 'sub-el-tr', name: 'Troubleshooting', order: 1 }],
  },
  {
    id: 'ind-appliance', name: 'Appliance Repair', visibility: 'visible', order: 4,
    subs: [
      { id: 'sub-ap-ref', name: 'Refrigeration', order: 1 },
      { id: 'sub-ap-laundry', name: 'Laundry', order: 2 },
    ],
  },
  { id: 'ind-safety', name: 'Safety', visibility: 'visible', order: 5, subs: [] },
  { id: 'ind-solar', name: 'Solar', visibility: 'hidden', order: 6, subs: [] },
]

/* ---------------- Skills ---------------- */
export const skills: Skill[] = [
  { id: 'sk-multimeter', name: lt('Multimeter', 'Multímetro'), description: lt('Can measure voltage, resistance, and continuity safely.'), status: 'active', color: '#eab308', emoji: '⚡', criteria: { taskIds: ['t-multimeter-xapi', 't-multimeter-final'], mode: 'all' }, holders: 7211, updatedAt: '2026-02-11' },
  { id: 'sk-elec-safety', name: lt('Electrical Safety Basics', 'Seguridad eléctrica básica'), status: 'active', color: '#ef4444', emoji: '🦺', criteria: { taskIds: ['t-multimeter-xapi'], mode: 'any' }, holders: 8423, updatedAt: '2026-02-11' },
  { id: 'sk-refrigerant', name: lt('Refrigerant Recovery', 'Recuperación de refrigerante'), status: 'active', color: '#3b82f6', emoji: '❄️', criteria: { taskIds: ['t-epa-core-intro', 't-epa-core-quiz'], mode: 'all' }, holders: 5102, updatedAt: '2026-05-22' },
  { id: 'sk-thermostat', name: lt('Thermostat Wiring', 'Cableado de termostato'), status: 'active', color: '#22c55e', emoji: '🔧', criteria: { taskIds: ['t-replace-thermostat'], mode: 'any' }, holders: 4118, updatedAt: '2026-04-02' },
  { id: 'sk-heat-pump', name: lt('Heat Pump Installation', 'Instalación de bomba de calor'), status: 'active', color: '#8b5cf6', emoji: '🏠', criteria: { taskIds: ['t-install-heat-pump'], mode: 'any' }, holders: 942, updatedAt: '2026-05-14' },
  { id: 'sk-cycle', name: lt('Refrigeration Cycle', 'Ciclo de refrigeración'), status: 'active', color: '#14b8a6', emoji: '🌀', criteria: { taskIds: ['t-intro-hvac-m2', 't-intro-hvac-final'], mode: 'all' }, holders: 15204, updatedAt: '2026-03-10' },
  { id: 'sk-ppe', name: lt('PPE & Jobsite Safety', 'EPP y seguridad en obra'), status: 'active', color: '#f97316', emoji: '⛑️', criteria: { taskIds: ['t-osha10-module', 't-osha-niosh-url'], mode: 'any' }, holders: 3318, updatedAt: '2026-05-29' },
  { id: 'sk-brazing', name: lt('Brazing'), status: 'archived', color: '#94a3b8', emoji: '🔥', criteria: { taskIds: ['t-install-heat-pump'], mode: 'any' }, holders: 1206, updatedAt: '2025-12-01' },
]

export const masterySkills: MasterySkill[] = [
  { id: 'ms-elec', name: lt('Electrical Safety', 'Seguridad eléctrica'), description: lt('Demonstrated safe electrical work across measurement and wiring.'), status: 'active', color: '#dc2626', emoji: '🛡️', skillIds: ['sk-multimeter', 'sk-elec-safety', 'sk-thermostat'], holders: 2807 },
  { id: 'ms-refr-fund', name: lt('Refrigeration Fundamentals', 'Fundamentos de refrigeración'), status: 'active', color: '#2563eb', emoji: '🧊', skillIds: ['sk-cycle', 'sk-refrigerant'], holders: 4231 },
  { id: 'ms-component', name: lt('Component Identification', 'Identificación de componentes'), status: 'active', color: '#7c3aed', emoji: '🔍', skillIds: ['sk-multimeter', 'sk-cycle'], holders: 5530 },
]

/* ---------------- Awards ---------------- */
export const designs: AwardDesign[] = [
  {
    id: 'dz-card-indigo', name: 'Standard Card — Indigo', orientation: 'landscape',
    background: 'linear-gradient(135deg, #4f4fd0 0%, #37379e 60%, #28287a 100%)',
    fields: [
      { key: 'certName', x: 50, y: 38 },
      { key: 'userName', x: 50, y: 58 },
      { key: 'date', x: 26, y: 84 },
      { key: 'number', x: 74, y: 84 },
    ],
  },
  {
    id: 'dz-epa-cert', name: 'EPA Certificate 2026', orientation: 'landscape',
    background: 'linear-gradient(150deg, #fdfcf8 0%, #f4efe2 70%, #ece2c8 100%)',
    fields: [
      { key: 'userName', x: 50, y: 44 },
      { key: 'certName', x: 50, y: 60 },
      { key: 'date', x: 24, y: 86 },
      { key: 'number', x: 50, y: 86 },
      { key: 'qr', x: 86, y: 80 },
    ],
  },
  {
    id: 'dz-diploma', name: 'Trade School Diploma', orientation: 'landscape',
    background: 'linear-gradient(160deg, #1d1d33 0%, #2c2c54 55%, #3d3d77 100%)',
    fields: [
      { key: 'userName', x: 50, y: 46 },
      { key: 'certName', x: 50, y: 62 },
      { key: 'date', x: 28, y: 85 },
      { key: 'number', x: 60, y: 85 },
      { key: 'qr', x: 88, y: 82 },
    ],
  },
  {
    id: 'dz-card-gold', name: 'Gold Card', orientation: 'landscape',
    background: 'linear-gradient(135deg, #b8860b 0%, #daa520 45%, #8d6508 100%)',
    fields: [
      { key: 'certName', x: 50, y: 40 },
      { key: 'userName', x: 50, y: 60 },
      { key: 'number', x: 50, y: 84 },
    ],
  },
]

export const awards: Award[] = [
  { id: 'aw-epa-universal', certificationId: 'c-epa-universal', tier: 'platinum', cardDesignId: 'dz-card-indigo', certificateDesignId: 'dz-epa-cert', status: 'active', issued: 4317 },
  { id: 'aw-epa-t1', certificationId: 'c-epa-type1', tier: 'gold', cardDesignId: 'dz-card-gold', certificateDesignId: 'dz-epa-cert', status: 'active', issued: 2954 },
  { id: 'aw-epa-t2', certificationId: 'c-epa-type2', tier: 'gold', cardDesignId: 'dz-card-gold', certificateDesignId: 'dz-epa-cert', status: 'active', issued: 1733 },
  { id: 'aw-epa-t3', certificationId: 'c-epa-type3', tier: 'gold', cardDesignId: 'dz-card-gold', certificateDesignId: 'dz-epa-cert', status: 'active', issued: 1241 },
  { id: 'aw-nate', certificationId: 'c-nate-rtw', tier: 'gold', cardDesignId: 'dz-card-gold', certificateDesignId: 'dz-epa-cert', status: 'active', issued: 1187 },
  { id: 'aw-osha', certificationId: 'c-osha10', tier: 'gold', cardDesignId: 'dz-card-gold', status: 'active', issued: 1409 },
  { id: 'aw-intro-hvac', certificationId: 'c-intro-hvac', tier: 'bronze', cardDesignId: 'dz-card-indigo', status: 'active', issued: 16882 },
  { id: 'aw-multimeter', certificationId: 'c-multimeter-v1', tier: 'silver', cardDesignId: 'dz-card-indigo', status: 'archived', issued: 7011 },
  { id: 'aw-multimeter-v2', certificationId: 'c-multimeter-v2', tier: 'silver', cardDesignId: 'dz-card-indigo', status: 'active', issued: 1518 },
  { id: 'aw-trade-school', certificationId: 'c-hvac-trade-school', tier: 'platinum', cardDesignId: 'dz-card-indigo', certificateDesignId: 'dz-diploma', status: 'active', issued: 312 },
]

/* ---------------- Feedback forms ---------------- */
export const feedbackForms: FeedbackForm[] = [
  {
    id: 'fb-epa', name: 'Post-EPA Exam Survey', status: 'active', version: 3,
    questions: [
      { id: 'fq-1', text: lt('How prepared did you feel walking into the exam?', '¿Qué tan preparado se sintió al iniciar el examen?'), type: 'scale', mandatory: true, options: [], scale: { min: 1, max: 10, minLabel: lt('Not at all', 'Nada'), maxLabel: lt('Fully prepared', 'Totalmente') } },
      { id: 'fq-2', text: lt('Which study materials did you use?', '¿Qué materiales de estudio utilizó?'), type: 'multi', mandatory: false, options: [lt('xAPI modules', 'Módulos xAPI'), lt('Checkpoint quizzes'), lt('PT charts'), lt('Outside resources')], allowOther: true },
      { id: 'fq-3', text: lt('Was the exam difficulty what you expected?'), type: 'single', mandatory: true, options: [lt('Easier than expected'), lt('About right'), lt('Harder than expected')] },
      { id: 'fq-4', text: lt('Anything we should improve?'), type: 'short', mandatory: false, options: [] },
    ],
    triggers: [
      { kind: 'certification', refId: 'c-epa-universal' },
      { kind: 'certification', refId: 'c-epa-type1' },
      { kind: 'certification', refId: 'c-epa-type2' },
    ],
    responses: [
      { id: 'r-1', userId: 'u-marcus', version: 3, submittedAt: '2026-06-04 14:22', trigger: 'EPA 608 Type 1', answers: [{ q: 'fq-1', value: '8' }, { q: 'fq-2', value: 'xAPI modules, Checkpoint quizzes' }, { q: 'fq-3', value: 'About right' }, { q: 'fq-4', value: 'More Type 2 practice questions please.' }] },
      { id: 'r-2', userId: 'u-sofia', version: 3, submittedAt: '2026-06-02 09:10', trigger: 'EPA 608 Universal', answers: [{ q: 'fq-1', value: '6' }, { q: 'fq-3', value: 'Harder than expected' }, { q: 'fq-4', value: 'El cuestionario de práctica ayudó mucho.' }] },
      { id: 'r-3', userId: 'u-sam', version: 2, submittedAt: '2026-04-19 17:45', trigger: 'EPA 608 Type 2', answers: [{ q: 'fq-1', value: '9' }, { q: 'fq-3', value: 'About right' }] },
    ],
    versionHistory: [
      { version: 3, date: '2026-05-12', by: 'Adriana Cole', note: 'Added study-materials multi-select' },
      { version: 2, date: '2026-02-03', by: 'Adriana Cole', note: 'Reworded difficulty question' },
      { version: 1, date: '2025-12-18', by: 'Eshwar D.', note: 'Initial version' },
    ],
  },
  {
    id: 'fb-pulse', name: 'Course Quality Pulse', status: 'active', version: 1,
    questions: [
      { id: 'fq-1', text: lt('Rate the overall quality of this training.', 'Califique la calidad general de esta capacitación.'), type: 'scale', mandatory: true, options: [], scale: { min: 1, max: 5, minLabel: lt('Poor'), maxLabel: lt('Excellent') } },
      { id: 'fq-2', text: lt('Would you recommend it to a coworker?'), type: 'single', mandatory: true, options: [lt('Yes'), lt('No')] },
    ],
    triggers: [{ kind: 'certification', refId: 'c-intro-hvac' }],
    responses: [
      { id: 'r-4', userId: 'u-daniela', version: 1, submittedAt: '2026-06-07 11:03', trigger: 'Intro to HVAC', answers: [{ q: 'fq-1', value: '5' }, { q: 'fq-2', value: 'Yes' }] },
      { id: 'r-5', userId: 'u-jay', version: 1, submittedAt: '2026-06-05 20:31', trigger: 'Intro to HVAC', answers: [{ q: 'fq-1', value: '4' }, { q: 'fq-2', value: 'Yes' }] },
    ],
    versionHistory: [{ version: 1, date: '2026-03-01', by: 'Adriana Cole', note: 'Initial version' }],
  },
  {
    id: 'fb-nate', name: 'NATE Experience Survey', status: 'draft', version: 1,
    questions: [
      { id: 'fq-1', text: lt('How clear was the NATE registration process?'), type: 'scale', mandatory: true, options: [], scale: { min: 1, max: 10 } },
      { id: 'fq-2', text: lt('Upload a photo of any unclear screen (optional).'), type: 'file', mandatory: false, options: [], file: { maxFiles: 2, maxSizeMb: 10 } },
    ],
    triggers: [],
    responses: [],
    versionHistory: [{ version: 1, date: '2026-06-01', by: 'Priya Raman', note: 'Draft' }],
  },
]

/* ---------------- Spotlights ---------------- */
export const spotlights: Spotlight[] = [
  { id: 'sp-1', heading: lt('EPA Summer Cohort — Enroll by June 20', 'Cohorte de verano EPA: inscríbete antes del 20 de junio'), description: lt('Live study sessions every Tuesday with a master tech.'), ctaText: lt('Join the cohort', 'Únete'), ctaRedirect: 'https://skillcat.app/EPA608Universal', endDate: '2026-06-20', status: 'active', requestedBy: 'Adriana Cole', createdAt: '2026-05-22', position: 1, views: 48211, clicks: 3917 },
  { id: 'sp-2', heading: lt('New: NATE RTW practice exams', 'Nuevo: exámenes de práctica NATE RTW'), ctaText: lt('Try a practice exam'), ctaRedirect: 'https://skillcat.app/NATEReadyToWork', endDate: '2026-07-31', status: 'active', requestedBy: 'Priya Raman', createdAt: '2026-05-28', position: 2, views: 30156, clicks: 2240 },
  { id: 'sp-3', heading: lt('Spanish content has landed', 'Llegó el contenido en español'), description: lt('Core EPA modules are now fully translated.', 'Los módulos principales de EPA ya están traducidos.'), endDate: '2026-08-15', status: 'active', requestedBy: 'Eshwar D.', createdAt: '2026-06-01', position: 3, views: 12089, clicks: 1532 },
  { id: 'sp-4', heading: lt('Podcast: Tools of the Trade — Ep. 12'), description: lt('Heat pumps in cold climates, with guest Lena Fischer.'), ctaText: lt('Listen now'), ctaRedirect: 'https://skillcat.app/podcast/12', endDate: '2026-09-01', status: 'pending', requestedBy: 'Marketing (Jo Vance)', createdAt: '2026-06-08', position: 4 },
  { id: 'sp-5', heading: lt('Refer a friend, get a month free'), endDate: '2026-12-31', status: 'pending', requestedBy: 'Growth (Theo K.)', createdAt: '2026-06-09', position: 5 },
  { id: 'sp-6', heading: lt('Q2 hiring fair — Dallas'), description: lt('In-person event, April 30.'), endDate: '2026-04-30', status: 'deactivated', requestedBy: 'Jobs team', createdAt: '2026-03-28', position: 9 },
  { id: 'sp-7', heading: lt('Win a free tool belt!'), description: lt('Sweepstakes draft — needs legal review.'), endDate: '2026-07-04', status: 'rejected', requestedBy: 'Growth (Theo K.)', createdAt: '2026-06-02', position: 10 },
]

/* ---------------- Proctoring ---------------- */
export const proctoring: ProctoringEntry[] = [
  {
    id: 'pr-1041', userId: 'u-marcus', quizTaskId: 't-epa-universal-exam', certificationId: 'c-epa-universal',
    category: 'proctored', status: 'in-review', submittedAt: '2026-06-09 16:42', scorePct: 81, language: 'en',
    sectionBreakdown: [
      { name: 'Core', scorePct: 84, passed: true, atStake: true },
      { name: 'Type 1', scorePct: 88, passed: true, atStake: true },
      { name: 'Type 2', scorePct: 76, passed: true, atStake: true },
      { name: 'Type 3', scorePct: 64, passed: false, atStake: false },
    ],
    idPreviouslyVerified: false,
    ai: { idConfidence: 0.96, idType: 'US Driver’s License (TX)', idName: 'Marcus J. Webb', nameMatch: true, flaggedFrames: [] },
    frameCount: 164,
  },
  {
    id: 'pr-1042', userId: 'u-chris', quizTaskId: 't-epa-universal-exam', certificationId: 'c-epa-type2',
    category: 'proctored', status: 'in-review', submittedAt: '2026-06-09 21:15', scorePct: 74, language: 'en',
    sectionBreakdown: [
      { name: 'Core', scorePct: 72, passed: true, atStake: true },
      { name: 'Type 1', scorePct: 58, passed: false, atStake: false },
      { name: 'Type 2', scorePct: 79, passed: true, atStake: true },
      { name: 'Type 3', scorePct: 68, passed: false, atStake: false },
    ],
    idPreviouslyVerified: true,
    ai: {
      idConfidence: 0.99, idType: 'US Passport', idName: 'Christopher Ononye', nameMatch: true,
      flaggedFrames: [
        { index: 31, time: '00:24:10', reason: 'Looking away from camera' },
        { index: 32, time: '00:24:30', reason: 'Looking away from camera' },
        { index: 78, time: '01:02:50', reason: 'User not visible in frame' },
      ],
    },
    frameCount: 198,
  },
  {
    id: 'pr-1043', userId: 'u-sofia', quizTaskId: 't-epa-t1-exam', certificationId: 'c-epa-type1',
    category: 'id-verification', status: 'in-review', submittedAt: '2026-06-10 08:05', scorePct: 86, language: 'es',
    sectionBreakdown: [
      { name: 'Core', scorePct: 82, passed: true, atStake: false },
      { name: 'Type 1', scorePct: 90, passed: true, atStake: false },
    ],
    idPreviouslyVerified: false,
    ai: { idConfidence: 0.91, idType: 'State ID (CA)', idName: 'Sofía Álvarez', nameMatch: true, flaggedFrames: [] },
    frameCount: 0,
  },
  {
    id: 'pr-1044', userId: 'u-sam', quizTaskId: 't-nate-rtw-exam', certificationId: 'c-nate-rtw',
    category: 'id-verification', status: 'in-review', submittedAt: '2026-06-10 09:48', scorePct: 78, language: 'en',
    idPreviouslyVerified: false,
    ai: { idConfidence: 0.62, idType: 'US Driver’s License (FL)', idName: 'Samuel Whitfield Jr.', nameMatch: false, flaggedFrames: [] },
    frameCount: 0,
  },
  {
    id: 'pr-1039', userId: 'u-daniela', quizTaskId: 't-epa-universal-exam', certificationId: 'c-epa-universal',
    category: 'proctored', status: 'id-reupload', reuploadReady: true, submittedAt: '2026-06-06 13:20', scorePct: 90, language: 'es',
    sectionBreakdown: [
      { name: 'Core', scorePct: 92, passed: true, atStake: true },
      { name: 'Type 1', scorePct: 94, passed: true, atStake: true },
      { name: 'Type 2', scorePct: 88, passed: true, atStake: true },
      { name: 'Type 3', scorePct: 86, passed: true, atStake: true },
    ],
    idPreviouslyVerified: false,
    ai: { idConfidence: 0.88, idType: 'Mexican Passport', idName: 'Daniela Reyes Cruz', nameMatch: true, flaggedFrames: [] },
    frameCount: 175,
  },
  {
    id: 'pr-1037', userId: 'u-priya', quizTaskId: 't-epa-t1-exam', certificationId: 'c-epa-type1',
    category: 'id-verification', status: 'id-reupload', submittedAt: '2026-06-04 18:54', scorePct: 80, language: 'en',
    idPreviouslyVerified: false,
    ai: { idConfidence: 0.34, idType: 'Unrecognized document', idName: '—', nameMatch: false, flaggedFrames: [] },
    frameCount: 0,
  },
  {
    id: 'pr-1031', userId: 'u-jay', quizTaskId: 't-epa-universal-exam', certificationId: 'c-epa-universal',
    category: 'proctored', status: 'approved', submittedAt: '2026-06-01 10:31', scorePct: 88, language: 'en',
    idPreviouslyVerified: false,
    ai: { idConfidence: 0.97, idType: 'US Driver’s License (OH)', idName: 'Jay Patel', nameMatch: true, flaggedFrames: [] },
    frameCount: 171, resolvedBy: 'R. Okafor', resolvedAt: '2026-06-02 09:14',
  },
  {
    id: 'pr-1028', userId: 'u-chris', quizTaskId: 't-epa-universal-exam', certificationId: 'c-epa-universal',
    category: 'proctored', status: 'rejected', submittedAt: '2026-05-27 22:03', scorePct: 79, language: 'en',
    idPreviouslyVerified: true,
    ai: {
      idConfidence: 0.99, idType: 'US Passport', idName: 'Christopher Ononye', nameMatch: true,
      flaggedFrames: [{ index: 12, time: '00:09:40', reason: 'Second person visible in frame' }],
    },
    frameCount: 154, resolvedBy: 'R. Okafor', resolvedAt: '2026-05-28 08:50',
  },
]

/* ---------------- Hands-on submissions ---------------- */
export const submissions: HandsOnSubmission[] = [
  {
    id: 'sub-501', taskId: 't-install-heat-pump', userId: 'u-marcus', attempt: 1, maxAttempts: 3,
    submittedAt: '2026-06-09 18:30', status: 'pending',
    description: 'Completed a 3-ton Goodman heat pump install at a residential site. Pulled vacuum to 320 microns, weighed in 2 oz additional charge per line-set length. Subcooling at 9°F against a target of 10°F.',
    media: [
      { kind: 'image', label: 'pad-and-unit.jpg' }, { kind: 'image', label: 'brazed-lineset.jpg' },
      { kind: 'image', label: 'micron-gauge.jpg' }, { kind: 'video', label: 'commissioning-readings.mp4' },
    ],
  },
  {
    id: 'sub-502', taskId: 't-replace-thermostat', userId: 'u-daniela', attempt: 2, maxAttempts: 5,
    submittedAt: '2026-06-09 12:11', status: 'pending',
    description: 'Replaced a mercury T87 with an ecobee. Labeled wires before removal, added a C-wire using the G terminal workaround, verified heat and cool staging.',
    media: [{ kind: 'image', label: 'before-wiring.jpg' }, { kind: 'image', label: 'after-install.jpg' }],
    staleInstructions: true,
  },
  {
    id: 'sub-503', taskId: 't-install-heat-pump', userId: 'u-jay', attempt: 1, maxAttempts: 3,
    submittedAt: '2026-06-08 09:47', status: 'pending',
    description: 'Mini-split heat pump install, 12k BTU. Flared connections torqued to spec, pressure tested with nitrogen at 500 psi for 30 minutes.',
    media: [{ kind: 'image', label: 'flare-torque.jpg' }, { kind: 'image', label: 'pressure-test.jpg' }, { kind: 'audio', label: 'compressor-sound.m4a' }],
  },
  {
    id: 'sub-498', taskId: 't-replace-thermostat', userId: 'u-sam', attempt: 1, maxAttempts: 5,
    submittedAt: '2026-06-05 15:02', status: 'reviewed', score: 9, passed: true,
    feedback: 'Clean work — wire labels visible in every photo and correct system config. Watch the mounting level next time (slightly off in photo 3).',
    reviewer: 'D. Whitman',
    media: [{ kind: 'image', label: 'install-1.jpg' }, { kind: 'image', label: 'install-2.jpg' }],
    description: 'Honeywell T6 swap with full rewire.',
  },
  {
    id: 'sub-495', taskId: 't-install-heat-pump', userId: 'u-chris', attempt: 2, maxAttempts: 3,
    submittedAt: '2026-06-03 19:26', status: 'reviewed', score: 5, passed: false,
    feedback: 'Vacuum reading not shown below 500 microns and no nitrogen flow during brazing visible. Please resubmit with the micron gauge in frame.',
    reviewer: 'D. Whitman',
    media: [{ kind: 'image', label: 'unit.jpg' }],
    description: 'Heat pump changeout, 2.5 ton.',
  },
]

/* ---------------- Users & tenants ---------------- */
export const tenants: Tenant[] = [
  { id: 'tn-hudson', name: 'Hudson Mechanical', tier: 'pro', seats: 48, trades: ['Residential HVAC'], partnerships: ['Nexstar'], customCertsUsed: 3, customTasksUsed: 11 },
  { id: 'tn-ace', name: 'ACE Plumbing Co', tier: 'essentials', seats: 12, trades: ['Plumbing'], partnerships: [], customCertsUsed: 1, customTasksUsed: 1 },
  { id: 'tn-beacon', name: 'Beacon Facilities Group', tier: 'growth', seats: 85, trades: ['Commercial HVAC', 'Residential HVAC'], partnerships: ['EGIA'], customCertsUsed: 4, customTasksUsed: 5 },
  { id: 'tn-vance', name: 'Vance & Sons Electric', tier: 'b2b-trial', seats: 9, trades: ['Electrical'], partnerships: [], customCertsUsed: 2, customTasksUsed: 3 },
]

export const users: UserRec[] = [
  {
    id: 'u-marcus', name: 'Marcus Webb', email: 'marcus.webb@gmail.com', userType: 'b2c', accessState: 'subscriber',
    language: 'en', idStatus: 'in-review', joinedAt: '2025-11-03', lastActive: '2026-06-09', industryPreference: 'HVAC',
    pathAssigned: [],
    pathSelf: [
      { kind: 'certification', refId: 'c-epa-universal' },
      { kind: 'certification', refId: 'c-nate-rtw' },
      { kind: 'task', refId: 't-install-heat-pump' },
    ],
    skillIds: ['sk-cycle', 'sk-multimeter', 'sk-refrigerant'], masteryIds: ['ms-refr-fund'],
    awards: [{ awardId: 'aw-intro-hvac', number: 'SC-9F2K-77AD', date: '2026-01-19' }],
    entitlements: [{ label: 'NATE RTW — 1 unused attempt', kind: 'quiz-attempts', detail: 'Purchased Apr 2026 · $60 (Stripe)' }],
    quizState: [
      { taskId: 't-epa-universal-exam', used: 1, granted: 0, bestScore: 81 },
      { taskId: 't-nate-rtw-exam', used: 0, granted: 0 },
    ],
  },
  {
    id: 'u-daniela', name: 'Daniela Reyes', email: 'daniela.reyes@outlook.com', userType: 'b2c', accessState: 'free-trial',
    language: 'es', idStatus: 'in-review', joinedAt: '2026-06-05', lastActive: '2026-06-09', industryPreference: 'HVAC',
    pathAssigned: [],
    pathSelf: [
      { kind: 'certification', refId: 'c-intro-hvac' },
      { kind: 'certification', refId: 'c-epa-universal' },
    ],
    skillIds: ['sk-cycle'], masteryIds: [],
    awards: [{ awardId: 'aw-intro-hvac', number: 'SC-3MD0-91XQ', date: '2026-06-07' }],
    entitlements: [],
    quizState: [{ taskId: 't-epa-universal-exam', used: 1, granted: 0, bestScore: 90 }],
  },
  {
    id: 'u-jay', name: 'Jay Patel', email: 'jay.p@yahoo.com', userType: 'b2c', accessState: 'starter',
    language: 'en', idStatus: 'completed', joinedAt: '2025-08-22', lastActive: '2026-06-08', industryPreference: 'HVAC',
    pathAssigned: [],
    pathSelf: [{ kind: 'certification', refId: 'c-hvac-trade-school' }],
    skillIds: ['sk-cycle', 'sk-refrigerant', 'sk-multimeter', 'sk-elec-safety'], masteryIds: ['ms-refr-fund'],
    awards: [
      { awardId: 'aw-intro-hvac', number: 'SC-1A8B-22TR', date: '2025-09-30' },
      { awardId: 'aw-epa-universal', number: 'SC-7Q4N-58LM', date: '2026-06-02' },
    ],
    entitlements: [{ label: 'HVAC Trade School', kind: 'certification', detail: 'Purchased Sep 2025 · $180 (Stripe) — survives Starter state' }],
    quizState: [{ taskId: 't-epa-universal-exam', used: 2, granted: 0, bestScore: 88 }],
  },
  {
    id: 'u-sofia', name: 'Sofía Álvarez', email: 'sofia.alvz@gmail.com', userType: 'b2c', accessState: 'scholarship',
    language: 'es', idStatus: 'in-review', joinedAt: '2026-02-14', lastActive: '2026-06-10', industryPreference: 'HVAC',
    scholarshipExpiry: '2026-09-01',
    pathAssigned: [],
    pathSelf: [{ kind: 'certification', refId: 'c-epa-type1' }, { kind: 'certification', refId: 'c-multimeter-v2' }],
    skillIds: ['sk-cycle', 'sk-refrigerant'], masteryIds: [],
    awards: [],
    entitlements: [],
    quizState: [{ taskId: 't-epa-t1-exam', used: 1, granted: 0, bestScore: 86 }],
  },
  {
    id: 'u-chris', name: 'Chris Ononye', email: 'c.ononye@gmail.com', userType: 'b2c', accessState: 'subscriber',
    language: 'en', idStatus: 'completed', joinedAt: '2025-06-30', lastActive: '2026-06-09', industryPreference: 'HVAC',
    integrityNote: { text: 'May 27 attempt rejected — second person visible at 00:09:40. Watch future Universal attempts closely.', by: 'R. Okafor', at: '2026-05-28' },
    pathAssigned: [],
    pathSelf: [{ kind: 'certification', refId: 'c-epa-universal' }, { kind: 'certification', refId: 'c-epa-type2' }],
    skillIds: ['sk-cycle', 'sk-multimeter'], masteryIds: [],
    awards: [{ awardId: 'aw-intro-hvac', number: 'SC-5TT2-04ZE', date: '2025-07-28' }],
    entitlements: [],
    quizState: [{ taskId: 't-epa-universal-exam', used: 3, granted: 1, bestScore: 79, cooldownUntil: '2026-06-10 09:15' }],
  },
  {
    id: 'u-tom', name: 'Tom Becker', email: 'tbecker@hudsonmech.com', userType: 'b2b', tenantId: 'tn-hudson', accessState: 'pro',
    language: 'en', idStatus: 'not-started', joinedAt: '2026-01-12', lastActive: '2026-06-08', industryPreference: 'HVAC',
    pathAssigned: [
      { kind: 'certification', refId: 'c-hudson-newhire', dueDate: '2026-07-15' },
      { kind: 'task', refId: 't-minisplit-design', dueDate: '2026-06-25' },
    ],
    pathSelf: [{ kind: 'certification', refId: 'c-nate-rtw' }],
    skillIds: ['sk-cycle'], masteryIds: [],
    awards: [],
    entitlements: [{ label: 'NATE RTW — 2 attempts (employer-purchased)', kind: 'quiz-attempts', detail: 'Purchased by Hudson Mechanical · May 2026' }],
    quizState: [{ taskId: 't-nate-rtw-exam', used: 0, granted: 2 }],
  },
  {
    id: 'u-lena', name: 'Lena Fischer', email: 'lena.f@beaconfg.com', userType: 'b2b', tenantId: 'tn-beacon', accessState: 'growth',
    language: 'en', idStatus: 'completed', joinedAt: '2025-10-08', lastActive: '2026-06-10', industryPreference: 'HVAC',
    pathAssigned: [{ kind: 'certification', refId: 'c-osha10', dueDate: '2026-08-01' }],
    pathSelf: [{ kind: 'certification', refId: 'c-epa-universal' }],
    skillIds: ['sk-cycle', 'sk-ppe', 'sk-refrigerant'], masteryIds: [],
    awards: [{ awardId: 'aw-osha', number: 'SC-8RC1-36KV', date: '2026-05-12' }],
    entitlements: [],
    quizState: [],
  },
  {
    id: 'u-priya', name: 'Priya Nair', email: 'priya.nair@aceplumbing.co', userType: 'b2b', tenantId: 'tn-ace', accessState: 'essentials',
    language: 'en', idStatus: 'reupload-requested', joinedAt: '2026-03-02', lastActive: '2026-06-07', industryPreference: 'Plumbing',
    pathAssigned: [{ kind: 'certification', refId: 'c-key-hand-tools' }],
    pathSelf: [{ kind: 'certification', refId: 'c-epa-type1' }],
    skillIds: [], masteryIds: [],
    awards: [],
    entitlements: [],
    quizState: [{ taskId: 't-epa-t1-exam', used: 1, granted: 0, bestScore: 80 }],
  },
  {
    id: 'u-sam', name: 'Sam Whitfield', email: 'sam.whit@gmail.com', userType: 'b2c', accessState: 'subscriber',
    language: 'en', idStatus: 'in-review', joinedAt: '2025-04-17', lastActive: '2026-06-10', industryPreference: 'HVAC',
    nateConnectId: 'NC-118842',
    pathAssigned: [],
    pathSelf: [{ kind: 'certification', refId: 'c-nate-rtw' }, { kind: 'certification', refId: 'c-key-hand-tools' }],
    skillIds: ['sk-thermostat', 'sk-cycle'], masteryIds: [],
    awards: [{ awardId: 'aw-epa-t2', number: 'SC-2WW9-83HN', date: '2026-04-20' }],
    entitlements: [{ label: 'NATE RTW — purchased attempt consumed', kind: 'quiz-attempts', detail: '$60 first attempt · Jun 2026 (Apple)' }],
    quizState: [{ taskId: 't-nate-rtw-exam', used: 1, granted: 0, bestScore: 78 }],
  },
  {
    id: 'u-rob', name: 'Robert Hale', email: 'rhale@vancesons.com', userType: 'b2b', tenantId: 'tn-vance', accessState: 'b2b-trial',
    language: 'en', idStatus: 'not-started', joinedAt: '2026-06-01', lastActive: '2026-06-06', industryPreference: 'Electrical',
    pathAssigned: [{ kind: 'certification', refId: 'c-multimeter-v2' }],
    pathSelf: [],
    skillIds: [], masteryIds: [],
    awards: [],
    entitlements: [],
    quizState: [],
  },
]

/* ---------------- Audit ---------------- */
export const audit: AuditEvent[] = [
  { id: 'ev-1', at: '2026-06-10 09:14', actor: 'R. Okafor', action: 'Approved proctored attempt', target: 'Jay Patel · EPA Universal Final Exam' },
  { id: 'ev-2', at: '2026-06-09 17:02', actor: 'Adriana Cole', action: 'Published certification', target: 'Using a Multimeter v2' },
  { id: 'ev-3', at: '2026-06-09 14:48', actor: 'D. Whitman', action: 'Reviewed hands-on submission (9/10)', target: 'Sam Whitfield · Replace a Thermostat' },
  { id: 'ev-4', at: '2026-06-09 11:25', actor: 'Eshwar D.', action: 'Granted +1 quiz attempt', target: 'Chris Ononye · EPA Universal Final Exam' },
  { id: 'ev-5', at: '2026-06-08 16:40', actor: 'Adriana Cole', action: 'Bulk uploaded 84 questions', target: 'Question Bank · EPA 608 > Type 2' },
  { id: 'ev-6', at: '2026-06-08 10:12', actor: 'Priya Raman', action: 'Issued scholarship (expires Sep 1)', target: 'Sofía Álvarez' },
  { id: 'ev-7', at: '2026-06-07 15:30', actor: 'Support (M. Lau)', action: 'Uploaded replacement ID — left In-Review', target: 'Daniela Reyes' },
  { id: 'ev-8', at: '2026-06-06 09:05', actor: 'Adriana Cole', action: 'Archived certification with replacement', target: 'Using a Multimeter → v2' },
]

export const seed: DB = {
  tasks, certifications, contentLinks, industries, questions, questionCategories,
  skills, masterySkills, awards, designs, feedbackForms, spotlights, proctoring,
  submissions, users, tenants, audit,
  settings: {
    b2cTrialDays: 3, b2bTrialDays: 14, initialTasksCount: 3, webcamFrequencySec: 20,
    natePassEmailSubject: 'Congratulations — you passed your NATE exam',
    nateFailEmailSubject: 'Your NATE exam results',
  },
}
