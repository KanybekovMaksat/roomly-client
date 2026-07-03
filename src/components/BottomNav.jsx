import { useNavigate, useLocation } from 'react-router-dom';
import { IconHome, IconCalendarEvent, IconDoor, IconChartBar, IconDots } from '@tabler/icons-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavColor = (path) => {
    return location.pathname === path ? 'var(--color-primary)' : 'var(--text-secondary)';
  };
  
  const getNavWeight = (path) => {
    return location.pathname === path ? 600 : 500;
  };

  const navItemStyle = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '4px', 
    cursor: 'pointer',
    flex: 1,
    padding: '8px 0'
  };

  return (
    <div style={{ padding: '8px 16px 24px', background: '#fff', borderTop: '1px solid var(--color-border-dark)', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
      <div onClick={() => navigate('/home')} style={{...navItemStyle, color: getNavColor('/home')}}>
        <IconHome size={26} stroke={location.pathname === '/home' ? 2.5 : 1.5} />
        <span style={{fontSize: '11px', fontWeight: getNavWeight('/home')}}>Главная</span>
      </div>
      <div onClick={() => navigate('/bookings')} style={{...navItemStyle, color: getNavColor('/bookings')}}>
        <IconCalendarEvent size={26} stroke={location.pathname === '/bookings' ? 2.5 : 1.5} />
        <span style={{fontSize: '11px', fontWeight: getNavWeight('/bookings')}}>Брони</span>
      </div>
      <div onClick={() => navigate('/rooms')} style={{...navItemStyle, color: getNavColor('/rooms')}}>
        <IconDoor size={26} stroke={location.pathname === '/rooms' ? 2.5 : 1.5} />
        <span style={{fontSize: '11px', fontWeight: getNavWeight('/rooms')}}>Комнаты</span>
      </div>
      <div onClick={() => navigate('/finance')} style={{...navItemStyle, color: getNavColor('/finance')}}>
        <IconChartBar size={26} stroke={location.pathname === '/finance' ? 2.5 : 1.5} />
        <span style={{fontSize: '11px', fontWeight: getNavWeight('/finance')}}>Финансы</span>
      </div>
      <div onClick={() => navigate('/settings')} style={{...navItemStyle, color: getNavColor('/settings')}}>
        <IconDots size={26} stroke={location.pathname === '/settings' ? 2.5 : 1.5} />
        <span style={{fontSize: '11px', fontWeight: getNavWeight('/settings')}}>Ещё</span>
      </div>
    </div>
  );
}
