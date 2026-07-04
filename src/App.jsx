import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModalsProvider, NavProvider, ToastProvider, useNav } from './store';
import { BottomNav, Fab } from './ui/chrome';

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 10000, retry: 1 } },
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
  const { cur, push } = useNav();
  const Screen = SCREENS[cur.screen] || Home;
  const { screen, ...params } = cur;

  return (
    <div className="app-container">
      <div className="mobile-frame">
        <Screen key={JSON.stringify(cur)} {...params} />
        {NAV_SCREENS.includes(cur.screen) && <BottomNav />}
        {FAB_SCREENS.includes(cur.screen) && <Fab onClick={() => push('bookingForm')} />}
        <Modals />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavProvider>
        <ToastProvider>
          <ModalsProvider>
            <Shell />
          </ModalsProvider>
        </ToastProvider>
      </NavProvider>
    </QueryClientProvider>
  );
}
