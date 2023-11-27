import { faArrowAltCircleLeft, faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { userDashboard } from '@models/common-model';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import AddNewUser from 'src/components/dashboard/AddNewUser';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useTranslation } from 'next-i18next';

const Locations = () => {
  const [users, setUsers] = useState<userDashboard[]>([]);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUser, setIsAddUser] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();

  // const handleDeleteFunc = () => {};

  async function initDataPage() {
    if (router.isReady) {
      const res = await findAllData('users');
      if (res.data.success) {
        setUsers(res.data.result);
        setIsLoading(false);
      }
    }
  }
  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  return (
    <OwnerAdminLayout>
      <AlertDialog
        alertShow={show}
        alertFun={(result: boolean, msg: string) => {
          if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
          initDataPage();
          setShow(false);
        }}
        id={selectedId}
        url={'delete-user'}>
        {t("g.Are_you_Sure_You_Want_Delete_This_Customer")}
      </AlertDialog>
      <ToastContainer />
      <button
        className="mb-4 btn btn-primary p-3"
        style={{ width: '150px' }}
        onClick={() => {
          setSelectedId(0);
          setIsAddUser(!isAddUser);
        }}>
        <FontAwesomeIcon icon={!isAddUser ? faPlus : faArrowAltCircleLeft} />{' '}
        {!isAddUser ? t("g.AddUser") : t('g.Back')}
      </button>
      {isAddUser && (
        <AddNewUser
          setIsAddUser={setIsAddUser}
          users={users}
          index={selectedId}
          initData={initDataPage}
        />
      )}
      {!isAddUser && (
        <div className="row">
          <div className="col-md-12">
            <Card>
              <Card.Header className="p-3 bg-white">
                <h5>{t("g.MyUsers")} </h5>
              </Card.Header>
              <Card.Body>
                {!isLoading ? (
                  <Table className="table table-hover" responsive>
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: '6%' }}>#</th>
                        <th>{t("g.name")}</th>
                        <th>{t("g.email")}</th>
                        <th>{t("g.password")}</th>
                        <th>{t("g.action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: any, i: number) => {
                        return (
                          <tr>
                            <th scope="row">{i + 1}</th>
                            <th>
                              {user.first_name + (user?.last_name ? ' ' + user?.last_name : '')}
                            </th>
                            <td>{user.email}</td>
                            <td>{user.password}</td>
                            <td>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                <Button
                                  onClick={() => {
                                    setSelectedId(user.id);
                                    setShow(true);
                                  }}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedId(user.id);
                                    setIsAddUser(true);
                                  }}>
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                              </ButtonGroup>
                            </td>
                          </tr>
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
      )}
    </OwnerAdminLayout>
  );
};

export default withAuth(Locations);


export async function getServerSideProps({locale}) {

  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}
