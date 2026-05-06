import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';

export const OnboardingPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleComplete = (placement: string) => {
    updateUser({
      assessmentCompleted: true,
      skillLevel: placement as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    });
    navigate('/profile-setup', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <span className="text-2xl">🎸</span>
          <span className="text-lg font-bold text-gradient-gold">StringTheory</span>
        </div>

        <OnboardingFlow username={user.username} onComplete={handleComplete} />
      </div>
    </div>
  );
};
