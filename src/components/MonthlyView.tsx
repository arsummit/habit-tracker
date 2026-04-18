import { useState } from 'react';
import { Habit } from '../types';
import { localDateStr } from '../utils/date';

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  habits: Habit[];
  getLongestStreak: (habit: Habit) => number;
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function longestStreakFromDays(days: string[]): number {
  if (!days.length) return 0;
  const sorted = [...new Set(days)].sort();
  let longest = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    cur = diff === 1 ? cur + 1 : 1;
    if (cur > longest) longest = cur;
  }
  return longest;
}

export default function MonthlyView({ habits, getLongestStreak }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filterId, setFilterId] = useState<string | 'all'>('all');

  const today = localDateStr(now);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const filteredHabits = filterId === 'all' ? habits : habits.filter(h => h.id === filterId);

  const isCompleted = (day: number) => {
    const d = toDateStr(year, month, day);
    return filteredHabits.some(h => h.completions.includes(d));
  };

  const isFullyDone = (day: number) => {
    if (!filteredHabits.length) return false;
    const d = toDateStr(year, month, day);
    return filteredHabits.every(h => h.completions.includes(d));
  };

  // Stats
  const completedDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => isCompleted(d))
    .map(d => toDateStr(year, month, d));

  const daysCompleted = completedDaysInMonth.length;
  const completionRate = Math.round((daysCompleted / daysInMonth) * 100);

  const streak = filterId === 'all'
    ? longestStreakFromDays(completedDaysInMonth)
    : filteredHabits[0] ? getLongestStreak(filteredHabits[0]) : 0;

  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1);

  const cells: (number | null)[] = [...Array(firstDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', scrollbarWidth: 'none' }}>

      {/* Title */}
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1C1C1E', margin: '4px 0 16px' }}>Monthly</h1>

      {/* Habit filter tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
        <button
          onClick={() => setFilterId('all')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 20, border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            background: filterId === 'all' ? '#1C1C1E' : '#E5E5EA',
            color: filterId === 'all' ? '#FFFFFF' : '#1C1C1E',
            fontSize: 14, fontWeight: 600,
          }}
        >
          <span>✓</span> All
        </button>
        {habits.map(h => (
          <button
            key={h.id}
            onClick={() => setFilterId(h.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 20, border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              background: filterId === h.id ? '#1C1C1E' : '#E5E5EA',
              color: filterId === h.id ? '#FFFFFF' : '#1C1C1E',
              fontSize: 14, fontWeight: 600,
            }}
          >
            {h.emoji} {h.name}
          </button>
        ))}
      </div>

      {/* Calendar card */}
      <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px 12px', marginBottom: 24 }}>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: 20, color: '#1C1C1E', padding: '4px 8px', cursor: 'pointer' }}>‹</button>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>{monthLabel}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: 20, color: '#1C1C1E', padding: '4px 8px', cursor: 'pointer' }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {DAY_HEADERS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#8E8E93' }}>{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateStr = toDateStr(year, month, day);
            const isToday = dateStr === today;
            const done = isCompleted(day);
            const full = isFullyDone(day);

            return (
              <div key={day} style={{
                aspectRatio: '1', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: full ? '#1C1C1E' : done ? '#E5E5EA' : 'transparent',
                border: isToday && !full ? '2.5px solid #1C1C1E' : done && !full ? 'none' : !done ? '1.5px solid #E5E5EA' : 'none',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: isToday ? 700 : 400,
                  color: full ? '#FFFFFF' : '#1C1C1E',
                }}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state when no completions this month */}
      {daysCompleted === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0 28px' }}>
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stars / sparkles */}
            <circle cx="22" cy="18" r="4" fill="#FFD60A" opacity="0.7" />
            <circle cx="98" cy="24" r="3" fill="#FFD60A" opacity="0.5" />
            <circle cx="14" cy="64" r="2.5" fill="#FFD60A" opacity="0.4" />
            <circle cx="108" cy="70" r="3.5" fill="#FFD60A" opacity="0.6" />
            {/* Moon body */}
            <path d="M60 14 C38 14 24 30 24 50 C24 70 38 86 60 86 C82 86 96 70 96 50 C96 30 82 14 60 14Z" fill="#F2F2F7" />
            {/* Zzz letters */}
            <text x="44" y="48" fontFamily="-apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#C7C7CC">Z</text>
            <text x="55" y="40" fontFamily="-apple-system, sans-serif" fontSize="10" fontWeight="700" fill="#C7C7CC">z</text>
            <text x="64" y="34" fontFamily="-apple-system, sans-serif" fontSize="8" fontWeight="700" fill="#C7C7CC">z</text>
            {/* Sleepy eyes */}
            <path d="M46 58 Q50 54 54 58" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M66 58 Q70 54 74 58" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Small mouth */}
            <path d="M56 68 Q60 65 64 68" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', marginBottom: 4 }}>No completions yet</div>
            <div style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.5 }}>Complete habits to see your<br />progress light up this month</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <span style={{ fontSize: 15, fontWeight: 700, color: '#8E8E93', marginLeft: 4 }}>
        {monthLabel.split(' ')[0]} Stats
      </span>
      <div style={{ background: '#FFFFFF', borderRadius: 16, marginTop: 10, overflow: 'hidden' }}>
        {[
          { label: 'Days Completed', value: String(daysCompleted) },
          { label: 'Completion Rate', value: `${completionRate}%` },
          { label: 'Longest Streak', value: `${streak} days` },
        ].map((row, i, arr) => (
          <div key={row.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px' }}>
              <span style={{ fontSize: 15, color: '#8E8E93' }}>{row.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>{row.value}</span>
            </div>
            {i < arr.length - 1 && <div style={{ height: 1, background: '#F2F2F7', margin: '0 16px' }} />}
          </div>
        ))}
      </div>

      {/* 4-week bar chart */}
      <WeeklyBarChart habits={filteredHabits} />

    </div>
  );
}

