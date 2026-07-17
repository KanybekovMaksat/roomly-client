import { useRooms, useBookings } from '../hooks';
import { useNav } from '../store';
import { perPersonFmt, dfmt, todayStr } from '../lib/format';
import { roomStatusStyle, roomIconStyle } from '../lib/styles';
import { Loading, ErrorState } from '../ui/overlays';

// Текущая (заселён сейчас) и ближайшая будущая бронь комнаты — из общего списка
// броней. Завершённые/отменённые не учитываем.
function roomTimeline(bookings, roomId, today) {
  const live = (bookings || [])
    .filter(
      (b) =>
        String(b.roomId) === String(roomId) &&
        b.status !== 'completed' &&
        b.status !== 'cancelled',
    )
    .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1));
  const current = live.find((b) => b.checkIn <= today && today <= b.checkOut);
  const next = live.find((b) => b.checkIn > today);
  return { current, next };
}

export default function Rooms() {
  const { push } = useNav();
  const { data, isLoading, isError } = useRooms();
  const { data: bookings } = useBookings();
  const today = todayStr();

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ padding: '6px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', padding: '6px 0 14px' }}>Комнаты</div>
        <div onClick={() => push('roomForm')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#155dfc', color: '#fff', fontSize: '13px', fontWeight: 500, borderRadius: '9999px', padding: '8px 14px', cursor: 'pointer' }}><i className="ti ti-plus" />Комната</div>
      </div>
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading && <Loading />}
        {isError && <ErrorState />}
        {data?.map((r) => {
          const { current, next } = roomTimeline(bookings, r.id, today);
          return (
          <div key={r.id} onClick={() => push('roomCard', { id: r.id })} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '18px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
            <div style={roomIconStyle(r.status)}><i className="ti ti-bed-filled" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>{r.name}</span>
                <span style={roomStatusStyle(r.status)}>{r.statusLabel}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#737373', marginTop: '2px' }}>{perPersonFmt(r.pricePerDay)} · {r.capacity} мест.</div>
              {r.guest && <div style={{ fontSize: '12px', color: '#155dfc', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="ti ti-user" style={{ fontSize: '12px' }} />{r.guest}</div>}
              {current && (
                <div style={{ fontSize: '12px', color: '#525252', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><i className="ti ti-login" style={{ fontSize: '12px', color: '#16a34a' }} />{dfmt(current.checkIn)}</span>
                  <i className="ti ti-arrow-narrow-right" style={{ fontSize: '12px', color: '#a1a1a1' }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><i className="ti ti-logout" style={{ fontSize: '12px', color: '#e7000b' }} />{dfmt(current.checkOut)}</span>
                </div>
              )}
              {next && (
                <div style={{ fontSize: '11px', color: '#a1a1a1', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="ti ti-calendar-clock" style={{ fontSize: '12px' }} />
                  След. заезд {dfmt(next.checkIn)} · {next.client}
                </div>
              )}
            </div>
            <i className="ti ti-chevron-right" style={{ color: '#a1a1a1' }} />
          </div>
          );
        })}
      </div>
    </div>
  );
}
