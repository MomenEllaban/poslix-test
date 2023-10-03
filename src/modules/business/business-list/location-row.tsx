import { faFolderOpen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import { Toastify } from 'src/libs/allToasts';
import api from 'src/utils/app-api';
import { ELocalStorageKeys } from 'src/utils/local-storage';
import { useSWRConfig } from 'swr';

export default function LocationRow({ location, locations, businessId }) {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { mutate } = useSWRConfig();
  const router = useRouter();

  const handleDeleteLocation = () => {
    setLoading(true);
    api
      .delete(`business/locations/${location.location_id}`)
      .then(() => {
        Toastify('success', 'Location deleted successfully!');
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
    <tr key={location.location_id}>
      <th scope="row"></th>
      <td>{location.location_name}</td>
      <td className="text-center">{location.location_status}</td>

      <td>
        <ButtonGroup className="mb-2 m-buttons-style">
          <Button
            onClick={() => {
              localStorage.setItem('businessId', businessId);
              localStorage.setItem('locations', JSON.stringify(locations));
              localStorage.setItem(ELocalStorageKeys.CUSTOEMR_LOCATIONS, JSON.stringify(locations));
              router.push(`/shop/${location.location_id}/products`);
            }}>
            <FontAwesomeIcon icon={faFolderOpen} />
          </Button>
          <Button className="text-danger" onClick={() => setShowConfirmation(true)}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </ButtonGroup>

        <ConfirmationModal
          loading={loading}
          show={showConfirmation}
          onConfirm={handleDeleteLocation}
          message="Are you sure to delete this location?"
          onClose={() => setShowConfirmation(false)}
        />
      </td>
    </tr>
  );
}
