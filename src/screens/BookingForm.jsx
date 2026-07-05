import { useEffect, useState } from 'react';
import {
  useAvailability, useAvailabilityBatch, useBooking,
  useCreateBookingBatch, useRooms, useUpdateBooking,
} from '../hooks';
import { useModals, useNav, useToast } from '../store';
import { mfmt, nightsBetween, todayStr, dfmt } from '../lib/format';
import { headerBar, roundBtn } from '../lib/styles';
import { Loading } from '../ui/overlays';
import DateRangeField from '../ui/DateRangeField';

const METHODS = [
  ['Наличные', 'Наличные'],
  ['Карта', 'Банковская карта'],
  ['Перевод', 'Перевод'],
];

// «5 мест» / «2 места» / «1 место»
const placesLabel = (n) => {
  const a = Math.abs(n) % 100;
  const b = n % 10;
  if (a > 10 && a < 20) return `${n} мест`;
  if (b === 1) return `${n} место`;
  if (b >= 2 && b <= 4) return `${n} места`;
  return `${n} мест`;
};

// Эффективная цена за человека: индивидуальная (если задана > 0) либо цена комнаты.
const priceOf = (room, priceStr) => {
  const p = Number(priceStr);
  return priceStr !== '' && priceStr != null && Number.isFinite(p) && p > 0
    ? p
    : room?.pricePerDay || 0;
};

