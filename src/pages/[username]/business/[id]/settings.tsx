import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card, Spinner } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import BusinessSettingsView from 'src/modules/business/business-settings/business-settings-view';
import { useGetBusiness } from 'src/services/business.service';

function UpdateBusinessSettings({ username, busniessType, user }: any) {
  const router = useRouter();
  const businessId = router.query.id as string;
  const { business, error, isLoading } = useGetBusiness(businessId);

  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={`/${user?.id}/business`} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to list
          </Link>
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>Settings</h5>
            </Card.Header>
            <Card.Body>
              {isLoading || error ? (
                <div className="d-flex justify-content-around">
                  <Spinner animation="grow" />
                </div>
              ) : (
                <BusinessSettingsView business={business} />
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
      <ToastContainer />
    </OwnerAdminLayout>
  );
}
export default withAuth(UpdateBusinessSettings);
