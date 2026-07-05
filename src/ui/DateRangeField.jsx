import { useState } from 'react';
import { Backdrop, Sheet } from './overlays';
import { dfmtY, nightsBetween, todayStr, monthName } from '../lib/format';

// Удобный выбор периода одним полем: тап открывает один календарь-модалку,
// где админ нажимает дату заезда, затем дату выезда (подсвечивается диапазон).

const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// «3 ночи» / «1 ночь» / «5 ночей»
const nightsLabel = (n) => {
  const a = Math.abs(n) % 100;
  const b = n % 10;
  if (a > 10 && a < 20) return `${n} ночей`;
  if (b === 1) return `${n} ночь`;
  if (b >= 2 && b <= 4) return `${n} ночи`;
  return `${n} ночей`;
};

export default function DateRangeField({ checkIn, checkOut, onChange }) {
  const [open, setOpen] = useState(false);
  const nights = nightsBetween(checkIn, checkOut);
  const filled = checkIn && checkOut;

  return (
    <>
      <div onClick={() => setOpen(true)} style={fieldWrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={iconBox}><i className="ti ti-calendar-event" /></span>
          <div style={{ minWidth: 0 }}>
            {filled ? (
              <>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', whiteSpace: 'nowrap' }}>
                  {dfmtY(checkIn)} <span style={{ color: '#a1a1a1', fontWeight: 400 }}>→</span> {dfmtY(checkOut)}
                </div>
                <div style={{ fontSize: '12px', color: '#737373', marginTop: '1px' }}>{nightsLabel(nights)}</div>
              </>
            ) : checkIn ? (
              <>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a' }}>{dfmtY(checkIn)} <span style={{ color: '#a1a1a1', fontWeight: 400 }}>→ …</span></div>
                <div style={{ fontSize: '12px', color: '#c2410c', marginTop: '1px' }}>Выберите дату выезда</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#a1a1a1' }}>Выберите даты</div>
                <div style={{ fontSize: '12px', color: '#a1a1a1', marginTop: '1px' }}>Заезд и выезд</div>
              </>
            )}
          </div>
        </div>
        <i className="ti ti-chevron-down" style={{ color: '#a1a1a1', fontSize: '18px', flexShrink: 0 }} />
      </div>

      {open && (
        <DateRangeSheet
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setOpen(false)}
          onApply={(ci, co) => { onChange(ci, co); setOpen(false); }}
        />
      )}
    </>
  );
}

function DateRangeSheet({ checkIn, checkOut, onClose, onApply }) {
  const today = todayStr();
  const [ci, setCi] = useState(checkIn || null);
  const [co, setCo] = useState(checkOut || null);

  const base = new Date(`${ci || checkIn || today}T00:00:00`);
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });

  const shiftMonth = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const onDay = (ds) => {
    // Нет начала, либо диапазон уже полностью выбран → начинаем заново.
    if (!ci || (ci && co)) { setCi(ds); setCo(null); return; }
    // Есть заезд, ждём выезд.
    if (ds <= ci) { setCi(ds); setCo(null); return; }
    setCo(ds);
  };

  const { y, m } = view;
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7; // Пн = 0
  const daysIn = new Date(y, m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(ymd(y, m, d));

  const nights = nightsBetween(ci, co);
  const canApply = !!(ci && co && nights > 0);

  return (
    <>
      <Backdrop onClick={onClose} />
      <Sheet>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>Даты проживания</div>
        <div style={{ fontSize: '13px', color: '#737373', marginBottom: '14px' }}>
          {!ci ? 'Нажмите дату заезда' : !co ? 'Теперь дату выезда' : nightsLabel(nights)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div onClick={() => shiftMonth(-1)} style={navBtn}><i className="ti ti-chevron-left" /></div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>{monthName(m)} {y}</div>
          <div onClick={() => shiftMonth(1)} style={navBtn}><i className="ti ti-chevron-right" /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '4px' }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: '11px', color: '#a1a1a1', fontWeight: 500 }}>{w}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', rowGap: '6px', columnGap: 0 }}>
          {cells.map((ds, i) => {
            if (!ds) return <div key={`e${i}`} />;
            const d = Number(ds.slice(-2));
            const isStart = ds === ci;
            const isEnd = ds === co;
            const inRange = ci && co && ds > ci && ds < co;
            const isEdge = isStart || isEnd;
            const isToday = ds === today;
            // «Полоса» диапазона: у краёв заливаем половину ячейки, чтобы она
            // сомкнулась с круглой отметкой; в середине — вся ячейка.
            const cellBg = inRange
              ? '#eff6ff'
              : isStart && co
                ? 'linear-gradient(to right, transparent 50%, #eff6ff 50%)'
                : isEnd
                  ? 'linear-gradient(to left, transparent 50%, #eff6ff 50%)'
                  : 'transparent';
            return (
              <div key={ds} onClick={() => onDay(ds)} style={{
                position: 'relative', aspectRatio: '1', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: cellBg,
              }}>
                <div style={{
                  width: '84%', aspectRatio: '1', borderRadius: '9999px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: isEdge || isToday ? 700 : 500,
                  background: isEdge ? '#155dfc' : 'transparent',
                  color: isEdge ? '#fff' : (isToday ? '#155dfc' : '#0a0a0a'),
                  border: !isEdge && isToday ? '1px solid #cdddff' : '1px solid transparent',
                }}>{d}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <div onClick={onClose} style={{ flex: '0 0 38%', textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: '#f5f5f5', fontSize: '15px', fontWeight: 600, color: '#525252', cursor: 'pointer' }}>Отмена</div>
          <div onClick={canApply ? () => onApply(ci, co) : undefined} style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderRadius: '9999px', background: canApply ? '#155dfc' : '#c9d6f5', color: '#fff', fontSize: '15px', fontWeight: 600, pointerEvents: canApply ? 'auto' : 'none', cursor: 'pointer' }}>
            {canApply ? `Готово · ${nightsLabel(nights)}` : 'Готово'}
          </div>
        </div>
      </Sheet>
    </>
  );
}

const fieldWrap = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px',
  padding: '12px 14px', cursor: 'pointer', gap: '10px',
};
const iconBox = {
  width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
  background: '#eff6ff', color: '#155dfc', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '19px',
};
const navBtn = {
  width: '36px', height: '36px', borderRadius: '9999px', background: '#f5f5f5',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer',
};
