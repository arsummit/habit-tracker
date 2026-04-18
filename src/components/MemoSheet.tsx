import { useState } from 'react';
import { Habit } from '../types';

type CtxType = 'time' | 'number' | 'duration' | 'text';

interface Ctx {
  type: CtxType;
  question: string;
  unit?: string;
  defaultVal: string;
  saveLabel: (v: string) => string;
}

function getContext(habit: Habit): Ctx {
  const n = habit.name.toLowerCase();

  if (/wake|woke|rise|morning|alarm/.test(n))
    return { type: 'time', question: 'What time did you wake up?', defaultVal: '07:00',
      saveLabel: v => `Woke up at ${fmt12(v)}` };

  if (/sleep|bed|bedtime|nap/.test(n))
    return { type: 'time', question: 'What time did you go to sleep?', defaultVal: '22:00',
      saveLabel: v => `Slept at ${fmt12(v)}` };

  if (/weight|weigh/.test(n))
    return { type: 'number', question: "What's your weight today?", unit: 'kg', defaultVal: '',
      saveLabel: v => `${v} kg` };

  if (/water|drink|hydrat/.test(n))
    return { type: 'number', question: 'How much did you drink?', unit: 'glasses', defaultVal: '',
      saveLabel: v => `${v} glasses` };

  if (/meditat|breath|mindful/.test(n))
    return { type: 'duration', question: 'How long did you meditate?', unit: 'min', defaultVal: '',
      saveLabel: v => `${v} min` };

  if (/workout|exercise|gym|train|lift/.test(n))
    return { type: 'duration', question: 'How long did you work out?', unit: 'min', defaultVal: '',
      saveLabel: v => `${v} min` };

  if (/walk|run|jog|step/.test(n))
    return { type: 'number', question: 'How many steps did you take?', unit: 'steps', defaultVal: '',
      saveLabel: v => `${v} steps` };

  if (/read|book|page/.test(n))
    return { type: 'number', question: 'How many pages did you read?', unit: 'pages', defaultVal: '',
      saveLabel: v => `${v} pages` };

  if (/pray|god|devotion|bible|church/.test(n))
    return { type: 'duration', question: 'How long did you spend?', unit: 'min', defaultVal: '',
      saveLabel: v => `${v} min` };

  return { type: 'text', question: 'How did it go?', defaultVal: '',
    saveLabel: v => v };
}

function fmt12(time24: string): string {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const MOODS = ['😊', '💪', '😴', '🔥', '😐', '😅'];

interface Props {
  habit: Habit;
  existingMemo: string;
  onSave: (text: string, goalMet?: boolean) => void;
  onClose: () => void;
  onDisable: () => void;
}

export default function MemoSheet({ habit, existingMemo, onSave, onClose, onDisable }: Props) {
  const ctx = getContext(habit);
  const [value, setValue] = useState(existingMemo || ctx.defaultVal);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState('');

  const isWeightGoal = (habit.goalUnit === 'kg' || habit.goalUnit === 'lbs') && !!habit.goalValue;
  const weightGoalMet = isWeightGoal && value !== '' ? Number(value) < habit.goalValue! : undefined;

  const handleSave = () => {
    const parts: string[] = [];
    if (value) parts.push(ctx.saveLabel(value));
    if (mood) parts.push(mood);
    if (note.trim()) parts.push(note.trim());
    onSave(parts.join(' · ') || '', isWeightGoal ? weightGoalMet : undefined);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleSave} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        background: '#FFFFFF', borderRadius: '24px 24px 0 0',
        padding: '0 20px calc(28px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D1D1D6' }} />
        </div>

        {/* Habit header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, background: '#F2F2F7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            {habit.emoji}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E' }}>{habit.name}</div>
            <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>{ctx.question}</div>
          </div>
        </div>

        {/* Context input */}
        {ctx.type === 'time' && (
          <div style={{ marginBottom: 20 }}>
            <input
              type="time"
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                border: '2px solid #E5E5EA', fontSize: 32, fontWeight: 700,
                color: '#1C1C1E', textAlign: 'center', background: '#F8F8FC',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {(ctx.type === 'number' || ctx.type === 'duration') && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#F8F8FC', borderRadius: 16, padding: '8px 12px',
              border: '2px solid #E5E5EA',
            }}>
              <button
                onClick={() => setValue(v => String(Math.max(0, (Number(v) || 0) - (ctx.type === 'duration' ? 5 : 1))))}
                style={{
                  width: 44, height: 44, borderRadius: 12, background: '#E5E5EA',
                  border: 'none', fontSize: 22, fontWeight: 700, color: '#1C1C1E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >−</button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    fontSize: 36, fontWeight: 700, color: '#1C1C1E', textAlign: 'center',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>{ctx.unit}</div>
              </div>
              <button
                onClick={() => setValue(v => String((Number(v) || 0) + (ctx.type === 'duration' ? 5 : 1)))}
                style={{
                  width: 44, height: 44, borderRadius: 12, background: '#007AFF',
                  border: 'none', fontSize: 22, fontWeight: 700, color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >+</button>
            </div>
          </div>
        )}

        {ctx.type === 'text' && (
          <textarea
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Write how it went..."
            style={{
              width: '100%', minHeight: 100, background: '#F8F8FC',
              borderRadius: 16, border: '2px solid #E5E5EA', padding: '14px',
              fontSize: 16, color: '#1C1C1E', resize: 'none', outline: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16,
            }}
          />
        )}

        {/* Weight goal indicator */}
        {isWeightGoal && value !== '' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 12, marginBottom: 14,
            background: weightGoalMet ? '#F0FFF4' : '#FFF2F2',
          }}>
            <span style={{ fontSize: 18 }}>{weightGoalMet ? '✅' : '⚠️'}</span>
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: weightGoalMet ? '#34C759' : '#FF3B30',
            }}>
              {weightGoalMet
                ? `Under ${habit.goalValue} ${habit.goalUnit} goal!`
                : `Over ${habit.goalValue} ${habit.goalUnit} goal — won't count as done`}
            </span>
          </div>
        )}

        {/* Mood row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 8 }}>HOW DO YOU FEEL?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setMood(prev => prev === m ? '' : m)}
                style={{
                  width: 44, height: 44, borderRadius: 12, fontSize: 22,
                  background: mood === m ? '#E8F0FF' : '#F2F2F7',
                  border: mood === m ? '2px solid #007AFF' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* Optional note (only shown for non-text types) */}
        {ctx.type !== 'text' && (
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              border: '2px solid #E5E5EA', fontSize: 15, color: '#1C1C1E',
              background: '#F8F8FC', outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box', marginBottom: 16,
            }}
          />
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onDisable}
            style={{
              padding: '14px 16px', borderRadius: 14, background: '#F2F2F7',
              border: 'none', fontSize: 13, color: '#8E8E93', fontFamily: 'inherit',
            }}
          >Don't ask again</button>
          <button
            onClick={handleSave}
            style={{
              flex: 1, padding: '14px', borderRadius: 14, background: '#1C1C1E',
              border: 'none', fontSize: 16, fontWeight: 700, color: '#FFFFFF',
              fontFamily: 'inherit',
            }}
          >Save Log</button>
        </div>
      </div>
    </>
  );
}
