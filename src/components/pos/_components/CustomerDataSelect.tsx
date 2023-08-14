import { IOrderMiniDetails } from '@models/common-model';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useProducts } from 'src/context/ProductContext';
import { Toastify } from 'src/libs/allToasts';
import Customermodal from '../modals/Customermodal';

export default function CustomerDataSelect({
  shopId,
  selectStyle,
  isOrderEdit,
  setCustomer,
  orderEditDetails,
  customer,
}: {
  shopId: number;
  selectStyle: { control: (style: any) => any };
  isOrderEdit: number;
  setCustomer: React.Dispatch<
    React.SetStateAction<{ value: string; label: string; isNew: boolean }>
  >;
  orderEditDetails: IOrderMiniDetails;
  customer: { value: string; label: string; isNew: boolean };
}) {
  const { customers } = useProducts();

  const [showType, setShowType] = useState(String);
  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);

  const customerModalHandler = (status: any) => setCustomerIsModal(false);

  useEffect(() => {
    if (customer?.isNew) setCustomerIsModal(true);
  }, [customer]);

  return (
    <>
      <div className="d-flex">
        <div className="flex-grow-1">
          <Select
            styles={selectStyle}
            isDisabled={isOrderEdit > 0}
            options={customers}
            onChange={(choice: any) => {
              setCustomer({
                ...choice,
                isNew: choice.__isNew__ === undefined ? false : true,
              });
            }}
            placeholder="Select Customer..."
            value={isOrderEdit > 0 ? { label: orderEditDetails.name, value: '111' } : customer}
          />
        </div>
        <button
          className="btn btn-primary ms-2 p-3"
          style={{
            lineHeight: 0,
            padding: '0px 12px !important',
            height: 38,
          }}
          type="button"
          onClick={() => {
            if (customer.value === '1') return;
            if (customer) {
              setShowType('edit');
              setCustomerIsModal(true);
            } else Toastify('error', 'Choose Customer First!');
          }}>
          <i className="ri-edit-box-line" />
        </button>
        <button
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
      <Customermodal
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
