import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { GoalSettingPage } from './pages/GoalSettingPage';
import { DashboardPage } from './pages/DashboardPage';
import MetronomePage from './components/metronome/Metronome';
import { CurriculumPage } from './pages/CurriculumPage';
import { LessonPage } from './pages/LessonPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import type { User } from './types';

// 4-step funnel: assess → profile → goal → dashboard
const postLoginPath = (user: User) => {
  if (!user.assessmentCompleted) return '/onboarding';
  if (!user.profileCompleted)    return '/profile-setup';
  if (!user.learningGoal)        return '/goal-setting';
  return '/dashboard';
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user)   return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const FullPageSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-bg-primary">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to={postLoginPath(user)} replace /> : <AuthPage />}
        />
        <Route path="/onboarding"    element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/goal-setting"  element={<ProtectedRoute><GoalSettingPage /></ProtectedRoute>} />
        <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/metronome"     element={<ProtectedRoute><MetronomePage /></ProtectedRoute>} />
        <Route path="/curriculum"    element={<ProtectedRoute><CurriculumPage /></ProtectedRoute>} />
        <Route path="/lessons/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route
          path="/"
          element={user ? <Navigate to={postLoginPath(user)} replace /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
