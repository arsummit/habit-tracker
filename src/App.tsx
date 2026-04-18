import { useState } from 'react';
import { localDateStr } from './utils/date';
import { TabType } from './types';
import { useHabits } from './hooks/useHabits';
import Header from './components/Header';
import WeekStrip from './components/WeekStrip';
import DailyView from './components/DailyView';
import MonthlyView from './components/MonthlyView';
import AllHabitsView from './components/AllHabitsView';
import GroupView from './components/GroupView';
import BottomNav from './components/BottomNav';
import HabitPickerModal from './components/HabitPickerModal';
import SettingsModal from './components/SettingsModal';
import HabitCounterScreen from './components/HabitCounterScreen';
import HabitDetailsScreen from './components/HabitDetailsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [selectedDate, setSelectedDate] = useState(localDateStr());
  const [showAdd, setShowAdd] = useState(false);
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);

  const { habits, addHabit, deleteHabit, updateHabit, toggleCompletion, getStreak, getLongestStreak, reorderHabits, saveMemo, getMemo, getHabitMemos, disableMemo, setMemoDisabled, getDailyCount, setDailyCount, archiveHabit } = useHabits();
  const [editHabit, setEditHabit] = useState<import('./types').Habit | null>(null);

  const detailHabit = detailHabitId ? habits.find(h => h.id === detailHabitId) : null;

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onAdd={() => setShowAdd(true)}
        onGroupAdd={() => setShowGroupSheet(true)}
      />

      {activeTab === 'daily' && (() => {
        const today = localDateStr();
        const todayDone = habits.filter(h => h.completions.includes(today)).length;
        const todayRatio = habits.length > 0 ? todayDone / habits.length : 0;
        return (
          <>
            <WeekStrip habits={habits} selectedDate={selectedDate} onSelectDate={setSelectedDate} todayRatio={todayRatio} />
            <DailyView
              habits={habits}
              selectedDate={selectedDate}
              onToggle={toggleCompletion}
              onReorder={reorderHabits}
              onDelete={deleteHabit}
              onSaveMemo={saveMemo}
              getMemo={getMemo}
              onDisableMemo={disableMemo}
              onHabitTap={id => setDetailHabitId(id)}
              getStreak={getStreak}
            />
          </>
        );
      })()}

      {activeTab === 'monthly' && <MonthlyView habits={habits} getLongestStreak={getLongestStreak} />}

      {activeTab === 'group' && (
        <GroupView
          habits={habits}
          showSheet={showGroupSheet}
          onCloseSheet={() => setShowGroupSheet(false)}
        />
      )}

      {activeTab === 'all' && (
        <AllHabitsView
          habits={habits}
          onDelete={deleteHabit}
          getStreak={getStreak}
          getLongestStreak={getLongestStreak}
          onToggleMemo={(id, disabled) => setMemoDisabled(id, disabled)}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsModal onClose={() => setActiveTab('daily')} />
      )}

      <BottomNav activeTab={activeTab} onTabChange={tab => {
        if (tab === 'group') setShowGroupSheet(false);
        setActiveTab(tab);
      }} />

      {showAdd && (
        <HabitPickerModal
          onAdd={(name, emoji, color, extra) => { addHabit(name, emoji, color, extra); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editHabit && (
        <HabitDetailsScreen
          editHabit={editHabit}
          onAdd={() => {}}
          onUpdate={changes => updateHabit(editHabit.id, changes)}
          onBack={() => setEditHabit(null)}
        />
      )}

      {detailHabit && (
        <HabitCounterScreen
          habit={detailHabit}
          date={selectedDate}
          onBack={() => setDetailHabitId(null)}
          onToggle={toggleCompletion}
          getDailyCount={getDailyCount}
          setDailyCount={setDailyCount}
          getMemo={getMemo}
          onSaveMemo={saveMemo}
          onDelete={id => { deleteHabit(id); setDetailHabitId(null); }}
          onArchive={id => { archiveHabit(id); setDetailHabitId(null); }}
          onEdit={habit => { setEditHabit(habit); setDetailHabitId(null); }}
          getHabitMemos={getHabitMemos}
        />
      )}
    </div>
  );
}
