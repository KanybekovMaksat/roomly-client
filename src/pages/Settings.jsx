import { useState, useEffect } from 'react';
import { IconCalendarEvent, IconUsers, IconHistory, IconSettings, IconChevronRight, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState('menu');
  const [formData, setFormData] = useState({ hotelName: '', currency: '', checkInTime: '', checkOutTime: '' });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        hotelName: settings.hotelName || '',
        currency: settings.currency || '',
        checkInTime: settings.checkInTime || '',
        checkOutTime: settings.checkOutTime || ''
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (newSettings) => (await api.put('/settings', newSettings)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Настройки сохранены!');
      setView('menu');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  const MenuItem = ({ icon, title, desc, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{desc}</div>
      </div>
      <IconChevronRight size={20} color="var(--color-border-dark)" />
    </div>
  );

  if (view === 'settings') {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <IconArrowLeft size={24} onClick={() => setView('menu')} style={{ cursor: 'pointer' }} />
          <div style={{ fontSize: '20px', fontWeight: 700 }}>Настройки</div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Загрузка...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Название гостевого дома</label>
              <input required type="text" value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--color-border-dark)', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Валюта</label>
              <input required type="text" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--color-border-dark)', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Время заезда (Check-in)</label>
              <input required type="time" value={formData.checkInTime} onChange={e => setFormData({...formData, checkInTime: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--color-border-dark)', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Время выезда (Check-out)</label>
              <input required type="time" value={formData.checkOutTime} onChange={e => setFormData({...formData, checkOutTime: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--color-border-dark)', fontSize: '16px' }} />
            </div>
            
            <button type="submit" disabled={updateSettings.isPending} style={{ marginTop: '20px', background: 'var(--color-primary)', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              {updateSettings.isPending ? 'Сохранение...' : 'Сохранить настройки'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', padding: '24px 20px', position: 'relative' }}>
      <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Ещё</div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '24px', padding: '8px 20px' }}>
        <MenuItem 
          icon={<IconCalendarEvent size={24} />} 
          title="Календарь" 
          desc="Заезды и выезды по датам" 
          onClick={() => navigate('/calendar')} 
        />
        <MenuItem 
          icon={<IconUsers size={24} />} 
          title="Клиенты" 
          desc="База гостей и история" 
          onClick={() => navigate('/clients')} 
        />
        <MenuItem 
          icon={<IconHistory size={24} />} 
          title="Журнал изменений" 
          desc="Все действия в системе" 
          onClick={() => {}} 
        />
        <div onClick={() => setView('settings')} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', cursor: 'pointer' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
            <IconSettings size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Настройки</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Гостевой дом, цены, экспорт</div>
          </div>
          <IconChevronRight size={20} color="var(--color-border-dark)" />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '12px' }}>
        Гостевой дом · v1.0
      </div>
    </div>
  );
}
