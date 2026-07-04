import { useRooms } from '../hooks';
import { useNav } from '../store';
import { perPersonFmt } from '../lib/format';
import { roomStatusStyle, roomIconStyle } from '../lib/styles';
import { Loading, ErrorState } from '../ui/overlays';

export default function Rooms() {
  const { push } = useNav();
  const { data, isLoading, isError } = useRooms();

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto', background: '#fafafa', minHeight: 0 }}>
      <div style={{ padding: '6px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', padding: '6px 0 14px' }}>Комнаты</div>
        <div onClick={() => push('roomForm')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#155dfc', color: '#fff', fontSize: '13px', fontWeight: 500, borderRadius: '9999px', padding: '8px 14px', cursor: 'pointer' }}><i className="ti ti-plus" />Комната</div>
      </div>
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading && <Loading />}
        {isError && <ErrorState />}
        {data?.map((r) => (
          <div key={r.id} onClick={() => push('roomCard', { id: r.id })} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '18px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
            <div style={roomIconStyle(r.status)}><i className="ti ti-bed-filled" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>{r.name}</span>
                <span style={roomStatusStyle(r.status)}>{r.statusLabel}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#737373', marginTop: '2px' }}>{perPersonFmt(r.pricePerDay)} · {r.capacity} мест.</div>
              {r.guest && <div style={{ fontSize: '12px', color: '#155dfc', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="ti ti-user" style={{ fontSize: '12px' }} />{r.guest}</div>}
            </div>
            <i className="ti ti-chevron-right" style={{ color: '#a1a1a1' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