export default function BookingForm({ id, roomId }) {
  const editing = !!id;
  const { back, resetTo } = useNav();
  const { showConflict } = useModals();
  const toast = useToast();
  const { data: rooms } = useRooms();
  const { data: booking } = useBooking(id);
  const createBatch = useCreateBookingBatch();
  const update = useUpdateBooking();

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (form) return;
    if (editing) {
      if (booking)
        setForm({
          roomId: booking.roomId,
          price: String(booking.pricePerDay ?? ''),
          client: booking.client,
          phone: booking.phone || '',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          comment: booking.comment || '',
        });
    } else {
      setForm({
        rooms: roomId ? [{ roomId, guests: 1, price: '' }] : [],
        client: '', phone: '', checkIn: todayStr(), checkOut: '',
        comment: '', prepay: '', method: 'Наличные',
      });
    }
  }, [editing, booking, roomId, form]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const nights = form ? nightsBetween(form.checkIn, form.checkOut) : 0;
  const roomById = (rid) => rooms?.find((r) => r.id === rid);

  // ----- доступность -----
  const single = useAvailability({
    roomId: editing ? form?.roomId : '',
    checkIn: form?.checkIn, checkOut: form?.checkOut, excludeId: id,
    enabled: editing && !!(form?.roomId && nights > 0),
  });
  const batch = useAvailabilityBatch({
    roomIds: !editing ? (form?.rooms || []).map((r) => r.roomId) : [],
    checkIn: form?.checkIn, checkOut: form?.checkOut,
    enabled: !editing && (form?.rooms?.length > 0) && nights > 0,
  });

  if (!form)
    return (
      <FormShell title={editing ? 'Изменить бронь' : 'Новое бронирование'} back={back}>
        <Loading />
      </FormShell>
    );

  // ----- общие вычисления -----
  const editRoom = editing ? roomById(form.roomId) : null;
  const lineTotal = (r) => nights * priceOf(roomById(r.roomId), r.price) * (r.guests || 1);
  const grandTotal = editing
    ? nights * priceOf(editRoom, form.price) * (form.guests || 1)
    : (form.rooms || []).reduce((s, r) => s + lineTotal(r), 0);
  const prepay = parseInt(form.prepay) || 0;

  const unavailable =
    !editing && batch.data
      ? (form.rooms || []).filter((r) => batch.data[r.roomId] && !batch.data[r.roomId].available)
      : [];
  const editConflict =
    editing && single.data && !single.data.available ? single.data.conflict : null;

  const isSelected = (rid) =>
    editing ? form.roomId === rid : (form.rooms || []).some((r) => r.roomId === rid);

  const toggleRoom = (rid) => {
    if (editing) return set('roomId', rid);
    setForm((f) => {
      const exists = f.rooms.some((r) => r.roomId === rid);
      return {
        ...f,
        rooms: exists
          ? f.rooms.filter((r) => r.roomId !== rid)
          : [...f.rooms, { roomId: rid, guests: 1, price: '' }],
      };
    });
  };
  const setRoom = (rid, patch) =>
    setForm((f) => ({
      ...f,
      rooms: f.rooms.map((r) => (r.roomId === rid ? { ...r, ...patch } : r)),
    }));

  const roomsChosen = editing ? (form.roomId ? 1 : 0) : (form.rooms || []).length;
  const canSave =
    roomsChosen > 0 &&
    nights > 0 &&
    !!form.client.trim() &&
    unavailable.length === 0 &&
    !editConflict;

  const save = async () => {
    if (roomsChosen === 0) return toast.show('Выберите комнату');
    if (!form.client.trim()) return toast.show('Введите имя клиента');
    if (nights <= 0) return toast.show('Проверьте даты');
    if (editConflict)
      return showConflict({
        client: editConflict.client, room: editConflict.roomName,
        range: `${dfmt(editConflict.checkIn)} – ${dfmt(editConflict.checkOut)}`,
      });
    if (unavailable.length > 0) {
      const r0 = unavailable[0];
      const c = batch.data[r0.roomId].conflict;
      return showConflict({
        client: c?.client || '', room: roomById(r0.roomId)?.name || '',
        range: `${dfmt(form.checkIn)} – ${dfmt(form.checkOut)}`,
      });
    }
    try {
      if (editing) {
        await update.mutateAsync({
          id,
          body: {
            roomId: form.roomId, client: form.client, phone: form.phone,
            checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests,
            comment: form.comment, pricePerDay: priceOf(editRoom, form.price),
          },
        });
        back();
        toast.show('Бронирование обновлено');
      } else {
        const res = await createBatch.mutateAsync({
          client: form.client, phone: form.phone,
          checkIn: form.checkIn, checkOut: form.checkOut,
          comment: form.comment, prepay, method: form.method,
          rooms: form.rooms.map((r) => ({
            roomId: r.roomId, guests: r.guests,
            pricePerDay: priceOf(roomById(r.roomId), r.price),
          })),
        });
        resetTo('bookings');
        toast.show(res?.count > 1 ? `Создано броней: ${res.count}` : 'Бронирование создано');
      }
    } catch (e) {
      if (e.response?.status === 409)
        showConflict({
          client: form.client, room: '',
          range: `${dfmt(form.checkIn)} – ${dfmt(form.checkOut)}`,
        });
      else toast.show(e.response?.data?.message || 'Не удалось сохранить');
    }
  };

  const roomOptions = (rooms || []).filter((r) => r.active || isSelected(r.id));

  return (
    <FormShell title={editing ? 'Изменить бронь' : 'Новое бронирование'} back={back}
      footer={
        <div style={{ flexShrink: 0, padding: '12px 20px 26px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
          <div onClick={back} style={{ flex: '0 0 40%', textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: '#f5f5f5', fontSize: '15px', fontWeight: 600, color: '#525252', cursor: 'pointer' }}>Отменить</div>
          <div onClick={canSave ? save : undefined} style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: canSave ? '#155dfc' : '#c9d6f5', color: '#fff', fontSize: '15px', fontWeight: 600, pointerEvents: canSave ? 'auto' : 'none', cursor: 'pointer', transition: 'background .15s' }}>Сохранить</div>
        </div>
      }>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373' }}>{editing ? 'Комната' : 'Комнаты'}</div>
        {!editing && <div style={{ fontSize: '11px', color: '#a1a1a1' }}>можно выбрать несколько</div>}
      </div>
      <div className="scr" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
        {roomOptions.map((r) => {
          const a = isSelected(r.id);
          return (
            <div key={r.id} onClick={() => toggleRoom(r.id)} style={{ position: 'relative', border: `1px solid ${a ? '#155dfc' : '#e5e5e5'}`, background: a ? '#eff6ff' : '#fff', borderRadius: '14px', padding: '10px 12px', minWidth: '132px', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: a ? '#155dfc' : '#0a0a0a' }}>{r.name}</div>
              <div style={{ fontSize: '11px', color: '#737373', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ti ti-users" style={{ fontSize: '12px' }} />{placesLabel(r.capacity)}
              </div>
              <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>{mfmt(r.pricePerDay)}</div>
              {!editing && a && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', color: '#155dfc', fontSize: '15px' }}><i className="ti ti-circle-check-filled" /></span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', margin: '18px 0 8px' }}>Клиент</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="Имя клиента" style={inp} />
        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Номер телефона" type="tel" inputMode="tel" autoComplete="tel" style={inp} />
      </div>

      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', margin: '18px 0 8px' }}>Даты</div>
      <DateRangeField
        checkIn={form.checkIn}
        checkOut={form.checkOut}
        onChange={(ci, co) => setForm((f) => ({ ...f, checkIn: ci, checkOut: co }))}
      />

      {/* ---- Комнаты, гости и индивидуальные цены ---- */}
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', margin: '18px 0 8px' }}>
        {editing ? 'Гости и цена' : 'Гости и цена по комнатам'}
      </div>

      {editing ? (
        <RoomLine
          name={editRoom?.name || '—'} capacity={editRoom?.capacity}
          guests={form.guests}
          onGuests={(g) => set('guests', g)}
          price={form.price} defPrice={editRoom?.pricePerDay || 0}
          onPrice={(v) => set('price', v)}
          subtotal={grandTotal} nights={nights}
        />
      ) : (form.rooms || []).length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e5e5e5', borderRadius: '14px', padding: '18px', textAlign: 'center', color: '#a1a1a1', fontSize: '13px' }}>
          Выберите комнату выше
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {form.rooms.map((r) => {
            const ro = roomById(r.roomId);
            const av = batch.data?.[r.roomId];
            return (
              <RoomLine key={r.roomId}
                name={ro?.name || '—'} capacity={ro?.capacity}
                guests={r.guests}
                onGuests={(g) => setRoom(r.roomId, { guests: g })}
                price={r.price} defPrice={ro?.pricePerDay || 0}
                onPrice={(v) => setRoom(r.roomId, { price: v })}
                subtotal={lineTotal(r)} nights={nights}
                available={nights > 0 && av ? av.available : undefined}
                conflictName={av && !av.available ? av.conflict?.client : ''}
                onRemove={() => toggleRoom(r.roomId)}
              />
            );
          })}
        </div>
      )}

      {editConflict && (
        <Banner bg="#fef2f2" border="#ffe2e2" color="#e7000b" icon="ti ti-alert-triangle-filled">Комната занята на эти даты. Занято: {editConflict.client}, до {dfmt(editConflict.checkOut)}</Banner>
      )}
      {editing && single.data?.available && (
        <Banner bg="#eafff2" border="#c3f2d5" color="#00a63e" icon="ti ti-circle-check-filled">Комната свободна на выбранные даты</Banner>
      )}

      <input value={form.comment} onChange={(e) => set('comment', e.target.value)} placeholder="Комментарий" style={{ ...inp, marginTop: '10px' }} />

      <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373', margin: '18px 0 8px' }}>Оплата</div>
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '14px' }}>
        {!editing && form.rooms.length > 1 && form.rooms.map((r) => {
          const ro = roomById(r.roomId);
          return <SumRow key={r.roomId} label={`${ro?.name || '—'} · ${r.guests} гост.`} value={mfmt(lineTotal(r))} />;
        })}
        <SumRow label="Количество суток" value={nights} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '16px', borderTop: '1px solid #f5f5f5', marginTop: '4px' }}><span style={{ fontWeight: 600 }}>Итого</span><span style={{ fontWeight: 700, color: '#155dfc' }}>{mfmt(grandTotal)}</span></div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 2px', fontSize: '14px' }}><span style={{ color: '#737373' }}>Остаток</span><span style={{ fontWeight: 700, color: '#e7000b' }}>{mfmt(Math.max(0, grandTotal - prepay))}</span></div>
          </>
        )}
      </div>
    </FormShell>
  );
}

