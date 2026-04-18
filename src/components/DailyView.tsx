import { useState, useRef, useEffect } from 'react';
import { Habit } from '../types';
import Confetti from './Confetti';
import MemoSheet from './MemoSheet';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const LONG_PRESS_MS = 400;
const MOVE_CANCEL_THRESHOLD = 8;
const SWIPE_REVEAL = 72;
const MEMO_EMOJIS = ['😀', '🙂', '😐', '😢', '😭', '😂', '😁'];

interface DragState {
  id: string;
  fromIndex: number;
  startY: number;
  offsetY: number;
  cardH: number;
}

interface SwipeState {
  id: string;
  startX: number;
  startY: number;
  offsetX: number;
  isHoriz: boolean | null;
}

interface Props {
  habits: Habit[];
  selectedDate: string;
  onToggle: (id: string, date: string) => void;
  onReorder: (habits: Habit[]) => void;
  onDelete: (id: string) => void;
  onSaveMemo: (habitId: string, date: string, text: string) => void;
  getMemo: (habitId: string, date: string) => string;
  onDisableMemo: (id: string) => void;
  onHabitTap: (id: string) => void;
  getStreak: (habit: Habit) => number;
}

export default function DailyView({ habits, selectedDate, onToggle, onReorder, onDelete, onSaveMemo, getMemo, onDisableMemo, onHabitTap, getStreak }: Props) {
  const completed = habits.filter(h => h.completions.includes(selectedDate)).length;
  const [drag, setDrag] = useState<DragState | null>(null);
  const [swipe, setSwipe] = useState<SwipeState | null>(null);
  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [memoSheet, setMemoSheet] = useState<{ habitId: string; deferredToggle?: boolean } | null>(null);
  const [memoText, setMemoText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const hoverIndex = drag
    ? Math.max(0, Math.min(habits.length - 1, drag.fromIndex + Math.round(drag.offsetY / drag.cardH)))
    : null;

  // Global handlers while dragging
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      setDrag(prev => prev ? { ...prev, offsetY: e.touches[0].clientY - prev.startY } : null);
    };
    const onEnd = () => {
      setDrag(prev => {
        if (!prev) return null;
        const hi = Math.max(0, Math.min(habits.length - 1,
          prev.fromIndex + Math.round(prev.offsetY / prev.cardH)));
        if (hi !== prev.fromIndex) {
          const next = [...habits];
          const [item] = next.splice(prev.fromIndex, 1);
          next.splice(hi, 0, item);
          onReorder(next);
        }
        return null;
      });
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
  }, [drag, habits, onReorder]);

  // Global handlers while swiping
  useEffect(() => {
    if (!swipe) return;
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = t.clientX - swipe.startX;
      const dy = t.clientY - swipe.startY;
      if (swipe.isHoriz === null && Math.hypot(dx, dy) > 6) {
        const horiz = Math.abs(dx) > Math.abs(dy);
        setSwipe(prev => prev ? { ...prev, isHoriz: horiz } : null);
        if (!horiz) clearTimeout(longPressTimer.current);
        return;
      }
      if (!swipe.isHoriz) return;
      e.preventDefault();
      const clamped = Math.max(-SWIPE_REVEAL, Math.min(0, (swipeOffsets[swipe.id] ?? 0) + dx));
      setSwipe(prev => prev ? { ...prev, offsetX: clamped } : null);
    };
    const onEnd = () => {
      setSwipe(prev => {
        if (!prev) return null;
        const snap = prev.offsetX < -(SWIPE_REVEAL / 2) ? -SWIPE_REVEAL : 0;
        setSwipeOffsets(o => ({ ...o, [prev.id]: snap }));
        return null;
      });
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
  }, [swipe, swipeOffsets]);

  const closeSwipe = (id: string) => {
    setSwipeOffsets(o => ({ ...o, [id]: 0 }));
    setConfirmDeleteId(null);
  };

  const fireConfettiIfAllDone = (toggledId: string) => {
    const newCompleted = habits.filter(h =>
      h.id === toggledId ? true : h.completions.includes(selectedDate)
    ).length;
    if (newCompleted === habits.length && habits.length > 0) {
      navigator.vibrate?.([30, 50, 80, 50, 120]);
      setShowConfetti(true);
    }
  };

  const handleCheckTap = (habit: Habit) => {
    const wasDone = habit.completions.includes(selectedDate);
    const isWeightGoal = (habit.goalUnit === 'kg' || habit.goalUnit === 'lbs') && !!habit.goalValue;

    // Weight habits: defer toggle until memo confirms goal was met
    if (!wasDone && isWeightGoal && !habit.memoDisabled) {
      navigator.vibrate?.([10, 30, 60]);
      setMemoText(getMemo(habit.id, selectedDate));
      setMemoSheet({ habitId: habit.id, deferredToggle: true });
      return;
    }

    if (!wasDone) navigator.vibrate?.([10, 30, 60]);
    else navigator.vibrate?.(20);
    onToggle(habit.id, selectedDate);
    if (!wasDone) fireConfettiIfAllDone(habit.id);
    if (!wasDone && !habit.memoDisabled) {
      setMemoText(getMemo(habit.id, selectedDate));
      setMemoSheet({ habitId: habit.id });
    }
  };

  const confirmMemo = () => {
    if (memoSheet) {
      onSaveMemo(memoSheet.habitId, selectedDate, memoText);
      setMemoSheet(null);
      setMemoText('');
    }
  };
  void confirmMemo; // keep reference to avoid lint warning

  const handleDisableMemo = () => {
    if (memoSheet) {
      onDisableMemo(memoSheet.habitId);
      setMemoSheet(null);
      setMemoText('');
    }
  };

  if (!habits.length) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px 48px', gap: 20 }}>
        <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Soft background circle */}
          <circle cx="80" cy="72" r="56" fill="#F2F2F7" />
          {/* Clipboard body */}
          <rect x="48" y="38" width="64" height="72" rx="10" fill="#FFFFFF" stroke="#E5E5EA" strokeWidth="2" />
          {/* Clipboard top clip */}
          <rect x="64" y="32" width="32" height="14" rx="7" fill="#E5E5EA" />
          <rect x="70" y="35" width="20" height="8" rx="4" fill="#C7C7CC" />
          {/* Dotted lines (empty rows) */}
          <rect x="60" y="58" width="40" height="5" rx="2.5" fill="#E5E5EA" />
          <rect x="60" y="70" width="32" height="5" rx="2.5" fill="#E5E5EA" />
          <rect x="60" y="82" width="36" height="5" rx="2.5" fill="#E5E5EA" />
          {/* Plus badge */}
          <circle cx="108" cy="108" r="16" fill="#007AFF" />
          <rect x="107" y="100" width="2" height="16" rx="1" fill="white" />
          <rect x="100" y="107" width="16" height="2" rx="1" fill="white" />
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E', marginBottom: 6 }}>No habits yet</div>
          <div style={{ fontSize: 14, color: '#8E8E93', lineHeight: 1.5 }}>Tap <strong style={{ color: '#007AFF' }}>+</strong> to add your first habit<br />and start building streaks</div>
        </div>
      </div>
    );
  }

  const selectedDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();

  return (
    <>
      <div style={{ flex: 1, overflowY: drag ? 'hidden' : 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 4, fontWeight: 500 }}>
          {completed}/{habits.length} completed
        </div>

        {habits.map((habit, i) => {
          const done = habit.completions.includes(selectedDate);
          const activeDays = habit.completionDays ?? [0, 1, 2, 3, 4, 5, 6];
          const isDragging = drag?.id === habit.id;
          const currentSwipeX = swipe?.id === habit.id ? swipe.offsetX : (swipeOffsets[habit.id] ?? 0);
          const isRevealed = currentSwipeX <= -(SWIPE_REVEAL / 2);

          let shiftY = 0;
          if (drag && !isDragging && hoverIndex !== null) {
            const { fromIndex } = drag;
            if (fromIndex < hoverIndex && i > fromIndex && i <= hoverIndex) shiftY = -drag.cardH;
            if (fromIndex > hoverIndex && i >= hoverIndex && i < fromIndex) shiftY = drag.cardH;
          }

          return (
            <div key={habit.id} style={{
              position: 'relative',
              transform: `translateY(${shiftY}px)`,
              transition: isDragging ? 'none' : 'transform 0.18s ease',
              zIndex: isDragging ? 20 : 1,
            }}>
              {/* Delete button */}
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0,
                width: SWIPE_REVEAL, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#FF3B30', overflow: 'hidden',
              }}>
                {confirmDeleteId === habit.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <button onClick={() => { onDelete(habit.id); setConfirmDeleteId(null); setSwipeOffsets(o => { const n = {...o}; delete n[habit.id]; return n; }); }}
                      style={{ color: '#FFF', fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>Delete</button>
                    <button onClick={() => closeSwipe(habit.id)}
                      style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 1.2 }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(habit.id)}
                    style={{ color: '#FFF', fontWeight: 700, fontSize: 13 }}>Delete</button>
                )}
              </div>

              {/* Habit card */}
              <div
                ref={el => { if (el) cardRefs.current.set(habit.id, el); else cardRefs.current.delete(habit.id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: isDragging ? '#F0F0F5' : '#FFFFFF',
                  borderRadius: 16, padding: '14px 16px',
                  boxShadow: isDragging ? '0 12px 32px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.06)',
                  transform: isDragging
                    ? `translateY(${drag.offsetY}px) scale(1.03)`
                    : `translateX(${currentSwipeX}px)`,
                  transition: isDragging ? 'box-shadow 0.15s' : swipe?.id === habit.id ? 'none' : 'transform 0.2s ease, box-shadow 0.15s',
                  userSelect: 'none',
                  touchAction: isDragging ? 'none' : 'pan-y',
                  position: 'relative',
                }}
                onTouchStart={e => {
                  if (Object.values(swipeOffsets).some(v => v !== 0)) {
                    const openId = Object.entries(swipeOffsets).find(([, v]) => v !== 0)?.[0];
                    if (openId && openId !== habit.id) { closeSwipe(openId); return; }
                  }
                  const touch = e.touches[0];
                  touchOrigin.current = { x: touch.clientX, y: touch.clientY };
                  setSwipe({ id: habit.id, startX: touch.clientX, startY: touch.clientY, offsetX: swipeOffsets[habit.id] ?? 0, isHoriz: null });
                  const el = cardRefs.current.get(habit.id);
                  const cardH = (el?.getBoundingClientRect().height ?? 76) + 10;
                  longPressTimer.current = setTimeout(() => {
                    navigator.vibrate?.(40);
                    setSwipe(null);
                    setDrag({ id: habit.id, fromIndex: i, startY: touch.clientY, offsetY: 0, cardH });
                  }, LONG_PRESS_MS);
                }}
                onTouchMove={e => {
                  if (drag) return;
                  const touch = e.touches[0];
                  const origin = touchOrigin.current;
                  if (!origin) return;
                  if (Math.hypot(touch.clientX - origin.x, touch.clientY - origin.y) > MOVE_CANCEL_THRESHOLD)
                    clearTimeout(longPressTimer.current);
                }}
                onTouchEnd={e => {
                  clearTimeout(longPressTimer.current);
                  if (!isRevealed) setConfirmDeleteId(null);
                  if (!drag && swipe?.isHoriz !== true) {
                    const origin = touchOrigin.current;
                    const t = e.changedTouches[0];
                    if (origin && Math.hypot(t.clientX - origin.x, t.clientY - origin.y) < 8) {
                      onHabitTap(habit.id);
                    }
                  }
                  touchOrigin.current = null;
                }}
              >
                {/* No visible handle — long press anywhere on card to drag */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E5E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {habit.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>{habit.name}</div>
                    {(() => { const s = getStreak(habit); return s > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#FFF3E0', borderRadius: 8, padding: '2px 6px' }}>
                        <span style={{ fontSize: 12 }}>🔥</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6B00' }}>{s}</span>
                      </div>
                    ) : null; })()}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {DAY_LABELS.map((label, di) => {
                      const isActiveDay = activeDays.includes(di);
                      const isHighlighted = done && di === selectedDayOfWeek;
                      return (
                        <div key={di} style={{
                          width: 22, height: 22, borderRadius: 6,
                          background: isHighlighted ? '#1C1C1E' : isActiveDay ? '#E5E5EA' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600,
                          color: isHighlighted ? '#FFFFFF' : isActiveDay ? '#8E8E93' : 'transparent',
                        }}>{label}</div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onTouchStart={e => e.stopPropagation()}
                  onTouchEnd={e => e.stopPropagation()}
                  onClick={() => handleCheckTap(habit)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? '#1C1C1E' : '#E5E5EA',
                    border: 'none', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke={done ? '#FFFFFF' : '#8E8E93'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {/* Memo sheet */}
      {memoSheet && (() => {
        const habit = habits.find(h => h.id === memoSheet.habitId);
        if (!habit) return null;
        return (
          <MemoSheet
            habit={habit}
            existingMemo={memoText}
            onSave={(text, goalMet) => {
              onSaveMemo(memoSheet.habitId, selectedDate, text);
              if (memoSheet.deferredToggle && goalMet) {
                onToggle(memoSheet.habitId, selectedDate);
                fireConfettiIfAllDone(memoSheet.habitId);
              }
            }}
            onClose={() => { setMemoSheet(null); setMemoText(''); }}
            onDisable={handleDisableMemo}
          />
        );
      })()}
    </>
  );
}
