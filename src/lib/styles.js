// Общие стилевые объекты (пиксель-в-пиксель из дизайна home/).

const pill = {
  fontSize: '11px',
  fontWeight: 600,
  padding: '4px 10px',
  borderRadius: '9999px',
  whiteSpace: 'nowrap',
};

/** Плашка статуса оплаты по значению payStatus ('Оплачено' | 'Частично' | 'Не оплачено'). */
export const payStyle = (status) => {
  if (status === 'Оплачено') return { ...pill, background: '#eafff2', color: '#00a63e' };
  if (status === 'Частично') return { ...pill, background: '#fffbeb', color: '#c2410c' };
  return { ...pill, background: '#fef2f2', color: '#e7000b' };
};

const statusPill = { fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '9999px', whiteSpace: 'nowrap' };

/** Плашка статуса комнаты по ключу (free|occupied|soon|inactive). */
export const roomStatusStyle = (key) => {
  if (key === 'free') return { ...statusPill, background: '#eafff2', color: '#00a63e' };
  if (key === 'occupied') return { ...statusPill, background: '#eff6ff', color: '#155dfc' };
  if (key === 'soon') return { ...statusPill, background: '#fffbeb', color: '#c2410c' };
  return { ...statusPill, background: '#f5f5f5', color: '#737373' };
};

/** Иконка-квадрат комнаты по ключу статуса. */
export const roomIconStyle = (key) => {
  const base = {
    width: '46px', height: '46px', borderRadius: '14px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0,
  };
  if (key === 'free') return { ...base, background: '#eafff2', color: '#00a63e' };
  if (key === 'occupied') return { ...base, background: '#eff6ff', color: '#155dfc' };
  if (key === 'soon') return { ...base, background: '#fffbeb', color: '#fd9a00' };
  return { ...base, background: '#f5f5f5', color: '#a1a1a1' };
};

/** Плашка статуса брони на карточке. */
export const bookingStatusStyle = (status) => {
  if (status === 'completed') return { ...statusPill, background: '#f5f5f5', color: '#737373' };
  if (status === 'future') return { ...statusPill, background: '#f7f7f7', color: '#525252' };
  if (status === 'cancelled') return { ...statusPill, background: '#fef2f2', color: '#e7000b' };
  return { ...statusPill, background: '#eafff2', color: '#00a63e' };
};

export const bookingStatusLabel = (status) =>
  status === 'completed' ? 'Завершено'
    : status === 'future' ? 'Будущее'
      : status === 'cancelled' ? 'Отменено'
        : 'Активно';

// Общие часто используемые стили
export const card = {
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '18px',
  padding: '14px',
};

export const input = {
  border: '1px solid #e5e5e5',
  borderRadius: '12px',
  padding: '13px 14px',
  fontSize: '15px',
  background: '#fff',
  width: '100%',
};

export const label = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#737373',
  marginBottom: '8px',
};

export const screen = {
  flex: 1,
  overflowY: 'auto',
  background: '#fafafa',
  minHeight: 0,
};

export const headerBar = {
  flexShrink: 0,
  height: '54px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '0 12px',
  background: '#fff',
  borderBottom: '1px solid #f0f0f0',
};

export const roundBtn = {
  width: '38px',
  height: '38px',
  borderRadius: '9999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  cursor: 'pointer',
};
