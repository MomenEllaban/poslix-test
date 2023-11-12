import { faChartPie, faUser } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsFileRuledFill } from 'react-icons/bs';
import { ImUsers } from 'react-icons/im';
import { IoBusinessSharp } from 'react-icons/io5';
import SidebarNavItem from './_components/SidebarNavItem';
import { useTranslation } from 'next-i18next';

export default function OwnerSidebarNav({ username2 }: any) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    var _username: any = router.query.username;
    if (typeof _username != undefined) setUsername(_username);
  }, [router.asPath]);

  return (
    <ul className="list-unstyled">
      {/* <SidebarNavItem icon={faGauge} href="/">
        Dashboard
        <small className="ms-auto"></small>
      </SidebarNavItem> */}
      <SidebarNavItem icon={faChartPie} href={username ? '/' + username + '/business' : ''}>
        <IoBusinessSharp className="nav-icon ms-n3" />
        {t('g.my_business')}
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href={username ? '/' + username + '/rules' : ''}>
        <BsFileRuledFill className="nav-icon ms-n3" />
        {t('g.roles')}
        <small className="ms-auto"></small>
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href={username ? '/' + username + '/users' : ''}>
        <ImUsers className="nav-icon ms-n3" />
        {t('g.users')}
        <small className="ms-auto"></small>
      </SidebarNavItem>
    </ul>
  );
}
