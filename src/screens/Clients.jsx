import { useState } from 'react';
import { useClients } from '../hooks';
import { useNav } from '../store';
import { mfmt } from '../lib/format';
import { Loading, ErrorState } from '../ui/overlays';

export default function Clients() {
  const { back, push } = useNav();
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useClients(search);

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#fafafa', padding: '0 12px' }}>
        <div style={{ height: '54px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div onClick={back} style={{ width: '38px', height: '38px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', cursor: 'pointer' }}><i className="ti ti-chevron-left" /></div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>Клиенты</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '9999px', padding: '10px 14px', margin: '0 8px 12px' }}>
          <i className="ti ti-search" style={{ color: '#a1a1a1' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Имя или телефон" style={{ border: 'none', flex: 1, fontSize: '14px', background: 'transparent' }} />
          {search && <i onClick={() => setSearch('')} className="ti ti-x" style={{ color: '#a1a1a1', cursor: 'pointer' }} />}
        </div>
      </div>
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isLoading && <Loading />}
        {isError && <ErrorState />}
        {data?.map((c) => (
          <div key={c.id} onClick={() => push('clientCard', { id: c.id })} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#eff6ff', color: '#155dfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}><i className="ti ti-user" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: '12px', color: '#737373' }}>{c.phone || '—'}</div>
              <div style={{ fontSize: '12px', color: '#a1a1a1', marginTop: '2px' }}>{c.visits} посещ. · {mfmt(c.totalSpent)}</div>
            </div>
            <i className="ti ti-chevron-right" style={{ color: '#a1a1a1' }} />
          </div>
        ))}
        {data && data.length === 0 && <div style={{ textAlign: 'center', color: '#a1a1a1', padding: '40px 0', fontSize: '14px' }}>Клиенты не найдены</div>}
      </div>
    </div>
  );
}
