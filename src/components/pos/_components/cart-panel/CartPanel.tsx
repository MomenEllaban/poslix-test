import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { clearCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
import { OrderCalcs } from '../../utils/OrderCalcs';
import CustomerDataSelect from '../CustomerDataSelect';
import CartTable from '../cart-table/CartTable';
import { OrdersFooter } from '../orders-footer/OrdersFooter';
import ProductSearch from '../product-search/ProductSearch';
import styles from './CartPanel.module.scss';
import { usePosContext } from 'src/modules/pos/_context/PosContext';

interface ICustomerItem {
  value: string | number;
  label: string;
  isNew: boolean;
}
interface IOrderItem {
  isEdit: boolean;
  name: string;
  total_price: number;
  orderId: number;
  notes?: string;
}

const initCustomer = {
  value: '1',
  label: 'walk-in customer',
  isNew: false,
};

const initOrder = {
  isEdit: false,
  name: '',
  total_price: 0,
  orderId: 0,
};

export default function CartPanel({ shopId }) {
  const { lang: _lang, isRtl } = usePosContext();
  const dispatch = useAppDispatch()
  const selectCartForLocation = selectCartByLocation(shopId ?? 0);
  const cart = useAppSelector(selectCartForLocation);

  useEffect(() => {
    dispatch(clearCart({ location_id: shopId }));
  }, [])

  const [customer, setCustomer] = useState<ICustomerItem>({
    ...initCustomer,
    value: cart?.customer_id ?? 0,
  });

  const direction = isRtl ? 'rtl' : 'ltr';
  const lang = _lang?.pos;

  return (
    <div className={styles['cart__container']} style={{ direction }}>
      <CustomerDataSelect
        shopId={shopId}
        isOrderEdit={0}
        setCustomer={setCustomer}
        orderEditDetails={initOrder}
        customer={customer}
      />
      <hr />
      <ProductSearch shopId={shopId} />

      <hr />
      <CartTable shopId={shopId} />
      <hr />

      <OrderCalcs
        shopId={shopId}
        orderEditDetails={initOrder}
        // with discount feature
        __WithDiscountFeature__total={0}
        lang={lang}
      />
      <OrdersFooter
        orderEditDetails={initOrder}
        shopId={shopId}
        details={{ customerId: customer?.value || undefined, totalAmount: cart?.cartSellTotal, isReturn: 0 }}
        lang={lang}
      />
    </div>
  );
}
