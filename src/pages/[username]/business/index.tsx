import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { getSession } from 'next-auth/react';
import Link from 'next/link';

import { useContext } from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'next-i18next';
import { darkModeContext } from 'src/context/DarkModeContext';
import { useUser } from 'src/context/UserContext';
import BusinessRow from 'src/modules/business/business-list/business-row';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const MyBusinessesPage = ({ businessList }) => {
  const { user } = useUser();
  const { darkMode } = useContext(darkModeContext);

  const { t } = useTranslation();

  const userId = user?.id;

  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={`/${userId}/business/create`} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faPlus} /> {t('g.add_new_business')}
          </Link>
          <Card className={darkMode ? 'dark-mode-body' : ''}>
            <Card.Header
              className={`p-3 bg-white ${darkMode ? 'dark-mode-body' : 'light-mode-body'}`}>
              <h5>{t('g.my_business')}</h5>
            </Card.Header>
            <Card.Body className={darkMode ? 'dark-mode-body rounded-3' : ''}>
              {businessList.length > 0 ? (
                <Table className="table table-hover rounded-3" responsive>
                  <thead className="thead-dark rounded-3">
                    <tr className={darkMode ? 'dark-mode-body rounded-3' : ''}>
                      <th style={{ width: '6%' }}>#</th>
                      <th>{t('g.name')}</th>
                      <th className="text-center">{t('g.type')}</th>
                      <th>{t('g.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessList.map((business) => (
                      <BusinessRow list={businessList} key={business.id} business={business} />
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="d-flex justify-content-around">
                  <Spinner animation="grow" />
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </OwnerAdminLayout>
  );
};

export default MyBusinessesPage;

async function getData(endPoint: string, API_BASE: string, _token: string) {
  try {
    const res = await fetch(`${API_BASE}${endPoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${_token}`,
      },
    });
    const data = await res.json();

    if (data.status === 200) {
      return data?.result;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function getServerSideProps(context) {
  const { req, locale } = context;

  const session = await getSession({ req: req });
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const _token = session?.user?.token;

  const businessList = (await getData(`business`, API_BASE, _token)) ?? [];

  return {
    props: {
      businessList,
      ...(await serverSideTranslations(locale)),
    },
  };
}
