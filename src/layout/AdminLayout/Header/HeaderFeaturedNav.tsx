import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useUser } from 'src/context/UserContext';

export default function HeaderFeaturedNav() {
  const { user } = useUser();
  const [userLevel, setUserLevel] = useState('');

  const [path, setPath] = useState('');
  useEffect(() => {
    const _lv = localStorage.getItem('levels') || '';

    setUserLevel(_lv);
    setPath('/' + user.id);
  }, []);

  return (
    <Nav>
      <Nav.Item>
        <Link href={path + '/business'} passHref legacyBehavior>
          {userLevel == 'owner' ? <Nav.Link className="p-2">My Businesses</Nav.Link> : ''}
        </Link>
      </Nav.Item>
    </Nav>
  );
}
