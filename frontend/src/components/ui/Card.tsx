interface Props {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: Props) => (
  <div
    className={`bg-bg-card border border-border rounded-2xl ${className}`}
  >
    {children}
  </div>
);
