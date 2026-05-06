// Toast — fixed-position notification that auto-dismisses after 4 seconds.

import { useEffect } from 'react';

interface Props {
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
}

export const Toast = ({ message, type = 'error', onClose }: Props) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium
          ${type === 'error'
            ? 'bg-red-500/95 text-white border border-red-400/30'
            : 'bg-emerald-500/95 text-white border border-emerald-400/30'
          }`}
      >
        <span>{type === 'error' ? '⚠️' : '✅'}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};
