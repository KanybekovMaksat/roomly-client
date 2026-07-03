import { IconSettings, IconDoorEnter, IconBedFilled, IconLogin2, IconLogout2, IconCalendarPlus, IconDoor, IconCash, IconAlertTriangleFilled, IconLogin } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    }
  });

  const formatMoney = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' сом';
  };

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)' }}>
      {/* Header */}
      <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Гостевой дом «Береке»</div>
          <div style={{ fontSize: '22px', lineHeight: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>Главная</div>
        </div>
        <div onClick={() => navigate('/settings')} style={{ cursor: 'pointer', width: '42px', height: '42px', borderRadius: '9999px', background: '#fff', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--text-primary)' }}>
          <IconSettings size={22} />
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>Загрузка данных...</div>
      ) : isError ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-warning)', background: 'var(--bg-surface)' }}>Ошибка загрузки статистики</div>
      ) : (
        <div style={{ background: 'var(--bg-surface)' }}>
          {/* Stat grid */}
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#fff', border: '1px solid var(--color-border-light)', borderRadius: '18px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--color-success)' }}>
                <IconDoorEnter size={18} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Свободно</span>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.1, marginTop: '6px' }}>{stats?.freeRooms || 0}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--color-border-light)', borderRadius: '18px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--color-primary)' }}>
                <IconBedFilled size={18} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Занято</span>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.1, marginTop: '6px' }}>{stats?.occRooms || 0}</div>
            </div>
          </div>

          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '12px 14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconLogin2 size={16} color="var(--color-primary)" />Заезды сегодня
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{stats?.checkinsToday || 0}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '12px 14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconLogout2 size={16} color="var(--color-warning)" />Выезды сегодня
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{stats?.checkoutsToday || 0}</div>
            </div>
          </div>

          {/* Income */}
          <div style={{ padding: '12px 20px 24px' }}>
            <div style={{ background: 'linear-gradient(135deg, #155dfc, #2b7fff)', borderRadius: '20px', padding: '16px 18px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Доход за сегодня</div>
                <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '2px' }}>{stats?.incomeTodayFmt || '0 KGS'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>За месяц</div>
                <div style={{ fontSize: '17px', fontWeight: 600, marginTop: '2px' }}>{stats?.incomeMonthFmt || '0 KGS'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px' }}>Быстрые действия</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div onClick={() => navigate('/bookings')} style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '20px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCalendarPlus size={24} />
            </span>
            <span style={{ fontSize: '12px', textAlign: 'center', fontWeight: 500, lineHeight: 1.2 }}>Новое<br/>бронирование</span>
          </div>
          <div onClick={() => navigate('/rooms')} style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '20px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconDoor size={24} />
            </span>
            <span style={{ fontSize: '12px', textAlign: 'center', fontWeight: 500, lineHeight: 1.2 }}>Добавить<br/>комнату</span>
          </div>
          <div onClick={() => navigate('/bookings')} style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '20px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCash size={24} />
            </span>
            <span style={{ fontSize: '12px', textAlign: 'center', fontWeight: 500, lineHeight: 1.2 }}>Добавить<br/>оплату</span>
          </div>
        </div>
      </div>

      {/* Events */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px' }}>Ближайшие события</div>
        
        {stats?.overdue?.length > 0 && (
          <div style={{ background: '#fff5f5', border: '1px solid #ffe3e3', borderRadius: '24px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
              <IconAlertTriangleFilled size={18} />
              Просроченные оплаты
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.overdue.map((booking, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{booking.client}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{booking.roomName || 'Без комнаты'}</div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-danger)' }}>
                    {formatMoney(booking.totalPrice - booking.paid)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.arrivalsToday?.length > 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--color-primary-light)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
              <IconLogin size={18} />
              Сегодняшние заезды
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {stats.arrivalsToday.map((booking, idx) => (
                <div key={idx} style={{ padding: '16px 20px', borderBottom: idx !== stats.arrivalsToday.length - 1 ? '1px solid var(--color-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{booking.client}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{booking.roomName || 'Без комнаты'} · {booking.guests || 1} гостя</div>
                  </div>
                  <div style={{ color: 'var(--color-border-dark)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--color-primary-light)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
              <IconLogin size={18} />
              Сегодняшние заезды
            </div>
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Нет заездов на сегодня</div>
          </div>
        )}
      </div>
      
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
