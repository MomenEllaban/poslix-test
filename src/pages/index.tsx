import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { set } from 'react-hook-form';
import { useUser } from 'src/context/UserContext';
import { ELocalStorageKeys } from 'src/utils/app-contants';
import { ROUTES } from 'src/utils/app-routes';

// this is the base page '/' that the user will be redirected to
export default function Home() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { data: session } = useSession();
  console.log('session', session);

  console.log('Home Page -------------------------');
  useEffect(() => {
    console.log('USER', user);
    const _business = localStorage.getItem(ELocalStorageKeys.USER_LOCATIONS) as any;
    const _username = localStorage.getItem(ELocalStorageKeys.USER_NAME) as any;
    const _level = localStorage.getItem(ELocalStorageKeys.LEVELS) as any;
    console.log('I am redirecting the user');
    console.log(_business);
    console.log(_username);
    console.log(_level);
    if (!user) router.push(ROUTES.AUTH);
    else if (_level === 'user') router.push('/shop/' + _business[0].value);
    else router.push('/' + _username + '/business');
  }, [user]);

  useEffect(() => {
    if (session) {
      console.log(session);
    }
  }, [session]);

  return <></>;
}
