import { Habit } from '../types';
import { localDateStr } from '../utils/date';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getCurrentWeek(): string[] {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return localDateStr(d);
  });
}

function completionCircleColor(ratio: number): string {
  if (ratio === 0)   return 'transparent';
  if (ratio <= 0.33) return '#C8DCFB';
  if (ratio <= 0.66) return '#90BAF5';
  if (ratio < 1)     return '#5090E8';
  return                    '#2563EB';
}

interface Props {
  habits: Habit[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  todayRatio: number;
}

export default function WeekStrip({ habits, selectedDate, onSelectDate }: Props) {
  const today = localDateStr();
  const days = getCurrentWeek();

  return (
    <div style={{ display: 'flex', padding: '4px 8px 12px' }}>
      {days.map(dateStr => {
        const d = new Date(dateStr + 'T00:00:00');
        const dow = d.getDay();
        const dayNum = d.getDate();
        const isToday    = dateStr === today;
        const isSelected = dateStr === selectedDate;

        const ratio = habits.length > 0
          ? habits.filter(h => h.completions.includes(dateStr)).length / habits.length
          : 0;

        const circleColor = completionCircleColor(ratio);
        const numOnDark = ratio > 0.66;

        // Outer oblong: selected/today gets a fill; others transparent
        const oblongBg = isSelected
          ? (isToday ? '#C8D8FF' : '#D8E8FF')
          : 'transparent';

        return (
          <div key={dateStr} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => onSelectDate(dateStr)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, padding: '14px 8px',
                borderRadius: 999,
                background: oblongBg,
                border: 'none', cursor: 'pointer',
                minWidth: 36, transition: 'background 0.2s',
              }}
            >
              {/* Weekday label */}
              <span style={{
                fontSize: 11, fontWeight: 600, lineHeight: 1, letterSpacing: 0.3,
                color: isSelected ? '#3A6BC8' : '#AEAEB2',
              }}>
                {DAY_LABELS[dow]}
              </span>

              {/* Number with completion circle layered behind */}
              <div style={{
                position: 'relative', width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Completion circle */}
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  background: circleColor,
                  transition: 'background 0.2s',
                }} />
                {/* Date number */}
                <span style={{
                  position: 'relative',
                  fontSize: 17,
                  fontWeight: isSelected ? 700 : 400,
                  lineHeight: 1,
                  color: isSelected
                    ? '#1C1C1E'
                    : numOnDark ? '#FFFFFF' : '#1C1C1E',
                }}>
                  {dayNum}
                </span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
