import { useState,useEffect } from 'react';
// import { TextField } from '@mui/material';
import styles from './digital.module.css';
import { Button } from 'react-bootstrap';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CartItem from './CartItem';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useDigitalContext } from 'src/modules/digital/_context/DigitalContext';
import PaymentCheckoutModal from './PaymentCheckoutModal';
import { findAllData } from 'src/services/crud.api';
import { useRouter } from 'next/router';

const Checkout = ({
  cartItems,
  removeFromCart,
  addItemTocart,
  setRenderedScreen,
  addByQuantity,
  totalPrice,
  location,
  shopId,
}) => {
  const { lang } = useDigitalContext();

  const [paymentModalShow, setPaymentModalShow] = useState<boolean>(false);

  const [invoiceType, setInvoiceType] = useState('receipt');
  const [invoiceDetails, setInvoiceDetails] = useState<any>({});

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
    try {
      if (router.isReady) checkPrintType();
    } catch (error) {
      console.log(error);
    }
  }, [router.asPath]);


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
            {/* <div className={styles.checkout_user_info_container}>
              <div className={styles.user_info_form}>
                <div className="w-100">{lang.digital.your_info}</div>
                <TextField
                  id="standard-basic"
                  label={lang.digital.full_name}
                  variant="standard"
                  style={{ width: '45%' }}
                  required
                />
                <TextField
                  id="standard-basic"
                  label={lang.digital.email_address}
                  variant="standard"
                  style={{ width: '45%' }}
                />
                <TextField
                  id="standard-basic"
                  label={lang.digital.phone_number}
                  variant="standard"
                  style={{ width: '45%' }}
                />
              </div>
            </div> */}
            {/* <div className={styles.checkout_user_info_container}>
              <div className={`mt-2 ${styles.user_info_form}`}>
                <div className="w-100">{lang.digital.order_note}</div>
                <TextField
                  id="standard-basic"
                  label={lang.digital.order_note}
                  variant="standard"
                  style={{ width: '45%' }}
                />
              </div>
            </div> */}
            <div className={styles.checkout_user_info_container}>
              <div className={`mt-2 ${styles.user_info_form}`}>
                <div className="digital-cart-checkout w-100 ">
                  <Button className="checkout_btn" variant="contained" color="error"  onClick={() => setPaymentModalShow(true)}>
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

      />
    </>
  );
};

export { Checkout };
