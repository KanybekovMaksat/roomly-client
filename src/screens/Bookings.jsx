import { useState } from 'react';
import { useBookings } from '../hooks';
import { useNav } from '../store';
import { mfmt, dateRange } from '../lib/format';
import { payStyle } from '../lib/styles';
import { Loading, ErrorState } from '../ui/overlays';

const FILTERS = ['Все', 'Активные', 'Будущие', 'Завершённые', 'Не оплачено'];

export default function Bookings() {
  const { push } = useNav();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Все');
  const { data, isLoading, isError } = useBookings(search, filter);

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '6px 20px 0', background: '#fafafa', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', paddingBottom: '10px' }}>Бронирования</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '9999px', padding: '10px 14px' }}>
          <i className="ti ti-search" style={{ color: '#a1a1a1' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Имя, телефон или комната" style={{ border: 'none', flex: 1, fontSize: '14px', background: 'transparent' }} />
          {search && <i onClick={() => setSearch('')} className="ti ti-x" style={{ color: '#a1a1a1', cursor: 'pointer' }} />}
        </div>
        <div className="scr" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0' }}>
          {FILTERS.map((f) => {
            const a = filter === f;
            return (
              <div key={f} onClick={() => setFilter(f)} style={{ fontSize: '13px', fontWeight: 500, padding: '7px 14px', borderRadius: '9999px', whiteSpace: 'nowrap', cursor: 'pointer', border: `1px solid ${a ? '#155dfc' : '#e5e5e5'}`, background: a ? '#155dfc' : '#fff', color: a ? '#fff' : '#525252' }}>{f}</div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading && <Loading />}
        {isError && <ErrorState />}
        {data?.map((b) => (
          <div key={b.id} onClick={() => push('bookingCard', { id: b.id })} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '18px', padding: '14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>{b.client}</span>
                <span style={{ fontSize: '12px', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}><i className="ti ti-phone" style={{ fontSize: '12px' }} />{b.phone || '—'}</span>
              </div>
              <div style={payStyle(b.payStatus)}>{b.payStatus}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 500, background: '#f5f5f5', borderRadius: '9999px', padding: '4px 10px', flexShrink: 0 }}><i className="ti ti-door" style={{ fontSize: '14px', color: '#155dfc' }} />{b.roomName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#525252', flexShrink: 0 }}><i className="ti ti-calendar" style={{ fontSize: '14px', color: '#a1a1a1' }} />{dateRange(b.checkIn, b.checkOut)} · {b.days} сут.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
              <div><div style={{ fontSize: '11px', color: '#a1a1a1' }}>Стоимость</div><div style={{ fontSize: '16px', fontWeight: 700 }}>{mfmt(b.totalPrice)}</div></div>
              {b.remaining > 0 && <div style={{ textAlign: 'right' }}><div style={{ fontSize: '11px', color: '#a1a1a1' }}>Остаток</div><div style={{ fontSize: '16px', fontWeight: 700, color: '#e7000b' }}>{mfmt(b.remaining)}</div></div>}
            </div>
          </div>
        ))}
        {data && data.length === 0 && (
          <div style={{ textAlign: 'center', color: '#a1a1a1', padding: '48px 0', fontSize: '14px' }}>
            <i className="ti ti-calendar-off" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }} />Ничего не найдено
          </div>
        )}
      </div>
    </div>
  );
}
