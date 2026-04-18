import { useState } from 'react';
import { Habit } from '../types';

interface Props {
  habits: Habit[];
  onDelete: (id: string) => void;
  getStreak: (h: Habit) => number;
  getLongestStreak: (h: Habit) => number;
  onToggleMemo: (id: string, disabled: boolean) => void;
}

export default function AllHabitsView({ habits, onDelete, getStreak, getLongestStreak, onToggleMemo }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!habits.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#8E8E93', fontSize: 16 }}>No habits yet</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {habits.map(habit => {
        const streak = getStreak(habit);
        const longest = getLongestStreak(habit);
        const total = habit.completions.length;

        return (
          <div key={habit.id} style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: habit.color + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}>
                {habit.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{habit.name}</div>
                <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>
                  Since {new Date(habit.createdAt + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <button
                onClick={() => setConfirmId(habit.id)}
                style={{ padding: 8, color: '#FF3B30', fontSize: 18, lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', marginTop: 12, gap: 8 }}>
              {[
                { label: 'Streak', value: `${streak}🔥` },
                { label: 'Longest', value: `${longest} days` },
                { label: 'Total', value: `${total} days` },
              ].map(stat => (
                <div key={stat.label} style={{
                  flex: 1,
                  background: '#F2F2F7',
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Memo toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, padding: '0 2px' }}>
              <span style={{ fontSize: 13, color: '#8E8E93' }}>Memo on completion</span>
              <button
                onClick={() => onToggleMemo(habit.id, !habit.memoDisabled)}
                style={{
                  width: 44, height: 26, borderRadius: 13,
                  background: habit.memoDisabled ? '#E5E5EA' : '#34C759',
                  border: 'none', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, borderRadius: '50%', width: 20, height: 20, background: '#FFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  left: habit.memoDisabled ? 3 : 21,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {confirmId === habit.id && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { onDelete(habit.id); setConfirmId(null); }}
                  style={{
                    flex: 1, background: '#FF3B30', color: '#FFF', borderRadius: 10,
                    padding: '10px', fontWeight: 600, fontSize: 14,
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  style={{
                    flex: 1, background: '#E5E5EA', borderRadius: 10,
                    padding: '10px', fontWeight: 600, fontSize: 14,
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
