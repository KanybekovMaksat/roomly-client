import { useState } from 'react';
import { useFinance } from '../hooks';
import { mfmt, dfmt, dfmtY } from '../lib/format';
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
            <div style={miniCard}><div style={miniLbl}>Сегодня</div><div style={miniVal}>{mfmt(data.today)}</div></div>
            <div style={miniCard}><div style={miniLbl}>За неделю</div><div style={miniVal}>{mfmt(data.week)}</div></div>
            <div style={{ ...miniCard, gridColumn: 'span 2' }}><div style={miniLbl}>Доход за год</div><div style={{ ...miniVal, fontSize: '22px' }}>{mfmt(data.year)}</div></div>
          </div>

          {/* Ожидается к оплате */}
          {data.outstanding > 0 && (
            <div style={{ margin: '12px 20px 0', background: '#fff', border: '1px solid #ffe2e2', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', color: '#e7000b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><i className="ti ti-clock-dollar" /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#737373' }}>Ожидается к оплате</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#e7000b' }}>{mfmt(data.outstanding)}</div>
              </div>
            </div>
          )}

          {/* Динамика дохода: дни / недели */}
          <TrendChart byDay={data.byDay || []} byWeek={data.byWeek || []} />

          {/* Доход по комнатам */}
          <RoomChart rooms={data.byRoom || []} />

          {/* Способы оплаты */}
          <MethodBreakdown methods={data.byMethod || []} />

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

// ---- Столбчатый график динамики (дни / недели) ----
function TrendChart({ byDay, byWeek }) {
  const [mode, setMode] = useState('days');
  const [sel, setSel] = useState(null);

  const raw = mode === 'days' ? byDay : byWeek;
  const data = raw.map((r) =>
    mode === 'days'
      ? { amount: r.amount, x: r.date.slice(8, 10), cap: dfmtY(r.date) }
      : { amount: r.amount, x: dfmt(r.start), cap: `${dfmt(r.start)} – ${dfmt(r.end)}` },
  );
  const max = Math.max(...data.map((d) => d.amount), 1);
  const selIdx = sel == null ? data.length - 1 : Math.min(sel, data.length - 1);
  const cur = data[selIdx] || { amount: 0, cap: '—' };
  const total = data.reduce((a, d) => a + d.amount, 0);
  const H = 120;

  const switchMode = (m) => { setMode(m); setSel(null); };

  return (
    <div style={{ ...panel, marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={panelTitle}>Динамика дохода</div>
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '9999px', padding: '3px' }}>
          {[['days', 'Дни'], ['weeks', 'Недели']].map(([m, lbl]) => (
            <div key={m} onClick={() => switchMode(m)} style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: mode === m ? '#155dfc' : 'transparent', color: mode === m ? '#fff' : '#737373' }}>{lbl}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px', fontWeight: 700 }}>{mfmt(cur.amount)}</span>
        <span style={{ fontSize: '12px', color: '#a1a1a1' }}>{cur.cap}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: mode === 'days' ? '3px' : '6px', height: `${H}px` }}>
        {data.map((d, i) => {
          const h = d.amount > 0 ? Math.max(5, Math.round((d.amount / max) * H)) : 2;
          const active = i === selIdx;
          return (
            <div key={i} onClick={() => setSel(i)} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', cursor: 'pointer' }}>
              <div style={{ height: `${h}px`, borderRadius: '5px 5px 3px 3px', background: active ? '#155dfc' : d.amount > 0 ? '#c9ddff' : '#ececec', transition: 'background .15s' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: mode === 'days' ? '3px' : '6px', marginTop: '6px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: i === selIdx ? '#155dfc' : '#a1a1a1', fontWeight: i === selIdx ? 600 : 400, overflow: 'hidden', whiteSpace: 'nowrap' }}>{d.x}</div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #f5f5f5', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#737373' }}>
        <span>{mode === 'days' ? 'За 14 дней' : 'За 8 недель'}</span>
        <span style={{ fontWeight: 600, color: '#0a0a0a' }}>{mfmt(total)}</span>
      </div>
    </div>
  );
}

// ---- Доход по комнатам (горизонтальные полосы) ----
function RoomChart({ rooms }) {
  if (!rooms.length) return null;
  const max = Math.max(...rooms.map((r) => r.amount), 1);
  const shown = rooms.slice(0, 12);
  return (
    <div style={{ ...panel, marginTop: '12px' }}>
      <div style={{ ...panelTitle, marginBottom: '12px' }}>Доход по комнатам</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shown.map((r) => (
          <div key={r.roomId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '42px', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>{r.name}</span>
            <div style={{ flex: 1, height: '20px', background: '#f5f5f5', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(3, (r.amount / max) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#155dfc,#4f8bff)', borderRadius: '6px' }} />
            </div>
            <span style={{ width: '76px', textAlign: 'right', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>{mfmt(r.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Способы оплаты ----
const METHOD_ICON = { 'Наличные': 'ti ti-cash', 'Банковская карта': 'ti ti-credit-card', 'Перевод': 'ti ti-arrows-exchange' };
function MethodBreakdown({ methods }) {
  if (!methods.length) return null;
  const total = methods.reduce((a, m) => a + m.amount, 0) || 1;
  return (
    <div style={{ ...panel, marginTop: '12px' }}>
      <div style={{ ...panelTitle, marginBottom: '12px' }}>Способы оплаты</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {methods.map((m) => {
          const pct = Math.round((m.amount / total) * 100);
          return (
            <div key={m.method}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#525252' }}><i className={METHOD_ICON[m.method] || 'ti ti-cash'} style={{ color: '#155dfc' }} />{m.method}</span>
                <span style={{ fontWeight: 600 }}>{mfmt(m.amount)} · {pct}%</span>
              </div>
              <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: '#155dfc', borderRadius: '9999px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const miniCard = { background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '13px' };
const miniLbl = { fontSize: '12px', color: '#737373' };
const miniVal = { fontSize: '19px', fontWeight: 700, marginTop: '2px' };
const panel = { margin: '0 20px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '18px', padding: '16px' };
const panelTitle = { fontSize: '14px', fontWeight: 600 };
