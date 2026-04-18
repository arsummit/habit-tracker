import { TabType } from '../types';

const TAB_LABELS: Record<TabType, string> = {
  daily: 'Today',
  monthly: 'Monthly',
  group: 'Group',
  all: 'All Habits',
  settings: 'Settings',
};

interface Props {
  activeTab: TabType;
  onAdd: () => void;
  onGroupAdd: () => void;
}

export default function Header({ activeTab, onAdd, onGroupAdd }: Props) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
    }}>
      <div style={{ width: 40 }} />

      <h1 style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>
        {TAB_LABELS[activeTab]}
      </h1>

      {activeTab === 'daily' && (
        <button onClick={onAdd} style={grayBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}

      {activeTab === 'group' && (
        <button onClick={onGroupAdd} style={blueBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}

      {activeTab !== 'daily' && activeTab !== 'group' && (
        <div style={{ width: 40 }} />
      )}
    </header>
  );
}

const grayBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  background: '#E5E5EA',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', cursor: 'pointer',
};

const blueBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  background: '#007AFF',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', cursor: 'pointer',
};
