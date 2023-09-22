'use client';
import type { NextPage } from 'next';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import { faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import useSWR from 'swr';
import { findAllData } from 'src/services/crud.api';
import { useRouter } from 'next/router';
import PaymentModal from './component/PaymentModal';

const PaymentMethods: NextPage = (props: any) => {
  const { shopId } = props;
  const [currentPaymentMethods, setCurrentPaymentMethods] = useState([]);

  const [paymentMethods, setPaymentMethods] = useState<any>();
  const [paymentMethodsModal, setPaymentMethodsModals] = useState<boolean>();

  const router = useRouter();
  console.log(router.query.id);

  const { data, error, mutate } = useSWR(`payments/${router.query.id}`, findAllData, {
    onSuccess: (data) => {
      mutate();
      console.log('Data fetched successfully:', data);
    },
  });

  const paymentData = useMemo(() => {
    // Check if data is available and not in an error state
    if (data && !error) {
      return setPaymentMethods(data.data.result.payments);
    }

  }, [data, error]);

  const handlePrimarySwitchChange = (e: any, i: number) => {
    const _paymentMethods = [...paymentMethods];
    _paymentMethods[i].enabled = !_paymentMethods[i].enabled;
    setPaymentMethods(_paymentMethods);
  };
  const methodModalHandler = (status: any) => {
    setPaymentMethodsModals(false);
    // initDataPage();
  };

  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions')).filter(loc => loc.id==router.query.id)
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
  }, [router.asPath])

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        {/* {!isLoading ? */}
        {/* : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div> */}
        {/* } */}
        <div className="container bg-white">
          <div className="row mb-2 header-row">
            <div className="col-6 bold">Method</div>
            <div className="col-3"></div>
            <div className="col-3"></div>
          </div>

          {paymentMethods &&
            paymentMethods?.map((method: any, i: number) => (
              <div className={`row mb-2 ${i % 2 === 0 ? 'even-row' : 'odd-row'}`} key={i}>
                <div className="col-6">
                  <input
                    type="text"
                    name="tax-name"
                    className="form-control p-2"
                    disabled={!permissions.hasInsert}
                    placeholder="Enter New Method Name"
                    value={method.name}
                  />
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
                  <button className="btn m-buttons-style" onClick={() => {}}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}

          <PaymentModal
            showType={'add'}
            statusDialog={paymentMethodsModal}
            openDialog={methodModalHandler}
            fetchData={mutate}
          />
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
        </div>
      </AdminLayout>
    </>
  );
};
export default withAuth(PaymentMethods);
