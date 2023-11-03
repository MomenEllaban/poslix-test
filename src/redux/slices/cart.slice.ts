import { IProduct } from '@models/pos.types';
import { createSelector, createSlice, current } from '@reduxjs/toolkit';

type ICartProduct = IProduct & {
  quantity: number;
  product_id: number;
  variation_id?: number | null;
  pivot?: any;
};

export interface ICart {
  location_id: number;
  customer_id?: number;
  cartItems: ICartProduct[];
  cartSellTotal: number;
  cartCostTotal: number;
  cartDiscount?: number;
  cartTax?: number;
  cartTaxType?: 'fixed' | 'percentage';
  cartDiscountType?: 'fixed' | 'percentage';
  shipping?: number;
  payment?: {
    payment_id: number | string;
    amount: number;
    note: string;
  }[];
  orderId?: number | null;
  lastTotal?: any;
  lastDue?: any;
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
      cartDiscount: 0,
      cartTax: 0,
      cartTaxType: 'fixed',
      cartDiscountType: 'fixed',
      shipping: 0,
      lastTotal: 0,
      lastDue: 0,
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
    setCartCustomer: (state, action) => {
      const { location_id, customer_id } = action.payload;
      const cart = findOrCreateCart(state, location_id);
      cart.customer_id = customer_id;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    setCartTax: (state, action) => {
      const { location_id, tax, type } = action.payload;
      const cart = findOrCreateCart(state, location_id);
      cart.cartTax = +tax;
      cart.cartTaxType = type;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    setCartDiscount: (state, action) => {
      const { location_id, discount, type } = action.payload;
      const cart = findOrCreateCart(state, location_id);
      cart.cartDiscount = +discount;
      cart.cartDiscountType = type;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    addToCart: (state, action) => {
      const { id, location_id } = action.payload;
      const cart = findOrCreateCart(state, location_id);
      const existingItem = cart.cartItems.find((item) => item.id === id);

      if (existingItem) {
        const newQty = existingItem.quantity + 1
        if((existingItem.stock < newQty) && (+existingItem.sell_over_stock === 0)){
          return
        }
        existingItem.quantity += 1;
      } else {
        cart.cartItems.push({ ...action.payload, quantity: 1 });
      }
      cart.cartSellTotal += +action.payload.sell_price;
      cart.cartCostTotal += +action.payload.cost_price;
      localStorage.setItem('cart', JSON.stringify(state));
      return state;
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

      clearCart(state);
    },
    clearCart: (state, action) => {
      const cart = findOrCreateCart(state, action.payload.location_id);
      cart.cartItems = [];
      cart.cartSellTotal = 0;
      cart.cartCostTotal = 0;
      cart.orderId = null;
      cart.lastTotal = 0;
      cart.lastDue = 0;
      cart.customer_id = 0;

      localStorage.setItem('cart', JSON.stringify(state));
      localStorage.removeItem('currentQuotation');
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

      if (!cart.cartItems.length) {
        cart.orderId = null;
        cart.lastTotal = 0;
        cart.lastDue = 0;
        cart.customer_id = 0;
      }
    },
    changeWithSpesificAmount: (state, { payload }) => {
      const { product, newQty } = payload;
      const { id, location_id, sell_price, cost_price } = product;
      const cart = findOrCreateCart(state, location_id);
      const existingItem = cart.cartItems.find((item) => item.id === id);

      if (existingItem) {
        const oldQty = existingItem.quantity;
        existingItem.quantity = newQty;
        if (existingItem.quantity === 0) {
          cart.cartItems = cart.cartItems.filter((item) => item.id !== id);
        }
        cart.cartSellTotal -= (+sell_price * oldQty);
        cart.cartSellTotal += (+sell_price * newQty);
        cart.cartCostTotal -= (+cost_price * oldQty);
        cart.cartCostTotal += (+cost_price * newQty);
        localStorage.setItem('cart', JSON.stringify(state));
      }

      if (!cart.cartItems.length) {
        cart.orderId = null;
        cart.lastTotal = 0;
        cart.lastDue = 0;
        cart.customer_id = 0;
      }
    },
    addMultipleToCart: (state, action) => {
      const { location_id, products, orderId, customerId, lastTotal, lastDue } = action.payload;
      const cart = findOrCreateCart(state, location_id);
      cart.orderId = orderId;
      cart.lastTotal = lastTotal;
      cart.lastDue = lastDue;
      cart.customer_id = customerId;
      products.map((prod) => {
        const existingItem = cart.cartItems.find((item) => item.id === prod.id);
        if (existingItem) {
          existingItem.quantity = +existingItem.pivot.qty;
        } else {
          cart.cartItems.push({ ...prod, product_id: prod.id, quantity: +prod.pivot.qty });
        }
        cart.cartSellTotal += +prod.sell_price * +prod.pivot.qty;
        cart.cartCostTotal += +prod.cost_price * +prod.pivot.qty;
      });
      localStorage.setItem('cart', JSON.stringify(state));
      state = [cart];
    },
  },
});

export default cartSlice.reducer;
export const selectCart = (state: any) => state.cart;
export const selectCartByLocation = (location_id: string | number) =>
  createSelector(
    selectCart,
    (cartState) =>
      (!!cartState.length
        ? cartState?.find((cart: any) => +cart.location_id === +location_id)
        : null) as ICart
  );

export const {
  addToCart,
  setCart,
  setCartTax,
  setCartCustomer,
  setCartDiscount,
  decreaseItemQuantity,
  clearCart,
  removeFromCart,
  changeWithSpesificAmount,
  addMultipleToCart,
} = cartSlice.actions;
