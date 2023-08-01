import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // this may cause problems ...redirect to login ?
    // TODO: convert to protected routes
    router.push('/user/login');
  }, []);

  // removed part could be get from previous commits
  return <></>;
}
