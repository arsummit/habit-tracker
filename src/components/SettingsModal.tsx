import { useState } from 'react';

interface Props {
  onClose: () => void;
}

function Row({ icon, title, subtitle, right, onClick, danger }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 16px', cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: danger ? '#FF3B30' : '#1C1C1E' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 1 }}>{subtitle}</div>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#F2F2F7', marginLeft: 58 }} />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: '#8E8E93', paddingLeft: 4, marginBottom: 6, marginTop: 20 }}>
      {label}
    </div>
  );
}

export default function SettingsModal({ onClose }: Props) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearData = () => {
    localStorage.removeItem('habit-tracker-v1');
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#F2F2F7',
      overflowY: 'auto',
      paddingBottom: 'env(safe-area-inset-bottom, 20px)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '16px 16px 0',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        position: 'sticky', top: 0, background: '#F2F2F7', zIndex: 10,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%', background: '#E5E5EA',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={{ padding: '8px 16px 32px' }}>
        {/* Title */}
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1C1C1E', margin: '8px 0 20px 4px' }}>Settings</h1>

        {/* Upgrade to Pro */}
        <div style={{
          background: 'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)',
          borderRadius: 16, padding: '16px 18px',
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8,
          cursor: 'pointer',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>Upgrade to Pro</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Unlock all features</div>
          </div>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M1 1L7 7L1 13" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* App Settings */}
        <SectionLabel label="App Settings" />
        <Card>
          <Row
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13" r="2.5"/><circle cx="6" cy="14" r="2.5"/>
                <path d="M13.5 9v10M19 15.5V20M6 16.5V20M13.5 4V2M19 11V4M6 12V4"/>
              </svg>
            }
            title="Accent Color"
            subtitle="Choose your app color"
            right={
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                border: '2.5px solid #1C1C1E',
              }} />
            }
          />
        </Card>

        {/* Language */}
        <SectionLabel label="Language" />
        <Card>
          <Row
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            }
            title="Language"
            subtitle="Select app language"
            right={<span style={{ fontSize: 15, color: '#1C1C1E', fontWeight: 500 }}>English <span style={{ fontSize: 12, color: '#8E8E93' }}>◇</span></span>}
          />
        </Card>

        {/* Week starts on */}
        <div style={{ marginTop: 12 }}>
          <Card>
            <Row
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              }
              title="Week starts on"
              subtitle="Choose the first day of the week"
              right={<span style={{ fontSize: 15, color: '#1C1C1E', fontWeight: 500 }}>Sunday <span style={{ fontSize: 12, color: '#8E8E93' }}>◇</span></span>}
            />
          </Card>
          <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 6, paddingLeft: 4, lineHeight: 1.5 }}>
            This setting determines which day appears first in all calendars and week views throughout the app.
          </div>
        </div>

        {/* Support */}
        <SectionLabel label="Support" />
        <Card>
          <Row
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="12" y1="2" x2="12" y2="18"/><path d="M5 13l7-11 7 11"/></svg>}
            title="Request a Feature"
            subtitle="Suggest a new feature"
          />
          <Divider />
          <Row
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            title="Report a Bug"
            subtitle="Report an issue"
          />
          <Divider />
          <Row
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="#8E8E93"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
            title="Rate the App"
            subtitle="Rate us on the App Store"
          />
          <Divider />
          <Row
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>}
            title="Share the App"
            subtitle="Share with friends"
          />
        </Card>

        {/* About */}
        <SectionLabel label="About" />
        <Card>
          <Row
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            title="App Version"
            subtitle="1.2.0"
          />
          <Divider />
          <Row
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            title="Privacy Policy"
            subtitle="View privacy policy"
          />
          <Divider />
          <Row
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
            title="Terms of Use"
            subtitle="View terms of use"
          />
        </Card>

        {/* Data */}
        <SectionLabel label="Data" />
        <Card>
          {!showClearConfirm ? (
            <Row
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              }
              title="Clear all data"
              subtitle="Delete all habits and their logs"
              danger
              onClick={() => setShowClearConfirm(true)}
            />
          ) : (
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#FF3B30', marginBottom: 4 }}>Delete all habits and data?</div>
              <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 14 }}>This cannot be undone.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={clearData}
                  style={{ flex: 1, background: '#FF3B30', color: '#FFF', borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: 14 }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{ flex: 1, background: '#E5E5EA', borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: 14 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
