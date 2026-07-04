import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, ModalsProvider, NavProvider, ToastProvider, useAuth, useNav } from './store';
import { BottomNav, Fab } from './ui/chrome';

import Login from './screens/Login';
import Home from './screens/Home';
import Bookings from './screens/Bookings';
import Rooms from './screens/Rooms';
import Finance from './screens/Finance';
import More from './screens/More';
import BookingForm from './screens/BookingForm';
import BookingCard from './screens/BookingCard';
import RoomForm from './screens/RoomForm';
import RoomCard from './screens/RoomCard';
import Clients from './screens/Clients';
import ClientCard from './screens/ClientCard';
import Calendar from './screens/Calendar';
import Changelog from './screens/Changelog';
import Settings from './screens/Settings';
import Modals from './screens/Modals';

// Повторяем только сетевые сбои и 5xx (до 2 раз, с нарастающей паузой);
// клиентские ошибки 4xx (валидация, конфликт, 401) повторять бессмысленно.
const shouldRetry = (failureCount, error) => {
  const status = error?.response?.status;
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 2;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 10000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
    // Мутации (создание/оплата/удаление) не повторяем автоматически —
    // иначе при разрыве связи возможны дубли записей.
    mutations: { retry: 0 },
  },
});

const SCREENS = {
  home: Home,
  bookings: Bookings,
  rooms: Rooms,
  finance: Finance,
  more: More,
  bookingForm: BookingForm,
  bookingCard: BookingCard,
  roomForm: RoomForm,
  roomCard: RoomCard,
  clients: Clients,
  clientCard: ClientCard,
  calendar: Calendar,
  changelog: Changelog,
  settings: Settings,
};

const NAV_SCREENS = ['home', 'bookings', 'rooms', 'finance', 'more', 'bookingCard', 'roomCard', 'clients', 'clientCard', 'calendar', 'settings', 'changelog'];
const FAB_SCREENS = ['home', 'bookings'];

function Shell() {
  const { authed } = useAuth();
  const { cur, push } = useNav();
  const Screen = SCREENS[cur.screen] || Home;
  const { screen, ...params } = cur;

  return (
    <div className="app-container">
      <div className="mobile-frame">
        {!authed ? (
          <Login />
        ) : (
          <>
            <Screen key={JSON.stringify(cur)} {...params} />
            {NAV_SCREENS.includes(cur.screen) && <BottomNav />}
            {FAB_SCREENS.includes(cur.screen) && <Fab onClick={() => push('bookingForm')} />}
            <Modals />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavProvider>
          <ToastProvider>
            <ModalsProvider>
              <Shell />
            </ModalsProvider>
          </ToastProvider>
        </NavProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
