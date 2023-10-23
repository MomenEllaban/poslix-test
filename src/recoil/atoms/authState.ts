import { atom } from 'recoil';

export const authState = atom({
  key: 'authState',
  default: {
    isLoggedIn: false,
    user: null,
    accessToken: null,
  },
});
