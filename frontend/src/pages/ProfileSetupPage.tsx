// ProfileSetupPage — Step 2 of the onboarding funnel. Collects display name,
// avatar, guitar type, and motivation. Redirects to /dashboard on success or
// immediately if the profile is already complete.

import { type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfileSetup } from '../hooks/useProfileSetup';
import { DisplayNameInput } from '../components/profile/DisplayNameInput';
import { AvatarPicker } from '../components/profile/AvatarPicker';
import { GuitarTypeSelector } from '../components/profile/GuitarTypeSelector';
import { MotivationSelector } from '../components/profile/MotivationSelector';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { StepIndicator } from '../components/ui/StepIndicator';
import type { GuitarType, Motivation } from '../types';

// Staggered entrance animation wrapper
const Fade = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <div
    className="animate-slide-up"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    {children}
  </div>
);

// Section header used throughout the form
const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
    {children}
  </p>
);

export const ProfileSetupPage = () => {
  const { user, updateUser } = useAuth();
  const navigate             = useNavigate();
  const {
    form, errors, loading, toast,
    avatarUploading, setField, uploadAvatar,
    submit, isFormValid, validateDisplayName, dismissToast,
  } = useProfileSetup();

  // Already completed — skip to next step
  if (user?.profileCompleted) return <Navigate to="/goal-setting" replace />;

  const handleSubmit = async () => {
    const ok = await submit();
    if (ok) {
      updateUser({
        profileCompleted: true,
        displayName:      form.displayName,
        avatarUrl:        form.avatarUrl,
        guitarType:       form.guitarType  as GuitarType,
        motivation:       form.motivation  as Motivation,
      });
      navigate('/goal-setting', { replace: true });
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
            current={2}
            total={3}
            labels={['Assessment', 'Profile', 'Goal']}
          />
        </div>
      </header>

      {/* ── Main form ──────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-6 py-10 pb-24">

        <Fade delay={0}>
          <h1 className="text-3xl font-extrabold mb-1">Set up your profile</h1>
          <p className="text-gray-400 mb-10">Make StringTheory feel like home.</p>
        </Fade>

        {/* ── Display Name ─────────────────────────────────────────────── */}
        <Fade delay={80}>
          <section className="mb-10">
            <SectionLabel>Display Name</SectionLabel>
            <DisplayNameInput
              value={form.displayName}
              onChange={(v) => setField('displayName', v)}
              error={errors.displayName}
              onBlurValidate={(v) => {
                const err = validateDisplayName(v);
                if (err) setField('displayName', v); // re-sets to trigger error display via hook
                return err;
              }}
            />
            <p className="mt-2 text-xs text-gray-600">
              Letters, numbers, hyphens, and underscores. This is how others will see you.
            </p>
          </section>
        </Fade>

        {/* ── Avatar ───────────────────────────────────────────────────── */}
        <Fade delay={160}>
          <section className="mb-10">
            <SectionLabel>Avatar</SectionLabel>
            <AvatarPicker
              selectedUrl={form.avatarUrl}
              onSelect={(url) => setField('avatarUrl', url)}
              onUpload={uploadAvatar}
              uploading={avatarUploading}
              error={errors.avatarUrl}
            />
          </section>
        </Fade>

        {/* ── Guitar Type ──────────────────────────────────────────────── */}
        <Fade delay={240}>
          <section className="mb-10">
            <SectionLabel>Guitar Type</SectionLabel>
            <GuitarTypeSelector
              selected={form.guitarType}
              onSelect={(v) => setField('guitarType', v)}
              error={errors.guitarType}
            />
          </section>
        </Fade>

        {/* ── Motivation ───────────────────────────────────────────────── */}
        <Fade delay={320}>
          <section className="mb-10">
            <SectionLabel>Primary Motivation</SectionLabel>
            <MotivationSelector
              selected={form.motivation}
              onSelect={(v) => setField('motivation', v)}
              error={errors.motivation}
            />
          </section>
        </Fade>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <Fade delay={400}>
          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!isFormValid()}
            >
              Complete Setup →
            </Button>
            {!isFormValid() && (
              <p className="text-center text-xs text-gray-600 mt-3">
                Fill in all fields above to continue.
              </p>
            )}
          </div>
        </Fade>
      </main>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast} type="error" onClose={dismissToast} />}
    </div>
  );
};
