import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import styles from './digital.module.css';
import { Button } from 'react-bootstrap';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CartItem from './CartItem';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useDigitalContext } from 'src/modules/digital/_context/DigitalContext';
import PaymentCheckoutModal from './PaymentCheckoutModal';
import { findAllData } from 'src/services/crud.api';
import { useRouter } from 'next/router';
import { MenuItem } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { Toastify } from 'src/libs/allToasts';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-number-input/style.css';

const Checkout = ({
  cartItems,
  removeFromCart,
  addItemTocart,
  setRenderedScreen,
  addByQuantity,
  totalPrice,
  location,
  shopId,
  setCartItems,
}) => {
  const { lang } = useDigitalContext();

  const [paymentModalShow, setPaymentModalShow] = useState<boolean>(false);

  const [invoiceType, setInvoiceType] = useState('receipt');
  const [invoiceDetails, setInvoiceDetails] = useState<any>({});
  const [cartData, setCartData] = useState([]);
  const [customerData, setCustomerData] = useState({
    full_name: '',
    customer_id: '',
    phone: '',
    address: '',
    email: '',
    order_type: '',
    notes: '',
  });

  const router = useRouter();

  const checkPrintType = async () => {
    const res2 = await findAllData(`appearance/${shopId}?digital_menu=true`);
    setInvoiceDetails({
      ...res2.data.result,
      en: { ...res2.data.result.en, is_multi_language: !!res2.data.result.en.is_multi_language },
    });
    const res = await findAllData(`print-settings/${shopId}?digital_menu=true`);
    setInvoiceType(res.data.result.print_type);
  };

  useEffect(() => {
    if (router.isReady) {
      checkPrintType();

      cartItems.forEach((item) => {
        setCartData((prev) => [
          ...prev,
          {
            product_id: item?.parent_id ? item.parent_id : item.id,
            variation_id: Array.isArray(item?.variations) ? undefined : item.id,
            quantity: item?.quantity,
          },
        ]);
      });
    }

    return () => {
      setCartData([]);
    };
  }, [router.asPath]);

  const typeOrder = [
    { value: 'none', label: 'none' },
    { value: 'dine_in', label: 'dine in' },
    { value: 'pick_up', label: 'pick up' },
  ];

  // ** var - data required
  const required = ['full_name', 'address', 'phone', 'order_type'];

  // ** functions
  const handleOpenModelCheckout = () => {
    for (const [key, value] of Object.entries(customerData)) {
      if (required.includes(key)) {
        if (key === 'phone') {
          if (value?.length <= 5) {
            Toastify('error', `${key?.replace(/_/g, ' ')} is required`);
          }
        }
        if (!value) {
          Toastify('error', `${key?.replace(/_/g, ' ')} is required`);
          return;
        }
      }
    }

    setPaymentModalShow(true);
  };

  const handleOnChange = (e) => {
    setCustomerData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userdata'));
    setCustomerData({
      full_name: `${user?.first_name} ${user?.last_name}`,
      customer_id: user?.id,
      phone: `+${user?.mobile}`,
      address: user?.shipping_address,
      email: user?.email,
      order_type: '',
      notes: '',
    });
  }, []);

  return (
    <>
      <div style={{ background: '#ebebeb' }} className="w-100 d-flex justify-content-center">
        <div style={{ width: 'calc(90% - 40px)' }} className="mt-2">
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setRenderedScreen('products');
            }}>
            <ArrowBackIcon /> Back
          </span>
        </div>
      </div>

      <div className={`pt-2 ${styles.checkout_wrapper}`}>
        <div className={styles.checkout_container}>
          <div className={styles.checkout_left_side_container}>
            <div className={styles.checkout_user_info_container}>
              <div className={styles.user_info_form}>
                <div className="w-100">{lang.digital.your_info}</div>
                <TextField
                  id="standard-basic"
                  label={lang.digital.full_name}
                  variant="standard"
                  style={{ marginTop: '1rem', width: '45%' }}
                  required
                  value={customerData.full_name}
                  name="customer"
                  type="text"
                  onChange={handleOnChange}
                />
                <TextField
                  id="standard-basic"
                  label={lang.digital.email_address}
                  variant="standard"
                  style={{ marginTop: '1rem', width: '45%' }}
                  value={customerData.email}
                  type="email"
                  name="email"
                  onChange={handleOnChange}
                />
                {/* 
                <TextField
                  id="standard-basic"
                  label={lang.digital.phone_number}
                  variant="standard"
                  style={{ marginTop: '1rem' }}
                  required
                  type="number"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleOnChange}
                /> */}

                <div className="mt-2 phone-control">
                  <label className="fw-semibold">
                    {lang.Customer.mobile}
                    <span className="text-danger ms-1">*</span>
                  </label>

                  <PhoneInput
                    inputClass="MuiInputBase-input MuiInput-input css-1x51dt5-MuiInputBase-input-MuiInput-input"
                    containerClass="d-block MuiInputBase-root MuiInput-root MuiInput-underline MuiInputBase-colorPrimary MuiInputBase-formControl css-v4u5dn-MuiInputBase-root-MuiInput-root"
                    country={'om'}
                    enableAreaCodes
                    enableTerritories
                    specialLabel=""
                    countryCodeEditable
                    onlyCountries={['om']}
                    autoFormat={true}
                    onChange={(e) => {
                      setCustomerData((prev) => ({
                        ...prev,
                        phone: e,
                      }));
                    }}
                    value={customerData?.phone}
                  />
                </div>
                <TextField
                  id="standard-basic"
                  label={'address'}
                  variant="standard"
                  style={{ marginTop: '1rem', width: '45%' }}
                  required
                  value={customerData.address}
                  name="address"
                  onChange={handleOnChange}
                />
                <FormControl sx={{ marginTop: '1rem', width: '45%' }}>
                  <InputLabel id="type_order-label">Order Type</InputLabel>
                  <Select
                    labelId="type_order-label"
                    id="type_order-select"
                    defaultValue={customerData.order_type}
                    name="order_type"
                    onChange={handleOnChange}
                    label="Type Order">
                    {typeOrder.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className={styles.checkout_user_info_container}>
              <div className={`mt-2 ${styles.user_info_form}`}>
                <div className="w-100">{lang.digital.order_note}</div>
                <TextField
                  id="standard-basic"
                  label={lang.digital.order_note}
                  variant="standard"
                  style={{ width: '45%' }}
                  value={customerData.notes}
                  name="notes"
                  onChange={handleOnChange}
                />
              </div>
            </div>
            <div className={styles.checkout_user_info_container}>
              <div className={`mt-2 ${styles.user_info_form}`}>
                <div className="digital-cart-checkout w-100 ">
                  <Button
                    className="checkout_btn"
                    variant="contained"
                    color="error"
                    disabled={!cartItems?.length}
                    onClick={handleOpenModelCheckout}>
                    {lang.pos.cartComponent.checkout}{' '}
                    {totalPrice?.toFixed(location?.location_decimal_places)}{' '}
                    {location?.currency_code}
                  </Button>
                  {/* <Button>{lang.digital.apply_coupon}</Button> */}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.checkout_right_side_container}>
            <div className={styles.checkout_user_info_container}></div>
            <div className={styles.checkout_items_container}>
              <div style={{ fontWeight: 'bold' }}>{lang.digital.your_order}</div>

              {cartItems?.length >= 1 ? (
                cartItems.map((item) => (
                  <CartItem
                    location={location}
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    name={item.name}
                    price={item.itemTotalPrice}
                    quantity={item.quantity}
                    addItemTocart={addItemTocart}
                    item={item}
                    removeFromCart={removeFromCart}
                    addByQuantity={addByQuantity}
                  />
                ))
              ) : (
                <p className="empty text-dark">{lang.digital.cart_empty}</p>
              )}
            </div>

            <div
              onClick={() => {
                setRenderedScreen('products');
              }}
              className={`mt-2 ${styles.checkout_add_items_container}`}>
              <MenuBookIcon sx={{ marginX: '4px' }} /> {lang.digital.add_more_items}
            </div>

            <div className={`mt-2 ${styles.order_Summary_container}`}>
              <div className="fw-bold">{lang.digital.order_summary}</div>
              <div className={styles.order_Summary_pricing_wrapper}>
                <div className={'w-50 '}>{lang.pos.cartComponent.total}</div>
                <div className={'w-50  text-end'}>
                  {totalPrice?.toFixed(location?.location_decimal_places)} {location?.currency_code}
                </div>
                {/* <hr/> */}
                <div className={'w-50 '}>Sub Total</div>
                <div className={'w-50 text-end'}>
                  {totalPrice?.toFixed(location?.location_decimal_places)} {location?.currency_code}
                </div>
                <div className={'w-50'}>VAT(0.00%)</div>
                <div className={'w-50 text-end'}>0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PaymentCheckoutModal
        shopId={shopId}
        show={paymentModalShow}
        setShow={setPaymentModalShow}
        invoiceType={invoiceType}
        invoiceDetails={invoiceDetails}
        cartItems={cartItems}
        cartData={cartData}
        setCartItems={setCartItems}
        setRenderedScreen={setRenderedScreen}
        locationSettings={location}
        customerData={customerData}
      />
    </>
  );
};

export { Checkout };
