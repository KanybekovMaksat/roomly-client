import { useLogs } from '../hooks';
import { useNav } from '../store';
import { dtfmt } from '../lib/format';
import { headerBar, roundBtn } from '../lib/styles';
import { Loading, ErrorState } from '../ui/overlays';

// action -> внешний вид (иконка / цвет / фон)
const STYLE = {
  PAYMENT_ADDED: ['ti ti-cash', '#00a63e', '#eafff2'],
  CREATE_BOOKING: ['ti ti-calendar-plus', '#155dfc', '#eff6ff'],
  UPDATE_BOOKING: ['ti ti-edit', '#155dfc', '#eff6ff'],
  EXTEND_BOOKING: ['ti ti-calendar-plus', '#155dfc', '#eff6ff'],
  COMPLETE_BOOKING: ['ti ti-circle-check', '#00a63e', '#eafff2'],
  DELETE_BOOKING: ['ti ti-trash', '#e7000b', '#fef2f2'],
  CREATE_ROOM: ['ti ti-door', '#00a63e', '#eafff2'],
  UPDATE_ROOM: ['ti ti-edit', '#c2410c', '#fffbeb'],
  DELETE_ROOM: ['ti ti-trash', '#e7000b', '#fef2f2'],
  CHECKIN: ['ti ti-login-2', '#155dfc', '#eff6ff'],
  CHECKOUT: ['ti ti-logout-2', '#fd9a00', '#fff7ed'],
};
const styleFor = (action) => STYLE[action] || ['ti ti-history', '#525252', '#f5f5f5'];

export default function Changelog() {
  const { back } = useNav();
  const { data, isLoading, isError } = useLogs();

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={headerBar}>
        <div onClick={back} style={roundBtn}><i className="ti ti-chevron-left" /></div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Журнал изменений</div>
      </div>
      <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isLoading && <Loading />}
        {isError && <ErrorState />}
        {data?.map((l) => {
          const [icon, color, bg] = styleFor(l.action);
          return (
            <div key={l.id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '13px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: bg, color, flexShrink: 0 }}><i className={icon} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{l.title}</div>
                {l.sub && <div style={{ fontSize: '13px', color: '#525252', marginTop: '1px' }}>{l.sub}</div>}
                <div style={{ fontSize: '11px', color: '#a1a1a1', marginTop: '3px' }}>{dtfmt(l.createdAt)}</div>
              </div>
            </div>
          );
        })}
        {data && data.length === 0 && <div style={{ textAlign: 'center', color: '#a1a1a1', padding: '40px 0', fontSize: '14px' }}>Записей пока нет</div>}
      </div>
    </div>
  );
}
