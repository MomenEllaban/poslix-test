import { createSlice } from '@reduxjs/toolkit';
import ar from 'ar.json';
import en from 'en.json';
import { ELocalStorageKeys } from 'src/utils/local-storage';

interface IRegister {
  status: 'open' | 'close' | null;
  hand_cash: number;
}

interface IPosState {
  lang: any;
  isOpenRegister: boolean;
  isColseRegister: boolean;
  isLoading: boolean;
  handCash: number;
  register: IRegister;
}

const initialState: IPosState = {
  lang: en,
  isOpenRegister: false,
  isColseRegister: false,
  isLoading: false,
  handCash: 0,
  register: {
    status: 'close',
    hand_cash: 0,
  },
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setPosLang(state, action) {
      if (action.payload === 'ar') {
        state.lang = ar;
      } else {
        state.lang = en;
      }

      return state;
    },
    setPosRegister(state, { payload }) {
      state.register = payload as IRegister;
      localStorage.setItem(ELocalStorageKeys.POS_REGISTER_STATE, JSON.stringify(payload));
      return state;
    },
  },
});

export const selectPos = (state) => state.pos as IPosState;

export const { setPosLang, setPosRegister } = posSlice.actions;

export default posSlice.reducer;
