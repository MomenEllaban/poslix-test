import { IOrderMiniDetails } from '@models/common-model';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useProducts } from 'src/context/ProductContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { Toastify } from 'src/libs/allToasts';
import { selectCartByLocation, setCartCustomer } from 'src/redux/slices/cart.slice';
import CustomerModal from '../modals/CustomerModal';
import { usePosContext } from 'src/modules/pos/_context/PosContext';


type TCustomer = { value: string | number; label: string; isNew: boolean }
interface IProps {
  shopId: number;
  isOrderEdit: number;
  customer: TCustomer;
  orderEditDetails: IOrderMiniDetails;
  setCustomer: React.Dispatch<React.SetStateAction<TCustomer>>;
}

const selectStyle = {
  control: (style: any) => ({
    ...style,
    fontSize: '12px',
    border: '1px solid #efefef',
    borderRadius: '12px',
  }),
};

export default function CustomerDataSelect({
  shopId,
  isOrderEdit,
  setCustomer,
  orderEditDetails,
  customer,
}: IProps) {
  const dispatch = useAppDispatch();
  const { customers } = useProducts();
  const { lang: _lang } = usePosContext();

  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation); // current location order

  const [showType, setShowType] = useState('');
  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const [options, setOptions] = useState<TCustomer[]>([{ value: 0, label: 'walk-in customer', isNew: false }])

  const currentCustomer = [{ value: 0, label: 'walk-in customer', isNew: false }, ...customers]?.find((c) => c.value === cart?.customer_id) ?? [];

  const customerModalHandler = (status: any) => setCustomerIsModal(false);

  const lang = _lang?.pos;

  useEffect(() => {
    if (customer?.isNew) setCustomerIsModal(true);
  }, [customer]);

  useEffect(() => {   
    const _options = [{ value: 0, label: 'walk-in customer', isNew: false }, ...customers]
    setOptions(_options)
    // setCustomer(_options[0]);
    if (!cart?.customer_id) dispatch(setCartCustomer({ customer_id: _options[0].value, location_id: shopId, }));
  }, [customers])

  return (
    <>
      <div className="d-flex">
        <div className="flex-grow-1">
          <Select
            isLoading={customers.length === 0}
            styles={selectStyle}
            isDisabled={isOrderEdit > 0 || (cart?.customer_id >= 0 && cart.cartItems.length > 0) || cart?.orderId > 0}
            options={options}
            defaultValue={options[0]}
            onChange={(choice: any) => {
              dispatch(setCartCustomer({ customer_id: choice.value, location_id: shopId, }));
              setCustomer({ ...choice, isNew: choice.__isNew__ === undefined ? false : true, });
            }}
            placeholder={lang.customerData.selectCustomer}
            // value={+customer.value > 0 && cart.customer_id > 0 ? customer : currentCustomer}
 
            value={customer}
          />
        </div>
        <button
          // disabled={isOrderEdit > 0 || (cart?.customer_id > 0 && cart.cartItems.length > 0)}
          className="btn btn-primary ms-2 p-3"
          style={{
            lineHeight: 0,
            padding: '0px 12px !important',
            height: 38,
            pointerEvents: cart?.customer_id > 1 ? "auto" : 'none',
            opacity: cart?.customer_id > 1 ? "1" : '0.6'
          }}
          type="button"
          onClick={() => {
            if (currentCustomer && currentCustomer !== 0) {
              setShowType('edit');
              setCustomerIsModal(true);
            } else Toastify('error', 'Choose Customer First!');
          }}>
          <i className="ri-edit-box-line" />
        </button>
        <button
          // disabled={isOrderEdit > 0 || (cart?.customer_id > 0 && cart.cartItems.length > 0)}
          className="btn btn-primary ms-2 p-3"
          style={{
            lineHeight: 0,
            padding: '0px 12px !important',
            height: 38,
          }}
          type="button"
          onClick={() => {
            setShowType('add');
            setCustomerIsModal(true);
          }}>
          <i className="ri-add-circle-line" />
        </button>
      </div>
      <CustomerModal
        shopId={shopId}
        showType={showType}
        userdata={customer}
        customers={customers}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
      />
    </>
  );
}
