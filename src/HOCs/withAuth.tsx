import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from 'src/context/UserContext';
import { ROUTES } from 'src/utils/app-routes';

/**
 * This HOC is used to check if the user is logged in or not.\
 * If the user is not logged in, it will redirect to the login page.
 *
 * Usage:
 *  import withAuth from 'src/HOCs/withAuth';
 * const MyPage = () => {
 *  return <div>My Page</div>
 * }
 * export default withAuth(MyPage);
 *
 */

export default function withAuth(Component) {
  return (props) => {
    const router = useRouter();

    const { user } = useUser();

    useEffect(() => {
      if (!user.username) {
        router.push(ROUTES.AUTH);
      }
    }, [user]);

    return <Component {...props} user={user} />;
  };
}
