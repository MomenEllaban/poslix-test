'use client';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import MainTextInput from 'src/components/form/_atoms/MainTextInput';
import MainModal from 'src/components/modals/MainModal';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import useSWR from 'swr';
import PaymentModal from './component/PaymentModal';

const PaymentMethods: NextPage = ({ id }: any) => {
  const router = useRouter();
  const shopId = router.query.id;

  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<any>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<{
    id: number;
    name: string;
    location_id: number;
    enable_flag: 1 | boolean;
  } | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editField, setEditField] = useState('');
  const [paymentMethodsModal, setPaymentMethodsModals] = useState<boolean>();

  const { isLoading: isMethodsLoading, mutate } = useSWR(
    `payments/${router.query.id}`,
    findAllData,
    {
      onSuccess: (data) => {
        setPaymentMethods(data.data.result.payments);
      },
    }
  );

  const handlePrimarySwitchChange = (e: any, i: number) => {
    const _paymentMethods = [...paymentMethods];
    _paymentMethods[i].enabled = !_paymentMethods[i].enabled;
    setPaymentMethods(_paymentMethods);
  };

  const methodModalHandler = (status: any) => {
    setPaymentMethodsModals(false);
  };

  const handleDeleteBusiness = (_id) => {
    setLoading(true);
    api
      .delete(`payments/${_id}`)
      .then(() => {
        Toastify('success', 'Payment deleted successfully!');
        mutate();
      })
      .catch(() => {
        Toastify('error', 'Something went wrong!');
      })
      .finally(() => {
        setShowConfirmation(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions?.map((perm) =>
      perm.name.includes('payment/show')
        ? (getPermissions.hasView = true)
        : perm.name.includes('payment/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('payment/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('payment/delete')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);
  }, [router.asPath]);

  const handleUpdateMethod = () => {
    setLoading(true);
    api
      .put(`/payments/${selectedMethod.id}`, {
        location_id: +shopId,
        name: editField,
      })
      .then(() => {
        Toastify('success', 'Payment method updated successfully!');
        setEditField('');
        setSelectedMethod(null);
        setShowEditModal(false);
        mutate();
      })
      .catch(() => {
        Toastify('error', 'Something went wrong!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (isMethodsLoading)
    return (
      <AdminLayout shopId={id}>
        <ToastContainer />

        <div className="container bg-white">
          <div className="d-flex">
            <div className="m-3">
              <button
                style={{ boxShadow: 'unset', backgroundColor: '#004e46' }}
                className="btn m-btn btn-primary btn-dark p-2"
                onClick={() => {
                  setPaymentMethodsModals(true);
                }}>
                <FontAwesomeIcon icon={faPlus} /> Add New Method
              </button>
            </div>
          </div>
          <PaymentModal
            showType={'add'}
            statusDialog={paymentMethodsModal}
            openDialog={methodModalHandler}
            fetchData={mutate}
          />
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout shopId={id}>
      <ToastContainer />

      <div className="container bg-white">
        <div className="d-flex">
          <div className="m-3">
            <button
              style={{ boxShadow: 'unset', backgroundColor: '#004e46' }}
              className="btn m-btn btn-primary btn-dark p-2"
              onClick={() => {
                setPaymentMethodsModals(true);
              }}>
              <FontAwesomeIcon icon={faPlus} /> Add New Method
            </button>
          </div>
        </div>
        <PaymentModal
          showType={'add'}
          statusDialog={paymentMethodsModal}
          openDialog={methodModalHandler}
          fetchData={mutate}
        />
        <div className="d-flex flex-column gap-1 justify-content-center rounded border p-4 m-4">
          {paymentMethods?.length &&
            paymentMethods?.map((method: any, i: number) => (
              <Card
                className={`row d-flex p-3 flex-row ${i % 2 === 0 ? 'even-row' : 'odd-row'}`}
                key={method.id + '-payment-method'}>
                <div className="col-6 border rounded" style={{ maxWidth: '20rem' }}>
                  <div>{method.name}</div>
                </div>
                <div className="col-3 d-flex justify-content-center pt-3">
                  <Form.Check
                    type="switch"
                    id={`custom-switch-${i}`}
                    disabled={!permissions.hasInsert}
                    className="custom-switch"
                    checked={method.enabled ? true : false}
                    onChange={(e) => {
                      handlePrimarySwitchChange(e, i);
                    }}
                  />
                </div>
                <div className="col-3">
                  <ButtonGroup>
                    <Button
                      variant="outline-info"
                      disabled={loading}
                      onClick={() => {
                        setSelectedMethod(method);
                        setEditField(method.name || '');
                        setShowEditModal(true);
                      }}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      disabled={loading}
                      onClick={() => {
                        setShowConfirmation(true);
                      }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </ButtonGroup>
                </div>
                <ConfirmationModal
                  loading={loading}
                  show={showConfirmation}
                  onConfirm={() => handleDeleteBusiness(method.id)}
                  message="Are you sure to delete this method?"
                  onClose={() => setShowConfirmation(false)}
                />
              </Card>
            ))}
        </div>
      </div>
      <MainModal
        show={showEditModal}
        setShow={setShowEditModal}
        onClose={() => {
          setEditField('');
          setSelectedMethod(null);
        }}
        title="Edit payment method"
        body={
          <MainTextInput
            autoFocus
            label="Payment Method"
            name={editField}
            onChange={(e) => setEditField(e.target.value)}
            value={editField}
            defaultValue={editField}
          />
        }
        footer={
          <Button disabled={loading} onClick={handleUpdateMethod}>
            Save
          </Button>
        }
      />
    </AdminLayout>
  );
};
export default withAuth(PaymentMethods);
export async function getServerSideProps({ params }) {
  const { id } = params;
  return { props: { id } };
}
