import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ASSESSMENT_QUESTIONS_QUERY } from '../../graphql/queries';
import { SUBMIT_ASSESSMENT_MUTATION } from '../../graphql/mutations';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { PlacementResult } from './PlacementResult';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { AssessmentQuestion, AssessmentResponseInput, AssessmentResult, QuestionOption } from '../../types';

type FlowStep = 'welcome' | 'questions' | 'submitting' | 'result';

interface Props {
  username: string;
  onComplete: (placement: string) => void;
}

export const OnboardingFlow = ({ username, onComplete }: Props) => {
  const [step, setStep] = useState<FlowStep>('welcome');
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [currentKey, setCurrentKey] = useState<string>('Q1');
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');

  const { data, loading: loadingQuestions } = useQuery(ASSESSMENT_QUESTIONS_QUERY);
  const [submitAssessment] = useMutation(SUBMIT_ASSESSMENT_MUTATION);

  if (loadingQuestions) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const questions: AssessmentQuestion[] = data?.assessmentQuestions ?? [];
  const questionMap = new Map(questions.map((q) => [q.key, q]));
  const currentQuestion = questionMap.get(currentKey);

  // Navigate to the next question or end the flow
  const advanceTo = (nextKey: string | null, updatedAnswers: Map<string, string[]>) => {
    if (!nextKey || !questionMap.has(nextKey)) {
      handleSubmit(updatedAnswers);
      return;
    }
    setAnswers(updatedAnswers);
    setQuestionHistory((h) => [...h, nextKey]);
    setCurrentKey(nextKey);
  };

  const handleSingleChoice = (option: QuestionOption) => {
    const updated = new Map(answers).set(currentKey, [option.key]);
    advanceTo(option.nextQuestionKey, updated);
  };

  const toggleMultiSelect = (key: string) => {
    const current = answers.get(currentKey) ?? [];
    const updated = new Map(answers).set(
      currentKey,
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );
    setAnswers(updated);
  };

  const handleMultiContinue = () => {
    const nextKey = currentQuestion?.defaultNextKey ?? null;
    advanceTo(nextKey, answers);
  };

  const handleSubmit = async (finalAnswers: Map<string, string[]>) => {
    setStep('submitting');
    const responses: AssessmentResponseInput[] = Array.from(finalAnswers.entries()).map(
      ([questionKey, answerKeys]) => ({ questionKey, answerKeys })
    );
    try {
      const { data } = await submitAssessment({ variables: { responses } });
      setResult(data.submitAssessment);
      setStep('result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStep('questions');
    }
  };

  const handleGoBack = () => {
    if (questionHistory.length === 0) {
      setStep('welcome');
      return;
    }
    const prev = [...questionHistory];
    const prevKey = prev.pop()!;
    setQuestionHistory(prev);
    setCurrentKey(prevKey);
    // Clear the current question's answer when going back
    const updated = new Map(answers);
    updated.delete(currentKey);
    setAnswers(updated);
  };

  // Calculate progress: history of visited + current = total visited so far
  // We show steps as 1-based indices
  const visitedCount = questionHistory.length + 1; // +1 for current
  // Max possible steps on any path is 3; just use visited count with a generous max
  const estimatedTotal = 3;

  if (step === 'welcome') {
    return <WelcomeScreen username={username} onStart={() => { setStep('questions'); setQuestionHistory(['Q1']); setCurrentKey('Q1'); }} />;
  }

  if (step === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400">Calculating your placement…</p>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <PlacementResult
        result={result}
        onContinue={() => onComplete(result.placement)}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={handleGoBack}
          className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
        >
          ← Back
        </button>
        <ProgressBar current={visitedCount} total={estimatedTotal} />
      </div>

      {error && (
        <p className="mb-6 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Re-key on question change to trigger slide-up animation */}
      <div key={currentKey}>
        <QuestionCard
          question={currentQuestion}
          selected={answers.get(currentKey) ?? []}
          onSingleChoice={handleSingleChoice}
          onToggleMulti={toggleMultiSelect}
          onMultiContinue={handleMultiContinue}
        />
      </div>
    </div>
  );
};
