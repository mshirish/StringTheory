import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const levelBadge: Record<string, string> = {
  BEGINNER:     'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  INTERMEDIATE: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  ADVANCED:     'bg-purple-400/10 text-purple-300 border-purple-400/30',
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎸</span>
          <span className="font-bold text-gradient-gold">StringTheory</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign out
        </Button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome banner */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 mb-1">Welcome back,</p>
              <h1 className="text-3xl font-bold mb-3">{user.username}</h1>
              {user.skillLevel && (
                <span className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${levelBadge[user.skillLevel]}`}>
                  {user.skillLevel.charAt(0) + user.skillLevel.slice(1).toLowerCase()} player
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</p>
              <p className="text-4xl font-extrabold text-accent-gold">{user.level}</p>
              <p className="text-xs text-gray-500">{user.xp} XP</p>
            </div>
          </div>
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🔥', label: 'Day Streak', value: user.streakCount ?? 0 },
            { icon: '⭐', label: 'Total XP', value: user.xp },
            { icon: '📚', label: 'Lessons Done', value: 0 },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-bg-card border border-border rounded-xl p-5 text-center">
              <span className="text-3xl block mb-2">{icon}</span>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="bg-bg-card border border-dashed border-border rounded-2xl p-12 text-center text-gray-600">
          <p className="text-lg font-medium mb-1">Courses coming soon</p>
          <p className="text-sm">The learning journey continues here.</p>
        </div>
      </main>
    </div>
  );
};
