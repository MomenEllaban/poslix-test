import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
// import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';
import withAuth from 'src/HOCs/withAuth';
import { darkModeContext } from 'src/context/DarkModeContext';
import { useUser } from 'src/context/UserContext';
import BusinessRow from 'src/modules/business/business-list/business-row';
// import { useBusinessList } from 'src/services';

const MyBusinessesPage = ({ businessList }) => {
  // const router = useRouter();
  const { user } = useUser();
  const { darkMode } = useContext(darkModeContext);

  // const { businessList, isLoading, error, refetch } = useBusinessList({
  //   suspense: !user.id,
  // });

  const userId = user?.id;

  // useEffect(() => {
  //   refetch();
  // }, [router.asPath]);

  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={`/${userId}/business/create`} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faPlus} /> Add New Business{' '}
          </Link>
          <Card className={darkMode ? 'dark-mode-body' : ''}>
            <Card.Header
              className={`p-3 bg-white ${darkMode ? 'dark-mode-body' : 'light-mode-body'}`}>
              <h5>My Business</h5>
            </Card.Header>
            <Card.Body className={darkMode ? 'dark-mode-body rounded-3' : ''}>
              {businessList.length > 0 ? (
                <Table className="table table-hover rounded-3" responsive>
                  <thead className="thead-dark rounded-3">
                    <tr className={darkMode ? 'dark-mode-body rounded-3' : ''}>
                      <th style={{ width: '6%' }}>#</th>
                      <th>Name</th>
                      <th className="text-center">type</th>
                      <th>Action</th>
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
  const { req } = context;

  const session = await getSession({ req: req });
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const _token = session?.user?.token;

  const businessList = (await getData(`business`, API_BASE, _token)) ?? [];

  return {
    props: {
      businessList,
    },
  };
}
