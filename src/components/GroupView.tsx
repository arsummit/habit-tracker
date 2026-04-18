import { useState } from 'react';
import { Habit } from '../types';

interface Props {
  habits: Habit[];
  showSheet: boolean;
  onCloseSheet: () => void;
}

export default function GroupView({ habits, showSheet, onCloseSheet }: Props) {
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px 64px' }}>
        {/* Illustration */}
        <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Decorative dots and plusses */}
          <circle cx="48" cy="44" r="4" fill="#C7D2FE" opacity="0.8"/>
          <circle cx="155" cy="36" r="6" fill="#C7D2FE" opacity="0.6"/>
          <circle cx="34" cy="110" r="3" fill="#C7D2FE" opacity="0.5"/>
          <circle cx="168" cy="118" r="5" fill="#C7D2FE" opacity="0.7"/>
          <text x="38" y="82" fontSize="14" fill="#C7D2FE" fontWeight="300">+</text>
          <text x="154" y="152" fontSize="14" fill="#C7D2FE" fontWeight="300">+</text>

          {/* Background circle */}
          <circle cx="100" cy="90" r="64" fill="#EEF2FF"/>

          {/* Person 1 (main, centered-left) */}
          <circle cx="88" cy="68" r="18" fill="#C7D2FE"/>
          <path d="M58 108 C58 92 72 82 88 82 C104 82 118 92 118 108" fill="#C7D2FE"/>

          {/* Person 2 (secondary, right, slightly behind) */}
          <circle cx="116" cy="72" r="14" fill="#A5B4FC" opacity="0.7"/>
          <path d="M92 108 C92 96 103 88 116 88 C129 88 140 96 140 108" fill="#A5B4FC" opacity="0.7"/>

          {/* Bottom lines suggesting a platform */}
          <line x1="30" y1="136" x2="90" y2="136" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="142" x2="75" y2="142" stroke="#C7D2FE" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <circle cx="160" cy="136" r="3" fill="#C7D2FE" opacity="0.5"/>
          <line x1="110" y1="136" x2="155" y2="136" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round"/>
          <line x1="115" y1="142" x2="148" y2="142" stroke="#C7D2FE" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </svg>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 15, color: '#8E8E93', lineHeight: 1.6 }}>
            It's always nice to have someone by your side.<br />
            Tap add button to invite a friend.
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      {showSheet && (
        <>
          <div onClick={onCloseSheet} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.2)' }} />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
            background: '#F2F2F7', borderRadius: '24px 24px 0 0',
            padding: '12px 20px calc(32px + env(safe-area-inset-bottom, 0px))',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
          }}>
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#C7C7CC', margin: '0 auto 20px' }} />

            {/* Hands illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="100" height="88" viewBox="0 0 100 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Sparkles */}
                <text x="54" y="10" fontSize="10" fill="#FFD60A">✦</text>
                <text x="14" y="28" fontSize="8" fill="#FF6B6B">✦</text>
                <text x="76" y="72" fontSize="8" fill="#34C759">✦</text>

                {/* Four hands meeting in center */}
                {/* Top-left hand (blue sleeve) */}
                <rect x="28" y="10" width="22" height="30" rx="6" fill="#60A5FA" transform="rotate(45 39 25)"/>
                <ellipse cx="39" cy="25" rx="10" ry="12" fill="#FBBF24" transform="rotate(45 39 25)"/>

                {/* Top-right hand (yellow sleeve) */}
                <rect x="50" y="10" width="22" height="30" rx="6" fill="#FBBF24" transform="rotate(-45 61 25)"/>
                <ellipse cx="61" cy="25" rx="10" ry="12" fill="#FDE68A" transform="rotate(-45 61 25)"/>

                {/* Bottom-left hand (dark sleeve) */}
                <rect x="28" y="48" width="22" height="30" rx="6" fill="#374151" transform="rotate(-45 39 63)"/>
                <ellipse cx="39" cy="63" rx="10" ry="12" fill="#D1D5DB" transform="rotate(-45 39 63)"/>

                {/* Bottom-right hand (white sleeve) */}
                <rect x="50" y="48" width="22" height="30" rx="6" fill="#E5E7EB" transform="rotate(45 61 63)"/>
                <ellipse cx="61" cy="63" rx="10" ry="12" fill="#FDE68A" transform="rotate(45 61 63)"/>

                {/* Center overlap */}
                <circle cx="50" cy="44" r="12" fill="#F9FAFB" opacity="0.6"/>
              </svg>
            </div>

            <div style={{ fontSize: 17, fontWeight: 600, color: '#1C1C1E', textAlign: 'center', marginBottom: 20 }}>
              Create or join shared habits
            </div>

            <button
              onClick={() => {
                onCloseSheet();
                navigator.share?.({ title: 'Join my habits!', text: "Let's build habits together!" });
              }}
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                background: '#6B8CFF', border: 'none', color: '#FFFFFF',
                fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, marginBottom: 12, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Share habits with others
            </button>

            <button
              onClick={() => onCloseSheet()}
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                background: '#F4A56A', border: 'none', color: '#FFFFFF',
                fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01"/>
              </svg>
              Scan &amp; join shared habits
            </button>
          </div>
        </>
      )}
    </>
  );
}
