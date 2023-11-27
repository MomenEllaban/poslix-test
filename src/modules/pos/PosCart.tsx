import { useState } from 'react';
import CartPanel from 'src/components/pos/_components/cart-panel/CartPanel';
import { ItemList } from 'src/components/pos/_components/item-list/ItemList';
import NavMenu from 'src/components/pos/parts/NavMenu';
import { useAppSelector } from 'src/hooks';
import { selectCartByLocation } from 'src/redux/slices/cart.slice';
interface ICustomerItem {
  value: string | number;
  label: string;
  isNew: boolean;
}
const initCustomer = {
  value: '1',
  label: 'walk-in customer',
  isNew: false,
};

export default function PosCart({ shopId }) {
  const selectCartForLocation = selectCartByLocation(shopId ?? 0);

  const cart = useAppSelector(selectCartForLocation);

  const [customer, setCustomer] = useState<ICustomerItem>({
    ...initCustomer,
    value: cart?.customer_id ?? 0,
  });
  return (
    <>
      <NavMenu shopId={shopId} />
      <div className="pos_layout">
        <CartPanel customer={customer} setCustomer={setCustomer} shopId={shopId} />
        {/* <OrdersComponent shopId={shopId} lang={lang.pos} direction={lang == ar ? 'rtl' : ''} /> */}
        <ItemList customer={customer} shopId={shopId} />
      </div>
    </>
  );
}
