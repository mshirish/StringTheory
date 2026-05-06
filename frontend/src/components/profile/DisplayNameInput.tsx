// DisplayNameInput — controlled text input with live character count and
// inline validation error display.

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onBlurValidate?: (value: string) => string | undefined;
}

export const DisplayNameInput = ({ value, onChange, error, onBlurValidate }: Props) => {
  const handleBlur = () => {
    onBlurValidate?.(value);
  };

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          maxLength={30}
          placeholder="e.g. GuitarLegend or string_sage"
          className={`w-full bg-bg-secondary border rounded-xl px-4 py-3.5 text-white placeholder-gray-600
            focus:outline-none focus:ring-2 transition-all pr-16
            ${error
              ? 'border-red-500/70 focus:ring-red-500/20'
              : value.length >= 2
              ? 'border-primary/60 focus:ring-primary/20'
              : 'border-border focus:border-primary/60 focus:ring-primary/20'
            }`}
        />
        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs tabular-nums
          ${value.length > 25 ? 'text-amber-400' : 'text-gray-600'}`}>
          {value.length}/30
        </span>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};
