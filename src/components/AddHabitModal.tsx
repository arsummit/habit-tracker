import { useState } from 'react';

const EMOJIS = ['💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎨', '🎸', '🧹', '💊', '🌿', '🐕', '🚴'];
const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFCC00'];

interface Props {
  onAdd: (name: string, emoji: string, color: string) => void;
  onClose: () => void;
}

export default function AddHabitModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');
  const [color, setColor] = useState('#007AFF');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), emoji, color);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: '#E5E5EA', borderRadius: 2, margin: '0 auto 20px' }} />

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>New Habit</h2>

        {/* Name input */}
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Habit name..."
          maxLength={40}
          style={{
            width: '100%', padding: '14px 16px',
            borderRadius: 14, border: '1.5px solid #E5E5EA',
            fontSize: 16, outline: 'none', background: '#F2F2F7',
            marginBottom: 20,
          }}
        />

        {/* Emoji picker */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#8E8E93', fontWeight: 600, marginBottom: 10 }}>ICON</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 24, padding: '6px', borderRadius: 10,
                  background: emoji === e ? '#F2F2F7' : 'transparent',
                  border: emoji === e ? '2px solid #2C2C2E' : '2px solid transparent',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#8E8E93', fontWeight: 600, marginBottom: 10 }}>COLOR</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: c,
                  border: color === c ? '3px solid #2C2C2E' : '3px solid transparent',
                  outline: color === c ? '2px solid #FFFFFF' : 'none',
                  outlineOffset: -4,
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '16px',
            background: name.trim() ? '#2C2C2E' : '#E5E5EA',
            color: name.trim() ? '#FFFFFF' : '#8E8E93',
            borderRadius: 16, fontSize: 16, fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          Add Habit
        </button>
      </div>
    </div>
  );
}
