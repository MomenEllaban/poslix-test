import { IUser } from '@models/auth.types';
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

type TUser = IUser & { token: string };
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: TUser;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    user?: TUser;
  }
}
