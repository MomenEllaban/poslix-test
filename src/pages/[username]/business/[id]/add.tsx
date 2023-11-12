import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import AddBusinessLocationView from 'src/modules/business/add-location/add-location-view';
//
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function AddBusinessLocation() {
  const router = useRouter();
  const businessId = router.query.id as string;
  const username = router.query.username as string;
  const { t } = useTranslation();

  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={`/${username}/business`} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faArrowLeft} /> {t('g.back_to_list')}{' '}
          </Link>
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>{t('g.add_new_location')}</h5>
            </Card.Header>
            <Card.Body>
              <AddBusinessLocationView businessId={businessId} />
            </Card.Body>
          </Card>
        </div>
      </div>
      <ToastContainer />
    </OwnerAdminLayout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}
