import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { del, get, post, put } from './api';

// ---------------- queries ----------------
export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard', 'stats'], queryFn: () => get('/dashboard/stats') });

export const useFinance = () =>
  useQuery({ queryKey: ['dashboard', 'finance'], queryFn: () => get('/dashboard/finance') });

export const useBookings = (search = '', filter = 'Все') =>
  useQuery({
    queryKey: ['bookings', { search, filter }],
    queryFn: () => get('/bookings', { params: { search, filter } }),
  });

export const useBooking = (id) =>
  useQuery({ queryKey: ['booking', id], queryFn: () => get(`/bookings/${id}`), enabled: !!id });

export const useRooms = () =>
  useQuery({ queryKey: ['rooms'], queryFn: () => get('/rooms') });

export const useRoom = (id) =>
  useQuery({ queryKey: ['room', id], queryFn: () => get(`/rooms/${id}`), enabled: !!id });

export const useClients = (search = '') =>
  useQuery({
    queryKey: ['clients', { search }],
    queryFn: () => get('/clients', { params: { search } }),
  });

export const useClient = (id) =>
  useQuery({ queryKey: ['client', id], queryFn: () => get(`/clients/${id}`), enabled: !!id });

export const useLogs = () =>
  useQuery({ queryKey: ['logs'], queryFn: () => get('/logs') });

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => get('/settings') });

export const useAvailability = ({ roomId, checkIn, checkOut, excludeId, enabled }) =>
  useQuery({
    queryKey: ['availability', { roomId, checkIn, checkOut, excludeId }],
    queryFn: () =>
      get('/bookings/availability', { params: { roomId, checkIn, checkOut, excludeId } }),
    enabled: !!enabled,
  });

// ---------------- mutations ----------------
// Любая мутация освежает все данные (приложение небольшое — так проще и надёжнее).
const useInvalidateAll = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
};

export const useCreateBooking = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (body) => post('/bookings', body), onSuccess: inv });
};

export const useUpdateBooking = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: ({ id, body }) => put(`/bookings/${id}`, body), onSuccess: inv });
};

export const useExtendBooking = () => {
  const inv = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, nights }) => post(`/bookings/${id}/extend`, { nights }),
    onSuccess: inv,
  });
};

export const useCompleteBooking = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (id) => post(`/bookings/${id}/complete`, {}), onSuccess: inv });
};

export const useDeleteBooking = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (id) => del(`/bookings/${id}`), onSuccess: inv });
};

export const useAddPayment = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (body) => post('/payments', body), onSuccess: inv });
};

export const useCreateRoom = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (body) => post('/rooms', body), onSuccess: inv });
};

export const useUpdateRoom = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: ({ id, body }) => put(`/rooms/${id}`, body), onSuccess: inv });
};

export const useDeleteRoom = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (id) => del(`/rooms/${id}`), onSuccess: inv });
};
