// import { useEffect, useState } from 'react';
import { useAppSelector } from 'src/hooks';
import {  selectCartByLocation } from 'src/redux/slices/cart.slice';
import { OrderCalcs } from '../../utils/OrderCalcs';
import CustomerDataSelect from '../CustomerDataSelect';
import CartTable from '../cart-table/CartTable';
import { OrdersFooter } from '../orders-footer/OrdersFooter';
import ProductSearch from '../product-search/ProductSearch';
import TakeawaySlider from '../takeaway-slider/TakeawaySlider';
import styles from './CartPanel.module.scss';
import { usePosContext } from 'src/modules/pos/_context/PosContext';
import { useEffect, useState } from 'react';


// interface IOrderItem {
//   isEdit: boolean;
//   name: string;
//   total_price: number;
//   orderId: number;
//   notes?: string;
// }


const initOrder = {
  isEdit: false,
  name: '',
  total_price: 0,
  orderId: 0,
};

export default function CartPanel({ shopId ,customer, setCustomer}) {
  const { lang: _lang, isRtl } = usePosContext();
  // const dispatch = useAppDispatch()
  const selectCartForLocation = selectCartByLocation(shopId ?? 0);
  const cart = useAppSelector(selectCartForLocation);
  
  
  // useEffect(() => {
    //   // dispatch(clearCart({ location_id: shopId }));
    // }, [])
    
    
    
    const direction = isRtl ? 'rtl' : 'ltr';
    const lang = _lang?.pos;
    
    const [orderType, setOrderType] = useState('');
    
    const handleOrderTypeChange = (newOrderType) => {
      setOrderType(newOrderType);
    };

    useEffect(() => {
      console.log('Updated orderType:', orderType);
    }, [orderType]);
  
    
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
        <TakeawaySlider  onOrderTypeChange={handleOrderTypeChange} orderType={orderType} />

        <hr />
        <CartTable  customer={customer} shopId={shopId} />
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
        details={{ customerId: customer?.value || undefined, totalAmount: cart?.cartSellTotal, isReturn: 0}}
        orderType={orderType}
        lang={lang}
      />
    </div>
  );
}
