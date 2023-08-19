import { IProduct } from '@models/pos.types';
import { createSlice } from '@reduxjs/toolkit';

type ICartProduct = IProduct & { quantity: number };

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [] as ICartProduct[],
    cartSellTotal: 0,
    cartCostTotal: 0,
  },
  reducers: {
    setCart: (state, action) => {
      return action.payload;
    },
    addToCart: (state, action) => {
      const { id } = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 });
      }
      state.cartSellTotal += +action.payload.sell_price;
      state.cartCostTotal += +action.payload.cost_price;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      const { id } = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);
      if (existingItem) {
        state.cartItems = state.cartItems.filter((item) => item.id !== id);
      }
      state.cartSellTotal -= +action.payload.sell_price * existingItem.quantity;
      state.cartCostTotal -= +action.payload.cost_price * existingItem.quantity;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.cartSellTotal = 0;
      state.cartCostTotal = 0;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    decreaseItemQuantity: (state, action) => {
      const { id } = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity === 0) {
          state.cartItems = state.cartItems.filter((item) => item.id !== id);
        }
      }
      state.cartSellTotal -= +action.payload.sell_price;
      state.cartCostTotal -= +action.payload.cost_price;
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
});

export default cartSlice.reducer;
export const { addToCart, setCart, decreaseItemQuantity, clearCart, removeFromCart } =
  cartSlice.actions;
