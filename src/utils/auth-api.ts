import axios, { AxiosInstance } from 'axios';
import { type Session } from 'next-auth';

export const authApi = (session: Session): AxiosInstance =>
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE,
    headers: {
      Authorization: `Bearer ${session.user.token}`,
    },
  });
