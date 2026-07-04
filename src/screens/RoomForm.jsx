import { useEffect, useState } from 'react';
import { useCreateRoom, useDeleteRoom, useRoom, useUpdateRoom } from '../hooks';
import { useModals, useNav, useToast } from '../store';
import { headerBar, roundBtn } from '../lib/styles';
import { Loading } from '../ui/overlays';

export default function RoomForm({ id }) {
  const editing = !!id;
  const { back, resetTo } = useNav();
  const { askConfirm } = useModals();
  const toast = useToast();
  const { data: room } = useRoom(id);
  const create = useCreateRoom();
  const update = useUpdateRoom();
  const del = useDeleteRoom();

  const [form, setForm] = useState(null);
  useEffect(() => {
    if (form) return;
    if (editing) {
      if (room) setForm({ name: room.name, price: String(room.pricePerDay), capacity: room.capacity, desc: room.description || '', active: room.active });
    } else {
      setForm({ name: '', price: '', capacity: 2, desc: '', active: true });
    }
  }, [editing, room, form]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return toast.show('Введите название');
    if ((parseInt(form.price) || 0) <= 0) return toast.show('Введите стоимость');
    const body = { name: form.name, pricePerDay: parseInt(form.price), capacity: form.capacity, description: form.desc, active: form.active };
    if (editing) { await update.mutateAsync({ id, body }); back(); toast.show('Комната сохранена'); }
    else { await create.mutateAsync(body); resetTo('rooms'); toast.show('Комната добавлена'); }
  };

  const onDelete = () => askConfirm({
    title: 'Удалить комнату?', text: 'Комната будет удалена из списка.', btn: 'Удалить', danger: true,
    onConfirm: async () => { await del.mutateAsync(id); back(); toast.show('Комната удалена'); },
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fafafa', minHeight: 0 }}>
      <div style={headerBar}>
        <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>{editing ? 'Изменить комнату' : 'Новая комната'}</div>
      </div>
      {!form ? <Loading /> : (
        <div className="scr" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={lbl}>Название комнаты</div>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Напр. №204 Комфорт" style={inp} />
            </div>
            <div>
              <div style={lbl}>Цена за человека, сом</div>
              <input value={form.price} onChange={(e) => set('price', e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" inputMode="numeric" style={inp} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '11px 14px' }}>
              <span style={{ fontSize: '15px' }}>Количество мест</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div onClick={() => set('capacity', Math.max(1, form.capacity - 1))} style={stepBtn}>−</div>
                <span style={{ fontSize: '16px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{form.capacity}</span>
                <div onClick={() => set('capacity', form.capacity + 1)} style={stepBtn}>+</div>
              </div>
            </div>
            <div>
              <div style={lbl}>Краткое описание</div>
              <textarea value={form.desc} onChange={(e) => set('desc', e.target.value)} placeholder="Особенности комнаты" rows={3} style={{ ...inp, resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '13px 14px' }}>
              <div><div style={{ fontSize: '15px' }}>Активна</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>Доступна для бронирования</div></div>
              <div onClick={() => set('active', !form.active)} style={{ width: '44px', height: '26px', borderRadius: '9999px', background: form.active ? '#155dfc' : '#d4d4d4', position: 'relative', transition: 'all .2s', flexShrink: 0, cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '9999px', background: '#fff', position: 'absolute', top: '3px', left: form.active ? '21px' : '3px', transition: 'all .2s' }} />
              </div>
            </div>
          </div>
          <div onClick={save} style={{ textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: '#155dfc', color: '#fff', fontSize: '15px', fontWeight: 600, marginTop: '22px', cursor: 'pointer' }}>Сохранить</div>
          {editing && (
            <div onClick={onDelete} style={{ textAlign: 'center', padding: '13px 0', color: '#e7000b', fontSize: '14px', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}><i className="ti ti-trash" />Удалить комнату</div>
          )}
        </div>
      )}
    </div>
  );
}

const inp = { width: '100%', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '13px 14px', fontSize: '15px', background: '#fff' };
const lbl = { fontSize: '12px', fontWeight: 600, color: '#737373', marginBottom: '6px' };
const stepBtn = { width: '32px', height: '32px', borderRadius: '9999px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' };
