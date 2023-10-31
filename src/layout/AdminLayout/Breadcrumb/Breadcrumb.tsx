import { Breadcrumb as BSBreadcrumb } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect, useContext } from 'react';
import Select, { StylesConfig } from 'react-select';
import { redirectToLogin } from 'src/libs/loginlib';
import { UserContext } from 'src/context/UserContext';

/*MOHAMMED MAHER */
import { darkModeContext } from 'src/context/DarkModeContext';
import { ILocation } from '@models/auth.types';

const selectStyles = {
  control: (style: any, state: any) => ({
    ...style,
    borderRadius: '10px',
    background: '#f5f5f5',
    height: '40px',
    width: '10rem',
    zIndex: 998,
    position: 'relative',
    outline: state.isFocused ? '2px solid #045c54' : 'none',
    boxShadow: 'none',
    '&:hover': {
      outline: '2px solid #045c54 ',
    },
  }),
  menu: (provided: any, state: any) => ({
    ...provided,
    borderRadius: '10px',
    zIndex: 998,
    padding: '10px', // Add padding to create space
    border: '1px solid #c9ced2',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#e6efee' : 'white',
    color: '#2e776f',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: '#e6efee',
      color: '#2e776f',
      borderRadius: '10px',
    },
    margin: '5px 0', // Add margin to create space between options
  }),
};

export default function Breadcrumb(props: any) {
  const { shopId } = props;
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<any>([]);
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);
  const [locationIndex, setLocationIndex] = useState<number>(-1);
  const [currentPageName, setCurrentPageName] = useState('');
  const [isSlug, setIsSlug] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { darkMode } = useContext(darkModeContext);

  const linkPath: string[] = router.asPath.split('/');
  linkPath.shift();
  const pathArray = linkPath.map((path, i) => {
    return { breadcrumb: path, href: '/' + linkPath.slice(0, i + 1).join('/') };
  });

  useEffect(() => {
    setBreadcrumbs(pathArray);
    if (linkPath.length > 2) setCurrentPageName(linkPath[2]);
    if (linkPath.length > 3) setIsSlug(true);
    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    setLocations(
      _locs.map((location: ILocation) => ({
        ...location,
        value: location.location_id,
        label: location.location_name,
      }))
    );
    setLocationIndex(
      _locs.findIndex((loc: any) => {
        return loc.value == shopId;
      })
    );
  }, [router.asPath]);
  return (
    <div className="breadcrumb-style bg-white  ">
      <div className="ineer-breadcrumb-style ms-auto">
        {!isSlug && locations.length > 1 && (
          <Select
            className={`mt-3 ${darkMode ? 'dark-mode-body' : 'light-mode-body'} w-100`}
            options={locations}
            value={locations[locationIndex]}
            styles={selectStyles}
            onChange={(itm: any) => {
              setUser(itm);
              redirectToLogin('/shop/' + itm!.value + '/' + currentPageName);
            }}
          />
        )}
      </div>
      <BSBreadcrumb
        listProps={{
          className: `my-0  align-items-center breadcrumb-m ${
            darkMode ? 'dark-mode-body' : 'light-mode-body'
          }`,
        }}>
        <BSBreadcrumb.Item active linkProps={{ className: 'text-decoration-none' }} href={'/'}>
          {locations.length > 0 && locationIndex > -1 && locations[locationIndex].label}
        </BSBreadcrumb.Item>
        {breadcrumbs &&
          breadcrumbs.map((br: any, i: number) => {
            return (
              i > 1 &&
              i < 4 && (
                <BSBreadcrumb.Item
                  key={i}
                  active={breadcrumbs.length - 1 == i ? true : i == 3 ? true : false}
                  linkProps={{
                    className: `text-decoration-none ${
                      darkMode ? 'dark-mode-body' : 'light-mode-body'
                    }`,
                  }}
                  href={'/shop/' + shopId + '/' + br.breadcrumb}>
                  {br.breadcrumb.split('?')[0]}
                </BSBreadcrumb.Item>
              )
            );
          })}
      </BSBreadcrumb>
    </div>
  );
}
