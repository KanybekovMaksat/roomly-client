import { useFinance } from '../hooks';
import { mfmt } from '../lib/format';
import { Loading, ErrorState } from '../ui/overlays';

export default function Finance() {
  const { data, isLoading, isError } = useFinance();

  const metrics = data
    ? [
        { icon: 'ti ti-users', label: 'Всего клиентов', value: String(data.totalClients) },
        { icon: 'ti ti-cash', label: 'Средняя стоимость', value: mfmt(data.avgPrice) },
        { icon: 'ti ti-moon', label: 'Средняя длительность', value: `${data.avgNights} сут.` },
        { icon: 'ti ti-trophy', label: 'Самая прибыльная', value: data.topRevenue },
        { icon: 'ti ti-flame', label: 'Самая популярная', value: data.topPopular },
        { icon: 'ti ti-chart-pie', label: 'Загрузка дома', value: `${data.load}%` },
      ]
    : [];

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', padding: '6px 20px 14px' }}>Финансы</div>
      {isLoading && <Loading />}
      {isError && <ErrorState />}
      {data && (
        <>
          <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg,#155dfc,#2b7fff)', borderRadius: '18px', padding: '14px', color: '#fff', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>Доход за месяц</div>
              <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '2px' }}>{mfmt(data.month)}</div>
              <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="ti ti-trending-up" />Загрузка дома — {data.load}%</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '13px' }}><div style={{ fontSize: '12px', color: '#737373' }}>Сегодня</div><div style={{ fontSize: '19px', fontWeight: 700, marginTop: '2px' }}>{mfmt(data.today)}</div></div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '13px' }}><div style={{ fontSize: '12px', color: '#737373' }}>За неделю</div><div style={{ fontSize: '19px', fontWeight: 700, marginTop: '2px' }}>{mfmt(data.week)}</div></div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '13px', gridColumn: 'span 2' }}><div style={{ fontSize: '12px', color: '#737373' }}>Доход за год</div><div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{mfmt(data.year)}</div></div>
          </div>
          <div style={{ padding: '18px 20px 0', fontSize: '13px', fontWeight: 600, color: '#737373' }}>Показатели</div>
          <div style={{ padding: '10px 20px 0', display: 'flex', flexDirection: 'column' }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid #f0f0f0', borderRadius: '14px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#525252', display: 'flex', alignItems: 'center', gap: '9px' }}><i className={m.icon} style={{ color: '#155dfc', fontSize: '18px' }} />{m.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ height: '24px' }} />
    </div>
  );
}
