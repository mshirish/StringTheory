import { Button } from '../ui/Button';

interface Props {
  username: string;
  onStart: () => void;
}

export const WelcomeScreen = ({ username, onStart }: Props) => (
  <div className="text-center animate-fade-in">
    <div className="text-7xl mb-6">🎸</div>
    <h1 className="text-4xl font-extrabold mb-3">
      Hey {username}, let's find<br />
      <span className="text-gradient-gold">your level</span>
    </h1>
    <p className="text-gray-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
      Answer a few quick questions so we can place you in the right learning path.
    </p>

    <div className="flex justify-center gap-6 mb-10">
      {[
        { icon: '⏱', text: '2–3 minutes' },
        { icon: '🎯', text: '3–5 questions' },
        { icon: '✅', text: 'No wrong answers' },
      ].map(({ icon, text }) => (
        <div key={text} className="flex flex-col items-center gap-1.5">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs text-gray-500 font-medium">{text}</span>
        </div>
      ))}
    </div>

    <Button onClick={onStart} size="lg" className="px-12">
      Start Assessment
    </Button>
  </div>
);
