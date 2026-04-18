import { Habit } from '../types';

interface Props {
  habits: Habit[];
  getStreak: (h: Habit) => number;
}

export default function ShareView({ habits, getStreak }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const doneToday = habits.filter(h => h.completions.includes(today)).length;
  const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0);

  const shareText = `My Habit Tracker Stats 🎯\n\n✅ ${doneToday}/${habits.length} habits today\n🔥 Best streak: ${bestStreak} days\n📅 Total completions: ${totalCompletions}\n\nTracking with Habit Tracker!`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'My Habit Tracker Stats', text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>🎯</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>My Habit Stats</h2>
          <p style={{ color: '#8E8E93', fontSize: 14, marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '✅', label: 'Today', value: `${doneToday} / ${habits.length} habits` },
            { icon: '🔥', label: 'Best Streak', value: `${bestStreak} days` },
            { icon: '📅', label: 'Total Completions', value: `${totalCompletions}` },
            { icon: '📋', label: 'Total Habits', value: `${habits.length}` },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#F2F2F7',
              borderRadius: 12,
              padding: '12px 14px',
            }}>
              <span style={{ fontSize: 22 }}>{row.icon}</span>
              <span style={{ flex: 1, fontSize: 15, color: '#8E8E93' }}>{row.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {habits.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 8, fontWeight: 500 }}>Top habits</div>
            {habits.slice(0, 3).map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{h.emoji}</span>
                <span style={{ fontSize: 14, flex: 1 }}>{h.name}</span>
                <span style={{ fontSize: 13, color: '#8E8E93' }}>{getStreak(h)}🔥</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleShare}
        style={{
          background: '#2C2C2E',
          color: '#FFFFFF',
          borderRadius: 16,
          padding: '16px',
          fontSize: 16,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share Stats
      </button>
    </div>
  );
}
