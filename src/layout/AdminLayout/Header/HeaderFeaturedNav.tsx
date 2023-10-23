import Link from 'next/link';
import { Nav } from 'react-bootstrap';
import { useUser } from 'src/context/UserContext';

export default function HeaderFeaturedNav() {
  const { user } = useUser();

  return (
    <Nav>
      <Nav.Item>
        <Link href={`/${user.id}/business`} passHref legacyBehavior>
          {user.user_type === 'owner' ? <Nav.Link className="p-2">My Businesses</Nav.Link> : ''}
        </Link>
      </Nav.Item>
    </Nav>
  );
}
