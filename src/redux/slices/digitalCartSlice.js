import { createSlice } from '@reduxjs/toolkit';

const digitalCartSlice = createSlice({
  name: 'digitalCart',
  initialState: {
    digitalCart: [],
  },
  reducers: {
    addTodigitalCart: (state, action) => {
      const itemIndigitalCart = state.digitalCart.find((item) => item.id === action.payload.id);
      if (itemIndigitalCart) {
        itemIndigitalCart.quantity=itemIndigitalCart.quantity+action.payload.quantity;
      } else {
        state.digitalCart.push({ ...action.payload, quantity: action.payload.quantity });
      }
    },
    incrementQuantity: (state, action) => {
      const item = state.digitalCart.find((item) => item.id === action.payload);
      item.quantity++;
    },
    decrementQuantity: (state, action) => {
      const item = state.digitalCart.find((item) => item.id === action.payload);
      if (item.quantity ==0) {
         item.quantity = 1;
      }
      if (item.quantity === 1) {
        // item.quantity = 1;
        const removeItem = state.digitalCart.filter((item) => item.id !== action.payload);
        state.digitalCart = removeItem;
      } else {
        item.quantity--;
      }
    },
    removeItem: (state, action) => {
      const removeItem = state.digitalCart.filter((item) => item.id !== action.payload);
      state.digitalCart = removeItem;
    },
  },
});

export const digitalCartReducer = digitalCartSlice.reducer;
export const {
  addTodigitalCart,
  incrementQuantity,
  decrementQuantity,
  removeItem,
} = digitalCartSlice.actions;