import { useState } from 'react';
import { Habit } from '../types';
import HabitDetailsScreen from './HabitDetailsScreen';

interface PresetHabit { name: string; emoji: string; color: string; goalValue?: number; goalUnit?: string; }

const CATEGORIES = [
  {
    id: 'popular', label: 'Popular', sub: 'Most popular habits',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#fff' : '#6A9FE8'}>
        <path d="M12 2C10 5 8 7 8 10c0 2 1 3.5 2.5 4.5C10 13 11 10 13 9c0 2-.5 3.5-1 5 1-1 2.5-2.5 2.5-4.5C16.5 11 17 13.5 17 15c0 3.3-2.2 6-5 6s-5-2.7-5-6c0-4 2.5-8 5-13z"/>
        <text x="6.5" y="21" fontSize="5" fontWeight="900" fill={active ? '#fff' : '#6A9FE8'} fontFamily="sans-serif">HOT</text>
      </svg>
    ),
  },
  {
    id: 'health', label: 'Health', sub: 'Health habits are linked with Apple Health App',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#fff' : '#6A9FE8'}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    ),
  },
  {
    id: 'sports', label: 'Sports', sub: 'Exercise and fitness related habits',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#6A9FE8'} strokeWidth="2" strokeLinecap="round">
        <circle cx="13" cy="4" r="2" fill={active ? '#fff' : '#6A9FE8'} stroke="none"/>
        <path d="M8 20l2-6 3 3 2-4 3 4"/>
        <path d="M6 12l3-4 3 1 2-3"/>
      </svg>
    ),
  },
  {
    id: 'lifestyle', label: 'Lifestyle', sub: 'Habits to make your life better',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#6A9FE8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'time', label: 'Time', sub: 'Habits with time units & timer',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#6A9FE8'} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    id: 'quit', label: 'Quit', sub: 'Quit type, not exceeding goal is success',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#6A9FE8'} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    ),
  },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

const BLACK = '#1C1C1E';

