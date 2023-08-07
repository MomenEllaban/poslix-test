import { faFolderOpen, faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap';
import withAuth from 'src/HOCs/withAuth';
import { darkModeContext } from 'src/context/DarkModeContext';
import { useUser } from 'src/context/UserContext';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { useBusinessList } from 'src/services';

const MyBusinessesPage = () => {
  const { darkMode } = useContext(darkModeContext);
  const { user } = useUser();
  const { businessList, isLoading, error, refetch } = useBusinessList({
    suspense: !user.username,
    onSuccess(data, key, config) {
      console.log(data);
    },
  });
  const username = user?.username;

  const router = useRouter();
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  async function initDataPage() {
    const { success, newdata } = await apiFetchCtr({ fetch: 'owner', subType: 'getBusiness' });
    if (!success) {
      return;
    }
    var buss: any = [];
    var _newdata = newdata;
    console.log(newdata);

    for (let j = 0; j < newdata.length; j++) {
      var bid = newdata[j].business_id;
      if (buss.findIndex((pp: any) => pp == bid) == -1) {
        buss.push(bid);
        _newdata.splice(j, 0, { isHead: true, data: newdata[j] });
      }
    }
    console.log(buss);

    console.log(_newdata);

    var busLocs: {
      bus_id: number;
      bus_name: string;
      locations: { loc_name: string; loc_id: number }[];
    }[] = [];
    _newdata.forEach((element) => {
      if (element.isHead) {
        busLocs.push({
          bus_id: element.data.business_id,
          bus_name: element.data.business_name,
          locations: [],
        });
      } else {
        const idx = busLocs.findIndex((e) => e.bus_id === element.business_id);
        busLocs[idx].locations.push({ loc_id: element.loc_id, loc_name: element.loc_name });
      }
    });
    console.log('bbbbbbbbbbbb', busLocs);
    localStorage.setItem('cusLocs', JSON.stringify(busLocs));
    setLocations(_newdata);
  }
  useEffect(() => {
    // initDataPage();
  }, []);

  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={'/' + username + '/business/create'} className="btn btn-primary p-3 mb-3">
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
                    {businessList.map((busi, i: number) => {
                      return (
                        <>
                          <tr key={busi.id} style={{ background: '#e4edec' }}>
                            <th scope="row">{busi.id}</th>

                            <td>{busi.name}</td>
                            <td className="text-center">{busi.type}</td>
                            <td>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                <Button
                                  onClick={() => {
                                    router.push(`/${username}/business/${busi.id}/settings`);
                                  }}>
                                  <FontAwesomeIcon icon={faGear} />
                                </Button>
                                <Button
                                  onClick={() => {
                                    router.push(`/${username}/business/${busi.id}/add`);
                                  }}>
                                  <FontAwesomeIcon icon={faPlus} /> Add New Location
                                </Button>
                              </ButtonGroup>
                            </td>
                          </tr>
                          {busi.locations.map((location, j) => {
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
                          })}
                        </>
                      );
                    })}
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
export default withAuth(MyBusinessesPage);
