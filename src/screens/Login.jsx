import { useState } from 'react';
import { useLogin } from '../hooks';
import { useAuth } from '../store';

// Единственный пользователь — логин фиксирован, вход по 4-значному PIN.
const LOGIN = 'aktan';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

export default function Login() {
  const { login } = useAuth();
  const doLogin = useLogin();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const submitting = doLogin.isPending;

  const submit = async (code) => {
    try {
      const res = await doLogin.mutateAsync({ login: LOGIN, password: code });
      login(res.token);
    } catch {
      setErr(true);
      setPin('');
      setTimeout(() => setErr(false), 700);
    }
  };

  const onDigit = (d) => {
    if (submitting || pin.length >= 4) return;
    setErr(false);
    const next = pin + d;
    setPin(next);
    if (next.length === 4) submit(next);
  };
  const onBack = () => {
    if (submitting) return;
    setErr(false);
    setPin((p) => p.slice(0, -1));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa', padding: '48px 28px 34px', minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '18px' }}>
        <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: '#155dfc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 10px 24px rgba(21,93,252,0.28)' }}>
          <i className="ti ti-building-community" />
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '16px', letterSpacing: '-0.02em' }}>Roomly</div>
        <div style={{ fontSize: '13px', color: '#a1a1a1', marginTop: '2px' }}>Гостевой дом «Алия-Д»</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '22px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '9999px', padding: '7px 14px 7px 8px' }}>
          <span style={{ width: '26px', height: '26px', borderRadius: '9999px', background: '#eff6ff', color: '#155dfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}><i className="ti ti-user" /></span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{LOGIN}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: '#737373', marginBottom: '16px' }}>
          {submitting ? 'Проверяем…' : err ? <span style={{ color: '#e7000b', fontWeight: 500 }}>Неверный PIN-код</span> : 'Введите PIN-код'}
        </div>
        <div style={{ display: 'flex', gap: '16px', animation: err ? 'shake .4s' : 'none' }}>
          {[0, 1, 2, 3].map((i) => {
            const filled = i < pin.length;
            return (
              <div key={i} style={{ width: '15px', height: '15px', borderRadius: '9999px', transition: 'all .15s', background: err ? '#e7000b' : filled ? '#155dfc' : 'transparent', border: `2px solid ${err ? '#e7000b' : filled ? '#155dfc' : '#d4d4d4'}` }} />
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '100%', maxWidth: '300px' }}>
        {KEYS.map((k, i) => {
          if (k === '') return <div key={i} />;
          if (k === 'back')
            return (
              <div key={i} onClick={onBack} style={{ ...keyStyle, background: 'transparent', color: '#525252', fontSize: '24px' }}>
                <i className="ti ti-backspace" />
              </div>
            );
          return (
            <div key={i} onClick={() => onDigit(k)} style={keyStyle}>{k}</div>
          );
        })}
      </div>
    </div>
  );
}

const keyStyle = {
  height: '62px',
  borderRadius: '9999px',
  background: '#fff',
  border: '1px solid #ececec',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 600,
  color: '#0a0a0a',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
};
