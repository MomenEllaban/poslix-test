import CartPanel from 'src/components/pos/_components/cart-panel/CartPanel';
import { ItemList } from 'src/components/pos/_components/item-list/ItemList';
import NavMenu from 'src/components/pos/parts/NavMenu';
import { usePosContext } from './_context/PosContext';

export default function PosCart({ shopId }) {
  const { lang, setLang, isRtl } = usePosContext();

  return (
    <>
      <NavMenu shopId={shopId} lang={lang} setLang={setLang} />

      <CartPanel shopId={shopId} lang={lang.pos} direction={isRtl ? 'rtl' : ''} />
      {/* <OrdersComponent shopId={shopId} lang={lang.pos} direction={lang == ar ? 'rtl' : ''} /> */}
      <ItemList shopId={shopId} lang={lang.pos.itemList} />
    </>
  );
}
