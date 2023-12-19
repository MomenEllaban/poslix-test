import { Autocomplete, Button, TextField } from '@mui/material';
import CartItem from './CartItem';

// import { useDispatch, useSelector } from 'react-redux';
// import {
//   addTodigitalCart,
//   incrementQuantity,
//   decrementQuantity,
//   removeItem,
// } from '../../redux/slices/digitalCartSlice';
import { useDigitalContext } from 'src/modules/digital/_context/DigitalContext';
import { useState } from 'react';
import { VariantsProductModal } from './variants-product-modal';
// import ProductVariablesModal from './product-variables-modal';
const DigitalCart = ({
  products,
  cartItems,
  addItemTocart,
  removeFromCart,
  setRenderedScreen,
  addByQuantity,
  totalPrice,
  location,
  setOpenModelAuth,
}) => {
  // const { digitalCart } = useSelector((state: any) => state.digitalCart);
  const { lang, setLang } = useDigitalContext();
  const [selectedVariantProduct, setSelectedVariantProduct] = useState<any>();
  // const [openVariablesModal, setOpenVariablesModal] = useState(false);

  // const dispatch = useDispatch()
  // const getTotal = () => {
  //     let totalQuantity = 0
  //     let totalPrice = 0
  //     console.log(digitalCart);
  //     digitalCart?.forEach(item => {
  //       totalQuantity += item.quantity
  //       totalPrice += item.price * item.quantity
  //     })
  //     return {totalPrice, totalQuantity}
  //   }
  //   console.log(products,'products');

  const handleOpenCheckout = () => {
    const user = JSON.parse(localStorage.getItem('userdata'));
    const token = user?.token?.length > 150;

    if (token) {
      setRenderedScreen('checkout');
      return;
    }
    setOpenModelAuth(true);
  };

  return (
    <div className="digital-cart">
      <div className="digital-cart-items-container">
        <h4>{lang.digital.your_orders}</h4>
        <Autocomplete
          size="small"
          isOptionEqualToValue={(option: any, value: any) => option?.name === value?.name}
          // disablePortal
          id="Select Product"
          options={products || []}
          value={''}
          getOptionLabel={(option) => option?.name || ''}
          onChange={(e, newValue) => {
            if (newValue?.type === 'variable') {
              setSelectedVariantProduct(newValue);
              return;
            }
            if (newValue) addItemTocart(newValue);
          }}
          sx={{ width: '100%' }}
          renderInput={(params) => (
            <TextField
              inputProps={{
                ...params.inputProps,
              }}
              fullWidth
              size="small"
              id="Select Product"
              InputProps={{
                ...params.InputProps,
              }}
              label={'Select Product'}
            />
          )}
        />
        <div className="digital-cart-items-list">
          {cartItems?.length >= 1 ? (
            cartItems.map((item) => (
              <CartItem
                addByQuantity={addByQuantity}
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
              />
            ))
          ) : (
            <p className="empty text-dark">{lang.digital.cart_empty}</p>
          )}
        </div>
      </div>
      <div className="digital-cart-checkout">
        <Button
          disabled={!cartItems.length}
          className="checkout_btn"
          variant="contained"
          color="error"
          onClick={handleOpenCheckout}>
          {lang.pos.cartComponent.checkout}{' '}
          {totalPrice.toFixed(location?.location_decimal_places || 2)} {location?.currency_code}
        </Button>
        {/* <Button>{lang.digital.apply_coupon}</Button> */}
      </div>
      {selectedVariantProduct && (
        <VariantsProductModal
          product={selectedVariantProduct}
          setProduct={setSelectedVariantProduct}
          addItemTocart={addItemTocart}
          location={{}}
        />
      )}
    </div>
  );
};

export default DigitalCart;
