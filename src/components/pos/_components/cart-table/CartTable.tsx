import { Button, ButtonGroup, Table } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import styles from './CartTable.module.scss';
import { useEffect } from 'react';
import {
  addToCart,
  decreaseItemQuantity,
  removeFromCart,
  setCart,
} from 'src/redux/slices/cart.slice';

export default function CartTable({ lang }) {
  const cart = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cart = localStorage.getItem('cart');

    if (cart) {
      dispatch(setCart(JSON.parse(cart)));
    }
  }, []);
  return (
    <div className={styles['table__container']}>
      <Table striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th>{lang?.cartComponent?.product}</th>
            <th>{lang?.cartComponent?.quantity}</th>
            <th> {lang?.cartComponent?.amount}</th>
            <th></th>
          </tr>
        </thead>

        <tbody className={styles['table-body']}>
          {!cart.cartItems.length && (
            <tr>
              <td colSpan={5} className="text-center">
                {lang.cartComponent.add}
              </td>
            </tr>
          )}
          {cart.cartItems?.map((product, idx) => (
            <tr key={product.id}>
              <td>{idx + 1}</td>
              <td>{product.name}</td>
              <td>
                <span className={styles['qty-col']}>
                  <button
                    className={styles['cart-quantity-btn']}
                    onClick={() => dispatch(decreaseItemQuantity(product))}>
                    -
                  </button>
                  <span className={styles['qty']}>{product.quantity}</span>
                  <button
                    className={styles['cart-quantity-btn']}
                    onClick={() => {
                      if (product.quantity < product.stock) dispatch(addToCart(product));
                    }}>
                    +
                  </button>
                </span>
              </td>
              <td>{(product.quantity * +product.sell_price).toFixed(2)}</td>
              <td className={styles['delete-col']}>
                <button
                  className={styles['cart-delete-btn']}
                  onClick={() => dispatch(removeFromCart(product))}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
