import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getToken, setToken } from './api';

// ------------------------------------------------------------------
// Авторизация — единый пользователь-администратор, токен в localStorage.
// ------------------------------------------------------------------
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(!!getToken());

  useEffect(() => {
    const onUnauth = () => setAuthed(false);
    window.addEventListener('roomly-unauthorized', onUnauth);
    return () => window.removeEventListener('roomly-unauthorized', onUnauth);
  }, []);

  const login = useCallback((token) => {
    setToken(token);
    setAuthed(true);
  }, []);
  const logout = useCallback(() => {
    setToken('');
    setAuthed(false);
  }, []);

  return (
    <AuthCtx.Provider value={{ authed, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

// ------------------------------------------------------------------
// Навигация — стек экранов (как в дизайн-прототипе: push / back / tab).
// ------------------------------------------------------------------
const NavCtx = createContext(null);

export function NavProvider({ children }) {
  const [stack, setStack] = useState([{ screen: 'home' }]);

  const push = useCallback(
    (screen, params = {}) => setStack((s) => [...s, { screen, ...params }]),
    [],
  );
  const tab = useCallback((screen) => setStack([{ screen }]), []);
  const back = useCallback(
    () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    [],
  );
  const resetTo = useCallback((screen) => setStack([{ screen }]), []);

  const cur = stack[stack.length - 1];
  const rootTab = stack[0].screen;

  return (
    <NavCtx.Provider value={{ stack, cur, rootTab, push, tab, back, resetTo }}>
      {children}
    </NavCtx.Provider>
  );
}

export const useNav = () => useContext(NavCtx);

// ------------------------------------------------------------------
// Тосты
// ------------------------------------------------------------------
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState('');
  const timer = useRef(null);
  const show = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 1900);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast, show }}>{children}</ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

// ------------------------------------------------------------------
// Модальные окна (оплата, продление, подтверждение, конфликт, день календаря)
// ------------------------------------------------------------------
const ModalsCtx = createContext(null);

export function ModalsProvider({ children }) {
  const [pay, setPay] = useState(null);
  const [extend, setExtend] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [daySheet, setDaySheet] = useState(null);

  const value = {
    pay, setPay,
    extend, setExtend,
    confirm, setConfirm,
    conflict, setConflict,
    daySheet, setDaySheet,
    openPay: (bookingId) => setPay({ bookingId, amount: '', method: 'Наличные' }),
    openExtend: (bookingId) => setExtend({ bookingId, nights: 1 }),
    askConfirm: (cfg) => setConfirm(cfg),
    showConflict: (info) => setConflict(info),
    openDaySheet: (ds, list) => setDaySheet({ ds, list }),
  };
  return <ModalsCtx.Provider value={value}>{children}</ModalsCtx.Provider>;
}

export const useModals = () => useContext(ModalsCtx);
