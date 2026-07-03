import { IconTrendingUp, IconUsers, IconCash, IconMoon, IconTrophy, IconFlame, IconChartPie } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export default function Finance() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['finance'],
    queryFn: async () => (await api.get('/dashboard/finance')).data
  });

  const formatMoney = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' сом';
  };

  if (isLoading) {
    return <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', padding: '24px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Загрузка...</div>;
  }

  const { month, today, week, year, load, totalClients, avgPrice, avgNights, topRevenue, topPopular } = stats || {};

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', position: 'relative' }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Финансы</div>
        
        <div style={{ background: 'var(--color-primary)', borderRadius: '24px', padding: '24px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', boxShadow: '0 8px 32px rgba(29, 78, 216, 0.2)' }}>
          <div style={{ fontSize: '15px', fontWeight: 500, opacity: 0.9 }}>Доход за месяц</div>
          <div style={{ fontSize: '38px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px' }}>{formatMoney(month)}</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '16px', alignSelf: 'flex-start' }}>
            <IconTrendingUp size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Загрузка дома — {load}%</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Сегодня</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{formatMoney(today)}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>За неделю</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{formatMoney(week)}</div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '20px', padding: '20px', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Доход за год</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatMoney(year)}</div>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '8px' }}>
          Показатели
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-border-dark)', borderRadius: '24px', padding: '8px 16px', marginBottom: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconUsers size={20} /></div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>Всего клиентов</div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{totalClients}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCash size={20} /></div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>Средняя стоимость</div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{formatMoney(avgPrice)}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconMoon size={20} /></div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>Средняя длительность</div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{avgNights} сут.</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTrophy size={20} /></div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>Самая прибыльная</div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{topRevenue}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconFlame size={20} /></div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>Самая популярная</div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{topPopular}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconChartPie size={20} /></div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>Загрузка дома</div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{load}%</div>
          </div>
        </div>

      </div>
    </div>
  );
}
