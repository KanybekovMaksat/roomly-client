import { useState } from 'react';
import { IconArrowLeft, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get('/bookings')).data
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await api.get('/rooms')).data
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Adjust so Monday is 0, Sunday is 6
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const toYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDateStr = toYMD(selectedDate);
  const selectedFormatted = `${String(selectedDate.getDate()).padStart(2, '0')}.${String(selectedDate.getMonth() + 1).padStart(2, '0')}.${selectedDate.getFullYear()}`;

  const getBookingsForDate = (dateStr) => {
    return bookings.filter(b => b.checkIn <= dateStr && b.checkOut > dateStr && b.status !== 'cancelled');
  };

  const getCheckInsForDate = (dateStr) => {
    return bookings.filter(b => b.checkIn === dateStr && b.status !== 'cancelled');
  };

  const getCheckOutsForDate = (dateStr) => {
    return bookings.filter(b => b.checkOut === dateStr && b.status !== 'cancelled');
  };

  const occupiedBookings = getBookingsForDate(selectedDateStr);
  const checkIns = getCheckInsForDate(selectedDateStr);
  const checkOuts = getCheckOutsForDate(selectedDateStr);

  const freeCount = rooms.length - occupiedBookings.length;
  const occCount = occupiedBookings.length;

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <IconArrowLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer', color: 'var(--text-primary)' }} />
        <div style={{ fontSize: '20px', fontWeight: 700 }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '24px', margin: '0 20px 24px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div onClick={handlePrevMonth} style={{ padding: '8px', cursor: 'pointer', background: 'var(--bg-app)', borderRadius: '12px' }}>
            <IconChevronLeft size={20} />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
          <div onClick={handleNextMonth} style={{ padding: '8px', cursor: 'pointer', background: 'var(--bg-app)', borderRadius: '12px' }}>
            <IconChevronRight size={20} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
          {weekDays.map(d => (
            <div key={d} style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1;
            const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
            const dateYMD = toYMD(fullDate);
            const isSelected = selectedDateStr === dateYMD;
            
            const dayBookings = getBookingsForDate(dateYMD);
            let indicatorColor = 'transparent';
            if (dayBookings.length > 0) {
              const fillRatio = dayBookings.length / (rooms.length || 1);
              if (fillRatio > 0.8) indicatorColor = 'var(--color-danger)';
              else if (fillRatio > 0.4) indicatorColor = 'var(--color-warning)';
              else indicatorColor = 'var(--color-primary)';
            }

            return (
              <div 
                key={date} 
                onClick={() => setSelectedDate(fullDate)}
                style={{
                  height: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  position: 'relative'
                }}
              >
                {date}
                {indicatorColor !== 'transparent' && !isSelected && (
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: indicatorColor, position: 'absolute', bottom: '6px' }} />
                )}
              </div>
            );
          })}
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger)' }}></div> Занято</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></div> Свободно</div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{selectedFormatted}</div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)' }}></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Свободно</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{freeCount}</div>
            </div>
          </div>
          <div style={{ flex: 1, background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-danger)' }}></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Занято</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{occCount}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            Заезды
          </div>
          {checkIns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checkIns.map(b => (
                <div key={b._id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.client}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.roomName} · {b.guests} гостя</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Нет заездов</div>
          )}
        </div>

        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-warning)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Выезды
          </div>
          {checkOuts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checkOuts.map(b => (
                <div key={b._id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.client}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.roomName}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Нет выездов</div>
          )}
        </div>
      </div>
    </div>
  );
}
