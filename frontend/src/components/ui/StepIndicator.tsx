// StepIndicator — shows "Step N of M" with labelled circle nodes and
// a connecting line. Completed steps show a gold check, the active step
// shows the primary purple, future steps are muted.

interface Props {
  current: number; // 1-based
  total: number;
  labels?: string[];
}

export const StepIndicator = ({ current, total, labels }: Props) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => {
      const step      = i + 1;
      const completed = step < current;
      const active    = step === current;

      return (
        <div key={i} className="flex items-center gap-2">
          {/* Node */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${completed ? 'bg-accent-gold border-accent-gold text-black'
                  : active  ? 'bg-primary border-primary text-white'
                  :           'bg-transparent border-border text-gray-600'}`}
            >
              {completed ? '✓' : step}
            </div>
            {labels?.[i] && (
              <span
                className={`text-[10px] font-medium hidden sm:block whitespace-nowrap
                  ${active ? 'text-white' : completed ? 'text-accent-gold' : 'text-gray-600'}`}
              >
                {labels[i]}
              </span>
            )}
          </div>

          {/* Connector */}
          {i < total - 1 && (
            <div
              className={`h-0.5 w-10 mb-4 rounded-full transition-all
                ${completed ? 'bg-accent-gold' : 'bg-border'}`}
            />
          )}
        </div>
      );
    })}

    <span className="text-xs text-gray-500 ml-1 hidden sm:block">
      Step {current} of {total}
    </span>
  </div>
);
