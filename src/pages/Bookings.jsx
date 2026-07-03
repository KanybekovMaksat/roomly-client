import { useState } from 'react';
import { IconSearch, IconPhone, IconBed, IconCalendarEvent, IconPlus, IconX, IconCash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function Bookings() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [formData, setFormData] = useState({ roomId: '', checkIn: '', checkOut: '', clientName: '', clientPhone: '', guests: 1, comment: '', prepay: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'cash' });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Все');

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get('/bookings')).data
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await api.get('/rooms')).data
  });

  const createBooking = useMutation({
    mutationFn: async (newBooking) => (await api.post('/bookings', newBooking)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setShowModal(false);
      setFormData({ roomId: '', checkIn: '', checkOut: '', clientName: '', clientPhone: '', guests: 1, comment: '', prepay: '' });
    }
  });

  const addPayment = useMutation({
    mutationFn: async (payment) => (await api.post('/payments', payment)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setShowPaymentModal(null);
      setPaymentData({ amount: '', method: 'cash' });
    }
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}`;
  };

  const formatMoney = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' сом';
  };

  const filteredBookings = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchesSearch = b.client.toLowerCase().includes(q) || (b.phone || '').includes(q) || b.roomName.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (activeTab === 'Активные') return b.status === 'active';
    if (activeTab === 'Будущие') return b.status === 'future';
    if (activeTab === 'Завершённые') return b.status === 'completed';
    if (activeTab === 'Не оплачено') return b.remaining > 0 && b.status !== 'completed';
    return true;
  });

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', position: 'relative' }}>
      <div style={{ padding: '24px 20px 16px', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 5 }}>
        <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Бронирования</div>
        
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '24px', padding: '10px 16px', gap: '10px', marginBottom: '20px' }}>
          <IconSearch size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Имя, телефон или комната" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="scr" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['Все', 'Активные', 'Будущие', 'Завершённые', 'Не оплачено'].map(tab => (
            <div 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: activeTab === tab ? 'var(--color-primary)' : '#fff',
                color: activeTab === tab ? '#fff' : 'var(--text-primary)',
                border: activeTab === tab ? '1px solid var(--color-primary)' : '1px solid var(--color-border-dark)',
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {bookingsLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Загрузка...</div>
        ) : (
          filteredBookings.map(b => (
            <div key={b._id} style={{ border: '1px solid var(--color-border)', borderRadius: '20px', padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>{b.client}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                    <IconPhone size={14} />
                    {b.phone || 'Нет номера'}
                  </div>
                </div>
                <div style={{ 
                  background: b.remaining === 0 ? 'var(--color-success-light)' : 'var(--color-warning-light)', 
                  color: b.remaining === 0 ? 'var(--color-success)' : 'var(--color-warning)',
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 600 
                }}>
                  {b.remaining === 0 ? 'Оплачено' : 'Частично'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-app)', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  <IconBed size={16} color="var(--color-primary)" />
                  {b.roomName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <IconCalendarEvent size={16} />
                  {formatDate(b.checkIn)} – {formatDate(b.checkOut)} · {b.days} сут.
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0', borderStyle: 'dashed' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Стоимость</div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{formatMoney(b.totalPrice)}</div>
                </div>
                {b.remaining > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Остаток</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-danger)' }}>{formatMoney(b.remaining)}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {!bookingsLoading && filteredBookings.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>Ничего не найдено</div>
        )}
      </div>

      <div 
        onClick={() => setShowModal(true)}
        style={{ 
          position: 'absolute', 
          bottom: '24px', 
          right: '24px', 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'var(--color-primary)', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(29, 78, 216, 0.3)',
          zIndex: 10
        }}
      >
        <IconPlus size={32} />
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', animation: 'sheetUp 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Новое бронирование</div>
              <IconX size={24} onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); createBooking.mutate({ roomId: formData.roomId, client: formData.clientName, phone: formData.clientPhone, checkIn: formData.checkIn, checkOut: formData.checkOut, guests: Number(formData.guests), comment: formData.comment, prepay: Number(formData.prepay) }); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>Комната</label>
                <div className="scr" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {rooms.map(r => (
                    <div 
                      key={r._id} 
                      onClick={() => setFormData({...formData, roomId: r._id})}
                      style={{
                        padding: '12px 16px',
                        border: formData.roomId === r._id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        minWidth: '140px',
                        background: formData.roomId === r._id ? 'var(--color-primary-light)' : '#fff'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: formData.roomId === r._id ? 'var(--color-primary)' : 'var(--text-primary)', marginBottom: '4px' }}>{r.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatMoney(r.pricePerDay)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>Клиент</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px' }} placeholder="Имя клиента" />
                  <input required type="text" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px' }} placeholder="Номер телефона" />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>Даты и гости</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', position: 'absolute', top: '8px', left: '16px' }}>Заезд</div>
                      <input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} style={{ width: '100%', padding: '24px 16px 8px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }} />
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', position: 'absolute', top: '8px', left: '16px' }}>Выезд</div>
                      <input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} style={{ width: '100%', padding: '24px 16px 8px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '15px' }}>Количество гостей</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div onClick={() => setFormData(p => ({...p, guests: Math.max(1, Number(p.guests) - 1)}))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 500 }}>-</div>
                      <span style={{ fontSize: '16px', fontWeight: 700 }}>{formData.guests}</span>
                      <div onClick={() => setFormData(p => ({...p, guests: Number(p.guests) + 1}))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 500 }}>+</div>
                    </div>
                  </div>

                  <input type="text" value={formData.comment || ''} onChange={e => setFormData({...formData, comment: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px' }} placeholder="Комментарий" />
                </div>
              </div>

              {/* Payment Section */}
              {(() => {
                const selectedRoom = rooms.find(r => r._id === formData.roomId);
                const price = selectedRoom ? selectedRoom.pricePerDay : 0;
                let days = 0;
                if (formData.checkIn && formData.checkOut) {
                  days = Math.max(0, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)));
                }
                const total = price * formData.guests * days;

                return (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>Оплата</label>
                    <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span>Цена за человека</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatMoney(price)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span>Количество гостей</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formData.guests}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span>Количество суток</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{days}</span>
                      </div>
                      
                      <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }}></div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700 }}>Итого</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>{formatMoney(total)}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{price} сом x {formData.guests} гост. x {days} сут.</div>
                        </div>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Предоплата</label>
                        <input type="number" max={total} value={formData.prepay || ''} onChange={e => setFormData({...formData, prepay: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px' }} placeholder="0 сом" />
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <button type="submit" disabled={createBooking.isPending} style={{ marginTop: '16px', background: 'var(--color-primary)', color: '#fff', padding: '16px', borderRadius: '24px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                {createBooking.isPending ? 'Сохранение...' : 'Забронировать'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', animation: 'sheetUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Добавить оплату</div>
              <IconX size={24} onClick={() => setShowPaymentModal(null)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); addPayment.mutate({ bookingId: showPaymentModal._id, amount: Number(paymentData.amount), method: paymentData.method }); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--color-primary)', fontSize: '14px' }}>
                Остаток долга: <b>{formatMoney(showPaymentModal.remaining)}</b>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Сумма оплаты</label>
                <input required type="number" max={showPaymentModal.remaining} value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px' }} placeholder="Сумма" />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Способ оплаты</label>
                <select value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '16px', background: '#fff' }}>
                  <option value="cash">Наличные</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Перевод</option>
                </select>
              </div>
              
              <button type="submit" disabled={addPayment.isPending} style={{ marginTop: '10px', background: 'var(--color-success)', color: '#fff', padding: '14px', borderRadius: '14px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                {addPayment.isPending ? 'Сохранение...' : 'Подтвердить оплату'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
