import { useState } from 'react';
import { Habit } from '../types';
import HabitStatScreen from './HabitStatScreen';

const MEMO_EMOJIS = ['😀', '🙂', '😐', '😢', '😭', '😂', '😁'];
const RING_R = 108;
const RING_CIRC = 2 * Math.PI * RING_R;

interface Props {
  habit: Habit;
  date: string;
  onBack: () => void;
  onToggle: (id: string, date: string) => void;
  getDailyCount: (habitId: string, date: string) => number;
  setDailyCount: (habitId: string, date: string, count: number) => void;
  getMemo: (habitId: string, date: string) => string;
  onSaveMemo: (habitId: string, date: string, text: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (habit: Habit) => void;
  getHabitMemos: (habitId: string) => Array<{ date: string; text: string }>;
}

export default function HabitCounterScreen({ habit, date, onBack, onToggle, getDailyCount, setDailyCount, getMemo, onSaveMemo, onDelete, onArchive, onEdit, getHabitMemos }: Props) {
  const goal = habit.goal ?? 1;
  const count = getDailyCount(habit.id, date);
  const done = habit.completions.includes(date);
  const ratio = Math.min(1, goal > 0 ? count / goal : 0);

  const [activeTab, setActiveTab] = useState<'memo' | 'stat'>('memo');
  const [memoText, setMemoText] = useState(getMemo(habit.id, date));
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStat, setShowStat] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const accent = '#7B8FE0';
  const accentLight = '#D4DAFC';
  const bg = '#EEF0F8';

  const changeCount = (delta: number) => {
    const next = Math.max(0, count + delta);
    setDailyCount(habit.id, date, next);
    if (next >= goal && !done) onToggle(habit.id, date);
    if (next < goal && done) onToggle(habit.id, date);
  };

  const handleAdd = () => changeCount(1);
  const handleReset = () => {
    setDailyCount(habit.id, date, 0);
    if (done) onToggle(habit.id, date);
  };
  const handleCheck = () => {
    if (!done) {
      setDailyCount(habit.id, date, goal);
      onToggle(habit.id, date);
    }
    onBack();
  };
  const saveMemo = () => onSaveMemo(habit.id, date, memoText);

  const handleShare = () => {
    setMenuOpen(false);
    if (navigator.share) {
      navigator.share({ title: habit.name, text: `I'm building the habit: ${habit.emoji} ${habit.name}` });
    }
  };

