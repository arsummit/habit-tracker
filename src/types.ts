export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  completions: string[];
  description?: string;
  frequency?: 'every_week' | 'once_a_month' | 'custom';
  completionDays?: number[];
  memoDisabled?: boolean;
  goal?: number;
  archived?: boolean;
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
}

export type TabType = 'daily' | 'monthly' | 'group' | 'all' | 'settings';
