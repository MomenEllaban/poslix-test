import { ILogin } from '@models/auth.types';
import { ICustomResponse } from '@models/global.types';
import axios, { AxiosResponse } from 'axios';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

type TLoginResponse = AxiosResponse<ICustomResponse<ILogin>>;

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'laravel-backend',
      type: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'mail@domain.com' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, req) => {
        const { email, password } = credentials;

        const { data } = await axios.post<
          string,
          TLoginResponse,
          { email: string; password: string }
        >(`${process.env.API_BASE}login`, { email, password });

        if (data) {
          const user = {
            ...data.result.user,
            token: data.result.authorization.token,
          };
          console.log(user);
          return user as any;
        }
        return null;
      },
    }),

    // ...add more providers here
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) token.user = user as any;

      return token;
    },
    async session({ session, token }) {
      if (!session) return;
      if (token.user) session.user = token.user;

      return session;
    },
  },
};
export default NextAuth(authOptions);
