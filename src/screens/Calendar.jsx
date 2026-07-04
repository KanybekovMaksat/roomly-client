import { useState } from 'react';
import { useBookings, useRooms } from '../hooks';
import { useModals, useNav } from '../store';
import { todayStr, dfmtY, dfmt, monthName } from '../lib/format';
import { headerBar, roundBtn } from '../lib/styles';
import { Loading } from '../ui/overlays';

const surnameShort = (name) => {
  const p = (name || '').trim().split(' ');
  const s = p.length > 1 ? p[p.length - 1] : p[0];
  return s.slice(0, 4);
};
const pad = (n) => String(n).padStart(2, '0');

export default function Calendar() {
  const { back, push } = useNav();
  const { openDaySheet } = useModals();
  const today = todayStr();
  const [selDate, setSelDate] = useState(today);
  const { data: bookings, isLoading } = useBookings('', 'Все');
  const { data: rooms } = useRooms();

  const now = new Date(today);
  const y = now.getFullYear();
  const mo = now.getMonth();
  const first = new Date(y, mo, 1);
  const startDow = (first.getDay() + 6) % 7; // Пн = 0
  const daysIn = new Date(y, mo + 1, 0).getDate();

  const active = (bookings || []).filter((b) => b.status !== 'completed' && b.status !== 'cancelled');

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) {
    const ds = `${y}-${pad(mo + 1)}-${pad(d)}`;
    const occs = active.filter((b) => b.checkIn <= ds && ds < b.checkOut);
    cells.push({ d, ds, occs, isToday: ds === today, isSel: ds === selDate });
  }

  const onCell = (c) => {
    setSelDate(c.ds);
    if (c.occs.length > 0) {
      const list = c.occs.map((b) => ({ id: b.id, client: b.client, roomName: b.roomName, range: `${dfmt(b.checkIn)} – ${dfmt(b.checkOut)}`, payStatus: b.payStatus }));
      openDaySheet(c.ds, list);
    }
  };

  const selArrivals = active.filter((b) => b.checkIn === selDate);
  const selDepartures = active.filter((b) => b.checkOut === selDate);
  const activeRooms = (rooms || []).filter((r) => r.active);
  const occRoomsCount = activeRooms.filter((r) => active.find((b) => b.roomId === r.id && b.checkIn <= selDate && selDate < b.checkOut)).length;

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={headerBar}>
        <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>{monthName(mo)} {y}</div>
      </div>
      {isLoading && <Loading />}
      {bookings && (
        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px', padding: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '6px' }}>
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => <div key={w} style={{ textAlign: 'center', fontSize: '11px', color: '#a1a1a1', fontWeight: 500 }}>{w}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
              {cells.map((c, i) => {
                if (!c) return <div key={`e${i}`} />;
                const occupied = c.occs.length > 0;
                const name = occupied ? surnameShort(c.occs[0].client) + (c.occs.length > 1 ? ` +${c.occs.length - 1}` : '') : '';
                return (
                  <div key={c.ds} onClick={() => onCell(c)} style={{
                    aspectRatio: '1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', padding: '2px 0',
                    background: c.isSel ? '#155dfc' : (occupied ? '#fef2f2' : (c.isToday ? '#eff6ff' : 'transparent')),
                    border: c.isSel ? 'none' : (c.isToday ? '1px solid #155dfc' : '1px solid transparent'),
                    color: c.isSel ? '#fff' : (occupied ? '#e7000b' : '#0a0a0a'),
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: c.isToday || c.isSel || occupied ? 700 : 500, lineHeight: 1 }}>{c.d}</span>
                    {occupied && <span style={{ fontSize: '8px', fontWeight: 600, marginTop: '1px', lineHeight: 1, whiteSpace: 'nowrap', color: c.isSel ? '#ffffffcc' : '#e7000b' }}>{name}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f5f5f5', fontSize: '12px', color: '#737373' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', borderRadius: '5px', background: '#fef2f2', border: '1px solid #ffd5d9' }} />Занято</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', borderRadius: '5px', background: '#fff', border: '1px solid #e5e5e5' }} />Свободно</span>
            </div>
          </div>

          <div style={{ margin: '18px 4px 12px', fontSize: '15px', fontWeight: 600 }}>{dfmtY(selDate)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#eafff2', border: '1px solid #c3f2d5', borderRadius: '16px', padding: '13px' }}><div style={{ fontSize: '12px', color: '#00a63e' }}>Свободно</div><div style={{ fontSize: '22px', fontWeight: 700, color: '#00a63e', marginTop: '2px' }}>{activeRooms.length - occRoomsCount}</div></div>
            <div style={{ background: '#eff6ff', border: '1px solid #d7e6ff', borderRadius: '16px', padding: '13px' }}><div style={{ fontSize: '12px', color: '#155dfc' }}>Занято</div><div style={{ fontSize: '22px', fontWeight: 700, color: '#155dfc', marginTop: '2px' }}>{occRoomsCount}</div></div>
          </div>

          {selArrivals.length > 0 && (
            <>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#155dfc', margin: '4px 4px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="ti ti-login-2" />Заезды</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {selArrivals.map((b) => <DayRow key={b.id} b={b} onClick={() => push('bookingCard', { id: b.id })} />)}
              </div>
            </>
          )}
          {selDepartures.length > 0 && (
            <>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#c2410c', margin: '4px 4px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="ti ti-logout-2" />Выезды</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selDepartures.map((b) => <DayRow key={b.id} b={b} onClick={() => push('bookingCard', { id: b.id })} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const DayRow = ({ b, onClick }) => (
  <div onClick={onClick} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
    <div><div style={{ fontSize: '14px', fontWeight: 600 }}>{b.client}</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>{b.roomName}</div></div>
    <i className="ti ti-chevron-right" style={{ color: '#a1a1a1' }} />
  </div>
);
