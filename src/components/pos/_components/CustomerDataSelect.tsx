import { IOrderMiniDetails } from '@models/common-model';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useProducts } from 'src/context/ProductContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { Toastify } from 'src/libs/allToasts';
import { selectCartByLocation, setCartCustomer } from 'src/redux/slices/cart.slice';
import CustomerModal from '../modals/CustomerModal';

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
}: {
  shopId: number;
  isOrderEdit: number;
  setCustomer: React.Dispatch<
    React.SetStateAction<{ value: string; label: string; isNew: boolean }>
  >;
  orderEditDetails: IOrderMiniDetails;
  customer: { value: string | number; label: string; isNew: boolean };
}) {
  const dispatch = useAppDispatch();
  const { customers } = useProducts();
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation); // current location order

  const [showType, setShowType] = useState(String);
  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const currentCustomer = customers.find((c) => c.value === cart?.customer_id);

  const customerModalHandler = (status: any) => setCustomerIsModal(false);

  useEffect(() => {
    if (customer?.isNew) setCustomerIsModal(true);
  }, [customer]);

  return (
    <>
      <div className="d-flex">
        <div className="flex-grow-1">
          <Select
            isLoading={customers.length === 0}
            styles={selectStyle}
            isDisabled={isOrderEdit > 0 || (cart?.customer_id > 0 && cart.cartItems.length > 0)}
            options={[{ value: '1', label: 'walk-in customer', isNew: false }, ...customers]}
            onChange={(choice: any) => {
              setCustomer({
                ...choice,
                isNew: choice.__isNew__ === undefined ? false : true,
              });
              dispatch(
                setCartCustomer({
                  customer_id: choice.value,
                  location_id: shopId,
                })
              );
            }}
            placeholder="Select Customer..."
            value={
              currentCustomer ||
              (isOrderEdit > 0 ? { label: orderEditDetails.name, value: '111' } : customer)
            }
          />
        </div>
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
            if (currentCustomer && currentCustomer !== '1') {
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
