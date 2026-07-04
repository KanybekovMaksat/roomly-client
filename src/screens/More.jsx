import { useNav } from '../store';

const ITEMS = [
  { icon: 'ti ti-calendar-month', label: 'Календарь', sub: 'Заезды и выезды по датам', screen: 'calendar' },
  { icon: 'ti ti-users', label: 'Клиенты', sub: 'База гостей и история', screen: 'clients' },
  { icon: 'ti ti-history', label: 'Журнал изменений', sub: 'Все действия в системе', screen: 'changelog' },
  { icon: 'ti ti-settings', label: 'Настройки', sub: 'Гостевой дом, цены, экспорт', screen: 'settings' },
];

export default function More() {
  const { push } = useNav();
  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', padding: '6px 20px 14px' }}>Ещё</div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
        {ITEMS.map((m) => (
          <div key={m.screen} onClick={() => push(m.screen)} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '15px 14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#eff6ff', color: '#155dfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px' }}><i className={m.icon} /></span>
            <div style={{ flex: 1 }}><div style={{ fontSize: '15px', fontWeight: 500 }}>{m.label}</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>{m.sub}</div></div>
            <i className="ti ti-chevron-right" style={{ color: '#a1a1a1' }} />
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', color: '#c4c4c4', fontSize: '11px', padding: '20px' }}>Roomly · Developed by .51 · v1.0</div>
    </div>
  );
}
