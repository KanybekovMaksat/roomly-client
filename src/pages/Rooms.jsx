import { useState } from 'react';
import { IconPlus, IconX, IconBed, IconUser, IconChevronRight } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function Rooms() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', pricePerDay: '', capacity: '2', description: '', active: true });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await api.get('/rooms')).data
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get('/bookings')).data
  });

  const createRoom = useMutation({
    mutationFn: async (newRoom) => (await api.post('/rooms', newRoom)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setShowModal(false);
      setFormData({ name: '', pricePerDay: '', capacity: '2', description: '', active: true });
    }
  });

  const formatMoney = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' сом';
  };

  const getRoomStatus = (roomId) => {
    const activeBooking = bookings.find(b => b.roomId?._id === roomId && b.status === 'active');
    if (activeBooking) {
      // Check if checkout is within 24 hours
      const checkOutDate = new Date(activeBooking.checkOut);
      const now = new Date();
      const diffHours = (checkOutDate - now) / (1000 * 60 * 60);
      
      if (diffHours <= 24 && diffHours > 0) {
        return { 
          status: 'soon', 
          label: 'Скоро освобождается', 
          color: 'var(--color-warning)', 
          bg: 'var(--color-warning-light)',
          occupant: activeBooking.client
        };
      }
      return { 
        status: 'occupied', 
        label: 'Занята', 
        color: 'var(--color-primary)', 
        bg: 'var(--color-primary-light)',
        occupant: activeBooking.client
      };
    }
    return { 
      status: 'free', 
      label: 'Свободна', 
      color: 'var(--color-success)', 
      bg: 'var(--color-success-light)',
      occupant: null
    };
  };

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)' }}>
      <div style={{ padding: '24px 20px 16px', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>Комнаты</div>
        <div 
          onClick={() => setShowModal(true)} 
          style={{ 
            background: 'var(--color-primary)', 
            color: '#fff', 
            padding: '8px 16px', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <IconPlus size={18} />
          Комната
        </div>
      </div>

      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {roomsLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Загрузка...</div>
        ) : (
          rooms.map(room => {
            const status = getRoomStatus(room._id);
            return (
              <div key={room._id} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '16px', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconBed size={24} color={status.color} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{room.name}</div>
                    <div style={{ background: status.bg, color: status.color, padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
                      {status.label}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: status.occupant ? '8px' : '0' }}>
                    {formatMoney(room.pricePerDay)} / сутки · {room.capacity} мест.
                  </div>

                  {status.occupant && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}>
                      <IconUser size={14} />
                      {status.occupant}
                    </div>
                  )}
                </div>

                <IconChevronRight size={20} color="var(--color-border-dark)" style={{ flexShrink: 0 }} />
              </div>
            );
          })
        )}
        {!roomsLoading && rooms.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Нет комнат.</div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', animation: 'sheetUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Новая комната</div>
              <IconX size={24} onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); createRoom.mutate({ name: formData.name, pricePerDay: Number(formData.pricePerDay), capacity: Number(formData.capacity), description: formData.description, active: formData.active }); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Название комнаты</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px' }} placeholder="Напр. №204 Комфорт" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Цена за человека, сом</label>
                <input required type="number" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px' }} placeholder="0" />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '15px' }}>Количество мест</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div onClick={() => setFormData(p => ({...p, capacity: Math.max(1, Number(p.capacity) - 1)}))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 500 }}>-</div>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>{formData.capacity}</span>
                  <div onClick={() => setFormData(p => ({...p, capacity: Number(p.capacity) + 1}))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 500 }}>+</div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Краткое описание</label>
                <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px', fontFamily: 'inherit', resize: 'none' }} placeholder="Особенности комнаты" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontSize: '15px', marginBottom: '2px' }}>Активна</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Доступна для бронирования</div>
                </div>
                <div onClick={() => setFormData(p => ({...p, active: !p.active}))} style={{ width: '48px', height: '28px', borderRadius: '24px', background: formData.active ? 'var(--color-primary)' : 'var(--color-border-dark)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: formData.active ? '22px' : '2px', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
              
              <button type="submit" disabled={createRoom.isPending} style={{ marginTop: '16px', background: 'var(--color-primary)', color: '#fff', padding: '16px', borderRadius: '24px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                {createRoom.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
