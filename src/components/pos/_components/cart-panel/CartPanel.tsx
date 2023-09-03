import { useState } from 'react';
import { useAppSelector } from 'src/hooks';
import { selectCartByLocation } from 'src/redux/slices/cart.slice';
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

//! models need the full data to be refactored from static to dynamic

export default function CartPanel({ shopId }) {
  const { lang: _lang, isRtl } = usePosContext();
  const direction = isRtl ? 'rtl' : 'ltr';
  const lang = _lang?.pos;

  const selectCartForLocation = selectCartByLocation(shopId ?? 0);
  const cart = useAppSelector(selectCartForLocation);

  const [subTotal, setSubTotal] = useState<number>(0);
  const [isOrderEdit, setIsOrderEdit] = useState<number>(0);
  const [customer, setCustomer] = useState<ICustomerItem>({
    ...initCustomer,
    value: cart?.customer_id ?? '1',
  });

  const [orderEditDetails, setOrderEditDetails] = useState<IOrderItem>(initOrder);

  const [__WithDiscountFeature__total, set__WithDiscountFeature__total] = useState<number>(0);

  return (
    <div className={styles['cart__container']} style={{ direction }}>
      <CustomerDataSelect
        shopId={shopId}
        isOrderEdit={isOrderEdit}
        setCustomer={setCustomer}
        orderEditDetails={orderEditDetails}
        customer={customer}
      />
      <hr />
      <ProductSearch shopId={shopId} />

      <hr />
      <CartTable shopId={shopId} />
      <hr />

      <OrderCalcs
        shopId={shopId}
        orderEditDetails={orderEditDetails}
        // with discount feature
        __WithDiscountFeature__total={__WithDiscountFeature__total}
        lang={lang}
      />
      <OrdersFooter
        orderEditDetails={orderEditDetails}
        shopId={shopId}
        details={{
          customerId: customer?.value,
          totalAmount: cart?.cartSellTotal,
          subTotal,
          isReturn: isOrderEdit,
        }}
        lang={lang}
      />
    </div>
  );
}
