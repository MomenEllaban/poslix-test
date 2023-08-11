import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { BusinessTypeData } from '@models/data';
import { setCookie } from 'cookies-next';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import { Toastify } from 'src/libs/allToasts';
import { apiInsertCtr } from 'src/libs/dbUtils';
import CreateBusinessView from 'src/modules/business/create-business/create-business-view';
import { useBusinessTypesList, useCurrenciesList } from 'src/services/business.service';
import { ROUTES } from 'src/utils/app-routes';

export default function CreateBusinessPage({ username, busniessType }: any) {
  const [formObj, setFormObj] = useState({
    id: 0,
    business_id: '',
    business_type: 0,
    decimal_places: 0,
    name: '',
    country: 0,
    city: '',
    state: '',
    mobile: '',
    email: '',
  });
  const [errorForm, setErrorForm] = useState({
    name: false,
    decimal_places: false,
    mobile: false,
    email: false,
    type: false,
  });
  const [currencies, setCurrencies] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [busniessTypesList, setBusniessTypesList] = useState(busniessType);
  const { businessTypesList } = useBusinessTypesList({
    onSuccess(data, key, config) {
      const _businessTypesList = data.result.map((itm: any) => {
        return { value: itm.id, label: itm.name };
      });
      setBusniessTypesList(_businessTypesList);
    },
  });

  const { currenciesList, isLoading } = useCurrenciesList(null, {
    onSuccess(data, key, config) {
      const _currenciesList = data.result.map((itm: any) => {
        return { value: itm.id, label: itm.country };
      });
      setCurrencies(_currenciesList);
    },
  });
  const router = useRouter();

  async function newBusiness() {
    const { success, newdata } = await apiInsertCtr({
      type: 'owner',
      subType: 'createBusiness',
      data: {
        ...formObj,
        types: localStorage.getItem('userlocs')
          ? JSON.parse(localStorage.getItem('userlocs')).map((loc) => {
              return { id: loc.value, type: loc.typeid };
            })
          : [],
      },
    });
    if (!success) {
      Toastify('error', 'Error, Try Again');
      return;
    }
    Toastify('success', 'Business Successfuly Created..');
    setCookie('tokend', newdata);
    localStorage.setItem('userinfo', newdata);
    router.push('/' + username + '/business');
  }
  var errors = [];

  return (
    <OwnerAdminLayout>
      <ToastContainer />
      <div className="row">
        <div className="col-md-12">
          <Link href={'/' + username + '/business'} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to list{' '}
          </Link>
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>Create Business </h5>
            </Card.Header>
            <Card.Body>
              {!loading ? (
                <CreateBusinessView />
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
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });
  if (!session) return { redirect: { permanent: false, destination: ROUTES.AUTH } };

  const username = session?.user?.username;
  const busniessType = BusinessTypeData(); // fallback

  return {
    props: { username, busniessType },
  };
}
