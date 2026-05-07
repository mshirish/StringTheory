import type { QuizContent } from '../../types/curriculum';

interface Props {
  content:       QuizContent;
  questionIndex: number;
  isSubmitting:  boolean;
  onAnswer:      (index: number) => void;
}

export const ActivityQuiz = ({ content, questionIndex, isSubmitting, onAnswer }: Props) => {
  const question = content.questions[questionIndex];
  if (!question) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-bg-elevated border border-border rounded-xl px-5 py-4">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Question {questionIndex + 1} of {content.questions.length}</p>
        <p className="text-base font-semibold text-gray-100 leading-snug">{question.question}</p>
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !isSubmitting && onAnswer(i)}
            disabled={isSubmitting}
            className={[
              'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150',
              'border-border bg-bg-card hover:border-primary/50 hover:bg-bg-elevated',
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className="text-gray-500 mr-3 font-mono">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
