import { LoadingSpinner } from './LoadingSpinner';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-accent-gold text-black font-bold hover:bg-accent-gold-light active:scale-[0.98]',
  secondary: 'bg-bg-card border border-border text-white hover:border-accent-gold/50 active:scale-[0.98]',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: Props) => (
  <button
    className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-accent-gold/40
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <LoadingSpinner size="sm" /> : children}
  </button>
);
