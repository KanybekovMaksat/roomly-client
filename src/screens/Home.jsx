import { useDashboardStats, useSettings } from '../hooks';
import { useNav } from '../store';
import { mfmt } from '../lib/format';
import { Loading, ErrorState } from '../ui/overlays';

function EventList({ title, icon, headBg, headColor, items, right }) {
  const { push } = useNav();
  if (!items || items.length === 0) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden', marginTop: '12px' }}>
      <div style={{ padding: '11px 14px', background: headBg, fontSize: '12px', fontWeight: 600, color: headColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className={icon} />{title}
      </div>
      {items.map((ev) => (
        <div key={ev.id} onClick={() => push('bookingCard', { id: ev.id })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderTop: '1px solid #f5f5f5', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{ev.client}</div>
            <div style={{ fontSize: '12px', color: '#737373' }}>{ev.roomName}{ev.guests ? ` · ${ev.guests} гостя` : ''}</div>
          </div>
          {right ? right(ev) : <i className="ti ti-chevron-right" style={{ color: '#a1a1a1' }} />}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { push, tab } = useNav();
  const { data, isLoading, isError } = useDashboardStats();
  const { data: settings } = useSettings();

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#737373' }}>Гостевой дом «{settings?.houseName || 'Береке'}»</div>
          <div style={{ fontSize: '22px', lineHeight: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>{settings?.hotelName || 'Roomly'}</div>
        </div>
        <div onClick={() => push('settings')} style={{ width: '42px', height: '42px', borderRadius: '9999px', background: '#fff', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}>
          <i className="ti ti-settings" />
        </div>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorState />}
      {data && (
        <>
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#fff', border: '1px solid #edf2ff', borderRadius: '18px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#00a63e' }}><i className="ti ti-door-enter" style={{ fontSize: '18px' }} /><span style={{ fontSize: '12px', color: '#737373' }}>Свободно</span></div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.1, marginTop: '6px' }}>{data.freeRooms}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #edf2ff', borderRadius: '18px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#155dfc' }}><i className="ti ti-bed-filled" style={{ fontSize: '18px' }} /><span style={{ fontSize: '12px', color: '#737373' }}>Занято</span></div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.1, marginTop: '6px' }}>{data.occRooms}</div>
            </div>
          </div>

          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '12px 14px' }}>
              <div style={{ fontSize: '12px', color: '#737373', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="ti ti-login-2" style={{ color: '#155dfc' }} />Заезды сегодня</div>
              <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{data.checkinsToday}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '12px 14px' }}>
              <div style={{ fontSize: '12px', color: '#737373', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="ti ti-logout-2" style={{ color: '#fd9a00' }} />Выезды сегодня</div>
              <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{data.checkoutsToday}</div>
            </div>
          </div>

          <div style={{ padding: '12px 20px 0' }}>
            <div style={{ background: 'linear-gradient(135deg,#155dfc,#2b7fff)', borderRadius: '20px', padding: '16px 18px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Доход за сегодня</div>
                <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '2px' }}>{mfmt(data.incomeToday)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>За месяц</div>
                <div style={{ fontSize: '17px', fontWeight: 600, marginTop: '2px' }}>{mfmt(data.incomeMonth)}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#737373', marginBottom: '10px' }}>Быстрые действия</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <QuickAction onClick={() => push('bookingForm')} bg="#eff6ff" color="#155dfc" icon="ti ti-calendar-plus" label={<>Новое<br />бронирование</>} />
              <QuickAction onClick={() => push('roomForm')} bg="#eafff2" color="#00a63e" icon="ti ti-door" label={<>Добавить<br />комнату</>} />
              <QuickAction onClick={() => tab('bookings')} bg="#fff7ed" color="#ff8904" icon="ti ti-cash" label={<>Добавить<br />оплату</>} />
            </div>
          </div>

          <div style={{ padding: '18px 20px 0' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#737373', marginBottom: '10px' }}>Ближайшие события</div>

            {data.overdue?.length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #ffe2e2', borderRadius: '16px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#e7000b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><i className="ti ti-alert-triangle-filled" />Просроченные оплаты</div>
                {data.overdue.map((ev) => (
                  <div key={ev.id} onClick={() => push('bookingCard', { id: ev.id })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', cursor: 'pointer' }}>
                    <div><div style={{ fontSize: '14px', fontWeight: 500 }}>{ev.client}</div><div style={{ fontSize: '12px', color: '#737373' }}>{ev.roomName}</div></div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#e7000b' }}>{mfmt(ev.remaining)}</div>
                  </div>
                ))}
              </div>
            )}

            <EventList title="Сегодняшние заезды" icon="ti ti-login-2" headBg="#f0f6ff" headColor="#155dfc" items={data.arrivalsToday} />
            <EventList title="Сегодняшние выезды" icon="ti ti-logout-2" headBg="#fff8ef" headColor="#c2410c" items={data.departuresToday} />
            <EventList title="Ближайшие заезды" icon="ti ti-calendar-clock" headBg="#f7f7f7" headColor="#525252" items={data.upcomingArrivals}
              right={(ev) => <div style={{ fontSize: '13px', fontWeight: 600, color: '#155dfc' }}>{ev.checkIn?.split('-').reverse().slice(0, 2).join('.')}</div>} />
          </div>
        </>
      )}
      <div style={{ height: '24px' }} />
    </div>
  );
}

function QuickAction({ onClick, bg, color, icon, label }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <span style={{ width: '40px', height: '40px', borderRadius: '9999px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><i className={icon} /></span>
      <span style={{ fontSize: '11px', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}
