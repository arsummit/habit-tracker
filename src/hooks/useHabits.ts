import { useState, useCallback } from 'react';
import { Habit } from '../types';
import { localDateStr } from '../utils/date';

const STORAGE_KEY = 'habit-tracker-v1';
const MEMO_KEY = 'habit-memos-v1';
const COUNT_KEY = 'habit-counts-v1';

const loadMemos = (): Record<string, string> => {
  try { const s = localStorage.getItem(MEMO_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
};
const saveMemos = (m: Record<string, string>) => localStorage.setItem(MEMO_KEY, JSON.stringify(m));

const loadCounts = (): Record<string, number> => {
  try { const s = localStorage.getItem(COUNT_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
};
const saveCounts = (c: Record<string, number>) => localStorage.setItem(COUNT_KEY, JSON.stringify(c));

const load = (): Habit[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

const save = (habits: Habit[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(load);
  const [memos, setMemos] = useState<Record<string, string>>(loadMemos);
  const [counts, setCounts] = useState<Record<string, number>>(loadCounts);

  const update = (updated: Habit[]) => {
    save(updated);
    setHabits(updated);
  };

  const addHabit = useCallback((name: string, emoji: string, color: string, extra?: {
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
  }) => {
    const habit: Habit = {
      id: Date.now().toString(),
      name,
      emoji,
      color,
      createdAt: extra?.startingFrom || toDateStr(new Date()),
      completions: [],
      description: extra?.description,
      frequency: extra?.frequency,
      completionDays: extra?.completionDays,
      habitType: extra?.habitType,
      goalValue: extra?.goalValue,
      goalUnit: extra?.goalUnit,
      timeRange: extra?.timeRange,
      remindersEnabled: extra?.remindersEnabled,
      reminderTimes: extra?.reminderTimes,
      reminderMessage: extra?.reminderMessage,
      showMemo: extra?.showMemo,
      chartType: extra?.chartType,
      endDate: extra?.endDate,
    };
    setHabits(prev => {
      const next = [...prev, habit];
      save(next);
      return next;
    });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => {
      const next = prev.filter(h => h.id !== id);
      save(next);
      return next;
    });
  }, []);

  const toggleCompletion = useCallback((id: string, date: string) => {
    setHabits(prev => {
      const next = prev.map(h => {
        if (h.id !== id) return h;
        const completions = h.completions.includes(date)
          ? h.completions.filter(d => d !== date)
          : [...h.completions, date];
        return { ...h, completions };
      });
      save(next);
      return next;
    });
  }, []);

  const getStreak = useCallback((habit: Habit): number => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const s = toDateStr(d);
      if (habit.completions.includes(s)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  }, []);

  const getLongestStreak = useCallback((habit: Habit): number => {
    if (!habit.completions.length) return 0;
    const sorted = [...habit.completions].sort();
    let longest = 1, current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) /
        86400000;
      current = diff === 1 ? current + 1 : 1;
      if (current > longest) longest = current;
    }
    return longest;
  }, []);

  const reorderHabits = useCallback((reordered: Habit[]) => {
    update(reordered);
  }, []);

  const saveMemo = useCallback((habitId: string, date: string, text: string) => {
    setMemos(prev => {
      const next = { ...prev, [`${habitId}_${date}`]: text };
      saveMemos(next);
      return next;
    });
  }, []);

  const getMemo = useCallback((habitId: string, date: string): string => {
    return memos[`${habitId}_${date}`] ?? '';
  }, [memos]);

  const disableMemo = useCallback((id: string) => {
    setHabits(prev => {
      const next = prev.map(h => h.id === id ? { ...h, memoDisabled: true } : h);
      save(next);
      return next;
    });
  }, []);

  const setMemoDisabled = useCallback((id: string, disabled: boolean) => {
    setHabits(prev => {
      const next = prev.map(h => h.id === id ? { ...h, memoDisabled: disabled } : h);
      save(next);
      return next;
    });
  }, []);

  const getHabitMemos = useCallback((habitId: string): Array<{ date: string; text: string }> => {
    const prefix = `${habitId}_`;
    return Object.entries(memos)
      .filter(([k, v]) => k.startsWith(prefix) && v.trim())
      .map(([k, v]) => ({ date: k.slice(prefix.length), text: v }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [memos]);

  const getDailyCount = useCallback((habitId: string, date: string): number => {
    return counts[`${habitId}_${date}`] ?? 0;
  }, [counts]);

  const updateHabit = useCallback((id: string, changes: Partial<Habit>) => {
    setHabits(prev => {
      const next = prev.map(h => h.id === id ? { ...h, ...changes } : h);
      save(next);
      return next;
    });
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setHabits(prev => {
      const next = prev.map(h => h.id === id ? { ...h, archived: true } : h);
      save(next);
      return next;
    });
  }, []);

  const setDailyCount = useCallback((habitId: string, date: string, count: number) => {
    setCounts(prev => {
      const next = { ...prev, [`${habitId}_${date}`]: Math.max(0, count) };
      saveCounts(next);
      return next;
    });
  }, []);

  return { habits, addHabit, deleteHabit, updateHabit, toggleCompletion, getStreak, getLongestStreak, reorderHabits, update, saveMemo, getMemo, getHabitMemos, disableMemo, setMemoDisabled, getDailyCount, setDailyCount, archiveHabit };
};

export const toDateStr = (d: Date) => localDateStr(d);
