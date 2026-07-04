import { useAddPayment, useExtendBooking } from '../hooks';
import { useModals, useNav, useToast } from '../store';
import { mfmt, dfmtY, dfmt } from '../lib/format';
import { payStyle } from '../lib/styles';
import { Backdrop, CenterCard, Sheet } from '../ui/overlays';

const METHODS = [['Наличные', 'Наличные'], ['Карта', 'Банковская карта'], ['Перевод', 'Перевод']];

export default function Modals() {
  const m = useModals();
  const toast = useToast();
  const { push } = useNav();
  const addPayment = useAddPayment();
  const extendBooking = useExtendBooking();

  return (
    <>
      {/* Оплата */}
      {m.pay && (
        <>
          <Backdrop onClick={() => m.setPay(null)} />
          <Sheet>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>Добавить оплату</div>
            <div style={{ fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Сумма</div>
            <input value={m.pay.amount} onChange={(e) => m.setPay({ ...m.pay, amount: e.target.value.replace(/[^0-9]/g, '') })} placeholder="0" inputMode="numeric" style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '14px', fontSize: '20px', fontWeight: 700 }} />
            <div style={{ fontSize: '12px', color: '#737373', margin: '14px 0 6px' }}>Способ оплаты</div>
            <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '4px', gap: '2px' }}>
              {METHODS.map(([lbl, full]) => {
                const a = m.pay.method === full;
                return <div key={full} onClick={() => m.setPay({ ...m.pay, method: full })} style={segStyle(a)}>{lbl}</div>;
              })}
            </div>
            <div onClick={async () => {
              const amt = parseInt(m.pay.amount) || 0;
              if (amt <= 0) return toast.show('Введите сумму');
              try {
                await addPayment.mutateAsync({ bookingId: m.pay.bookingId, amount: amt, method: m.pay.method });
                m.setPay(null); toast.show('Оплата добавлена');
              } catch (e) { toast.show(e.response?.data?.message || 'Ошибка'); }
            }} style={{ textAlign: 'center', padding: '15px 0', borderRadius: '9999px', background: '#155dfc', color: '#fff', fontSize: '15px', fontWeight: 600, marginTop: '18px', cursor: 'pointer' }}>
              Добавить {mfmt(parseInt(m.pay.amount) || 0)}
            </div>
          </Sheet>
        </>
      )}

      {/* Продление */}
      {m.extend && (
        <>
          <Backdrop onClick={() => m.setExtend(null)} />
          <Sheet>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Продлить проживание</div>
            <div style={{ fontSize: '13px', color: '#737373', marginBottom: '18px' }}>Дата выезда сдвинется на выбранное число суток.</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '22px' }}>
              <div onClick={() => m.setExtend({ ...m.extend, nights: Math.max(1, m.extend.nights - 1) })} style={bigStep}>−</div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1 }}>{m.extend.nights}</div><div style={{ fontSize: '12px', color: '#a1a1a1' }}>суток</div></div>
              <div onClick={() => m.setExtend({ ...m.extend, nights: m.extend.nights + 1 })} style={bigStep}>+</div>
            </div>
            <div onClick={async () => {
              const n = m.extend.nights;
              try { await extendBooking.mutateAsync({ id: m.extend.bookingId, nights: n }); m.setExtend(null); toast.show(`Проживание продлено на ${n} сут.`); }
              catch (e) { toast.show(e.response?.data?.message || 'Ошибка'); }
            }} style={{ textAlign: 'center', padding: '15px 0', borderRadius: '9999px', background: '#155dfc', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Продлить</div>
          </Sheet>
        </>
      )}

      {/* Конфликт дат */}
      {m.conflict && (
        <Backdrop onClick={() => m.setConflict(null)} center zIndex={55}>
          <CenterCard>
            <div style={{ width: '56px', height: '56px', borderRadius: '9999px', background: '#fef2f2', color: '#e7000b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 14px' }}><i className="ti ti-calendar-x" /></div>
            <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>Комната занята в выбранные даты</div>
            <div style={{ fontSize: '13px', color: '#737373', lineHeight: 1.5, marginBottom: '16px', textAlign: 'center' }}>Создать пересекающееся бронирование нельзя. Выберите другие даты или комнату.</div>
            <div style={{ background: '#f7f7f7', borderRadius: '12px', padding: '12px 14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{m.conflict.client}</div>
              <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>{m.conflict.room} · {m.conflict.range}</div>
            </div>
            <div onClick={() => m.setConflict(null)} style={{ padding: '13px 0', borderRadius: '9999px', background: '#155dfc', color: '#fff', fontSize: '15px', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>Понятно</div>
          </CenterCard>
        </Backdrop>
      )}

      {/* День календаря */}
      {m.daySheet && (
        <>
          <Backdrop onClick={() => m.setDaySheet(null)} />
          <Sheet>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{dfmtY(m.daySheet.ds)}</div>
            <div style={{ fontSize: '13px', color: '#737373', marginBottom: '14px' }}>Заняты в этот день</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {m.daySheet.list.map((b) => (
                <div key={b.id} onClick={() => { m.setDaySheet(null); push('bookingCard', { id: b.id }); }} style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '13px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div><div style={{ fontSize: '15px', fontWeight: 600 }}>{b.client}</div><div style={{ fontSize: '12px', color: '#737373', marginTop: '1px' }}>{b.roomName} · {b.range}</div></div>
                  <div style={payStyle(b.payStatus)}>{b.payStatus}</div>
                </div>
              ))}
            </div>
          </Sheet>
        </>
      )}

      {/* Подтверждение */}
      {m.confirm && (
        <Backdrop onClick={() => m.setConfirm(null)} center>
          <CenterCard>
            <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>{m.confirm.title}</div>
            <div style={{ fontSize: '13px', color: '#737373', lineHeight: 1.5, marginBottom: '20px' }}>{m.confirm.text}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div onClick={() => m.setConfirm(null)} style={{ flex: 1, textAlign: 'center', padding: '13px 0', borderRadius: '9999px', background: '#f5f5f5', fontSize: '15px', fontWeight: 600, color: '#525252', cursor: 'pointer' }}>Отмена</div>
              <button onClick={async () => { const fn = m.confirm.onConfirm; m.setConfirm(null); await fn?.(); }} style={{ flex: 1, padding: '13px 0', borderRadius: '9999px', border: 'none', fontSize: '15px', fontWeight: 600, color: '#fff', background: m.confirm.danger ? '#fb2c36' : '#155dfc', cursor: 'pointer' }}>{m.confirm.btn}</button>
            </div>
          </CenterCard>
        </Backdrop>
      )}

      {/* Тост */}
      {toast.toast && (
        <div style={{ position: 'absolute', bottom: '96px', left: '50%', transform: 'translateX(-50%)', background: '#0a0a0a', color: '#fff', fontSize: '13px', fontWeight: 500, padding: '11px 18px', borderRadius: '9999px', zIndex: 60, animation: 'toastIn .2s ease', display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
          <i className="ti ti-circle-check-filled" style={{ color: '#00c951' }} />{toast.toast}
        </div>
      )}
    </>
  );
}

const segStyle = (a) => ({ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: a ? '#155dfc' : 'transparent', color: a ? '#fff' : '#525252' });
const bigStep = { width: '44px', height: '44px', borderRadius: '9999px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer' };
