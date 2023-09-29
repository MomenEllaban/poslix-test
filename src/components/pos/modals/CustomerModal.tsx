import { joiResolver } from '@hookform/resolvers/joi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import { Toastify } from 'src/libs/allToasts';
import { addCustomerSchema } from 'src/modules/pos/_schema/add-customer.schema';
import api from 'src/utils/app-api';
import { useSWRConfig } from 'swr';
import { useProducts } from '../../../context/ProductContext';
import { apiUpdateCtr } from '../../../libs/dbUtils';
import { findAllData } from 'src/services/crud.api';
import { usePosContext } from 'src/modules/pos/_context/PosContext';

const customerTemplate = {
  id: 0,
  first_name: '',
  last_name: '',
  mobile: '',
  pricing_group: null,
  city: '',
  state: '',
  country: '',
  zip_code: '',
  address_line_1: '',
  address_line_2: '',
};

const CustomerModal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId } = props;
  const [open, setOpen] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [currentPricingGroup, setCurrentPricingGroup] = useState<number | null>();

  const { lang: _lang } = usePosContext();
  const lang = _lang?.pos;

  const [customerInfo, setCustomerInfo] = useState(customerTemplate);
  const { customers, setCustomers } = useProducts();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,

    clearErrors,
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onBlur',
    resolver: joiResolver(addCustomerSchema),
    // defaultValues: initState,
  });

  const handleEditCustomer = (data: any) => {
    api
      .put('/customers/' + userdata.value, { ...data, price_groups_id: currentPricingGroup })
      .then((res) => res.data.result)
      .then((res) => {
        mutate('/customers/' + router.query.id);
        const cinx = customers.findIndex((customer) => customer.value === res.id);
        if (cinx > -1) {
          const upCustomer = [...customers];
          upCustomer[cinx] = {
            ...upCustomer[cinx],
            value: res.id,
            label: res.first_name + ' ' + res.last_name + ' | ' + res.mobile,
          };
          setCustomers(upCustomer);
        }

        Toastify('success', 'Successfully Update');
        handleClose();
      })
      .catch(() => Toastify('error', 'Has Error, Try Again...'))
      .finally(() => setIsLoading(false));
  };

  const handleAddCustomer = (data: any) => {
    api
      .post('/customers/' + router.query.id, { ...data, price_groups_id: currentPricingGroup })
      .then((res) => res.data.result)
      .then((res) => {
        mutate('/customers/' + router.query.id);
        setCustomers([...customers, res]);
        Toastify('success', 'Successfully Created');
        handleClose();
      })
      .catch(() => {
        Toastify('error', 'Has Error, Try Again...');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onSubmit = async (data: any) => {
    // setIsLoading(true);
    if (showType === 'edit') {
      handleEditCustomer(data);
    } else {
      handleAddCustomer(data);
    }
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
    setCurrentPricingGroup(null);
    setOpen(false);
    openDialog(false);
  };

  async function getCustomerInfo(theId: any) {
    setIsLoading(true);
    setCustomerInfo(customerTemplate);

    api
      .get('/customers/' + theId + '/show')
      .then((res) => {
        const selCustomer = res?.data?.result?.profile;

        Object.entries(selCustomer).forEach(([key, value]) => {
          if (!value) value = '';
          setValue(key, value);
        });
        if (selCustomer.price_groups_id) setCurrentPricingGroup(selCustomer.price_groups_id);
      })
      .catch(() => {
        Toastify('error', 'has error, Try Again...');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    if (!statusDialog) return;
    setCustomerInfo(customerTemplate);
    setOpen(statusDialog);
    if (userdata !== undefined && showType != 'add' && statusDialog)
      getCustomerInfo(userdata.value);
  }, [statusDialog]);

  useEffect(() => {
    if (!open) {
      reset();
      setMoreInfo(false);
      clearErrors();
    }
  }, [open]);

  const getPricingGroups = async () => {
    const res = await findAllData(`pricing-group/${router.query.id}`);
    if (res?.data?.success)
      setPricingGroups([
        ...res.data.result.data.map((pg) => {
          return { ...pg, label: pg.name, value: pg.id };
        }),
      ]);
  };

  useEffect(() => {
    if (router.query.id) getPricingGroups();
  }, [router.asPath]);

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType + ' customer'}
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <CircularProgress />
          </Box>
        </Modal.Body>
      </Modal>
    );

  return (
    <Modal show={open} onHide={handleClose}>
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        {showType + ' customer'}
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <Modal.Body>
            <fieldset disabled={showType === 'show'}>
              <FormField
                required
                type="text"
                name="first_name"
                label={lang.CustomerModal.firstName}
                placeholder={lang.CustomerModal.firstName}
                errors={errors}
                register={register}
              />
              <FormField
                type="text"
                name="last_name"
                label={lang.CustomerModal.lastName}
                placeholder={lang.CustomerModal.lastName}
                errors={errors}
                register={register}
              />
              <FormField
                required
                type="text"
                name="mobile"
                label={lang.CustomerModal.mobile}
                placeholder={lang.CustomerModal.enterMobile}
                errors={errors}
                register={register}
              />
              <div className="col-lg-6 mb-3">
                <label>{lang.CustomerModal.pricingGroup}</label>
                <select
                  className="form-select"
                  name="pricing_group"
                  placeholder={lang.CustomerModal.enterPrice}
                  defaultValue={0}
                  value={currentPricingGroup ? currentPricingGroup : null}
                  onChange={(e) => setCurrentPricingGroup(+e.target.value)}>
                  <option value={0} disabled>
                    {lang.CustomerModal.selectPrice}
                  </option>
                  {pricingGroups.map((el, i) => {
                    return (
                      <option key={el.id} value={el.id}>
                        {el.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </fieldset>
            <div className="d-flex flex-row mb-3">
              <Button
                variant="primary"
                className="ms-auto"
                onClick={() => {
                  setMoreInfo(!moreInfo);
                }}>
                {moreInfo ? `${lang.CustomerModal.less} ` : `${lang.CustomerModal.more} `}{' '}
                {lang.CustomerModal.information}{' '}
                <i className={`ri-arrow-${moreInfo ? 'up' : 'down'}-s-line ps-1`} />
              </Button>
            </div>

            {moreInfo ? (
              <div className="row">
                <div className="col-lg-6 mb-3">
                  <FormField
                    type="text"
                    name="address_line_1"
                    label={lang.CustomerModal.addressLine1}
                    placeholder={lang.CustomerModal.enterAddressLine1}
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-6 mb-3">
                  <FormField
                    type="text"
                    name="address_line_2"
                    label={lang.CustomerModal.addressLine2}
                    placeholder={lang.CustomerModal.enterAddressLine2}
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="country"
                    label={lang.CustomerModal.hassan}
                    placeholder={lang.CustomerModal.enterCountry}
                    errors={errors}
                    register={register}
                  />
                </div>
                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="state"
                    label={lang.CustomerModal.state}
                    placeholder={lang.CustomerModal.enterState}
                    errors={errors}
                    register={register}
                  />
                </div>
                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="city"
                    label={lang.CustomerModal.city}
                    placeholder={lang.CustomerModal.enterCity}
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="zip_code"
                    label={lang.CustomerModal.zipCode}
                    placeholder={lang.CustomerModal.enterZipCode}
                    errors={errors}
                    register={register}
                  />
                </div>
                <hr />
                <FormField
                  type="text"
                  name="shipping_address"
                  label={lang.CustomerModal.shippingAddress}
                  placeholder={lang.CustomerModal.enterShippingAddress}
                  errors={errors}
                  register={register}
                />
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
              <i className="ri-close-line me-1 align-middle" /> {lang.CustomerModal.close}
            </a>{' '}
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {}}>
                {showType} Customer
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CustomerModal;
