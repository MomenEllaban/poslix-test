import CartPanel from 'src/components/pos/_components/cart-panel/CartPanel';
import { ItemList } from 'src/components/pos/_components/item-list/ItemList';
import NavMenu from 'src/components/pos/parts/NavMenu';

export default function PosCart({ shopId }) {
  return (
    <>
      <NavMenu shopId={shopId} />

      <CartPanel shopId={shopId} />
      {/* <OrdersComponent shopId={shopId} lang={lang.pos} direction={lang == ar ? 'rtl' : ''} /> */}
      <ItemList shopId={shopId} />
    </>
  );
}
