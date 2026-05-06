import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoalSetting } from '../hooks/useGoalSetting';
import { GoalCardGrid } from '../components/goal/GoalCardGrid';
import { GoalConfirmModal } from '../components/goal/GoalConfirmModal';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { StepIndicator } from '../components/ui/StepIndicator';

export const GoalSettingPage = () => {
  const { user, updateUser }  = useAuth();
  const navigate              = useNavigate();
  const {
    selectedGoal, modalOpen, loading, error,
    selectGoal, openModal, closeModal, confirmGoal,
  } = useGoalSetting();

  // Already done — skip
  if (user?.learningGoal) return <Navigate to="/dashboard" replace />;

  const handleConfirm = async () => {
    const ok = await confirmGoal();
    if (ok) {
      updateUser({ learningGoal: selectedGoal });
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg-primary/90 backdrop-blur px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎸</span>
            <span className="font-bold text-gradient-gold">StringTheory</span>
          </div>
          <StepIndicator
            current={3}
            total={3}
            labels={['Assessment', 'Profile', 'Goal']}
          />
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-6 py-10 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">Choose your learning goal</h1>
          <p className="text-gray-400">
            This shapes your curriculum. You can change it later from your profile.
          </p>
        </div>

        <GoalCardGrid selected={selectedGoal} onSelect={selectGoal} />

        {error && (
          <Toast message={error} type="error" onClose={() => {}} />
        )}
      </main>

      {/* ── Sticky CTA ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 border-t border-border bg-bg-primary/95 backdrop-blur px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full"
            disabled={!selectedGoal}
            onClick={openModal}
          >
            {selectedGoal ? 'Continue →' : 'Select a goal to continue'}
          </Button>
        </div>
      </div>

      {/* ── Confirmation modal ─────────────────────────────────────────── */}
      <GoalConfirmModal
        open={modalOpen}
        goalId={selectedGoal}
        loading={loading}
        onConfirm={handleConfirm}
        onBack={closeModal}
      />
    </div>
  );
};
