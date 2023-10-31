import { useDispatch } from 'react-redux';
import {
  addTodigitalCart,
  incrementQuantity,
  decrementQuantity,
  removeItem,
} from '../../redux/slices/digitalCartSlice';

const CartItem = ({
  location,
  id,
  image,
  name,
  price,
  quantity = 0,
  addItemTocart,
  item,
  removeFromCart,
}) => {
  const dispatch = useDispatch();

  return (
    <div className="cart-item">
      <div style={{ fontSize: '14px' }} className="col-4">
        {name}
      </div>
      <div className="modal_counter col-3">
        <div
          className="btn col-4  d-flex justify-content-center"
          onClick={() => removeFromCart(item)}>
          -
        </div>
        <div className="col-4 d-flex justify-content-center">{quantity}</div>
        <div
          className="btn col-4  d-flex justify-content-center"
          onClick={() => addItemTocart(item)}>
          +
        </div>
      </div>

      <div className="order_btn col-3">
        {price.toFixed(location?.location_decimal_places || 2)} {location?.currency_code}
      </div>
    </div>
  );
};

export default CartItem;
