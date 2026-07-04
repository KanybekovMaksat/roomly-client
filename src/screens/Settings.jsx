import { useQueryClient } from '@tanstack/react-query';
import { useRooms, useSettings } from '../hooks';
import { useAuth, useNav, useToast } from '../store';
import { perPersonFmt } from '../lib/format';
import { headerBar, roundBtn } from '../lib/styles';
import { Loading } from '../ui/overlays';
import { exportBookings } from '../lib/exporter';

const currencyLabel = (c) => (c === 'KGS' ? 'Сом (KGS)' : c || '—');

export default function Settings() {
  const { back, push } = useNav();
  const toast = useToast();
  const { logout } = useAuth();
  const qc = useQueryClient();
  const { data: s, isLoading } = useSettings();
  const { data: rooms } = useRooms();

  const handleLogout = () => {
    qc.clear();
    logout();
  };

  const handleExport = async (format) => {
    try {
      toast.show(format === 'excel' ? 'Готовим Excel…' : 'Готовим PDF…');
      const n = await exportBookings(format, s?.houseName);
      toast.show(
        format === 'excel'
          ? `Excel-файл сформирован (${n})`
          : 'Открыт диалог печати — сохраните в PDF',
      );
    } catch (e) {
      toast.show('Не удалось выполнить экспорт');
    }
  };

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={headerBar}>
        <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Настройки</div>
      </div>
      {isLoading && <Loading />}
      {s && (
        <div style={{ padding: '16px 20px 28px' }}>
          <div style={grpLabel}>Гостевой дом</div>
          <div style={grp}>
            <KV label="Название" value={`«${s.houseName}»`} />
            <KV label="Адрес" value={s.address} border />
            <KV label="Телефон" value={s.phone} border />
            <KV label="Валюта" value={currencyLabel(s.currency)} border />
          </div>

          <div style={{ ...grpLabel, marginTop: '18px' }}>Время</div>
          <div style={grp}>
            <KV label="Время заселения" value={s.checkInTime} />
            <KV label="Время выселения" value={s.checkOutTime} border />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#737373' }}>Комнаты и цены</div>
            <div onClick={() => push('roomForm')} style={{ fontSize: '12px', fontWeight: 600, color: '#155dfc', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}><i className="ti ti-plus" />Добавить</div>
          </div>
          <div style={grp}>
            {rooms?.map((r, i) => (
              <div key={r.id} onClick={() => push('roomForm', { id: r.id })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', borderTop: i === 0 ? 'none' : '1px solid #f5f5f5', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{r.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#155dfc', fontWeight: 600 }}>{perPersonFmt(r.pricePerDay)}<i className="ti ti-chevron-right" style={{ color: '#a1a1a1' }} /></span>
              </div>
            ))}
          </div>

          <div style={{ ...grpLabel, marginTop: '18px' }}>Экспорт данных</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div onClick={() => handleExport('excel')} style={{ ...exportBtn, color: '#00a63e' }}><i className="ti ti-file-spreadsheet" style={{ fontSize: '22px' }} />Excel</div>
            <div onClick={() => handleExport('pdf')} style={{ ...exportBtn, color: '#e7000b' }}><i className="ti ti-file-type-pdf" style={{ fontSize: '22px' }} />PDF</div>
          </div>

          <div onClick={handleLogout} style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '14px 0', borderRadius: '14px', background: '#fff', border: '1px solid #ffe2e2', color: '#e7000b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <i className="ti ti-logout" />Выйти
          </div>

          <div style={{ textAlign: 'center', color: '#c4c4c4', fontSize: '11px', padding: '28px 0 8px' }}>Roomly · Developed by .51 · v1.0</div>
        </div>
      )}
    </div>
  );
}

const grpLabel = { fontSize: '12px', fontWeight: 600, color: '#737373', marginBottom: '8px' };
const grp = { background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', overflow: 'hidden' };
const exportBtn = { flex: 1, background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' };

const KV = ({ label, value, border }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 14px', fontSize: '14px', borderTop: border ? '1px solid #f5f5f5' : 'none' }}>
    <span style={{ color: '#737373' }}>{label}</span>
    <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
  </div>
);
