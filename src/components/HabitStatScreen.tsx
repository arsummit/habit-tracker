import { useState, useMemo } from 'react';
import { Habit } from '../types';
import { localDateStr } from '../utils/date';

interface Props {
  habit: Habit;
  onClose: () => void;
  memos: Array<{ date: string; text: string }>;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function toStr(d: Date) {
  return localDateStr(d);
}

function parseDate(s: string) {
  return new Date(s + 'T00:00:00');
}

function daysBetween(a: Date, b: Date) {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / 86400000);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatMonthDay(s: string) {
  const d = parseDate(s);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// Catmull-Rom → SVG cubic bezier path
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, iconBg, value, unit, label }: { icon: React.ReactNode; iconBg: string; value: string | number; unit?: string; label: string }) {
  return (
    <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '16px 14px', minWidth: 0 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1C1C1E', lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 14, fontWeight: 500, color: '#8E8E93' }}> {unit}</span>}
      </div>
      <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function LineChart({ data, labels, color = '#A8B4F0', height = 120 }: { data: number[]; labels: string[]; color?: string; height?: number }) {
  const w = 320;
  const pad = { t: 10, b: 30, l: 24, r: 10 };
  const chartW = w - pad.l - pad.r;
  const chartH = height - pad.t - pad.b;
  const max = Math.max(...data, 1);

  const pts: [number, number][] = data.map((v, i) => [
    pad.l + (i / Math.max(data.length - 1, 1)) * chartW,
    pad.t + chartH - (v / max) * chartH,
  ]);

  const path = smoothPath(pts);
  // Fill path: close below
  const fillPath = path + ` L ${pts[pts.length - 1][0].toFixed(1)} ${(pad.t + chartH).toFixed(1)} L ${pts[0][0].toFixed(1)} ${(pad.t + chartH).toFixed(1)} Z`;

  const showLabels = labels.filter((_, i) => i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 5) === 0);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{ display: 'block' }}>
      {/* Y axis lines */}
      {[0, 0.5, 1].map(r => (
        <line key={r} x1={pad.l} x2={w - pad.r} y1={pad.t + chartH * (1 - r)} y2={pad.t + chartH * (1 - r)}
          stroke="#F2F2F7" strokeWidth="1" />
      ))}
      {/* Y labels */}
      <text x={pad.l - 4} y={pad.t + chartH} fontSize="10" fill="#C7C7CC" textAnchor="end" dominantBaseline="middle">0</text>
      <text x={pad.l - 4} y={pad.t} fontSize="10" fill="#C7C7CC" textAnchor="end" dominantBaseline="middle">{max}</text>
      {/* Fill */}
      <path d={fillPath} fill={color} opacity="0.15" />
      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* X labels */}
      {labels.map((lbl, i) => {
        const x = pad.l + (i / Math.max(data.length - 1, 1)) * chartW;
        const show = i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 6) === 0;
        if (!show) return null;
        return <text key={i} x={x} y={height - 4} fontSize="9" fill="#C7C7CC" textAnchor="middle">{lbl}</text>;
      })}
    </svg>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function HabitStatScreen({ habit, onClose, memos }: Props) {
  const today = new Date();
  const todayStr = toStr(today);
  const completionSet = useMemo(() => new Set(habit.completions), [habit.completions]);

  // Calendar state
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [heatYear, setHeatYear] = useState(today.getFullYear());
  const [trendRange, setTrendRange] = useState<'1W' | '1M' | '1Y'>('1W');
  const [cmpRange, setCmpRange] = useState<'Week' | 'Month' | 'Year'>('Week');

  // ── calendar (Monday-first) ──
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon=0
  const prevDays = new Date(calYear, calMonth, 0).getDate();
  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }).replace('/', '/');

  const calCells: { day: number; cur: boolean; dateStr?: string }[] = [];
  for (let i = 0; i < firstDow; i++) calCells.push({ day: prevDays - firstDow + 1 + i, cur: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calCells.push({ day: d, cur: true, dateStr });
  }
  const remaining = (7 - (calCells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) calCells.push({ day: i, cur: false });

  const prevMonth = () => calMonth === 0 ? (setCalYear(y => y - 1), setCalMonth(11)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalYear(y => y + 1), setCalMonth(0)) : setCalMonth(m => m + 1);

  // ── yearly heatmap ──
  const heatStart = new Date(heatYear, 0, 1);
  const heatEnd = new Date(heatYear, 11, 31);
  const startDow = (heatStart.getDay() + 6) % 7;
  const totalCells = Math.ceil((daysBetween(heatStart, heatEnd) + 1 + startDow) / 7) * 7;
  const heatCells = Array.from({ length: totalCells }, (_, i) => {
    const d = addDays(heatStart, i - startDow);
    return { dateStr: toStr(d), inYear: d.getFullYear() === heatYear };
  });

  // ── stats ──
  const createdAt = parseDate(habit.createdAt || todayStr);
  const totalDays = Math.max(1, daysBetween(createdAt, today) + 1);
  const totalSuccess = habit.completions.length;
  const curMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const successThisMonth = habit.completions.filter(d => d.startsWith(curMonthStr)).length;
  const dailyAvg = (totalSuccess / totalDays).toFixed(2);
  const overallRate = ((totalSuccess / totalDays) * 100).toFixed(2);

  // current streak
  let curStreak = 0;
  const sd = new Date(today);
  while (completionSet.has(toStr(sd))) { curStreak++; sd.setDate(sd.getDate() - 1); }

  // best streak
  const sorted = [...habit.completions].sort();
  let bestStreak = sorted.length > 0 ? 1 : 0, runStreak = sorted.length > 0 ? 1 : 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (parseDate(sorted[i]).getTime() - parseDate(sorted[i - 1]).getTime()) / 86400000;
    runStreak = diff === 1 ? runStreak + 1 : 1;
    if (runStreak > bestStreak) bestStreak = runStreak;
  }

  // ── trending chart data ──
  const trendDays = trendRange === '1W' ? 7 : trendRange === '1M' ? 30 : 365;
  const trendData = Array.from({ length: trendDays }, (_, i) => {
    const d = addDays(today, -(trendDays - 1 - i));
    return completionSet.has(toStr(d)) ? 1 : 0;
  });
  const trendLabels = Array.from({ length: trendDays }, (_, i) => {
    if (trendRange === '1Y' && i % 30 !== 0) return '';
    return formatMonthDay(toStr(addDays(today, -(trendDays - 1 - i))));
  });

  // ── comparison chart ──
  const cmpDays = cmpRange === 'Week' ? 7 : cmpRange === 'Month' ? 30 : 365;
  const cmpDayLabels = cmpRange === 'Week' ? ['MON','TUE','WED','THU','FRI','SAT','SUN'] : [];
  const thisData = Array.from({ length: cmpDays }, (_, i) => {
    return completionSet.has(toStr(addDays(today, -(cmpDays - 1 - i)))) ? 1 : 0;
  });
  const lastData = Array.from({ length: cmpDays }, (_, i) => {
    return completionSet.has(toStr(addDays(today, -(cmpDays * 2 - 1 - i)))) ? 1 : 0;
  });
  const cmpLabels = cmpDayLabels.length
    ? cmpDayLabels
    : Array.from({ length: cmpDays }, (_, i) => formatMonthDay(toStr(addDays(today, -(cmpDays - 1 - i)))));

  const monthName = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleString('en-US', { month: 'long' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: '#F2F2F7', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        background: '#F2F2F7',
      }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: '#E5E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>{habit.name}</span>
        <div style={{ width: 36 }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }}>

        {/* ── Calendar ── */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: 18, color: '#8E8E93', padding: '4px 10px' }}>‹</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>
              {String(calMonth + 1).padStart(2, '0')}/{calYear}
            </span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: 18, color: '#8E8E93', padding: '4px 10px' }}>›</button>
          </div>
          {/* Day headers Mon-Sun */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#8E8E93' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {calCells.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const done = cell.dateStr ? completionSet.has(cell.dateStr) : false;
              return (
                <div key={idx} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: isToday ? '#7B8FE0' : done ? '#D4DAFC' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isToday && <span style={{ fontSize: 10, position: 'absolute', top: 0, right: '25%' }}>👑</span>}
                    <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: !cell.cur ? '#C7C7CC' : isToday ? '#FFFFFF' : '#1C1C1E' }}>
                      {cell.day}
                    </span>
                  </div>
                  {done && !isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B8FE0', marginTop: 1 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Yearly Heatmap ── */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px', marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Yearly Status</span>
            <button onClick={() => setHeatYear(y => y)} style={{ fontSize: 13, color: '#1C1C1E', background: '#F2F2F7', borderRadius: 12, padding: '4px 10px', border: 'none', fontWeight: 600 }}>
              {heatYear} ▾
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 10px)', gridAutoFlow: 'column', gap: 2, width: 'max-content' }}>
              {heatCells.map((cell, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: !cell.inYear ? 'transparent' : completionSet.has(cell.dateStr) ? '#7B8FE0' : '#E5E5EA',
                  opacity: cell.inYear ? 1 : 0,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats Row 1 ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <StatCard iconBg="#EAF4FF" value={successThisMonth} unit="Day" label={`success in ${monthName}`}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A9EE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>}
          />
          <StatCard iconBg="#E8FAF4" value={totalSuccess} unit="Days" label="Total Success"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>}
          />
        </div>

        {/* ── Stats Row 2 ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <StatCard iconBg="#F0EAFF" value={curStreak} unit="Day" label="Current Streak"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B6FE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>}
          />
          <StatCard iconBg="#FFF3E0" value={bestStreak} unit="Days" label="Best Streak"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
          />
        </div>

        {/* ── Vol / Rate stats ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <StatCard iconBg="#E8FAF0" value={successThisMonth} label={`Vol. in ${monthName}`}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" fill="#34C759"/><rect x="7" y="13" width="3" height="5" rx="1" fill="#FFF"/><rect x="11" y="9" width="3" height="9" rx="1" fill="#FFF"/><rect x="15" y="6" width="3" height="12" rx="1" fill="#FFF"/></svg>}
          />
          <StatCard iconBg="#FDE8F0" value={totalSuccess} label="Vol. Total"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" fill="#FF6B9D"/><path d="M6 14l4-4 4 4 4-6" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <StatCard iconBg="#F0E8FF" value={dailyAvg} label="Daily Avg."
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" fill="#9B6FE0"/><path d="M8 12h8M12 8v8" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/></svg>}
          />
          <StatCard iconBg="#E8F4FF" value={overallRate} unit="%" label="Overall Rate"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" fill="#4A9EE0"/><path d="M12 7v5l3 3" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="4" stroke="#FFF" strokeWidth="1.5" fill="none"/></svg>}
          />
        </div>

        {/* ── Memos ── */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Memos</span>
            <span style={{ fontSize: 14, color: '#8E8E93' }}>More ›</span>
          </div>
          {memos.length === 0 ? (
            <div style={{ fontSize: 14, color: '#C7C7CC', padding: '8px 0' }}>No memos yet</div>
          ) : (
            memos.slice(0, 3).map(m => (
              <div key={m.date} style={{ padding: '8px 0', borderBottom: '1px solid #F2F2F7' }}>
                <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 2 }}>{m.date}</div>
                <div style={{ fontSize: 14, color: '#1C1C1E' }}>{m.text}</div>
              </div>
            ))
          )}
        </div>

        {/* ── Trending ── */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Trending</span>
            <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: 20, padding: 2 }}>
              {(['1W','1M','1Y'] as const).map(r => (
                <button key={r} onClick={() => setTrendRange(r)} style={{
                  padding: '5px 12px', borderRadius: 18, fontSize: 13, fontWeight: 600, border: 'none',
                  background: trendRange === r ? '#FFFFFF' : 'transparent',
                  color: trendRange === r ? '#1C1C1E' : '#8E8E93',
                  boxShadow: trendRange === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>{r === '1W' ? '1 Week' : r === '1M' ? '1 Month' : '1 Year'}</button>
              ))}
            </div>
          </div>
          <LineChart data={trendData} labels={trendLabels} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#A8B4F0' }} />
            <span style={{ fontSize: 12, color: '#8E8E93' }}>{trendRange === '1W' ? '1 Week' : trendRange === '1M' ? '1 Month' : '1 Year'}</span>
          </div>
        </div>

        {/* ── Comparison ── */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Comparison</span>
            <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: 20, padding: 2 }}>
              {(['Week','Month','Year'] as const).map(r => (
                <button key={r} onClick={() => setCmpRange(r)} style={{
                  padding: '5px 12px', borderRadius: 18, fontSize: 13, fontWeight: 600, border: 'none',
                  background: cmpRange === r ? '#FFFFFF' : 'transparent',
                  color: cmpRange === r ? '#1C1C1E' : '#8E8E93',
                  boxShadow: cmpRange === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>{r}</button>
              ))}
            </div>
          </div>
          {/* Two overlapping line charts */}
          <svg width="100%" viewBox="0 0 320 150" style={{ display: 'block' }}>
            {[0, 0.5, 1].map(r => (
              <line key={r} x1={24} x2={310} y1={10 + 110 * (1 - r)} y2={10 + 110 * (1 - r)}
                stroke="#F2F2F7" strokeWidth="1" />
            ))}
            <text x={20} y={120} fontSize="10" fill="#C7C7CC" textAnchor="end" dominantBaseline="middle">0</text>
            <text x={20} y={10} fontSize="10" fill="#C7C7CC" textAnchor="end" dominantBaseline="middle">1</text>
            {/* Last period — lighter */}
            <path d={smoothPath(lastData.map((v, i) => [24 + (i / Math.max(lastData.length - 1, 1)) * 286, 10 + 110 - v * 110] as [number, number]))}
              fill="none" stroke="#D0D5F0" strokeWidth="2" strokeLinecap="round" />
            {/* This period */}
            <path d={smoothPath(thisData.map((v, i) => [24 + (i / Math.max(thisData.length - 1, 1)) * 286, 10 + 110 - v * 110] as [number, number]))}
              fill="none" stroke="#A8B4F0" strokeWidth="2" strokeLinecap="round" />
            {/* X labels */}
            {cmpLabels.map((lbl, i) => {
              const show = i === 0 || i === cmpLabels.length - 1 || i % Math.ceil(cmpLabels.length / 6) === 0;
              if (!show) return null;
              const x = 24 + (i / Math.max(cmpLabels.length - 1, 1)) * 286;
              return <text key={i} x={x} y={146} fontSize="9" fill="#C7C7CC" textAnchor="middle">{lbl}</text>;
            })}
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#D0D5F0' }} />
              <span style={{ fontSize: 12, color: '#8E8E93' }}>Last {cmpRange}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#A8B4F0' }} />
              <span style={{ fontSize: 12, color: '#8E8E93' }}>This {cmpRange}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
