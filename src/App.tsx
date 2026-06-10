import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './layout/Shell'
import Dashboard from './pages/Dashboard'
import CertsList from './pages/certifications/CertsList'
import CertEditor from './pages/certifications/CertEditor'
import TasksList from './pages/tasks/TasksList'
import TaskEditor from './pages/tasks/TaskEditor'
import QuestionBank from './pages/questions/QuestionBank'
import QuestionEditor from './pages/questions/QuestionEditor'
import Industries from './pages/Industries'
import Skills from './pages/Skills'
import Awards from './pages/awards/Awards'
import DesignEditor from './pages/awards/DesignEditor'
import FeedbackForms from './pages/feedback/FeedbackForms'
import FormEditor from './pages/feedback/FormEditor'
import Spotlights from './pages/Spotlights'
import Proctoring from './pages/proctoring/Proctoring'
import ProctoringReview from './pages/proctoring/ProctoringReview'
import ReviewQueue from './pages/reviews/ReviewQueue'
import SubmissionReview from './pages/reviews/SubmissionReview'
import Automations from './pages/automations/Automations'
import QuestionUploadWizard from './pages/automations/QuestionUploadWizard'
import CertImportWizard from './pages/automations/CertImportWizard'
import UsersPage from './pages/users/Users'
import UserDetail from './pages/users/UserDetail'
import Companies from './pages/Companies'
import SettingsPage from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/certifications" element={<CertsList />} />
        <Route path="/certifications/:id" element={<CertEditor />} />
        <Route path="/tasks" element={<TasksList />} />
        <Route path="/tasks/:id" element={<TaskEditor />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/question-bank/:id" element={<QuestionEditor />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/awards/designs/:id" element={<DesignEditor />} />
        <Route path="/feedback-forms" element={<FeedbackForms />} />
        <Route path="/feedback-forms/:id" element={<FormEditor />} />
        <Route path="/spotlights" element={<Spotlights />} />
        <Route path="/proctoring" element={<Proctoring />} />
        <Route path="/proctoring/:id" element={<ProctoringReview />} />
        <Route path="/reviews" element={<ReviewQueue />} />
        <Route path="/reviews/:id" element={<SubmissionReview />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/automations/questions" element={<QuestionUploadWizard />} />
        <Route path="/automations/certification" element={<CertImportWizard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
