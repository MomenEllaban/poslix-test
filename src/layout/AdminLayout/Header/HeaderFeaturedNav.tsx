import Link from 'next/link';
import { Nav } from 'react-bootstrap';
import { useTranslation } from 'next-i18next';
import { useUser } from 'src/context/UserContext';

export default function HeaderFeaturedNav() {
  const { user } = useUser();
  const { t } = useTranslation();

  return (
    <Nav>
      <Nav.Item>
        <Link href={`/${user.id}/business`} passHref legacyBehavior>
          {user.user_type === 'owner' ? (
            <Nav.Link className="p-2">{t('g.my_business')}</Nav.Link>
          ) : (
            ''
          )}
        </Link>
      </Nav.Item>
    </Nav>
  );
}
