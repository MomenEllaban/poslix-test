// recoil/selectors/authSelectors.ts
import { selectorFamily } from 'recoil';
import { authState } from '../atoms/authState';

export const login = selectorFamily({
  key: 'login',
  get:
    () =>
    async ({ get, set }, credentials) => {
      try {
        // Perform API request to authenticate user and get token
        const response = await fetch('your-login-api', {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const { token, user } = data;
          set(authState, {
            isAuthenticated: true,
            user,
            accessToken: token,
          });
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    },
});

export const logout = selectorFamily({
  key: 'logout',
  get:
    () =>
    async ({ set }) => {
      // Perform any additional cleanup, like invalidating the token on the server
      set(authState, {
        isAuthenticated: false,
        user: null,
        accessToken: null,
      });
    },
});
