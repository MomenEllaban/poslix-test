import { faGear, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { Fragment, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import api from 'src/utils/app-api';
import { useSWRConfig } from 'swr';
import LocationRow from './location-row';

export default function BusinessRow({ business, list = [] }) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { mutate } = useSWRConfig();

  const userId = user?.id;

  const idx = list.findIndex((item) => item.id === business.id);

  const handleDeleteBusiness = () => {
    setLoading(true);
    api
      .delete(`business/${business.id}`)
      .then(() => {
        Toastify('success', 'Business deleted successfully!');
        mutate('/business'); //this is the key of the business
        setShowConfirmation(false);
      })
      .catch(() => {
        Toastify('error', 'Something went wrong!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Fragment>
      <tr style={{ background: '#e4edec' }}>
        <th scope="row">{business.id}</th>

        <td>{business.name}</td>
        <td className="text-center">{business.type}</td>
        <td>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              onClick={() => {
                router.push(`/${userId}/business/${business.id}/settings`);
              }}>
              <FontAwesomeIcon icon={faGear} />
            </Button>
            <Button
              disabled={idx === 0 || list.length < 2}
              className="text-danger"
              onClick={() => {
                if (list.length < 2)
                  return Toastify('error', 'You cannot delete the only business exist!');
                if (idx < 1) return Toastify('error', 'You cannot delete the first business!');

                setShowConfirmation(true);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
            <Button
              onClick={() => {
                router.push(`/${userId}/business/${business.id}/add`);
              }}>
              <FontAwesomeIcon icon={faPlus} /> Add New Location
            </Button>
          </ButtonGroup>
        </td>
      </tr>
      {business.locations.map((location) => (
        <LocationRow
          key={location.location_id}
          location={location}
          locations={business.locations}
          businessId={business.id}
        />
      ))}
      <ConfirmationModal
        loading={loading}
        show={showConfirmation}
        onConfirm={handleDeleteBusiness}
        message="Are you sure to delete this business?"
        onClose={() => setShowConfirmation(false)}
      />
    </Fragment>
  );
}
