import { useBooking, useCompleteBooking, useDeleteBooking } from '../hooks';
import { useModals, useNav, useToast } from '../store';
import { mfmt, dfmtY, dateRange, methodIcon } from '../lib/format';
import { bookingStatusStyle, bookingStatusLabel, headerBar, roundBtn } from '../lib/styles';
import { Loading, ErrorState } from '../ui/overlays';

export default function BookingCard({ id }) {
  const { back, push } = useNav();
  const { openPay, openEditPay, openExtend, askConfirm } = useModals();
  const toast = useToast();
  const { data: b, isLoading, isError } = useBooking(id);
  const complete = useCompleteBooking();
  const del = useDeleteBooking();

  const onComplete = () =>
    askConfirm({
      title: 'Завершить проживание?',
      text: 'Комната станет свободной, бронь перейдёт в завершённые.',
      btn: 'Завершить', danger: false,
      onConfirm: async () => { await complete.mutateAsync(id); back(); toast.show('Проживание завершено'); },
    });
  const onDelete = () =>
    askConfirm({
      title: 'Удалить бронирование?', text: 'Действие нельзя отменить.',
      btn: 'Удалить', danger: true,
      onConfirm: async () => { await del.mutateAsync(id); back(); toast.show('Бронирование удалено'); },
    });

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ ...headerBar, position: 'sticky', top: 0, zIndex: 5 }}>
        <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Бронирование</div>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorState />}
      {b && (
        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{b.client}</div>
                <a href={`tel:${b.phone}`} style={{ fontSize: '13px', color: '#155dfc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', whiteSpace: 'nowrap' }}><i className="ti ti-phone" />{b.phone || '—'}</a>
              </div>
              <div style={bookingStatusStyle(b.status)}>{bookingStatusLabel(b.status)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <Field label="Комната" value={b.roomName} />
              <Field label="Гостей" value={b.guests} />
              <Field label="Проживание" value={dateRange(b.checkIn, b.checkOut)} />
              <Field label="Суток" value={b.days} />
            </div>
            {b.comment && <div style={{ marginTop: '14px', background: '#f7f7f7', borderRadius: '12px', padding: '10px 12px', fontSize: '13px', color: '#525252' }}>{b.comment}</div>}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px', padding: '16px', marginTop: '12px' }}>
            <Row label={`Цена за человека${b.guests > 1 ? ` · ${b.guests} гост.` : ''}`} value={mfmt(b.pricePerDay)} />
            <Row label="Общая стоимость" value={mfmt(b.totalPrice)} />
            <Row label="Оплачено" value={mfmt(b.paid)} valueColor="#00a63e" />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 2px', fontSize: '16px', borderTop: '1px solid #f5f5f5', marginTop: '4px' }}>
              <span style={{ fontWeight: 600 }}>Осталось оплатить</span>
              <span style={{ fontWeight: 700, color: '#e7000b' }}>{mfmt(b.remaining)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 4px 10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#737373' }}>История оплат</div>
            {b.payments?.length > 0 && <div style={{ fontSize: '11px', color: '#a1a1a1' }}>нажмите, чтобы исправить</div>}
          </div>
          {(!b.payments || b.payments.length === 0) && (
            <div style={{ background: '#fff', border: '1px dashed #e5e5e5', borderRadius: '16px', padding: '20px', textAlign: 'center', color: '#a1a1a1', fontSize: '13px' }}>Оплат ещё не было</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {b.payments?.map((p, i) => (
              <div key={p.id} onClick={() => openEditPay(p)} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#155dfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}><i className={methodIcon(p.method)} /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: '14px', fontWeight: 600 }}>{mfmt(p.amount)}{i === 0 && <span style={{ fontSize: '11px', fontWeight: 500, color: '#155dfc', marginLeft: '6px' }}>предоплата</span>}</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>{p.method}</div></div>
                <div style={{ fontSize: '12px', color: '#737373' }}>{dfmtY(p.date)}</div>
                <i className="ti ti-pencil" style={{ fontSize: '15px', color: '#c0c0c0' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
            <Action onClick={() => openPay(b.id)} bg="#155dfc" color="#fff" icon="ti ti-cash" label="Оплата" />
            <Action onClick={() => openExtend(b.id)} bg="#eff6ff" color="#155dfc" icon="ti ti-calendar-plus" label="Продлить" />
            <Action onClick={() => push('bookingForm', { id: b.id })} bg="#f5f5f5" color="#0a0a0a" icon="ti ti-edit" label="Изменить" />
            {b.status !== 'completed' && <Action onClick={onComplete} bg="#eafff2" color="#00a63e" icon="ti ti-circle-check" label="Завершить" />}
          </div>
          <div onClick={onDelete} style={{ textAlign: 'center', padding: '13px 0', borderRadius: '14px', color: '#e7000b', fontSize: '14px', fontWeight: 600, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}><i className="ti ti-trash" />Удалить бронирование</div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, value }) => (
  <div><div style={{ fontSize: '11px', color: '#a1a1a1' }}>{label}</div><div style={{ fontSize: '14px', fontWeight: 600, marginTop: '1px' }}>{value}</div></div>
);
const Row = ({ label, value, valueColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px' }}><span style={{ color: '#737373' }}>{label}</span><span style={{ fontWeight: 600, color: valueColor }}>{value}</span></div>
);
const Action = ({ onClick, bg, color, icon, label }) => (
  <div onClick={onClick} style={{ textAlign: 'center', padding: '13px 0', borderRadius: '14px', background: bg, color, fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}><i className={icon} />{label}</div>
);
