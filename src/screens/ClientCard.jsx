import { useClient } from '../hooks';
import { useNav } from '../store';
import { mfmt, dfmtY, dateRange, methodIcon } from '../lib/format';
import { payStyle, headerBar, roundBtn } from '../lib/styles';
import { Loading, ErrorState } from '../ui/overlays';

export default function ClientCard({ id }) {
  const { back, push } = useNav();
  const { data: c, isLoading, isError } = useClient(id);

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ ...headerBar, position: 'sticky', top: 0, zIndex: 5 }}>
        <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Клиент</div>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorState />}
      {c && (
        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '9999px', background: '#eff6ff', color: '#155dfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}><i className="ti ti-user" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '19px', fontWeight: 700 }}>{c.name}</div>
              <a href={`tel:${c.phone}`} style={{ fontSize: '13px', color: '#155dfc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', whiteSpace: 'nowrap' }}><i className="ti ti-phone" />{c.phone || '—'}</a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '14px' }}><div style={{ fontSize: '12px', color: '#737373' }}>Посещений</div><div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{c.visits}</div></div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '14px' }}><div style={{ fontSize: '12px', color: '#737373' }}>Сумма оплат</div><div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{mfmt(c.totalSpent)}</div></div>
          </div>

          {c.note && <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '14px', padding: '11px 14px', marginTop: '12px', fontSize: '13px', color: '#9a3412', display: 'flex', gap: '8px' }}><i className="ti ti-note" style={{ marginTop: '2px' }} /><span>{c.note}</span></div>}

          <div style={{ fontSize: '13px', fontWeight: 600, color: '#737373', margin: '20px 4px 10px' }}>История проживаний</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {c.bookings?.map((b) => (
              <div key={b.id} onClick={() => push('bookingCard', { id: b.id })} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div><div style={{ fontSize: '14px', fontWeight: 600 }}>{b.roomName}</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>{dateRange(b.checkIn, b.checkOut)} · {b.days} сут.</div></div>
                <div style={payStyle(b.payStatus)}>{b.payStatus}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, color: '#737373', margin: '20px 4px 10px' }}>История платежей</div>
          {(!c.payments || c.payments.length === 0) && <div style={{ background: '#fff', border: '1px dashed #e5e5e5', borderRadius: '16px', padding: '18px', textAlign: 'center', color: '#a1a1a1', fontSize: '13px' }}>Платежей нет</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {c.payments?.map((p) => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', color: '#155dfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}><i className={methodIcon(p.method)} /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: '14px', fontWeight: 600 }}>{mfmt(p.amount)}</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>{p.room ? `${p.room} · ` : ''}{p.method}</div></div>
                <div style={{ fontSize: '12px', color: '#737373' }}>{dfmtY(p.date)}</div>
              </div>
            ))}
          </div>

          <div onClick={() => push('bookingForm')} style={{ textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: '#155dfc', color: '#fff', fontSize: '15px', fontWeight: 600, marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}><i className="ti ti-calendar-plus" />Новое бронирование</div>
        </div>
      )}
    </div>
  );
}
