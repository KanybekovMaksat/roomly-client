// Обёртки для нижних «шторок», центральных модалок и индикатора загрузки.

export function Backdrop({ onClick, zIndex = 50, center = false, children }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex,
        animation: 'fadeIn .2s ease',
        ...(center
          ? { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px' }
          : {}),
      }}
    >
      {children}
    </div>
  );
}

export function Sheet({ children }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff',
      borderRadius: '24px 24px 0 0', padding: '20px 20px 28px', zIndex: 51,
      animation: 'sheetUp .25s cubic-bezier(.2,.8,.2,1)', maxHeight: '80%', overflowY: 'auto',
    }}>
      <div style={{ width: '36px', height: '4px', borderRadius: '9999px', background: '#e5e5e5', margin: '0 auto 16px' }} />
      {children}
    </div>
  );
}

const stop = (e) => e.stopPropagation();

export function CenterCard({ children, maxWidth = 300 }) {
  return (
    <div onClick={stop} style={{
      background: '#fff', borderRadius: '22px', padding: '22px', width: '100%', maxWidth,
    }}>
      {children}
    </div>
  );
}

export function Loading({ text = 'Загрузка…' }) {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center', color: '#a1a1a1', fontSize: '14px' }}>
      <i className="ti ti-loader-2" style={{ fontSize: '26px', display: 'block', marginBottom: '10px', animation: 'spin 1s linear infinite' }} />
      {text}
    </div>
  );
}

export function ErrorState({ text = 'Не удалось загрузить данные' }) {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#e7000b', fontSize: '14px' }}>
      <i className="ti ti-wifi-off" style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }} />
      {text}
    </div>
  );
}
