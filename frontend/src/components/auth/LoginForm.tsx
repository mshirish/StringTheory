import { useState } from 'react';
import { Button } from '../ui/Button';

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitch: () => void;
}

export const LoginForm = ({ onSubmit, onSwitch }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600
            focus:outline-none focus:border-accent-gold/60 focus:ring-1 focus:ring-accent-gold/30 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600
            focus:outline-none focus:border-accent-gold/60 focus:ring-1 focus:ring-accent-gold/30 transition-colors"
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Sign In
      </Button>
      <p className="text-center text-gray-500 text-sm">
        New here?{' '}
        <button type="button" onClick={onSwitch} className="text-accent-gold hover:text-accent-gold-light font-medium">
          Create an account
        </button>
      </p>
    </form>
  );
};
