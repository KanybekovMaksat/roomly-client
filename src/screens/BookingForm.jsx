import { useEffect, useState } from 'react';
import {
  useAvailability, useBooking, useCreateBooking, useRooms, useUpdateBooking,
} from '../hooks';
import { useModals, useNav, useToast } from '../store';
import { mfmt, nightsBetween, todayStr, dfmt } from '../lib/format';
import { headerBar, roundBtn } from '../lib/styles';
import { Loading } from '../ui/overlays';

const METHODS = [
  ['Наличные', 'Наличные'],
  ['Карта', 'Банковская карта'],
  ['Перевод', 'Перевод'],
];

export default function BookingForm({ id, roomId }) {
  const editing = !!id;
  const { back, resetTo } = useNav();
  const { showConflict } = useModals();
  const toast = useToast();
  const { data: rooms } = useRooms();
  const { data: booking } = useBooking(id);
  const create = useCreateBooking();
  const update = useUpdateBooking();

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (form) return;
    if (editing) {
      if (booking) setForm({ roomId: booking.roomId, client: booking.client, phone: booking.phone || '', checkIn: booking.checkIn, checkOut: booking.checkOut, guests: booking.guests, comment: booking.comment || '', prepay: '', method: 'Наличные' });
    } else {
      setForm({ roomId: roomId || '', client: '', phone: '', checkIn: todayStr(), checkOut: '', guests: 1, comment: '', prepay: '', method: 'Наличные' });
    }
  }, [editing, booking, roomId, form]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const nights = form ? nightsBetween(form.checkIn, form.checkOut) : 0;
  const room = rooms?.find((r) => r.id === form?.roomId);
  const price = room ? room.pricePerDay : 0;
  const guests = form?.guests || 0;
  const total = nights * price * guests;
  const prepay = parseInt(form?.prepay) || 0;

  const avail = useAvailability({
    roomId: form?.roomId, checkIn: form?.checkIn, checkOut: form?.checkOut,
    excludeId: id, enabled: !!(form?.roomId && nights > 0),
  });
  const conflict = avail.data && !avail.data.available ? avail.data.conflict : null;
  const isAvailable = avail.data?.available;

  if (!form) return <FormShell title={editing ? 'Изменить бронь' : 'Новое бронирование'} back={back}><Loading /></FormShell>;

  const canSave = !!form.roomId && nights > 0 && !!form.client.trim() && guests >= 1 && !(avail.data && !avail.data.available);

  const save = async () => {
    if (!form.roomId) return toast.show('Выберите комнату');
    if (!form.client.trim()) return toast.show('Введите имя клиента');
    if (nights <= 0) return toast.show('Проверьте даты');
    if (conflict) return showConflict({ client: conflict.client, room: conflict.roomName, range: `${dfmt(conflict.checkIn)} – ${dfmt(conflict.checkOut)}` });
    try {
      if (editing) {
        await update.mutateAsync({ id, body: { roomId: form.roomId, client: form.client, phone: form.phone, checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests, comment: form.comment } });
        back();
        toast.show('Бронирование обновлено');
      } else {
        await create.mutateAsync({ roomId: form.roomId, client: form.client, phone: form.phone, checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests, comment: form.comment, prepay, method: form.method });
        resetTo('bookings');
        toast.show('Бронирование создано');
      }
    } catch (e) {
      if (e.response?.status === 409) showConflict({ client: form.client, room: room?.name || '', range: `${dfmt(form.checkIn)} – ${dfmt(form.checkOut)}` });
      else toast.show(e.response?.data?.message || 'Не удалось сохранить');
    }
  };

  const roomOptions = (rooms || []).filter((r) => r.active || r.id === form.roomId);

  return (
    <FormShell title={editing ? 'Изменить бронь' : 'Новое бронирование'} back={back}
      footer={
        <div style={{ flexShrink: 0, padding: '12px 20px 26px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
          <div onClick={back} style={{ flex: '0 0 40%', textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: '#f5f5f5', fontSize: '15px', fontWeight: 600, color: '#525252', cursor: 'pointer' }}>Отменить</div>
          <div onClick={canSave ? save : undefined} style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: canSave ? '#155dfc' : '#c9d6f5', color: '#fff', fontSize: '15px', fontWeight: 600, pointerEvents: canSave ? 'auto' : 'none', cursor: 'pointer', transition: 'background .15s' }}>Сохранить</div>
        </div>
      }>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', marginBottom: '8px' }}>Комната</div>
      <div className="scr" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
        {roomOptions.map((r) => {
          const a = form.roomId === r.id;
          return (
            <div key={r.id} onClick={() => set('roomId', r.id)} style={{ border: `1px solid ${a ? '#155dfc' : '#e5e5e5'}`, background: a ? '#eff6ff' : '#fff', borderRadius: '14px', padding: '10px 12px', minWidth: '132px', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: a ? '#155dfc' : '#0a0a0a' }}>{r.name}</div>
              <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>{mfmt(r.pricePerDay)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', margin: '18px 0 8px' }}>Клиент</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="Имя клиента" style={inp} />
        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Номер телефона" type="tel" inputMode="tel" autoComplete="tel" style={inp} />
      </div>

      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', margin: '18px 0 8px' }}>Даты и гости</div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '9px 12px' }}><div style={{ fontSize: '11px', color: '#a1a1a1' }}>Заезд</div><input type="date" value={form.checkIn} onChange={(e) => set('checkIn', e.target.value)} style={dateInp} /></div>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '9px 12px' }}><div style={{ fontSize: '11px', color: '#a1a1a1' }}>Выезд</div><input type="date" value={form.checkOut} onChange={(e) => set('checkOut', e.target.value)} style={dateInp} /></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '11px 14px', marginTop: '10px' }}>
        <span style={{ fontSize: '15px' }}>Количество гостей</span>
        <Stepper value={form.guests} dec={() => set('guests', Math.max(1, form.guests - 1))} inc={() => set('guests', form.guests + 1)} />
      </div>

      {conflict && (
        <Banner bg="#fef2f2" border="#ffe2e2" color="#e7000b" icon="ti ti-alert-triangle-filled">Комната занята на эти даты. Занято: {conflict.client}, до {dfmt(conflict.checkOut)}</Banner>
      )}
      {isAvailable && (
        <Banner bg="#eafff2" border="#c3f2d5" color="#00a63e" icon="ti ti-circle-check-filled">Комната свободна на выбранные даты</Banner>
      )}

      <input value={form.comment} onChange={(e) => set('comment', e.target.value)} placeholder="Комментарий" style={{ ...inp, marginTop: '10px' }} />

      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', margin: '18px 0 8px' }}>Оплата</div>
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '14px' }}>
        <SumRow label="Цена за человека" value={mfmt(price)} />
        <SumRow label="Количество гостей" value={guests} />
        <SumRow label="Количество суток" value={nights} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '16px', borderTop: '1px solid #f5f5f5', marginTop: '4px' }}><span style={{ fontWeight: 600 }}>Итого</span><span style={{ fontWeight: 700, color: '#155dfc' }}>{mfmt(total)}</span></div>
        <div style={{ fontSize: '11px', color: '#a1a1a1', textAlign: 'right', marginTop: '-2px' }}>{mfmt(price)} × {guests} гост. × {nights} сут.</div>
        {!editing && (
          <>
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Предоплата</div>
              <input value={form.prepay} onChange={(e) => set('prepay', e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" inputMode="numeric" style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '11px 12px', fontSize: '15px' }} />
            </div>
            <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '4px', gap: '2px', marginTop: '10px' }}>
              {METHODS.map(([lbl, full]) => {
                const a = form.method === full;
                return <div key={full} onClick={() => set('method', full)} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: a ? '#155dfc' : 'transparent', color: a ? '#fff' : '#525252' }}>{lbl}</div>;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 2px', fontSize: '14px' }}><span style={{ color: '#737373' }}>Остаток</span><span style={{ fontWeight: 700, color: '#e7000b' }}>{mfmt(Math.max(0, total - prepay))}</span></div>
          </>
        )}
      </div>
    </FormShell>
  );
}

function FormShell({ title, back, children, footer }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fafafa', minHeight: 0 }}>
      <div style={headerBar}>
        <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>{title}</div>
      </div>
      <div className="scr" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>{children}</div>
      {footer}
    </div>
  );
}

const inp = { border: '1px solid #e5e5e5', borderRadius: '12px', padding: '13px 14px', fontSize: '15px', background: '#fff', width: '100%' };
const dateInp = { border: 'none', fontSize: '14px', width: '100%', background: 'transparent', padding: '2px 0' };

const Stepper = ({ value, dec, inc }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div onClick={dec} style={stepBtn}>−</div>
    <span style={{ fontSize: '16px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{value}</span>
    <div onClick={inc} style={stepBtn}>+</div>
  </div>
);
const stepBtn = { width: '32px', height: '32px', borderRadius: '9999px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' };

const SumRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}><span style={{ color: '#737373' }}>{label}</span><span style={{ fontWeight: 500 }}>{value}</span></div>
);
const Banner = ({ bg, border, color, icon, children }) => (
  <div style={{ marginTop: '10px', background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '10px 12px', fontSize: '13px', color, display: 'flex', alignItems: 'center', gap: '7px' }}><i className={icon} />{children}</div>
);
