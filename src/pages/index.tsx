// Ensure you're using 'import' instead of 'use' for importing the 'client' module.
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from 'src/context/UserContext';
import { ELocalStorageKeys } from 'src/utils/app-contants';
import { ROUTES } from 'src/utils/app-routes';

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const redirectUser = () => {
      // const _business = localStorage.getItem(ELocalStorageKeys.USER_LOCATIONS);
      // const _username = localStorage.getItem(ELocalStorageKeys.USER_NAME);
      // const _level = localStorage.getItem(ELocalStorageKeys.LEVELS);
      // console.log('business', _business);
      console.log('I am in the home page');
      router.push(ROUTES.AUTH);
      // if (!Object.keys(user).length) {
      //   console.log("I am in the user's auth");
      // } else if (_level === 'user' && _business) {
      //   console.log("I am in the user's business");
      //   router.push('/shop/' + _business[0]?.value);
      // } else if (_username) {
      //   console.log('username', _username);
      //   router.push('/' + _username + '/business');
      // }
    };

    console.log('Home Page> -------------------------');

    console.log('USER', user);

    if (user) {
      redirectUser();
    }
  }, [user, router]);

  return <></>;

  <div>
    <style jsx>{`
      div {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 40vh;
      }
    `}</style>
    Loading...
  </div>; // You can replace this with meaningful content for your home page.
}
