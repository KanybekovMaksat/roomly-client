import { useState } from 'react';
import { IconArrowLeft, IconSearch, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export default function Clients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => (await api.get('/clients')).data
  });

  const formatMoney = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' сом';
  };

  const filteredClients = clients.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone || '').includes(q);
  });

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', paddingBottom: '80px' }}>
      <div style={{ padding: '24px 20px 16px', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <IconArrowLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer', color: 'var(--text-primary)' }} />
          <div style={{ fontSize: '20px', fontWeight: 700 }}>Клиенты</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '20px', padding: '12px 16px', gap: '10px' }}>
          <IconSearch size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Поиск клиента" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Загрузка...</div>
        ) : (
          <>
            {filteredClients.map(client => (
              <div key={client._id} style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-app)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconUser size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>{client.phone}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {client.totalVisits} посещ. · <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatMoney(client.totalSpent)}</span>
                  </div>
                </div>
              </div>
            ))}
            {!isLoading && filteredClients.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Ничего не найдено</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
