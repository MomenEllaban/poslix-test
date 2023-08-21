import { IProduct } from '@models/pos.types';
import { createSelector, createSlice, current } from '@reduxjs/toolkit';

type ICartProduct = IProduct & { quantity: number };

interface ICart {
  location_id: number;
  cartItems: ICartProduct[];
  cartSellTotal: number;
  cartCostTotal: number;
}

const initialState: ICart[] = [];

const findOrCreateCart = (state: ICart[], location_id: string): ICart => {

  const existingCart = state.find((cart) => +cart.location_id === +location_id);

  if (existingCart) {
    return existingCart;
  } else {
    const newCart: ICart = {
      location_id: +location_id,
      cartItems: [],
      cartSellTotal: 0,
      cartCostTotal: 0,
    };
    state.push(newCart);
    return newCart;
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      return action.payload;
    },
    addToCart: (state, action) => {
      const { id, location_id } = action.payload;
      console.log(current(state));
      const cart = findOrCreateCart(state, location_id);
      const existingItem = cart.cartItems.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.cartItems.push({ ...action.payload, quantity: 1 });
      }
      console.log(id, location_id, cart);

      cart.cartSellTotal += +action.payload.sell_price;
      cart.cartCostTotal += +action.payload.cost_price;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      const { id, location_id } = action.payload;
      const cart = findOrCreateCart(state, location_id);
      const existingItem = cart.cartItems.find((item) => item.id === id);

      if (existingItem) {
        cart.cartItems = cart.cartItems.filter((item) => item.id !== id);
        cart.cartSellTotal -= +action.payload.sell_price * +existingItem.quantity;
        cart.cartCostTotal -= +action.payload.cost_price * +existingItem.quantity;
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
    clearCart: (state, action) => {
      const cart = findOrCreateCart(state, action.payload.location_id);
      cart.cartItems = [];
      cart.cartSellTotal = 0;
      cart.cartCostTotal = 0;

      localStorage.setItem('cart', JSON.stringify(state));
      return state;
    },
    decreaseItemQuantity: (state, action) => {
      const { id, location_id } = action.payload;
      const cart = findOrCreateCart(state, location_id);
      const existingItem = cart.cartItems.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity === 0) {
          cart.cartItems = cart.cartItems.filter((item) => item.id !== id);
        }
        cart.cartSellTotal -= +action.payload.sell_price;
        cart.cartCostTotal -= +action.payload.cost_price;
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
  },
});

export default cartSlice.reducer;
export const selectCart = (state: any) => state.cart;
export const selectCartByLocation = (location_id: string) =>
  createSelector(
    selectCart,
    (cartState) =>
      (!!cartState.length
        ? cartState?.find((cart: any) => +cart.location_id === +location_id)
        : null) as ICart
  );

export const { addToCart, setCart, decreaseItemQuantity, clearCart, removeFromCart } =
  cartSlice.actions;
