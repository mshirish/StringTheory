import { Button } from '../ui/Button';
import type { AssessmentQuestion, QuestionOption } from '../../types';

interface Props {
  question: AssessmentQuestion;
  selected: string[];
  onSingleChoice: (option: QuestionOption) => void;
  onToggleMulti: (key: string) => void;
  onMultiContinue: () => void;
}

export const QuestionCard = ({
  question,
  selected,
  onSingleChoice,
  onToggleMulti,
  onMultiContinue,
}: Props) => {
  const isSingle = question.type === 'SINGLE_CHOICE';

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-8 leading-snug">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.key);
          return (
            <button
              key={option.key}
              onClick={() =>
                isSingle ? onSingleChoice(option) : onToggleMulti(option.key)
              }
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 group
                ${
                  isSelected
                    ? 'border-accent-gold bg-accent-gold/10 text-white'
                    : 'border-border bg-bg-card text-gray-300 hover:border-accent-gold/40 hover:text-white hover:bg-bg-secondary'
                }`}
            >
              <div className="flex items-center gap-4">
                {/* Indicator */}
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${isSelected ? 'border-accent-gold bg-accent-gold' : 'border-gray-600 group-hover:border-accent-gold/60'}`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {!isSingle && (
        <Button
          onClick={onMultiContinue}
          className="w-full mt-8"
          size="lg"
          disabled={selected.length === 0}
        >
          Continue →
        </Button>
      )}

      {!isSingle && (
        <p className="text-center text-xs text-gray-600 mt-3">Select all that apply</p>
      )}
    </div>
  );
};
