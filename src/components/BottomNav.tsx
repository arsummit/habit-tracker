import { TabType } from '../types';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div style={{
      padding: '8px 16px',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      background: 'var(--bg)',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 24,
        display: 'flex',
        alignItems: 'center',
        padding: '6px 4px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      }}>
        {/* Daily */}
        <NavBtn id="daily" activeTab={activeTab} onTabChange={onTabChange} label="Daily">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </NavBtn>

        {/* Monthly */}
        <NavBtn id="monthly" activeTab={activeTab} onTabChange={onTabChange} label="Monthly">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <rect x="7" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none"/>
            <rect x="11" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none"/>
            <rect x="15" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none"/>
          </svg>
        </NavBtn>

        {/* Group — middle pill */}
        <button
          onClick={() => onTabChange('group')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '10px 4px',
            borderRadius: 18,
            background: activeTab === 'group' ? '#007AFF' : '#F2F2F7',
            color: activeTab === 'group' ? '#FFFFFF' : '#8E8E93',
            transition: 'background 0.15s, color 0.15s',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: activeTab === 'group' ? 700 : 400, lineHeight: 1 }}>Group</span>
        </button>

        {/* All Habits */}
        <NavBtn id="all" activeTab={activeTab} onTabChange={onTabChange} label="All">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </NavBtn>

        {/* Settings */}
        <NavBtn id="settings" activeTab={activeTab} onTabChange={onTabChange} label="Settings">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({ id, activeTab, onTabChange, label, children }: {
  id: TabType;
  activeTab: TabType;
  onTabChange: (t: TabType) => void;
  label: string;
  children: React.ReactNode;
}) {
  const active = id === activeTab;
  return (
    <button
      onClick={() => onTabChange(id)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '8px 4px',
        borderRadius: 18,
        background: active ? '#F2F2F7' : 'transparent',
        color: active ? '#2C2C2E' : '#8E8E93',
        transition: 'background 0.15s, color 0.15s',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, lineHeight: 1 }}>{label}</span>
    </button>
  );
}
