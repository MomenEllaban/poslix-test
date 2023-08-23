import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import CustomerDataSelect from '../CustomerDataSelect';
import CartTable from '../cart-table/CartTable';
import { OrdersFooter } from '../orders-footer/OrdersFooter';
import styles from './CartPanel.module.scss';
import { addToCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
import { OrderCalcs } from '../../utils/OrderCalcs';
import AsyncSelect from 'react-select/async';
import api from 'src/utils/app-api';
import { IProduct } from '@models/pos.types';
import { useUser } from 'src/context/UserContext';
import { ResultItemRow } from '../result-item-row/ResultItemRow';
import PackageItemsModal from '../../modals/package-item/PackageItemsModal';

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

//! models need the full data to be refactored from static to dynamic

export default function CartPanel({ shopId, lang, direction }) {
  const selectCartForLocation = selectCartByLocation(shopId ?? 0);
  const cart = useAppSelector(selectCartForLocation);

  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();

  const [tax, setTax] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [product, setProduct] = useState<IProduct>(null);
  const [isOrderEdit, setIsOrderEdit] = useState<number>(0);
  const [customer, setCustomer] = useState<ICustomerItem>(initCustomer);
  const [discount, setDiscount] = useState({ type: 'fixed', amount: 0 });
  const [orderEditDetails, setOrderEditDetails] = useState<IOrderItem>(initOrder);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productVariations, setProductVariations] = useState<IProduct['variations']>([]);
  const [selectedHold, setSelectedHold] = useState<{ holdId: number }>({ holdId: -1 });
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [__WithDiscountFeature__total, set__WithDiscountFeature__total] = useState<number>(0);

  const handleProductSearch = async (inputValue: string) => {
    const result = await api
      .get(`/products/search/${shopId}?search=${inputValue}`)
      .then(({ data }) => data.result);
    const options = result.map((item: IProduct) => ({
      ...item,
      value: item.id,
      label: (
        <ResultItemRow
          product={item}
          set={setProduct}
          onClick={handleAddToCart}
          setShow={setIsProductModalOpen}
        />
      ),
    }));
    return options;
  };

  const handleAddToCart = (product: IProduct) => {
    console.log(product);
    if (product.type?.includes('variable')) {
      setProductVariations(product.variations);
      setIsOpenDialog(true);
      console.log('_________', product.variations);
    } else {
      dispatch(addToCart(product));
    }
  };

  useEffect(() => {
    if (!isProductModalOpen) setProductVariations([]);
  }, [isProductModalOpen]);

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
      <AsyncSelect
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
        openMenuOnClick={true}
        menuIsOpen={isMenuOpen}
        closeMenuOnSelect={false}
        onFocus={() => setIsMenuOpen(true)}
        isSearchable
        placeholder="Search Product ..."
        cacheOptions
        defaultOptions
        loadOptions={handleProductSearch}
      />
      <PackageItemsModal
        show={isProductModalOpen}
        setShow={setIsProductModalOpen}
        product={product}
        variations={productVariations}
      />
      <hr />
      <CartTable shopId={shopId} lang={lang} />
      <hr />

      <OrderCalcs
        shopId={shopId}
        orderEditDetails={orderEditDetails}
        taxRate={taxRate}
        subTotal={subTotal}
        shippingRate={0}
        // with discount feature
        tax={tax}
        __WithDiscountFeature__total={__WithDiscountFeature__total}
        setDiscount={setDiscount}
        totalDiscount={0}
        lang={lang}
      />
      <OrdersFooter
        selectedHold={selectedHold}
        orderEditDetails={orderEditDetails}
        shopId={shopId}
        details={{
          taxRate,
          customerId: customer?.value,
          totalAmount: cart?.cartSellTotal,
          subTotal,
          isReturn: isOrderEdit,
        }}
        holdObj={{ orders: cart?.cartItems, quantity: 0, name: 'noset' }}
        // with discount feature
        tax={tax}
        __WithDiscountFeature__total={__WithDiscountFeature__total}
        setDiscount={setDiscount}
        totalDiscount={0}
        lang={lang}
      />
    </div>
  );
}
