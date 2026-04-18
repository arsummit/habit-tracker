import { useState, useRef, useEffect } from 'react';
import { Habit } from '../types';

interface Props {
  habits: Habit[];
  onReorder: (habits: Habit[]) => void;
  onClose: () => void;
}

interface DragState {
  index: number;
  startY: number;
  offsetY: number;
  rowH: number;
}

export default function ReorderModal({ habits: initialHabits, onReorder, onClose }: Props) {
  const [list, setList] = useState(initialHabits);
  const [drag, setDrag] = useState<DragState | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const hoverIndex = drag
    ? Math.max(0, Math.min(list.length - 1, drag.index + Math.round(drag.offsetY / drag.rowH)))
    : null;

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      setDrag(prev => prev ? { ...prev, offsetY: e.touches[0].clientY - prev.startY } : null);
    };

    const onEnd = () => {
      setDrag(prev => {
        if (!prev) return null;
        const hi = Math.max(0, Math.min(list.length - 1,
          prev.index + Math.round(prev.offsetY / prev.rowH)));
        if (hi !== prev.index) {
          setList(cur => {
            const next = [...cur];
            const [item] = next.splice(prev.index, 1);
            next.splice(hi, 0, item);
            return next;
          });
        }
        return null;
      });
    };

    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [drag, list.length]);

  const handleClose = () => {
    onReorder(list);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80 }}>
      {/* Backdrop */}
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#F2F2F7',
        borderRadius: '20px 20px 0 0',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, background: '#C7C7CC', borderRadius: 2, margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>Reorder Habits</span>
          <button
            onClick={handleClose}
            style={{ fontSize: 15, fontWeight: 600, color: '#007AFF', background: 'none', border: 'none' }}
          >
            Done
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0 16px' }}>
          {list.map((habit, i) => {
            const isDragging = drag?.index === i;

            let shiftY = 0;
            if (drag && !isDragging && hoverIndex !== null) {
              const { index: from } = drag;
              if (from < hoverIndex && i > from && i <= hoverIndex) shiftY = -(drag.rowH);
              if (from > hoverIndex && i >= hoverIndex && i < from) shiftY = drag.rowH;
            }

            return (
              <div
                key={habit.id}
                ref={el => { if (el) rowRefs.current.set(i, el); else rowRefs.current.delete(i); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 20px',
                  background: isDragging ? '#E8E8ED' : 'transparent',
                  transform: isDragging
                    ? `translateY(${drag.offsetY}px) scale(1.02)`
                    : `translateY(${shiftY}px)`,
                  transition: isDragging ? 'box-shadow 0.1s' : 'transform 0.15s ease',
                  zIndex: isDragging ? 10 : 1,
                  position: 'relative',
                  boxShadow: isDragging ? '0 6px 20px rgba(0,0,0,0.12)' : 'none',
                  borderRadius: isDragging ? 12 : 0,
                }}
              >
                {/* Emoji */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: '#E5E5EA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {habit.emoji}
                </div>

                {/* Name */}
                <span style={{ flex: 1, fontSize: 17, fontWeight: 500, color: '#1C1C1E' }}>
                  {habit.name}
                </span>

                {/* Drag handle */}
                <div
                  onTouchStart={e => {
                    e.preventDefault();
                    const el = rowRefs.current.get(i);
                    const rowH = (el?.getBoundingClientRect().height ?? 60);
                    setDrag({ index: i, startY: e.touches[0].clientY, offsetY: 0, rowH });
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 4,
                    padding: '8px 4px', cursor: 'grab', touchAction: 'none',
                  }}
                >
                  {[0,1,2].map(k => (
                    <div key={k} style={{ width: 20, height: 2, borderRadius: 1, background: '#C7C7CC' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
