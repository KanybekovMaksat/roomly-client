import { useRoom } from '../hooks';
import { useNav } from '../store';
import { perPersonFmt, mfmt, dfmtY, dateRange } from '../lib/format';
import { roomStatusStyle, payStyle, headerBar, roundBtn } from '../lib/styles';
import { Loading, ErrorState } from '../ui/overlays';

export default function RoomCard({ id }) {
  const { back, push } = useNav();
  const { data: r, isLoading, isError } = useRoom(id);
  const guest = r?.currentGuest;

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ ...headerBar, justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>Комната</div>
        </div>
        <div onClick={() => push('roomForm', { id })} style={{ ...roundBtn, fontSize: '20px', color: '#155dfc' }}><i className="ti ti-edit" /></div>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorState />}
      {r && (
        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{r.name}</div>
              <div style={roomStatusStyle(r.status)}>{r.statusLabel}</div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '14px' }}>
              <div><div style={{ fontSize: '11px', color: '#a1a1a1' }}>Стоимость</div><div style={{ fontSize: '16px', fontWeight: 700, marginTop: '1px' }}>{perPersonFmt(r.pricePerDay)}</div></div>
              <div><div style={{ fontSize: '11px', color: '#a1a1a1' }}>Мест</div><div style={{ fontSize: '16px', fontWeight: 700, marginTop: '1px' }}>{r.capacity}</div></div>
            </div>
            {r.description && <div style={{ marginTop: '14px', fontSize: '13px', color: '#525252', lineHeight: 1.5 }}>{r.description}</div>}
          </div>

          {guest && (
            <div onClick={() => push('bookingCard', { id: guest.id })} style={{ background: '#eff6ff', border: '1px solid #d7e6ff', borderRadius: '20px', padding: '16px', marginTop: '12px', cursor: 'pointer' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#155dfc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="ti ti-user-filled" />Текущий гость</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ fontSize: '16px', fontWeight: 600 }}>{guest.client}</div><i className="ti ti-chevron-right" style={{ color: '#155dfc' }} /></div>
              <div style={{ fontSize: '13px', color: '#525252', marginTop: '2px' }}>{guest.phone}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #d7e6ff' }}>
                <div><div style={{ fontSize: '11px', color: '#737373' }}>Заезд</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{dfmtY(guest.checkIn)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '11px', color: '#737373' }}>Выезд</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{dfmtY(guest.checkOut)}</div></div>
                <div><div style={{ fontSize: '11px', color: '#737373' }}>Гостей</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{guest.guests}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '11px', color: '#737373' }}>Итоговая цена</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{mfmt(guest.totalPrice)}</div></div>
                {guest.remaining > 0 && <div><div style={{ fontSize: '11px', color: '#737373' }}>Остаток</div><div style={{ fontSize: '14px', fontWeight: 600, color: '#e7000b' }}>{mfmt(guest.remaining)}</div></div>}
              </div>
            </div>
          )}

          <div onClick={() => push('bookingForm', { roomId: id })} style={{ textAlign: 'center', padding: '13px 0', borderRadius: '14px', background: '#155dfc', color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}><i className="ti ti-calendar-plus" />Забронировать</div>

          <div style={{ fontSize: '13px', fontWeight: 600, color: '#737373', margin: '20px 4px 10px' }}>История бронирований</div>
          {(!r.history || r.history.length === 0) && <div style={{ background: '#fff', border: '1px dashed #e5e5e5', borderRadius: '16px', padding: '20px', textAlign: 'center', color: '#a1a1a1', fontSize: '13px' }}>Бронирований пока нет</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {r.history?.map((b) => (
              <div key={b.id} onClick={() => push('bookingCard', { id: b.id })} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div><div style={{ fontSize: '14px', fontWeight: 600 }}>{b.client}</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>{dateRange(b.checkIn, b.checkOut)} · {b.days} сут.</div></div>
                <div style={payStyle(b.payStatus)}>{b.payStatus}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
