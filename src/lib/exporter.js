// Экспорт бронирований в Excel (.xls) и PDF (через диалог печати браузера).
// Без внешних зависимостей.
import { get } from '../api';

const statusRu = (s) =>
  ({ active: 'Активно', future: 'Будущее', completed: 'Завершено', cancelled: 'Отменено' }[s] || s);

// Колонки: [заголовок, функция значения]
const COLS = [
  ['Клиент', (b) => b.client],
  ['Телефон', (b) => b.phone || ''],
  ['Комната', (b) => b.roomName],
  ['Заезд', (b) => b.checkIn],
  ['Выезд', (b) => b.checkOut],
  ['Суток', (b) => b.days],
  ['Гостей', (b) => b.guests],
  ['Стоимость', (b) => b.totalPrice],
  ['Оплачено', (b) => b.paid],
  ['Остаток', (b) => b.remaining],
  ['Оплата', (b) => b.payStatus],
  ['Статус', (b) => statusRu(b.status)],
];

const esc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const download = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const stamp = () => new Date().toISOString().slice(0, 10);

function buildRows(rows, tdStyle = '') {
  const head = COLS.map(([h]) => `<th${tdStyle ? '' : ''}>${h}</th>`).join('');
  const body = rows
    .map(
      (b) => `<tr>${COLS.map(([, f]) => `<td>${esc(f(b))}</td>`).join('')}</tr>`,
    )
    .join('');
  return { head, body };
}

function toExcel(rows, title) {
  const { head, body } = buildRows(rows);
  const html =
    `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head>` +
    `<body><h3>${esc(title)}</h3>` +
    `<table border="1" cellspacing="0" cellpadding="4">` +
    `<thead><tr style="background:#155dfc;color:#fff;font-weight:bold;">${head}</tr></thead>` +
    `<tbody>${body}</tbody></table></body></html>`;
  const blob = new Blob(['﻿', html], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  download(blob, `roomly-bookings-${stamp()}.xls`);
}

// PDF формируется через диалог печати браузера («Сохранить как PDF»).
// Печатаем скрытый iframe в том же документе — это надёжнее window.open,
// который блокируется всплывающими окнами (особенно в PWA и на телефоне).
function toPdf(rows, title) {
  const { head, body } = buildRows(rows);
  const html =
    `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      *{font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;}
      body{margin:0;color:#0a0a0a;}
      h3{font-size:16px;margin:0 0 14px;}
      table{border-collapse:collapse;width:100%;font-size:11px;}
      thead th{background:#155dfc;color:#fff;text-align:left;padding:7px 8px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      tbody td{border-bottom:1px solid #eee;padding:6px 8px;white-space:nowrap;}
      tbody tr:nth-child(even){background:#f7f9ff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      @page{size:landscape;margin:12mm;}
    </style></head><body><h3>${esc(title)}</h3>` +
    `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>` +
    `</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, {
    position: 'fixed', right: '0', bottom: '0',
    width: '0', height: '0', border: '0', visibility: 'hidden',
  });
  document.body.appendChild(iframe);

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    setTimeout(() => iframe.remove(), 500);
  };

  const doPrint = () => {
    const win = iframe.contentWindow;
    if (!win) return cleanup();
    try {
      win.focus();
      if (win.onafterprint !== undefined) win.onafterprint = cleanup;
      win.print();
    } catch {
      cleanup();
    }
    // Подстраховка на случай, если onafterprint не сработает.
    setTimeout(cleanup, 60000);
  };

  iframe.onload = () => setTimeout(doPrint, 250);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}

/**
 * Забирает все брони и экспортирует в выбранный формат.
 * @param {'excel'|'pdf'} format
 * @param {string} houseName — для заголовка
 * @returns {Promise<number>} число выгруженных записей
 */
export async function exportBookings(format, houseName = '') {
  const rows = await get('/bookings', { params: { filter: 'Все' } });
  // В выгрузке — хронологический порядок: самые ранние брони сверху
  // (по дате заезда, затем по времени создания записи).
  rows.sort((a, b) =>
    a.checkIn < b.checkIn ? -1
      : a.checkIn > b.checkIn ? 1
        : String(a.createdAt || '') < String(b.createdAt || '') ? -1 : 1,
  );
  const today = new Date().toLocaleDateString('ru-RU');
  const title = `Бронирования${houseName ? ` — ${houseName}` : ''} · ${today}`;
  if (format === 'excel') toExcel(rows, title);
  else toPdf(rows, title);
  return rows.length;
}