// Строка комнаты: гости (степпер) + редактируемая цена + подытог.
function RoomLine({ name, capacity, guests, onGuests, price, defPrice, onPrice, subtotal, nights, available, conflictName, onRemove }) {
  const over = capacity != null && guests > capacity;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>{name}</span>
          {capacity != null && (
            <span style={{ fontSize: '11px', color: '#737373', background: '#f5f5f5', borderRadius: '9999px', padding: '2px 8px', whiteSpace: 'nowrap' }}>
              <i className="ti ti-users" style={{ fontSize: '11px', marginRight: '3px' }} />{placesLabel(capacity)}
            </span>
          )}
        </div>
        {onRemove && (
          <span onClick={onRemove} style={{ color: '#a1a1a1', fontSize: '18px', cursor: 'pointer', flexShrink: 0 }}><i className="ti ti-x" /></span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
        <span style={{ fontSize: '13px', color: '#525252' }}>Гостей{over && <span style={{ color: '#e7000b', marginLeft: '6px' }}>больше вместимости</span>}</span>
        <Stepper value={guests} over={over} dec={() => onGuests(Math.max(1, guests - 1))} inc={() => onGuests(guests + 1)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: '#525252' }}>Цена / чел. / сутки</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input value={price} onChange={(e) => onPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder={String(defPrice)} inputMode="numeric" style={{ width: '96px', textAlign: 'right', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '9px 11px', fontSize: '15px', fontWeight: 600 }} />
          <span style={{ fontSize: '13px', color: '#a1a1a1' }}>сом</span>
        </div>
      </div>
      {price !== '' && Number(price) > 0 && Number(price) !== defPrice && (
        <div style={{ fontSize: '11px', color: Number(price) < defPrice ? '#00a63e' : '#c2410c', textAlign: 'right', marginTop: '4px' }}>
          {Number(price) < defPrice ? 'Скидка' : 'Наценка'} · обычная цена {mfmt(defPrice)}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f5f5f5' }}>
        {available === false ? (
          <span style={{ fontSize: '12px', color: '#e7000b', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="ti ti-alert-triangle-filled" />Занято{conflictName ? `: ${conflictName}` : ''}</span>
        ) : available === true ? (
          <span style={{ fontSize: '12px', color: '#00a63e', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="ti ti-circle-check-filled" />Свободно</span>
        ) : <span style={{ fontSize: '12px', color: '#a1a1a1' }}>{nights > 0 ? `${nights} сут.` : 'Укажите даты'}</span>}
        <span style={{ fontSize: '15px', fontWeight: 700 }}>{mfmt(subtotal)}</span>
      </div>
    </div>
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

const Stepper = ({ value, dec, inc, over }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div onClick={dec} style={stepBtn}>−</div>
    <span style={{ fontSize: '16px', fontWeight: 600, minWidth: '16px', textAlign: 'center', color: over ? '#e7000b' : '#0a0a0a' }}>{value}</span>
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