const PRESETS: Record<CategoryId, PresetHabit[]> = {
  popular: [
    { name: 'Wake Up Early',   emoji: '⏰',  color: BLACK, goalValue: 1,     goalUnit: 'times'  },
    { name: 'Weigh In',        emoji: '⚖️',  color: BLACK, goalValue: 1,     goalUnit: 'times'  },
    { name: 'Drink Water',     emoji: '💧',  color: BLACK, goalValue: 8,     goalUnit: 'glasses'},
    { name: 'Time with God',   emoji: '🙏',  color: BLACK, goalValue: 30,    goalUnit: 'min'    },
    { name: 'Workout',         emoji: '💪',  color: BLACK, goalValue: 45,    goalUnit: 'min'    },
    { name: 'Walk',            emoji: '🚶‍♀️', color: BLACK, goalValue: 10000, goalUnit: 'steps'  },
    { name: 'Deep Work',       emoji: '🎯',  color: BLACK, goalValue: 2,     goalUnit: 'hr'     },
    { name: 'Calorie Deficit', emoji: '🥗',  color: BLACK, goalValue: 500,   goalUnit: 'Cal'    },
    { name: 'Journal',         emoji: '📔',  color: BLACK, goalValue: 1,     goalUnit: 'times'  },
    { name: 'Plan',            emoji: '📋',  color: BLACK, goalValue: 1,     goalUnit: 'times'  },
    { name: 'Read Books',      emoji: '📚',  color: BLACK, goalValue: 30,    goalUnit: 'min'    },
    { name: 'Meditation',      emoji: '🧘‍♀️', color: BLACK, goalValue: 10,    goalUnit: 'min'    },
    { name: 'Sleep Early',     emoji: '🛏️',  color: BLACK, goalValue: 8,     goalUnit: 'hr'     },
  ],
  health: [
    { name: 'Drink Water',         emoji: '💧',  color: BLACK, goalValue: 8,     goalUnit: 'glasses'},
    { name: 'Weigh In',            emoji: '⚖️',  color: BLACK, goalValue: 1,     goalUnit: 'times'  },
    { name: 'Sleep Early',         emoji: '🛏️',  color: BLACK, goalValue: 8,     goalUnit: 'hr'     },
    { name: 'Calorie Deficit',     emoji: '🥗',  color: BLACK, goalValue: 500,   goalUnit: 'Cal'    },
    { name: 'Walk',                emoji: '🚶‍♀️', color: BLACK, goalValue: 10000, goalUnit: 'steps'  },
    { name: 'Stand',               emoji: '🧍',  color: BLACK, goalValue: 12,    goalUnit: 'times'  },
    { name: 'Cycling',             emoji: '🚴',  color: BLACK, goalValue: 30,    goalUnit: 'min'    },
    { name: 'Active Calorie',      emoji: '🔥',  color: BLACK, goalValue: 500,   goalUnit: 'Cal'    },
    { name: 'Burn Calorie',        emoji: '🔥',  color: BLACK, goalValue: 300,   goalUnit: 'Cal'    },
    { name: 'Exercise',            emoji: '🏃‍♀️', color: BLACK, goalValue: 30,    goalUnit: 'min'    },
    { name: 'Meditation',          emoji: '🧘‍♀️', color: BLACK, goalValue: 10,    goalUnit: 'min'    },
    { name: 'Eat Fruits',          emoji: '🍓',  color: BLACK, goalValue: 2,     goalUnit: 'times'  },
    { name: 'Less Carbohydrate',   emoji: '🍞',  color: BLACK, goalValue: 50,    goalUnit: 'g'      },
    { name: 'Drink Less Caffeine', emoji: '☕',  color: BLACK, goalValue: 1,     goalUnit: 'drink'  },
  ],
  sports: [
    { name: 'Walk',         emoji: '🚶‍♀️', color: BLACK, goalValue: 10000, goalUnit: 'steps'},
    { name: 'Run',          emoji: '🏃‍♀️', color: BLACK, goalValue: 5,     goalUnit: 'km'   },
    { name: 'Workout',      emoji: '💪',  color: BLACK, goalValue: 45,    goalUnit: 'min'  },
    { name: 'Stretch',      emoji: '🤸‍♀️', color: BLACK, goalValue: 10,    goalUnit: 'min'  },
    { name: 'Stand',        emoji: '🧍',  color: BLACK, goalValue: 12,    goalUnit: 'times'},
    { name: 'Yoga',         emoji: '🧘',  color: BLACK, goalValue: 30,    goalUnit: 'min'  },
    { name: 'Cycling',      emoji: '🚴',  color: BLACK, goalValue: 30,    goalUnit: 'min'  },
    { name: 'Swim',         emoji: '🏊',  color: BLACK, goalValue: 30,    goalUnit: 'min'  },
    { name: 'Burn Calorie', emoji: '🔥',  color: BLACK, goalValue: 300,   goalUnit: 'Cal'  },
    { name: 'Exercise',     emoji: '🏃‍♀️', color: BLACK, goalValue: 30,    goalUnit: 'min'  },
    { name: 'Anaerobic',    emoji: '🏋️',  color: BLACK, goalValue: 45,    goalUnit: 'min'  },
  ],
  lifestyle: [
    { name: 'Wake Up Early',  emoji: '⏰',  color: BLACK, goalValue: 1,  goalUnit: 'times'},
    { name: 'Time with God',  emoji: '🙏',  color: BLACK, goalValue: 30, goalUnit: 'min'  },
    { name: 'Journal',        emoji: '📔',  color: BLACK, goalValue: 1,  goalUnit: 'times'},
    { name: 'Plan',           emoji: '📋',  color: BLACK, goalValue: 1,  goalUnit: 'times'},
    { name: 'Deep Work',      emoji: '🎯',  color: BLACK, goalValue: 2,  goalUnit: 'hr'   },
    { name: 'Read a Book',    emoji: '📚',  color: BLACK, goalValue: 30, goalUnit: 'min'  },
    { name: 'Learning',       emoji: '🎓',  color: BLACK, goalValue: 30, goalUnit: 'min'  },
    { name: 'Track Expenses', emoji: '📒',  color: BLACK, goalValue: 1,  goalUnit: 'times'},
    { name: 'Save Money',     emoji: '💰',  color: BLACK, goalValue: 1,  goalUnit: 'times'},
    { name: 'Breathe',        emoji: '😮‍💨', color: BLACK, goalValue: 10, goalUnit: 'min'  },
    { name: 'Meditation',     emoji: '🧘‍♀️', color: BLACK, goalValue: 10, goalUnit: 'min'  },
    { name: 'Review Today',   emoji: '📼',  color: BLACK, goalValue: 1,  goalUnit: 'times'},
    { name: 'Mind Clearing',  emoji: '💡',  color: BLACK, goalValue: 10, goalUnit: 'min'  },
    { name: 'Drink Water',    emoji: '💧',  color: BLACK, goalValue: 8,  goalUnit: 'glasses'},
  ],
  time: [
    { name: 'Deep Work',     emoji: '🎯',  color: BLACK, goalValue: 2,  goalUnit: 'hr'  },
    { name: 'Meditation',    emoji: '🧘‍♀️', color: BLACK, goalValue: 10, goalUnit: 'min' },
    { name: 'Stretch',       emoji: '🤸‍♀️', color: BLACK, goalValue: 10, goalUnit: 'min' },
    { name: 'Yoga',          emoji: '🧘',  color: BLACK, goalValue: 30, goalUnit: 'min' },
    { name: 'Swim',          emoji: '🏊',  color: BLACK, goalValue: 30, goalUnit: 'min' },
    { name: 'Exercise',      emoji: '🏃‍♀️', color: BLACK, goalValue: 30, goalUnit: 'min' },
    { name: 'Anaerobic',     emoji: '🏋️',  color: BLACK, goalValue: 45, goalUnit: 'min' },
    { name: 'Breathe',       emoji: '😮‍💨', color: BLACK, goalValue: 10, goalUnit: 'min' },
    { name: 'Read a Book',   emoji: '📚',  color: BLACK, goalValue: 30, goalUnit: 'min' },
    { name: 'Learning',      emoji: '🎓',  color: BLACK, goalValue: 30, goalUnit: 'min' },
    { name: 'Review Today',  emoji: '📼',  color: BLACK, goalValue: 30, goalUnit: 'min' },
    { name: 'Mind Clearing', emoji: '💡',  color: BLACK, goalValue: 10, goalUnit: 'min' },
  ],
  quit: [
    { name: 'Less Carbohydrate',   emoji: '🍞', color: BLACK, goalValue: 50, goalUnit: 'g'    },
    { name: 'Eat Less Sugar',      emoji: '🍭', color: BLACK, goalValue: 25, goalUnit: 'g'    },
    { name: 'Drink Less Caffeine', emoji: '☕', color: BLACK, goalValue: 1,  goalUnit: 'drink'},
    { name: 'Drink Less Beverage', emoji: '🥤', color: BLACK, goalValue: 1,  goalUnit: 'drink'},
    { name: 'Drink Less Alcohol',  emoji: '🍺', color: BLACK, goalValue: 1,  goalUnit: 'drink'},
    { name: 'Smoke Less',          emoji: '🚭', color: BLACK, goalValue: 5,  goalUnit: 'count'},
    { name: 'Play Less Game',      emoji: '🎮', color: BLACK, goalValue: 1,  goalUnit: 'hr'   },
    { name: 'Complain Less',       emoji: '😤', color: BLACK, goalValue: 3,  goalUnit: 'count'},
    { name: 'Sit Less',            emoji: '🪑', color: BLACK, goalValue: 2,  goalUnit: 'hr'   },
    { name: 'Watch Less TV',       emoji: '📺', color: BLACK, goalValue: 1,  goalUnit: 'hr'   },
    { name: 'Less Social App',     emoji: '📱', color: BLACK, goalValue: 1,  goalUnit: 'hr'   },
  ],
};

