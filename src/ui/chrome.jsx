import { useEffect, useState } from 'react';
import { useNav } from '../store';

export function StatusBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{
      height: '50px', flexShrink: 0, display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', padding: '0 28px 8px', background: '#fff',
    }}>
      <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>{time}</span>
      <span style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '16px', color: '#0a0a0a' }}>
        <i className="ti ti-signal-4g" />
        <i className="ti ti-wifi" />
        <i className="ti ti-battery-3" />
      </span>
    </div>
  );
}

const NAV = [
  ['home', 'Главная', 'ti ti-smart-home'],
  ['bookings', 'Брони', 'ti ti-calendar-event'],
  ['rooms', 'Комнаты', 'ti ti-door'],
  ['finance', 'Финансы', 'ti ti-chart-bar'],
  ['more', 'Ещё', 'ti ti-dots'],
];

export function BottomNav() {
  const { rootTab, tab } = useNav();
  return (
    <div style={{
      flexShrink: 0, background: '#fff', borderTop: '1px solid #f0f0f0',
      display: 'flex', padding: '8px 8px 22px',
    }}>
      {NAV.map(([key, lbl, icon]) => {
        const active = rootTab === key;
        return (
          <div key={key} onClick={() => tab(key)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px', padding: '4px 0', cursor: 'pointer',
          }}>
            <i className={icon} style={{ fontSize: '23px', color: active ? '#155dfc' : '#a1a1a1' }} />
            <span style={{ fontSize: '10px', fontWeight: active ? 600 : 500, color: active ? '#155dfc' : '#a1a1a1' }}>
              {lbl}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Fab({ onClick }) {
  return (
    <div onClick={onClick} style={{
      position: 'absolute', bottom: '86px', right: '18px', width: '56px', height: '56px',
      borderRadius: '9999px', background: '#155dfc', color: '#fff', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '28px',
      boxShadow: '0 8px 22px -4px rgba(21,93,252,0.55)', zIndex: 20, cursor: 'pointer',
    }}>
      <i className="ti ti-plus" />
    </div>
  );
}