  return (
    <>
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        position: 'relative',
      }}>
        <button onClick={onBack} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}>
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 600, color: '#1C1C1E' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {habit.emoji}
          </div>
          {habit.name}
        </div>

        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}
        >
          <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
            <circle cx="2" cy="2" r="2" fill="#8E8E93"/>
            <circle cx="2" cy="8" r="2" fill="#8E8E93"/>
            <circle cx="2" cy="14" r="2" fill="#8E8E93"/>
          </svg>
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
            <div style={{
              position: 'absolute', top: 'calc(100% - 4px)', right: 16,
              background: '#FFFFFF', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
              minWidth: 200, zIndex: 2, overflow: 'hidden',
            }}>
              {[
                {
                  label: 'Build w/ Friend', color: '#1C1C1E',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                  action: handleShare,
                },
                {
                  label: 'Edit', color: '#1C1C1E',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  ),
                  action: () => { setMenuOpen(false); onEdit(habit); },
                },
                {
                  label: 'Archive', color: '#1C1C1E',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8"/>
                      <rect x="1" y="3" width="22" height="5"/>
                      <line x1="10" y1="12" x2="14" y2="12"/>
                    </svg>
                  ),
                  action: () => { setMenuOpen(false); onArchive(habit.id); onBack(); },
                },
              ].map((item, idx, arr) => (
                <div key={item.label}>
                  <button
                    onClick={item.action}
                    style={{
                      width: '100%', padding: '14px 18px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      fontSize: 16, color: item.color, textAlign: 'left',
                      background: 'none', border: 'none',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                  {idx < arr.length - 1 && <div style={{ height: 1, background: '#F2F2F7', margin: '0 16px' }} />}
                </div>
              ))}
              <div style={{ height: 1, background: '#F2F2F7', margin: '0 16px' }} />
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#FF3B30', background: 'none', border: 'none' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Delete
                </button>
              ) : (
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 10 }}>Delete this habit?</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { onDelete(habit.id); setMenuOpen(false); onBack(); }}
                      style={{ flex: 1, background: '#FF3B30', color: '#FFF', borderRadius: 8, padding: '8px', fontWeight: 600, fontSize: 14, border: 'none' }}>
                      Delete
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      style={{ flex: 1, background: '#E5E5EA', borderRadius: 8, padding: '8px', fontWeight: 600, fontSize: 14, border: 'none' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main counter area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 260, height: 260 }}>
          <svg width="260" height="260" viewBox="0 0 260 260" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="130" cy="130" r={RING_R} fill="none" stroke={accentLight} strokeWidth="20"/>
            {ratio > 0 && (
              <circle cx="130" cy="130" r={RING_R} fill="none" stroke={accent} strokeWidth="20"
                strokeDasharray={`${RING_CIRC * ratio} ${RING_CIRC}`} strokeLinecap="round"
                transform="rotate(-90 130 130)" />
            )}
          </svg>

          {/* Emoji at top inside ring */}
          <div style={{ position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)', fontSize: 22, lineHeight: 1 }}>
            {habit.emoji}
          </div>

          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <button onClick={() => changeCount(-1)} style={{ background: 'none', border: 'none', fontSize: 28, color: '#C0C4E0', lineHeight: 1, padding: 8 }}>−</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 72, fontWeight: 800, color: '#1C1C1E', lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 16, color: '#B0B4D0', marginTop: 4 }}>/{goal}</div>
            </div>
            <button onClick={() => changeCount(1)} style={{ background: 'none', border: 'none', fontSize: 28, color: '#C0C4E0', lineHeight: 1, padding: 8 }}>+</button>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{ padding: '0 40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <button onClick={handleReset} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        <button onClick={handleAdd} style={{ flex: 1, height: 50, borderRadius: 25, background: accentLight, color: accent, fontWeight: 700, fontSize: 17, border: 'none' }}>
          Add
        </button>
        <button onClick={handleCheck} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}>
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path d="M1.5 9L8 15.5L20.5 1.5" stroke={done ? accent : accentLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Tab content */}
      <div style={{ padding: '0 16px', minHeight: 80 }}>
        {activeTab === 'memo' && (
          <div>
            <textarea value={memoText} onChange={e => setMemoText(e.target.value)} onBlur={saveMemo}
              placeholder="Input your memo here"
              style={{ width: '100%', minHeight: 64, background: 'rgba(255,255,255,0.7)', borderRadius: 12, border: 'none', padding: '10px 12px', fontSize: 15, color: '#1C1C1E', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {MEMO_EMOJIS.map(em => (
                <button key={em} onClick={() => setMemoText(t => t + em)} style={{ fontSize: 22, background: 'none', border: 'none', padding: '2px 1px' }}>{em}</button>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'stat' && (
          <div style={{ padding: '8px 4px', display: 'flex', gap: 12 }}>
            {[
              { label: 'Streak', value: `${habit.completions.length > 0 ? 1 : 0}🔥` },
              { label: 'Total', value: `${habit.completions.length} days` },
              { label: 'Goal', value: `${goal}x/day` },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 40px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => setActiveTab('memo')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', opacity: activeTab === 'memo' ? 1 : 0.4 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="#F5A623"/>
            <path d="M7 8h10M7 12h7" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M15 16l2-2-2-2" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, color: '#F5A623', fontWeight: 600 }}>Memo</span>
        </button>
        <button onClick={() => setShowStat(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', opacity: activeTab === 'stat' ? 1 : 0.4 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="#3ECFB2"/>
            <rect x="7" y="13" width="3" height="5" rx="1" fill="#FFF"/>
            <rect x="11" y="9" width="3" height="9" rx="1" fill="#FFF"/>
            <rect x="15" y="6" width="3" height="12" rx="1" fill="#FFF"/>
          </svg>
          <span style={{ fontSize: 11, color: '#3ECFB2', fontWeight: 600 }}>Stat</span>
        </button>
      </div>
    </div>

      {showStat && (
        <HabitStatScreen
          habit={habit}
          onClose={() => setShowStat(false)}
          memos={getHabitMemos(habit.id)}
        />
      )}
    </>
  );
}
