import { faChartPie, faUser } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsFileRuledFill } from 'react-icons/bs';
import { ImUsers } from 'react-icons/im';
import { IoBusinessSharp } from 'react-icons/io5';
import SidebarNavItem from './_components/SidebarNavItem';

export default function OwnerSidebarNav({ username2 }: any) {
  const router = useRouter();
  const [username, setUsername] = useState('');

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
        My Businesses
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href={username ? '/' + username + '/rules' : ''}>
        <BsFileRuledFill className="nav-icon ms-n3" />
        Roles<small className="ms-auto"></small>
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href={username ? '/' + username + '/users' : ''}>
        <ImUsers className="nav-icon ms-n3" />
        Users<small className="ms-auto"></small>
      </SidebarNavItem>
    </ul>
  );
}
