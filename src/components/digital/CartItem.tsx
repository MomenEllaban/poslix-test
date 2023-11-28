import { TextField } from '@mui/material';
import { ChangeEvent } from 'react';

const CartItem = ({
  location,
  id,
  image,
  name,
  price,
  quantity = 0,
  addItemTocart,
  addByQuantity,
  item,
  removeFromCart,
}) => {
  

  return (
    <div className="cart-item">
      <div style={{ fontSize: '14px' }} className="col-4">
        {name}
      </div>
      <div className="modal_counter col-4">
        <div
          className="btn col-4  d-flex justify-content-center align-items-center"
          onClick={() => removeFromCart(item)}>
          -
        </div>
        {/* <div className="col-4 d-flex justify-content-center">{quantity}</div> */}
        <TextField
          id="product-qty"
          className={""}
          variant="outlined"
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            min: 1,
            value: item.quantity,
            style: {
              textAlign: 'center',
              height: '30px',
              width: 'auto',
              padding: '0'
            },
            
          }}
          onInput={(e: ChangeEvent<HTMLInputElement>) => {
            const newQty = +e.target.value === 0 ? 1 : +e.target.value;
            addByQuantity(item, newQty)
          }}
          sx={{
            minWidth: '5px',
          }}
        />
        <div
          className="btn col-4  d-flex justify-content-center align-items-center"
          onClick={() => addItemTocart(item)}>
          +
        </div>
      </div>

      <div className="order_btn col-3">
        {price?.toFixed(location?.location_decimal_places || 2)} {location?.currency_code}
      </div>
    </div>
  );
};

export default CartItem;
