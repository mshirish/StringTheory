import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    // Navigation handled by App.tsx after user state updates
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    await register(username, email, password);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-bg-secondary p-12 border-r border-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎸</span>
          <span className="text-xl font-bold text-gradient-gold">StringTheory</span>
        </div>
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Master the guitar,<br />
            <span className="text-gradient-gold">one string at a time.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Adaptive lessons, real-time feedback, and a gamified journey built for every level — beginner to advanced.
          </p>
        </div>
        <div className="flex gap-8">
          {[['10k+', 'Learners'], ['500+', 'Lessons'], ['50+', 'Courses']].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-accent-gold">{num}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🎸</span>
            <span className="text-lg font-bold text-gradient-gold">StringTheory</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
          </h2>
          <p className="text-gray-500 mb-8">
            {mode === 'login'
              ? 'Sign in to continue learning.'
              : 'Create a free account to get started.'}
          </p>

          {mode === 'login' ? (
            <LoginForm onSubmit={handleLogin} onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm onSubmit={handleRegister} onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
};
