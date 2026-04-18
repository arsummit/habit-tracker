import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Habit } from '../types';
import { toDateStr } from '../hooks/useHabits';
import ColorPickerSheet from './ColorPickerSheet';

const GROUP_COLORS = ['#FF3B30','#FF9500','#FFCC00','#34C759','#5AC8FA','#007AFF','#5856D6','#AF52DE','#FF2D55','#8E8E93'];

function loadGroups(): string[] {
  try { return JSON.parse(localStorage.getItem('habit-groups-v1') || '[]'); } catch { return []; }
}
function saveGroups(g: string[]) { localStorage.setItem('habit-groups-v1', JSON.stringify(g)); }

const GOAL_PERIODS = ['Day-Long', 'Week-Long', 'Month-Long'] as const;
type GoalPeriod = typeof GOAL_PERIODS[number];

const PERIOD_UNIT: Record<GoalPeriod, string> = {
  'Day-Long': 'Day',
  'Week-Long': 'Week',
  'Month-Long': 'Month',
};

function GoalPeriodSheet({ value, color, onSelect, onClose }: {
  value: GoalPeriod; color: string; onSelect: (p: GoalPeriod) => void; onClose: () => void;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#FFFFFF', borderRadius: '20px 20px 0 0',
        padding: '0 0 calc(28px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D1D1D6' }} />
        </div>
        {/* Title */}
        <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', color: '#1C1C1E', padding: '12px 20px 4px' }}>
          Goal Period
        </div>
        {/* Options */}
        <div style={{ padding: '8px 16px 0' }}>
          {GOAL_PERIODS.map((p, i) => {
            const selected = value === p;
            return (
              <div key={p}>
                <div
                  onClick={() => { onSelect(p); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 4px', cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#1C1C1E' }}>{p}</span>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: selected ? 'none' : '2px solid #D1D1D6',
                    background: selected ? color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {selected && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <polyline points="1,5 4.5,8.5 11,1.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                {i < GOAL_PERIODS.length - 1 && <div style={{ height: 1, background: '#F2F2F7' }} />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}


function NumpadSheet({ value, onChange, onClose }: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const press = (key: string) => {
    if (key === '✓') { onClose(); return; }
    if (key === 'AC') { onChange('0'); return; }
    if (key === '⌫') { onChange(value.length <= 1 ? '0' : value.slice(0, -1)); return; }
    if (key === '.' && value.includes('.')) return;
    const next = value === '0' && key !== '.' ? key : value + key;
    if (next.length <= 8) onChange(next);
  };

  const KEY_H = 48;
  const GAP = 7;

  const keyBtn = (key: string, extra?: React.CSSProperties) => (
    <button
      key={key + (extra?.gridRow ?? '')}
      onClick={() => press(key)}
      style={{
        height: KEY_H, border: 'none', cursor: 'pointer',
        background: '#FFFFFF', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 0 rgba(0,0,0,0.18)',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        ...extra,
      }}
    >
      {key === '⌫' ? (
        <svg width="22" height="17" viewBox="0 0 32 24" fill="none">
          <rect x="9" y="1" width="22" height="22" rx="5" stroke="#1C1C1E" strokeWidth="1.7" fill="none"/>
          <line x1="14" y1="8" x2="25" y2="16" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="25" y1="8" x2="14" y2="16" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ) : key === '⌘' ? (
        <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
          <path d="M8 8h12M8 20h12M8 8v12M20 8v12M5 5a3 3 0 103 3V5zM20 5a3 3 0 113 3V5zM5 23a3 3 0 113-3v3zM20 23a3 3 0 103-3v3z"
            stroke="#8E8E93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : key === '✓' ? (
        <svg width="22" height="18" viewBox="0 0 28 24" fill="none">
          <polyline points="2,12 10,20 26,4" stroke="#34C759" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <span style={{ fontSize: 24, fontWeight: 300, color: '#1C1C1E', lineHeight: 1 }}>{key}</span>
      )}
    </button>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#EAEAEA', borderRadius: '16px 16px 0 0',
        padding: `6px ${GAP}px calc(${GAP}px + env(safe-area-inset-bottom, 0px))`,
        maxWidth: 430, margin: '0 auto',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
          <div style={{ width: 38, height: 5, borderRadius: 3, background: '#AEAEB2' }} />
        </div>

        {/* Grid: 4 cols, 4 rows. ✓ spans rows 3-4 in col 4 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: `repeat(4, ${KEY_H}px)`,
          gap: GAP,
        }}>
          {/* Row 1 */}
          {keyBtn('1')}
          {keyBtn('2')}
          {keyBtn('3')}
          {keyBtn('AC')}
          {/* Row 2 */}
          {keyBtn('4')}
          {keyBtn('5')}
          {keyBtn('6')}
          {keyBtn('⌫')}
          {/* Row 3 — numbers only; ✓ placed explicitly in col 4 spanning rows 3-4 */}
          {keyBtn('7')}
          {keyBtn('8')}
          {keyBtn('9')}
          {/* ✓ tall button spanning rows 3 & 4 */}
          {keyBtn('✓', {
            gridColumn: 4, gridRow: '3 / 5',
            height: KEY_H * 2 + GAP,
          })}
          {/* Row 4 */}
          {keyBtn('⌘')}
          {keyBtn('0')}
          {keyBtn('.', { fontSize: 28 })}
        </div>
      </div>
    </>
  );
}

function GroupManagerSheet({ selected, onSelect, onClose }: {
  selected: string; onSelect: (g: string) => void; onClose: () => void;
}) {
  const [groups, setGroups] = useState<string[]>(loadGroups);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const addGroup = () => {
    const n = newName.trim();
    if (!n || groups.includes(n)) { setAdding(false); setNewName(''); return; }
    const next = [...groups, n];
    setGroups(next); saveGroups(next);
    setAdding(false); setNewName('');
  };

  const deleteGroup = (g: string) => {
    const next = groups.filter(x => x !== g);
    setGroups(next); saveGroups(next);
    if (selected === g) onSelect('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 14px',
        borderBottom: '1px solid #F2F2F7',
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 22, color: '#1C1C1E',
          cursor: 'pointer', lineHeight: 1, padding: 4,
        }}>✕</button>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>Group Manager</span>
        <div style={{ width: 32 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>

        {/* Add group row */}
        {adding ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#F2F2F7', borderRadius: 14, padding: '12px 14px', marginBottom: 8,
          }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addGroup(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
              placeholder="Group name"
              autoFocus
              style={{
                flex: 1, fontSize: 16, border: 'none', outline: 'none',
                background: 'transparent', color: '#1C1C1E', fontFamily: 'inherit',
              }}
            />
            <button onClick={addGroup} style={{
              padding: '7px 16px', borderRadius: 20, border: 'none',
              background: '#1C1C1E', color: '#FFF', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}>Add</button>
            <button onClick={() => { setAdding(false); setNewName(''); }} style={{
              padding: '7px 12px', borderRadius: 20, border: 'none',
              background: '#E5E5EA', color: '#1C1C1E', fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
            }}>Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 4px', width: '100%',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#E8F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: '#007AFF', fontWeight: 300, flexShrink: 0,
            }}>+</div>
            <span style={{ fontSize: 16, color: '#007AFF', fontWeight: 500 }}>Add group</span>
          </button>
        )}

        {/* Group list */}
        {groups.length === 0 && !adding && (
          <div style={{ textAlign: 'center', color: '#AEAEB2', fontSize: 15, marginTop: 48 }}>
            No groups yet. Tap + to create one.
          </div>
        )}

        {groups.map((g, i) => {
          const isSelected = selected === g;
          const dotColor = GROUP_COLORS[i % GROUP_COLORS.length];
          return (
            <div
              key={g}
              onClick={() => onSelect(isSelected ? '' : g)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: isSelected ? '#F0F4FF' : '#FFFFFF',
                border: isSelected ? '1.5px solid #007AFF' : '1.5px solid #F2F2F7',
                borderRadius: 14, padding: '13px 14px', marginBottom: 8, cursor: 'pointer',
              }}
            >
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: dotColor, flexShrink: 0,
              }} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: '#1C1C1E' }}>{g}</span>
              {isSelected && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <button
                onClick={e => { e.stopPropagation(); deleteGroup(g); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4, color: '#AEAEB2', fontSize: 16, lineHeight: 1,
                }}
              >✕</button>
            </div>
          );
        })}
      </div>

      {/* Done button */}
      <div style={{ padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={onClose} style={{
          width: '100%', padding: '15px', borderRadius: 30,
          background: '#1C1C1E', color: '#FFF',
          fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
        }}>Done</button>
      </div>
    </div>
  );
}

type TaskDaysMode = 'every_day' | 'specific_week' | 'count_week' | 'specific_month' | 'count_month';
const WEEK_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun order

function inferTaskDaysMode(days: number[]): TaskDaysMode {
  if (days.length === 7 && days.every(d => d >= 0 && d <= 6)) return 'every_day';
  if (days.every(d => d >= 0 && d <= 6)) return 'specific_week';
  if (days.every(d => d >= 1 && d <= 31)) return 'specific_month';
  return 'every_day';
}

function TaskDaysSheet({ initMode, initWeekDays, initWeekCount, initMonthDays, initMonthCount, onDone, onClose }: {
  initMode: TaskDaysMode;
  initWeekDays: number[];
  initWeekCount: number;
  initMonthDays: number[];
  initMonthCount: number;
  color: string;
  onDone: (mode: TaskDaysMode, weekDays: number[], weekCount: number, monthDays: number[], monthCount: number) => void;
  onClose: () => void;
}) {
  const [selMode, setSelMode] = useState<TaskDaysMode>(initMode);
  const [selWeekDays, setSelWeekDays] = useState<number[]>(initWeekDays);
  const [selWeekCount, setSelWeekCount] = useState(initWeekCount);
  const [selMonthDays, setSelMonthDays] = useState<number[]>(initMonthDays);
  const [selMonthCount, setSelMonthCount] = useState(initMonthCount);

  const SUMMARY = '#FF6B35';

  const handleClose = () => {
    onDone(selMode, selWeekDays, selWeekCount, selMonthDays, selMonthCount);
    onClose();
  };

  const toggleWeekDay = (d: number) =>
    setSelWeekDays(prev => {
      if (prev.includes(d)) return prev.filter(x => x !== d);
      const next = [...prev, d];
      return next.length === 7 ? [d] : next; // selecting all 7 resets to just this day
    });
  const toggleMonthDay = (d: number) =>
    setSelMonthDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const weekSummary = () => {
    if (!selWeekDays.length) return '';
    const names = WEEK_ORDER.filter(d => selWeekDays.includes(d)).map(d => WEEK_LABEL[d].toUpperCase().slice(0, 3));
    return `*Task needs to be done every ${names.join(', ')}`;
  };
  const monthSummary = () => {
    if (!selMonthDays.length) return '';
    const sorted = [...selMonthDays].sort((a, b) => a - b);
    return `*Task needs to be done on ${sorted.join(', ')}`;
  };

  const options: Array<{ id: TaskDaysMode; label: string }> = [
    { id: 'every_day', label: 'Every Day' },
    { id: 'specific_week', label: 'Specific days of the week' },
    { id: 'count_week', label: 'Number of days per week' },
    { id: 'specific_month', label: 'Specific days of the month' },
    { id: 'count_month', label: 'Number of days per month' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: 'calc(20px + env(safe-area-inset-top, 0px)) 20px 16px',
      }}>
        <button onClick={handleClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: '#1C1C1E',
          cursor: 'pointer', lineHeight: 1, padding: '4px 8px 4px 0',
          fontWeight: 400,
        }}>✕</button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: '#1C1C1E', marginRight: 28 }}>
          Task Days
        </span>
      </div>

      {/* Options list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {options.map(opt => {
          const isSel = selMode === opt.id;
          return (
            <div
              key={opt.id}
              style={{
                borderRadius: 16,
                border: isSel ? '2px solid #1C1C1E' : '1.5px solid #E8E8E8',
                background: isSel ? '#FFFFFF' : '#F5F5F5',
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              {/* Label row */}
              <div
                onClick={() => setSelMode(opt.id)}
                style={{
                  padding: isSel && opt.id !== 'every_day' ? '16px 20px 12px' : '16px 20px',
                  textAlign: 'center', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 400, color: '#1C1C1E' }}>{opt.label}</span>
              </div>

              {/* Expanded body — only if selected and not "every_day" */}
              {isSel && opt.id !== 'every_day' && (
                <div style={{ padding: '0 16px 18px' }}>

                  {/* Specific days of the week */}
                  {opt.id === 'specific_week' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        {WEEK_ORDER.map(d => {
                          const on = selWeekDays.includes(d);
                          return (
                            <button key={d} onClick={() => toggleWeekDay(d)} style={{
                              width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
                              background: on ? '#1C1C1E' : '#E0E0E0',
                              color: on ? '#FFF' : '#1C1C1E',
                              fontSize: 13, fontWeight: 500, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'inherit',
                            }}>
                              {WEEK_LABEL[d].slice(0, 3).toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                      {selWeekDays.length > 0 && (
                        <div style={{ fontSize: 13, color: SUMMARY, textAlign: 'center', lineHeight: 1.4 }}>
                          {weekSummary()}
                        </div>
                      )}
                    </>
                  )}

                  {/* Number of days per week */}
                  {opt.id === 'count_week' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <button
                          onClick={() => setSelWeekCount(c => Math.max(1, c - 1))}
                          style={{ background: 'none', border: 'none', fontSize: 22, color: '#1C1C1E', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                        >−</button>
                        <div style={{
                          flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 400, color: '#1C1C1E',
                          background: '#E8E8E8', borderRadius: 999, padding: '10px 0',
                        }}>{selWeekCount}</div>
                        <button
                          onClick={() => setSelWeekCount(c => Math.min(7, c + 1))}
                          style={{ background: 'none', border: 'none', fontSize: 22, color: '#1C1C1E', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                        >+</button>
                      </div>
                      <div style={{ fontSize: 12, color: SUMMARY, textAlign: 'center' }}>
                        {`*Complete on any ${selWeekCount} day${selWeekCount !== 1 ? 's' : ''} of the week`}
                      </div>
                    </>
                  )}

                  {/* Specific days of the month */}
                  {opt.id === 'specific_month' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                          const on = selMonthDays.includes(d);
                          return (
                            <button key={d} onClick={() => toggleMonthDay(d)} style={{
                              aspectRatio: '1', borderRadius: '50%', border: 'none',
                              background: on ? '#1C1C1E' : '#E0E0E0',
                              color: on ? '#FFF' : '#1C1C1E',
                              fontSize: 13, fontWeight: 400, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'inherit',
                            }}>{d}</button>
                          );
                        })}
                        {/* Select All in 4 remaining cells */}
                        <button
                          onClick={() => setSelMonthDays(
                            selMonthDays.length === 31 ? [] : Array.from({ length: 31 }, (_, i) => i + 1)
                          )}
                          style={{
                            gridColumn: 'span 4', borderRadius: 999, border: 'none',
                            background: selMonthDays.length === 31 ? '#1C1C1E' : '#E8E8E8',
                            color: selMonthDays.length === 31 ? '#FFF' : '#3C3C43',
                            fontSize: 12, fontWeight: 400, cursor: 'pointer', padding: '10px 0',
                          }}
                        >Select All</button>
                      </div>
                      {selMonthDays.length > 0 && (
                        <div style={{ fontSize: 12, color: SUMMARY, textAlign: 'center', lineHeight: 1.4 }}>
                          {monthSummary()}
                        </div>
                      )}
                    </>
                  )}

                  {/* Number of days per month */}
                  {opt.id === 'count_month' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <button
                          onClick={() => setSelMonthCount(c => Math.max(1, c - 1))}
                          style={{ background: 'none', border: 'none', fontSize: 22, color: '#1C1C1E', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                        >−</button>
                        <div style={{
                          flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 400, color: '#1C1C1E',
                          background: '#E8E8E8', borderRadius: 999, padding: '10px 0',
                        }}>{selMonthCount}</div>
                        <button
                          onClick={() => setSelMonthCount(c => Math.min(31, c + 1))}
                          style={{ background: 'none', border: 'none', fontSize: 22, color: '#1C1C1E', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                        >+</button>
                      </div>
                      <div style={{ fontSize: 12, color: SUMMARY, textAlign: 'center' }}>
                        {`*Complete on any ${selMonthCount} day${selMonthCount !== 1 ? 's' : ''} of the month`}
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RINGTONES: Array<{ name: string; freq: number[]; dur: number[] }> = [
  { name: 'Default',  freq: [880],           dur: [0.15] },
  { name: 'Chime',    freq: [523, 659, 784], dur: [0.18, 0.18, 0.3] },
  { name: 'Bell',     freq: [1047, 784],     dur: [0.25, 0.4] },
  { name: 'Ding',     freq: [1318],          dur: [0.35] },
  { name: 'Alert',    freq: [440, 440],      dur: [0.1, 0.1] },
  { name: 'Ping',     freq: [1568],          dur: [0.12] },
  { name: 'Classic',  freq: [392, 523, 659, 784], dur: [0.12, 0.12, 0.12, 0.25] },
  { name: 'Gentle',   freq: [659, 784],      dur: [0.2, 0.35] },
];

function playRingtone(tone: typeof RINGTONES[0]) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  let t = ctx.currentTime;
  tone.freq.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + tone.dur[i]);
    osc.start(t); osc.stop(t + tone.dur[i]);
    t += tone.dur[i];
  });
}

function RingtoneSheet({ value, onSelect, onClose }: {
  value: string; onSelect: (name: string) => void; onClose: () => void;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#FFFFFF', borderRadius: '20px 20px 0 0',
        padding: '0 0 calc(24px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D1D1D6' }} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', color: '#1C1C1E', padding: '12px 20px 8px' }}>
          Ringtone
        </div>
        <div style={{ padding: '0 16px' }}>
          {RINGTONES.map((tone, i) => {
            const sel = value === tone.name;
            return (
              <div key={tone.name}>
                <div
                  onClick={() => { playRingtone(tone); onSelect(tone.name); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 4px', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: sel ? '#1C1C1E' : '#F2F2F7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18V5l12-2v13" stroke={sel ? '#FFF' : '#8E8E93'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="6" cy="18" r="3" stroke={sel ? '#FFF' : '#8E8E93'} strokeWidth="2"/>
                        <circle cx="18" cy="16" r="3" stroke={sel ? '#FFF' : '#8E8E93'} strokeWidth="2"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 16, color: '#1C1C1E', fontWeight: sel ? 600 : 400 }}>{tone.name}</span>
                  </div>
                  {sel && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {i < RINGTONES.length - 1 && <div style={{ height: 1, background: '#F2F2F7' }} />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_LIST = Array.from({ length: 31 }, (_, i) => String(i + 1));
const CUR_YEAR = new Date().getFullYear();
const YEARS_LIST = Array.from({ length: 16 }, (_, i) => String(CUR_YEAR - 3 + i));
const P_ITEM_H = 50;
const P_VISIBLE = 5; // 2 above + selected + 2 below
const P_PAD = 2 * P_ITEM_H; // 100px

function PickerCol({ items, initIdx, onChange }: {
  items: string[]; initIdx: number; onChange: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(initIdx);

  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = initIdx * P_ITEM_H;
  }, []); // eslint-disable-line

  const onScroll = () => {
    if (!ref.current) return;
    const raw = Math.round(ref.current.scrollTop / P_ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, raw));
    setIdx(clamped);
    onChange(clamped);
  };

  return (
    <div style={{ flex: 1, position: 'relative', height: P_VISIBLE * P_ITEM_H, overflow: 'hidden' }}>
      {/* Scrollable items — transparent bg so highlight bar shows through */}
      <div ref={ref} onScroll={onScroll} style={{
        position: 'absolute', inset: 0,
        overflowY: 'scroll', scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none', background: 'transparent',
      }}>
        <div style={{ height: P_PAD }} />
        {items.map((item, i) => {
          const d = Math.abs(i - idx);
          return (
            <div key={i} style={{
              height: P_ITEM_H, scrollSnapAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: d === 0 ? 22 : d === 1 ? 18 : 15,
              fontWeight: d === 0 ? 600 : 400,
              color: d === 0 ? '#1C1C1E' : d === 1 ? 'rgba(28,28,30,0.4)' : 'rgba(28,28,30,0.18)',
              userSelect: 'none' as const,
            }}>{item}</div>
          );
        })}
        <div style={{ height: P_PAD }} />
      </div>
      {/* Top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: P_PAD,
        background: 'linear-gradient(to bottom, rgba(255,255,255,1) 20%, rgba(255,255,255,0))',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: P_PAD,
        background: 'linear-gradient(to top, rgba(255,255,255,1) 20%, rgba(255,255,255,0))',
        pointerEvents: 'none', zIndex: 2,
      }} />
    </div>
  );
}

function DatePickerSheet({ value, isEnd, onConfirm, onNoEnd, onClose }: {
  value: string; isEnd: boolean;
  onConfirm: (d: string) => void;
  onNoEnd?: () => void;
  onClose: () => void;
}) {
  const initial = value ? new Date(value + 'T12:00:00') : new Date();
  const [mIdx, setMIdx] = useState(initial.getMonth());
  const [dIdx, setDIdx] = useState(initial.getDate() - 1);
  const [yIdx, setYIdx] = useState(() => {
    const i = YEARS_LIST.indexOf(String(initial.getFullYear()));
    return i >= 0 ? i : 3;
  });

  const confirm = () => {
    const m = String(mIdx + 1).padStart(2, '0');
    const d = String(dIdx + 1).padStart(2, '0');
    const y = YEARS_LIST[yIdx];
    onConfirm(`${y}-${m}-${d}`);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#FFFFFF', borderRadius: '20px 20px 0 0',
        padding: '0 20px calc(16px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0 8px' }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 18,
            color: '#1C1C1E', cursor: 'pointer', padding: '4px 8px 4px 0', lineHeight: 1,
          }}>✕</button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: '#1C1C1E', marginRight: 28 }}>
            Choose Date
          </span>
        </div>

        {/* Picker columns with shared highlight bar */}
        <div style={{ position: 'relative' }}>
          {/* Gray pill highlight — sits BEHIND columns (z-index 0) */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: P_PAD, height: P_ITEM_H,
            background: '#F0F0F0', borderRadius: 12,
            zIndex: 0, pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
            <PickerCol items={MONTHS_FULL} initIdx={mIdx} onChange={setMIdx} />
            <PickerCol items={DAYS_LIST}   initIdx={dIdx} onChange={setDIdx} />
            <PickerCol items={YEARS_LIST}  initIdx={yIdx} onChange={setYIdx} />
          </div>
        </div>

        {/* Single Confirm button (+ optional No End for end date) */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {isEnd && (
            <button onClick={() => { onNoEnd?.(); onClose(); }} style={{
              flex: 1, padding: '15px', borderRadius: 30,
              background: '#FF3B30', color: '#FFF',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            }}>No End</button>
          )}
          <button onClick={confirm} style={{
            flex: isEnd ? 1 : undefined, width: isEnd ? undefined : '100%',
            padding: '15px', borderRadius: 30,
            background: '#1C1C1E', color: '#FFF',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}>Confirm</button>
        </div>
      </div>
    </>
  );
}

type HabitBarMode = 'mark' | 'keypad' | 'add_value';

function HabitBarInfoSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#F2F2F7', borderRadius: '20px 20px 0 0',
        padding: '0 20px calc(24px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D1D1D6' }} />
        </div>
        <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E' }}>HabitBar Button</div>
          <div style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>There are 3 types of button function</div>
        </div>

        {/* Preview card */}
        <div style={{
          background: '#E8756A', borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          margin: '14px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 28 }}>🍓</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#FFF' }}>Eat Fruits</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>1/2</div>
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.25)',
            border: '2.5px solid rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: '#FFF',
          }}>+</div>
        </div>

        {/* Feature list */}
        <div style={{ background: '#FFFFFF', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {[
            { icon: '✅', label: 'Mark as done' },
            { icon: '🔢', label: 'Pop up keypad' },
            { icon: '🔴', label: 'Add value', extra: '+1' },
          ].map((item, i, arr) => (
            <div key={item.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#1C1C1E' }}>{item.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ height: 1, background: '#F2F2F7', marginLeft: 52 }} />}
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '15px', borderRadius: 30,
          background: '#1C1C1E', color: '#FFF',
          fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 10,
        }}>Got it</button>
        <div style={{ fontSize: 12, color: '#AEAEB2', textAlign: 'center', lineHeight: 1.5 }}>
          Change function in habit's "editing page" - Habit Bar button.
        </div>
      </div>
    </>
  );
}

function HabitBarPickerSheet({ value, unit, onSelect, onClose }: {
  value: HabitBarMode; unit: string;
  onSelect: (m: HabitBarMode) => void; onClose: () => void;
}) {
  const options: Array<{ id: HabitBarMode; label: string }> = [
    { id: 'mark', label: 'Mark as done' },
    { id: 'keypad', label: 'Pop up keypad' },
    { id: 'add_value', label: 'Add value' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#F2F2F7', borderRadius: '20px 20px 0 0',
        padding: '0 0 calc(24px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D1D1D6' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px 8px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#1C1C1E', cursor: 'pointer', padding: '4px 8px 4px 0' }}>✕</button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: '#1C1C1E', marginRight: 28 }}>HabitBar Button</span>
        </div>

        <div style={{ background: '#FFFFFF', margin: '8px 16px', borderRadius: 14, overflow: 'hidden' }}>
          {options.map((opt, i) => {
            const sel = value === opt.id;
            return (
              <div key={opt.id}>
                <div onClick={() => onSelect(opt.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 16px', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: sel ? 'none' : '2px solid #D1D1D6',
                      background: sel ? '#1C1C1E' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {sel && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <polyline points="1,5 4.5,8.5 11,1.5" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: sel ? 600 : 400, color: '#1C1C1E' }}>{opt.label}</span>
                  </div>
                  {opt.id === 'add_value' && (
                    <div style={{
                      background: '#1C1C1E', borderRadius: 20,
                      padding: '4px 12px', fontSize: 13, fontWeight: 600, color: '#FFF',
                    }}>{unit}</div>
                  )}
                </div>
                {i < options.length - 1 && <div style={{ height: 1, background: '#F2F2F7', marginLeft: 52 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const isTimeHabitName = (n: string) =>
  /wake|woke|rise|morning|alarm|sleep|bed|bedtime/i.test(n);

const isWeightHabitName = (n: string) => /weigh|weight/i.test(n);

const HOURS_LIST = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINS_LIST = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function TimePickerSheet({ value, ampm, onConfirm, onClose }: {
  value: string; ampm: 'AM' | 'PM';
  onConfirm: (val: string, ap: 'AM' | 'PM') => void;
  onClose: () => void;
}) {
  const [hStr, mStr] = value.split(':');
  const initH = Math.max(0, Math.min(11, (parseInt(hStr) || 7) - 1));
  const initM = Math.max(0, Math.min(11, Math.round((parseInt(mStr) || 0) / 5)));

  const [hIdx, setHIdx] = useState(initH);
  const [mIdx, setMIdx] = useState(initM);
  const [selAmPm, setSelAmPm] = useState<'AM' | 'PM'>(ampm);

  const confirm = () => {
    onConfirm(`${hIdx + 1}:${MINS_LIST[mIdx]}`, selAmPm);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#FFFFFF', borderRadius: '20px 20px 0 0',
        padding: '0 20px calc(20px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D1D1D6' }} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', color: '#1C1C1E', padding: '12px 0 8px' }}>
          Set Goal Time
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: P_PAD, height: P_ITEM_H,
            background: '#F0F0F0', borderRadius: 12,
            zIndex: 0, pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <PickerCol items={HOURS_LIST} initIdx={hIdx} onChange={setHIdx} />
            <div style={{
              width: 24, flexShrink: 0, textAlign: 'center',
              fontSize: 22, fontWeight: 700, color: '#1C1C1E',
              paddingTop: P_PAD,
            }}>:</div>
            <PickerCol items={MINS_LIST} initIdx={mIdx} onChange={setMIdx} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '16px 0 14px' }}>
          {(['AM', 'PM'] as const).map(ap => (
            <button key={ap} onClick={() => setSelAmPm(ap)} style={{
              flex: 1, padding: '12px', borderRadius: 14, border: 'none',
              background: selAmPm === ap ? '#1C1C1E' : '#F2F2F7',
              color: selAmPm === ap ? '#FFF' : '#3C3C43',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>{ap}</button>
          ))}
        </div>

        <button onClick={confirm} style={{
          width: '100%', padding: '15px', borderRadius: 30,
          background: '#1C1C1E', color: '#FFF',
          fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
        }}>Confirm</button>
      </div>
    </>
  );
}

function hexAlpha(hex: string, alpha: number): string {
  if (!hex || hex.length < 7) return hex;
  return hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
}

function fmt12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TIME_RANGES = ['Anytime', 'Morning', 'Afternoon', 'Evening'] as const;
type TimeRange = typeof TIME_RANGES[number];

const QUANTITY_UNITS = ['count', 'steps', 'm', 'km', 'mile', 'ml', 'oz', 'Cal', 'g', 'mg', 'drink', 'glasses', 'pages', 'times', 'reps', 'sets'];
const TIME_UNITS = ['sec', 'min', 'hr'];
const ALL_TIME_UNITS = new Set(TIME_UNITS);

function Toggle({ value, color, onChange }: { value: boolean; color: string; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14, cursor: 'pointer', flexShrink: 0,
        background: value ? color : '#E5E5EA',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: value ? 22 : 2,
        width: 24, height: 24, borderRadius: '50%',
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        transition: 'left 0.18s',
      }} />
    </div>
  );
}

function UnitPickerSheet({ value, color, onSelect, onClose }: {
  value: string; color: string; onSelect: (u: string) => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<'quantity' | 'time'>(ALL_TIME_UNITS.has(value) ? 'time' : 'quantity');
  const units = tab === 'quantity' ? QUANTITY_UNITS : TIME_UNITS;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: '#F2F2F7', borderRadius: '20px 20px 0 0',
        padding: '0 16px calc(28px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D1D1D6' }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', color: '#1C1C1E', marginBottom: 14 }}>
          Select Unit
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#E5E5EA', borderRadius: 10, padding: 3, marginBottom: 14 }}>
          {(['quantity', 'time'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: tab === t ? '#FFFFFF' : 'transparent',
              color: '#1C1C1E', fontSize: 15, fontWeight: tab === t ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              textTransform: 'capitalize' as const,
            }}>{t}</button>
          ))}
        </div>
        {/* Unit grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tab === 'time' ? 3 : 4}, 1fr)`, gap: 8 }}>
          {units.map(u => (
            <button key={u} onClick={() => { onSelect(u); onClose(); }} style={{
              padding: '12px 8px', borderRadius: 12, border: 'none',
              background: value === u ? color : '#FFFFFF',
              color: value === u ? '#FFFFFF' : '#1C1C1E',
              fontSize: 15, fontWeight: value === u ? 700 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{u}</button>
          ))}
        </div>
      </div>
    </>
  );
}

interface Props {
  initialName?: string;
  initialEmoji?: string;
  initialColor?: string;
  initialGoalValue?: number;
  initialGoalUnit?: string;
  editHabit?: Habit;
  onAdd: (name: string, emoji: string, color: string, extra: {
    description?: string;
    frequency?: Habit['frequency'];
    completionDays?: number[];
    startingFrom?: string;
    habitType?: 'build' | 'quit';
    goalValue?: number;
    goalUnit?: string;
    timeRange?: string;
    remindersEnabled?: boolean;
    reminderTimes?: string[];
    reminderMessage?: string;
    showMemo?: boolean;
    chartType?: 'bar' | 'line';
    endDate?: string;
  }) => void;
  onUpdate?: (changes: Partial<Habit>) => void;
  onBack: () => void;
}

export default function HabitDetailsScreen({
  initialName = '',
  initialEmoji = '💪',
  initialColor = '#1C1C1E',
  initialGoalValue,
  initialGoalUnit,
  editHabit,
  onAdd,
  onUpdate,
  onBack,
}: Props) {
  const isEdit = !!editHabit;
  const [name, setName] = useState(editHabit?.name ?? initialName);
  const [emoji, setEmoji] = useState(editHabit?.emoji ?? initialEmoji);
  const [color, setColor] = useState(editHabit?.color ?? initialColor);
  const [description, setDescription] = useState(editHabit?.description ?? '');
  const [habitType, setHabitType] = useState<'build' | 'quit'>(editHabit?.habitType ?? 'build');
  const [goalValue, setGoalValue] = useState(() => {
    if (editHabit && isTimeHabitName(editHabit.name) && editHabit.goalValue) {
      const mins = editHabit.goalValue;
      const h24 = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${h24 % 12 || 12}:${String(m).padStart(2, '0')}`;
    }
    return String(editHabit?.goalValue ?? initialGoalValue ?? 1);
  });
  const [goalUnit, setGoalUnit] = useState(editHabit?.goalUnit ?? initialGoalUnit ?? 'times');
  const [timeGoalAmPm, setTimeGoalAmPm] = useState<'AM' | 'PM'>(() => {
    if (editHabit && isTimeHabitName(editHabit.name) && editHabit.goalValue) {
      return Math.floor(editHabit.goalValue / 60) >= 12 ? 'PM' : 'AM';
    }
    return /sleep|bed|bedtime/i.test(editHabit?.name ?? initialName ?? '') ? 'PM' : 'AM';
  });
  const [timeRange, setTimeRange] = useState<TimeRange>((editHabit?.timeRange as TimeRange) ?? 'Anytime');
  const [remindersEnabled, setRemindersEnabled] = useState(editHabit?.remindersEnabled ?? false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(editHabit?.reminderTimes ?? []);
  const [reminderMessage, setReminderMessage] = useState(editHabit?.reminderMessage ?? '');
  const [showMemoAfterCompletion, setShowMemoAfterCompletion] = useState(editHabit?.showMemo ?? true);
  const [chartType, setChartType] = useState<'bar' | 'line'>(editHabit?.chartType ?? 'bar');
  const [startDate, setStartDate] = useState(editHabit?.createdAt ?? toDateStr(new Date()));
  const [endDate, setEndDate] = useState<string | null>(editHabit?.endDate ?? null);
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>('Day-Long');
  const [showGoalPeriod, setShowGoalPeriod] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [ringtone, setRingtone] = useState('Default');
  const [showRingtone, setShowRingtone] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [habitBarMode, setHabitBarMode] = useState<HabitBarMode>('mark');
  const [showHabitBarInfo, setShowHabitBarInfo] = useState(false);
  const [showHabitBarPicker, setShowHabitBarPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isTimeHabit = isTimeHabitName(name);
  const isWeightHabit = isWeightHabitName(name);
  const [showTaskDays, setShowTaskDays] = useState(false);
  const [taskDaysMode, setTaskDaysMode] = useState<TaskDaysMode>(() => inferTaskDaysMode(editHabit?.completionDays ?? [0,1,2,3,4,5,6]));
  const [tdWeekDays, setTdWeekDays] = useState<number[]>(() => {
    const d = editHabit?.completionDays ?? [];
    return d.length > 0 && d.length < 7 && d.every(x => x >= 0 && x <= 6) ? d : [];
  });
  const [tdWeekCount, setTdWeekCount] = useState(3);
  const [tdMonthDays, setTdMonthDays] = useState<number[]>(() => {
    const d = editHabit?.completionDays ?? [];
    return d.every(x => x >= 1 && x <= 31) && d.length < 7 ? d : [];
  });
  const [tdMonthCount, setTdMonthCount] = useState(10);
  const [addingReminder, setAddingReminder] = useState(false);

  const [newReminderTime, setNewReminderTime] = useState('09:00');

  useEffect(() => {
    if (!isTimeHabit) return;
    if (!/^\d+:\d+$/.test(goalValue)) {
      const isWake = /wake|woke|rise|morning|alarm/.test(name.toLowerCase());
      setGoalValue(isWake ? '7:00' : '10:00');
      setTimeGoalAmPm(isWake ? 'AM' : 'PM');
    }
  }, [isTimeHabit]); // eslint-disable-line

  useEffect(() => {
    if (!isWeightHabit) return;
    if (!['kg', 'lbs'].includes(goalUnit)) setGoalUnit('kg');
    if (goalValue === '1') setGoalValue('70');
  }, [isWeightHabit]); // eslint-disable-line

  const computeGoalValue = (): number => {
    if (isTimeHabit) {
      const [hStr, mStr] = goalValue.split(':');
      const h = parseInt(hStr) % 12 || 0;
      const m = parseInt(mStr) || 0;
      return (h + (timeGoalAmPm === 'PM' ? 12 : 0)) * 60 + m;
    }
    return Number(goalValue);
  };

  const addReminderTime = () => {
    if (!reminderTimes.includes(newReminderTime)) {
      setReminderTimes(prev => [...prev, newReminderTime].sort());
    }
    setAddingReminder(false);
  };

  const resolvedCompletionDays = (): number[] => {
    switch (taskDaysMode) {
      case 'every_day': return [0,1,2,3,4,5,6];
      case 'specific_week': return tdWeekDays;
      case 'count_week': return [tdWeekCount]; // encode count as single-element array
      case 'specific_month': return tdMonthDays;
      case 'count_month': return [tdMonthCount + 100]; // offset to distinguish from week
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const completionDays = resolvedCompletionDays();
    if (isEdit && onUpdate) {
      onUpdate({
        name: name.trim(), emoji, color, description, completionDays,
        habitType, goalValue: computeGoalValue(), goalUnit: isTimeHabit ? timeGoalAmPm : goalUnit, timeRange,
        remindersEnabled, reminderTimes, reminderMessage,
        showMemo: showMemoAfterCompletion, chartType,
        endDate: endDate ?? undefined,
      });
    } else {
      onAdd(name.trim(), emoji, color, {
        description: description || undefined,
        completionDays,
        startingFrom: startDate,
        habitType,
        goalValue: computeGoalValue(),
        goalUnit: isTimeHabit ? timeGoalAmPm : goalUnit,
        timeRange,
        remindersEnabled,
        reminderTimes,
        reminderMessage: reminderMessage || undefined,
        showMemo: showMemoAfterCompletion,
        chartType,
        endDate: endDate ?? undefined,
      });
    }
    onBack();
  };

  const taskDaysLabel = (() => {
    switch (taskDaysMode) {
      case 'every_day': return 'Every Day';
      case 'specific_week': {
        if (!tdWeekDays.length) return 'None';
        if (tdWeekDays.length === 7) return 'Every Day';
        return WEEK_ORDER.filter(d => tdWeekDays.includes(d)).map(d => WEEK_LABEL[d].slice(0,3)).join(', ');
      }
      case 'count_week': return `Any ${tdWeekCount}/week`;
      case 'specific_month': return tdMonthDays.length ? `${tdMonthDays.length} days/month` : 'None';
      case 'count_month': return `Any ${tdMonthCount}/month`;
    }
  })();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#F2F2F7',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
      fontFamily: 'inherit',
    }}>
      {/* Subtle tint */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 160,
        background: `linear-gradient(180deg, ${hexAlpha(color, 0.15)} 0%, transparent 100%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: 'calc(12px + env(safe-area-inset-top, 0px)) 16px 10px',
        display: 'flex', alignItems: 'center',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none',
          fontSize: 24, color: '#1C1C1E', cursor: 'pointer',
          padding: '0 8px 0 0', lineHeight: 1, flexShrink: 0,
        }}>‹</button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{emoji || '💪'}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name || 'New Habit'}
          </span>
        </div>

        <div style={{ width: 32, flexShrink: 0 }} />
      </div>

      {/* Scrollable content */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, overflowY: 'auto', padding: '4px 12px 0',
        scrollbarWidth: 'none',
      }}>

        {/* Card 1: Identity */}
        <div style={card}>
          {/* Emoji + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: '#F2F2F7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ pointerEvents: 'none' }}>{emoji || '💪'}</span>
              <input
                value={emoji}
                onChange={e => {
                  const val = e.target.value;
                  if (!val) { setEmoji(''); return; }
                  const segs = (Intl as any).Segmenter
                    ? [...new (Intl as any).Segmenter().segment(val)]
                    : [{ segment: [...val].slice(-1).join('') }];
                  setEmoji(segs[segs.length - 1].segment);
                }}
                style={{
                  position: 'absolute', inset: 0, opacity: 0, fontSize: 1,
                  border: 'none', outline: 'none', background: 'transparent',
                  width: '100%', height: '100%', cursor: 'pointer',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Habit name"
                maxLength={40}
                autoFocus={!isEdit}
                style={{
                  width: '100%', fontSize: 16, fontWeight: 700, border: 'none', outline: 'none',
                  background: 'transparent', color: '#1C1C1E', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description (Optional)"
                maxLength={100}
                style={{
                  width: '100%', fontSize: 16, border: 'none', outline: 'none',
                  background: 'transparent', color: '#AEAEB2', fontFamily: 'inherit',
                  marginTop: 2, boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={hr} />

          {/* Color */}
          <div
            style={row}
            onClick={() => setShowColorPicker(true)}
          >
            <span style={rowLabel}>Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 22, borderRadius: 11, background: color }} />
              <span style={chev}>›</span>
            </div>
          </div>

          <div style={hr} />

          {/* Group */}
          <div style={row} onClick={() => setShowGroupManager(true)}>
            <span style={rowLabel}>Group</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, color: selectedGroup ? '#1C1C1E' : '#AEAEB2', fontWeight: selectedGroup ? 500 : 400 }}>
                {selectedGroup || '(Optional)'}
              </span>
              <span style={chev}>›</span>
            </div>
          </div>
        </div>

        {/* Card 2: Habit Type */}
        <div style={card}>
          <div style={cardLabel}>Habit Type</div>
          <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: 10, padding: 3 }}>
            {(['build', 'quit'] as const).map(t => (
              <button key={t} onClick={() => setHabitType(t)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                background: habitType === t ? color : 'transparent',
                color: habitType === t ? '#FFF' : '#8E8E93',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}>
                {t === 'build' ? 'Build' : 'Quit'}
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Goal */}
        <div style={card}>
          {/* Goal Period */}
          <div style={row} onClick={() => setShowGoalPeriod(true)}>
            <span style={rowLabel}>Goal Period</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                background: '#F2F2F7', color: '#3C3C43',
                padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              }}>{goalPeriod}</span>
              <span style={chev}>›</span>
            </div>
          </div>

          <div style={hr} />

          {/* Goal Value */}
          <div style={row}>
            <span style={rowLabel}>{habitType === 'quit' ? 'Allowable Value' : 'Goal Value'}</span>
            {isTimeHabit ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  onClick={() => setShowTimePicker(true)}
                  style={{
                    minWidth: 64, textAlign: 'center',
                    fontSize: 16, fontWeight: 600, color: '#1C1C1E',
                    background: '#F2F2F7', borderRadius: 10,
                    padding: '5px 12px', cursor: 'pointer',
                  }}
                >{goalValue}</div>
                {(['AM', 'PM'] as const).map(ap => (
                  <button key={ap} onClick={() => setTimeGoalAmPm(ap)} style={{
                    padding: '5px 12px', borderRadius: 20, border: 'none',
                    background: timeGoalAmPm === ap ? '#1C1C1E' : '#F2F2F7',
                    color: timeGoalAmPm === ap ? '#FFF' : '#8E8E93',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{ap}</button>
                ))}
              </div>
            ) : isWeightHabit ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  onClick={() => setShowNumpad(true)}
                  style={{
                    minWidth: 56, textAlign: 'center',
                    fontSize: 16, fontWeight: 600, color: '#1C1C1E',
                    background: '#F2F2F7', borderRadius: 10,
                    padding: '5px 12px', cursor: 'pointer',
                  }}
                >{goalValue}</div>
                {(['kg', 'lbs'] as const).map(u => (
                  <button key={u} onClick={() => setGoalUnit(u)} style={{
                    padding: '5px 12px', borderRadius: 20, border: 'none',
                    background: goalUnit === u ? '#1C1C1E' : '#F2F2F7',
                    color: goalUnit === u ? '#FFF' : '#8E8E93',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{u}</button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  onClick={() => setShowNumpad(true)}
                  style={{
                    minWidth: 48, textAlign: 'right',
                    fontSize: 16, fontWeight: 600, color: '#1C1C1E',
                    background: '#F2F2F7', borderRadius: 10,
                    padding: '5px 10px', cursor: 'pointer',
                  }}
                >{goalValue}</div>
                <button
                  onClick={() => setShowUnitPicker(p => !p)}
                  style={{
                    background: '#F2F2F7', color: '#3C3C43',
                    padding: '4px 12px', borderRadius: 20, border: 'none',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >{goalUnit}</button>
                <span style={{ fontSize: 14, color: '#AEAEB2' }}>/ {PERIOD_UNIT[goalPeriod]}</span>
              </div>
            )}
          </div>

          <div style={hr} />

          {/* Task Days */}
          <div style={row} onClick={() => setShowTaskDays(true)}>
            <span style={rowLabel}>Task Days</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#AEAEB2', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{taskDaysLabel}</span>
              <span style={chev}>›</span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#FF9500', fontWeight: 500, marginTop: 8 }}>
            {isWeightHabit
              ? `*Target weight: ${goalValue} ${goalUnit}`
              : isTimeHabit
                ? `*${habitType === 'quit' ? 'No later than' : 'By'} ${goalValue} ${timeGoalAmPm}`
                : habitType === 'quit'
                  ? `*Don't exceed ${goalValue} ${goalUnit} each ${PERIOD_UNIT[goalPeriod].toLowerCase()}`
                  : `*Complete ${goalValue} ${goalUnit} each ${PERIOD_UNIT[goalPeriod].toLowerCase()}`}
          </div>
        </div>

        {/* Card 4: Time Range */}
        <div style={card}>
          <div style={cardLabel}>Time Range</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {TIME_RANGES.map(t => (
              <button key={t} onClick={() => setTimeRange(t)} style={{
                flex: 1, padding: '8px 0', borderRadius: 20, border: 'none',
                background: timeRange === t ? color : '#F2F2F7',
                color: timeRange === t ? '#FFF' : '#8E8E93',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Card 5: Reminders */}
        <div style={card}>
          <div style={row}>
            <span style={rowLabel}>Reminders</span>
            <Toggle value={remindersEnabled} color={color} onChange={setRemindersEnabled} />
          </div>

          {remindersEnabled && (
            <>
              <div style={hr} />

              {/* Time row */}
              <div style={row}>
                <span style={rowLabel}>Time</span>
                {addingReminder ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="time"
                      value={newReminderTime}
                      onChange={e => setNewReminderTime(e.target.value)}
                      autoFocus
                      style={{
                        padding: '4px 8px', borderRadius: 8, border: `1.5px solid ${color}`,
                        fontSize: 16, outline: 'none', background: '#F8F8FC', fontFamily: 'inherit',
                      }}
                    />
                    <button onClick={addReminderTime} style={{
                      padding: '5px 14px', borderRadius: 20, border: 'none',
                      background: color, color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>Add</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingReminder(true)} style={{
                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                    background: '#007AFF', color: '#FFF',
                    fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', fontWeight: 300,
                  }}>+</button>
                )}
              </div>

              {/* Time chips */}
              {reminderTimes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {reminderTimes.map(t => (
                    <button key={t} onClick={() => setReminderTimes(prev => prev.filter(x => x !== t))} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: hexAlpha(color, 0.12), color: color,
                      padding: '5px 12px', borderRadius: 20, border: 'none',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {fmt12(t)} <span style={{ fontSize: 10, opacity: 0.7 }}>✕</span>
                    </button>
                  ))}
                </div>
              )}

              <div style={hr} />

              {/* Ringtone */}
              <div style={row} onClick={() => setShowRingtone(true)}>
                <span style={rowLabel}>Ringtone</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, color: '#AEAEB2' }}>{ringtone}</span>
                  <span style={chev}>›</span>
                </div>
              </div>

              <div style={hr} />

              {/* Reminder message */}
              <input
                value={reminderMessage}
                onChange={e => setReminderMessage(e.target.value)}
                placeholder="Reminder message"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  border: 'none', outline: 'none', fontSize: 16,
                  color: '#1C1C1E', background: '#F2F2F7', fontFamily: 'inherit',
                  boxSizing: 'border-box', marginTop: 4,
                }}
              />
            </>
          )}
        </div>

        {/* Card 6: More */}
        <div style={{ ...card, marginBottom: 16 }}>
          {/* Show memo */}
          <div style={row}>
            <span style={rowLabel}>Show memo after completion</span>
            <Toggle value={showMemoAfterCompletion} color={color} onChange={setShowMemoAfterCompletion} />
          </div>

          <div style={hr} />

          {/* HabitBar Button */}
          <div style={row} onClick={() => setShowHabitBarPicker(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={rowLabel}>HabitBar Button</span>
              <button
                onClick={e => { e.stopPropagation(); setShowHabitBarInfo(true); }}
                style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#E5E5EA', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#8E8E93', flexShrink: 0,
                }}>?</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, color: '#AEAEB2' }}>
                {habitBarMode === 'mark' ? 'Mark as done' : habitBarMode === 'keypad' ? 'Pop up keypad' : 'Add value'}
              </span>
              <span style={chev}>›</span>
            </div>
          </div>

          <div style={hr} />

          {/* Chart Type */}
          <div style={row}>
            <span style={rowLabel}>Chart Type</span>
            <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: 9, padding: 2, gap: 2 }}>
              <button onClick={() => setChartType('bar')} style={{
                width: 36, height: 28, borderRadius: 7, border: 'none',
                background: chartType === 'bar' ? color : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="14" viewBox="0 0 18 16" fill="none">
                  <rect x="0" y="8" width="4" height="8" rx="1" fill={chartType === 'bar' ? '#FFF' : '#8E8E93'} />
                  <rect x="7" y="4" width="4" height="12" rx="1" fill={chartType === 'bar' ? '#FFF' : '#8E8E93'} />
                  <rect x="14" y="0" width="4" height="16" rx="1" fill={chartType === 'bar' ? '#FFF' : '#8E8E93'} />
                </svg>
              </button>
              <button onClick={() => setChartType('line')} style={{
                width: 36, height: 28, borderRadius: 7, border: 'none',
                background: chartType === 'line' ? color : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="12" viewBox="0 0 20 14" fill="none">
                  <polyline points="0,12 5,6 10,9 15,2 20,5"
                    stroke={chartType === 'line' ? '#FFF' : '#8E8E93'}
                    strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div style={hr} />

          {/* Habit Term */}
          <div style={{ paddingTop: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#AEAEB2' }}>Start Date</span>
              <span style={{ fontSize: 12, color: '#AEAEB2' }}>End Date</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDatePicker('start')} style={{
                flex: 1, background: '#1C1C1E', borderRadius: 20,
                padding: '9px 10px', textAlign: 'center',
                fontSize: 13, fontWeight: 600, color: '#FFFFFF',
                border: 'none', cursor: 'pointer',
              }}>
                {startDate}
              </button>
              <button onClick={() => setShowDatePicker('end')} style={{
                flex: 1, background: '#1C1C1E', borderRadius: 20,
                padding: '9px 10px', textAlign: 'center',
                fontSize: 13, fontWeight: 600,
                color: '#FFFFFF', border: 'none', cursor: 'pointer',
              }}>
                {endDate ?? 'No End'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Save button */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '10px 12px calc(14px + env(safe-area-inset-bottom, 0px))',
      }}>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '15px',
            background: name.trim() ? color : '#E5E5EA',
            color: name.trim() ? '#FFFFFF' : '#8E8E93',
            borderRadius: 30, fontSize: 16, fontWeight: 700, border: 'none',
            opacity: name.trim() ? 1 : 0.5,
            boxShadow: name.trim() ? `0 4px 16px ${hexAlpha(color, 0.38)}` : 'none',
            fontFamily: 'inherit', cursor: name.trim() ? 'pointer' : 'default',
          }}
        >
          {isEdit ? 'Save Changes' : 'Save'}
        </button>
      </div>

      {showColorPicker && (
        <ColorPickerSheet color={color} onChange={setColor} onClose={() => setShowColorPicker(false)} />
      )}

      {showNumpad && (
        <NumpadSheet
          value={goalValue}
          onChange={v => setGoalValue(v)}
          onClose={() => setShowNumpad(false)}
        />
      )}

      {showTimePicker && (
        <TimePickerSheet
          value={goalValue}
          ampm={timeGoalAmPm}
          onConfirm={(val, ap) => { setGoalValue(val); setTimeGoalAmPm(ap); }}
          onClose={() => setShowTimePicker(false)}
        />
      )}

      {showGoalPeriod && (
        <GoalPeriodSheet
          value={goalPeriod}
          color={color}
          onSelect={setGoalPeriod}
          onClose={() => setShowGoalPeriod(false)}
        />
      )}

      {showUnitPicker && (
        <UnitPickerSheet
          value={goalUnit}
          color={color}
          onSelect={setGoalUnit}
          onClose={() => setShowUnitPicker(false)}
        />
      )}

      {showGroupManager && (
        <GroupManagerSheet
          selected={selectedGroup}
          onSelect={setSelectedGroup}
          onClose={() => setShowGroupManager(false)}
        />
      )}

      {showRingtone && (
        <RingtoneSheet
          value={ringtone}
          onSelect={setRingtone}
          onClose={() => setShowRingtone(false)}
        />
      )}

      {showHabitBarInfo && (
        <HabitBarInfoSheet onClose={() => setShowHabitBarInfo(false)} />
      )}

      {showHabitBarPicker && (
        <HabitBarPickerSheet
          value={habitBarMode}
          unit={goalUnit}
          onSelect={setHabitBarMode}
          onClose={() => setShowHabitBarPicker(false)}
        />
      )}

      {showDatePicker && (
        <DatePickerSheet
          value={showDatePicker === 'start' ? startDate : (endDate ?? toDateStr(new Date()))}
          isEnd={showDatePicker === 'end'}
          onConfirm={d => showDatePicker === 'start' ? setStartDate(d) : setEndDate(d)}
          onNoEnd={() => setEndDate(null)}
          onClose={() => setShowDatePicker(null)}
        />
      )}

      {showTaskDays && (
        <TaskDaysSheet
          initMode={taskDaysMode}
          initWeekDays={tdWeekDays}
          initWeekCount={tdWeekCount}
          initMonthDays={tdMonthDays}
          initMonthCount={tdMonthCount}
          color={color}
          onDone={(mode, weekDays, weekCount, monthDays, monthCount) => {
            setTaskDaysMode(mode);
            setTdWeekDays(weekDays);
            setTdWeekCount(weekCount);
            setTdMonthDays(monthDays);
            setTdMonthCount(monthCount);
          }}
          onClose={() => setShowTaskDays(false)}
        />
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 14,
  padding: '12px 14px', marginBottom: 8,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};

const hr: React.CSSProperties = {
  height: 1, background: '#F2F2F7',
  margin: '10px -14px',
};

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  cursor: 'pointer',
};

const rowLabel: React.CSSProperties = {
  fontSize: 15, fontWeight: 500, color: '#1C1C1E',
};

const chev: React.CSSProperties = {
  fontSize: 18, color: '#C7C7CC',
};

const cardLabel: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#3C3C43', marginBottom: 10,
};