interface Props {
  onAdd: (name: string, emoji: string, color: string, extra?: {
    description?: string;
    frequency?: Habit['frequency'];
    completionDays?: number[];
    startingFrom?: string;
  }) => void;
  onClose: () => void;
}

export default function HabitPickerModal({ onAdd, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('popular');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPreset, setSelectedPreset] = useState<PresetHabit | null>(null);

  const toggleFav = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const activeCat = CATEGORIES.find(c => c.id === activeCategory)!;

  if (selectedPreset !== null) {
    return (
      <HabitDetailsScreen
        initialName={selectedPreset.name}
        initialEmoji={selectedPreset.emoji}
        initialColor={selectedPreset.color}
        initialGoalValue={selectedPreset.goalValue}
        initialGoalUnit={selectedPreset.goalUnit}
        onAdd={(name, emoji, color, extra) => { onAdd(name, emoji, color, extra); }}
        onBack={() => setSelectedPreset(null)}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#F2F2F7',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(14px + env(safe-area-inset-top, 0px)) 20px 16px',
        background: '#F2F2F7',
      }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%', background: 'none',
          border: 'none', fontSize: 22, color: '#1C1C1E', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>‹</button>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>New Habit</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#C7D8FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B8AEE" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>

      {/* Category icons */}
      <div style={{
        display: 'flex', gap: 10, padding: '0 20px 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => {
          const active = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: active ? '#5B8AEE' : '#D8E6FF',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              {cat.icon(active)}
            </button>
          );
        })}
      </div>

      {/* Category title + subtitle */}
      <div style={{ padding: '0 20px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>{activeCat.label}</div>
        <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>{activeCat.sub}</div>
      </div>

      {/* Habit list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 16px',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        scrollbarWidth: 'none',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PRESETS[activeCategory].map(habit => (
            <div
              key={habit.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#FFFFFF', borderRadius: 16,
                padding: '14px 16px', cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: 28, flexShrink: 0, width: 36, textAlign: 'center' }}>
                {habit.emoji}
              </span>

              <span style={{
                flex: 1, fontSize: 16, fontWeight: 600, color: '#1C1C1E',
              }}>
                {habit.name}
              </span>

              {/* Heart favorite */}
              <button
                onClick={e => toggleFav(habit.name, e)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px', flexShrink: 0,
                  fontSize: 18, lineHeight: 1,
                }}
              >
                {favorites.has(habit.name) ? '❤️' : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2D55" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                )}
              </button>

              {/* Add button */}
              <button
                onClick={() => setSelectedPreset(habit)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px', flexShrink: 0,
                  fontSize: 22, fontWeight: 300, color: '#1C1C1E', lineHeight: 1,
                }}
              >+</button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Custom Habit pill */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
      }}>
        <button
          onClick={() => setSelectedPreset({ name: '', emoji: '✨', color: '#007AFF' })}
          style={{
            background: 'linear-gradient(135deg, #90B8FF, #B8A0FF)',
            color: '#FFFFFF', borderRadius: 999,
            padding: '14px 40px', fontSize: 16, fontWeight: 600,
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(90,140,255,0.35)',
          }}
        >
          Custom Habit
        </button>
      </div>
    </div>
  );
}
