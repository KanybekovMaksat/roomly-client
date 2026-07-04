// Форматирование денег и дат — как в дизайн-прототипе.

export const mfmt = (n) => (Number(n) || 0).toLocaleString('ru-RU') + ' сом';
export const perPersonFmt = (n) => mfmt(n) + ' / чел.';

/** 'YYYY-MM-DD' -> 'DD.MM' */
export const dfmt = (d) => {
  if (!d) return '—';
  const p = String(d).split('-');
  return p[2] + '.' + p[1];
};

/** 'YYYY-MM-DD' -> 'DD.MM.YYYY' */
export const dfmtY = (d) => {
  if (!d) return '—';
  const p = String(d).split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
};

export const dateRange = (a, b) => `${dfmt(a)} – ${dfmt(b)}`;

/** ISO-время из createdAt -> 'DD.MM.YYYY, HH:MM' */
export const dtfmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Иконка способа оплаты. */
export const methodIcon = (m) =>
  m === 'Наличные'
    ? 'ti ti-cash'
    : m === 'Банковская карта'
      ? 'ti ti-credit-card'
      : 'ti ti-arrows-exchange';

// ---- даты ----
export const todayStr = () => new Date().toISOString().slice(0, 10);

export const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  const n = Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  return n > 0 ? n : 0;
};

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
export const monthName = (m) => MONTHS[m];