function WeeklyBarChart({ habits }: { habits: Habit[] }) {
  const BAR_W = 8;
  const GAP = 3;
  const STEP = BAR_W + GAP;
  const WEEK_SEP = 10;
  const CHART_H = 80;

  const todayObj = new Date();
  const past28 = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(todayObj);
    d.setDate(d.getDate() - 27 + i);
    return localDateStr(d);
  });

  const rates = past28.map(date => {
    if (!habits.length) return 0;
    const done = habits.filter(h => h.completions.includes(date)).length;
    return done / habits.length;
  });

  // x position for bar index i, with extra gap between weeks
  const barX = (i: number) => i * STEP + Math.floor(i / 7) * (WEEK_SEP - GAP);
  const TOTAL_W = 28 * BAR_W + 27 * GAP + 3 * (WEEK_SEP - GAP);

  const weekStarts = [0, 7, 14, 21].map(w => {
    const d = new Date(past28[w] + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{ marginTop: 20, paddingBottom: 24 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#8E8E93', marginLeft: 4 }}>Past 4 Weeks</span>
      <div style={{ background: '#FFFFFF', borderRadius: 16, marginTop: 10, padding: '16px 14px 12px' }}>
        <svg width="100%" viewBox={`0 0 ${TOTAL_W} ${CHART_H + 14}`} style={{ display: 'block', overflow: 'visible' }}>
          {/* Subtle 50% and 100% guide lines */}
          {[0.5, 1].map(level => (
            <line
              key={level}
              x1={0} y1={CHART_H - level * CHART_H}
              x2={TOTAL_W} y2={CHART_H - level * CHART_H}
              stroke="#F2F2F7" strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {rates.map((rate, i) => {
            const x = barX(i);
            const barH = rate > 0 ? Math.max(5, rate * CHART_H) : 4;
            const y = rate > 0 ? CHART_H - barH : CHART_H - 4;
            const fill = rate >= 1 ? '#1C1C1E' : rate > 0 ? '#007AFF' : '#E5E5EA';
            const opacity = rate > 0 && rate < 1 ? 0.3 + rate * 0.7 : 1;
            return (
              <rect key={i} x={x} y={y} width={BAR_W} height={barH} rx={3} fill={fill} opacity={opacity} />
            );
          })}

          {/* Week separator lines */}
          {[1, 2, 3].map(w => {
            const xSep = barX(w * 7 - 1) + BAR_W + (WEEK_SEP - GAP) / 2;
            return (
              <line key={w} x1={xSep} y1={0} x2={xSep} y2={CHART_H + 2} stroke="#E5E5EA" strokeWidth="1" strokeDasharray="3 3" />
            );
          })}

          {/* Day-of-week labels */}
          {past28.map((date, i) => {
            const dow = new Date(date + 'T00:00:00').getDay();
            return (
              <text
                key={i}
                x={barX(i) + BAR_W / 2}
                y={CHART_H + 12}
                textAnchor="middle"
                fontSize="7"
                fill="#C7C7CC"
                fontFamily="-apple-system, sans-serif"
                fontWeight="600"
              >
                {DOW[dow]}
              </text>
            );
          })}
        </svg>

        {/* Week date labels */}
        <div style={{ display: 'flex', marginTop: 2 }}>
          {weekStarts.map((label, w) => (
            <div key={w} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#C7C7CC', fontWeight: 600 }}>
              {label}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center' }}>
          {[
            { fill: '#1C1C1E', label: '100%' },
            { fill: '#007AFF', label: 'Partial', opacity: 0.7 },
            { fill: '#E5E5EA', label: 'None' },
          ].map(({ fill, label, opacity }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: fill, opacity: opacity ?? 1 }} />
              <span style={{ fontSize: 11, color: '#8E8E93', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
