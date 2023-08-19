import { useState } from 'react';
import CustomerDataSelect from '../CustomerDataSelect';
import CartTable from '../cart-table/CartTable';
import styles from './CartPanel.module.scss';

interface ICustomerItem {
  value: string;
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

export default function CartPanel({ shopId, lang, direction }) {
  const [isOrderEdit, setIsOrderEdit] = useState<number>(0);
  const [customer, setCustomer] = useState<ICustomerItem>(initCustomer);
  const [orderEditDetails, setOrderEditDetails] = useState<IOrderItem>(initOrder);

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
      <CartTable lang={lang} />
    </div>
  );
}
