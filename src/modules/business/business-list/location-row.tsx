import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { Button, ButtonGroup } from 'react-bootstrap';

export default function LocationRow({ location }) {
  const router = useRouter();

  return (
    <tr key={location.location_id}>
      <th scope="row"></th>
      <td>{location.location_name}</td>
      <td className="text-center">. . .</td>

      <td>
        <ButtonGroup className="mb-2 m-buttons-style">
          <Button
            onClick={() => {
              router.push(`/shop/${location.location_id}/products`);
            }}>
            <FontAwesomeIcon icon={faFolderOpen} />
          </Button>
        </ButtonGroup>
      </td>
    </tr>
  );
}
