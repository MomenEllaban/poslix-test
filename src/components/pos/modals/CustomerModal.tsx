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
import { useTranslation } from 'next-i18next';

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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [currentPricingGroup, setCurrentPricingGroup] = useState<number | null>();
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
    // console.log({ ...data, price_groups_id: currentPricingGroup });
    // return
    api
      .post('/customers/' + router.query.id, { ...data, price_groups_id: currentPricingGroup })
      .then((res) => res.data.result)
      .then((res) => {
        mutate('/customers/' + router.query.id);
        setCustomers([...customers, res]);
        Toastify('success', 'Successfully Created');
        const currentPath = router.pathname;

        if (!currentPath.includes('customers')) {
          router.push(`/shop/${shopId}/customers`);
        }
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
        console.log(selCustomer);
        
        Object.entries(selCustomer).forEach(([key, value]) => {
          if (!value) value = '';
          setValue(key, value);
        });
        if (selCustomer.pricing_group.id) setCurrentPricingGroup(selCustomer.pricing_group.id);
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
          {showType == 'edit' ? t('customer.edit_customer') : t('customer.add_customer')}
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
        {showType == 'edit' ? t('customer.edit_customer') : t('customer.add_customer')}
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <Modal.Body>
            <fieldset disabled={showType === 'show'}>
              <FormField
                required
                type="text"
                name="first_name"
                label={t('customer.first_name')}
                placeholder={t('customer.first_name')}
                errors={errors}
                register={register}
              />
              <FormField
                type="text"
                name="last_name"
                label={t('customer.last_name')}
                placeholder={t('customer.last_name')}
                errors={errors}
                register={register}
              />
              <FormField
                required
                type="text"
                name="mobile"
                label={t('customer.mobile')}
                placeholder={t('customer.enter_mobile')}
                errors={errors}
                register={register}
              />
              <div className="col-lg-6 mb-3">
                <label>{t('customer.pricing_group')}</label>
                <select
                  className="form-select"
                  name="pricing_group"
                  placeholder={t('customer.selected_pricing_group')}
                  defaultValue={0}
                  value={currentPricingGroup ? currentPricingGroup : null}
                  onChange={(e) => setCurrentPricingGroup(+e.target.value)}>
                  <option value={0} disabled>
                    {t('customer.selected_pricing_group')}
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
                {moreInfo ? `${t('customer.less_info')} ` : `${t('customer.more_info')} `}{' '}
                {/* {lang.CustomerModal.information}{' '} */}
                <i className={`ri-arrow-${moreInfo ? 'up' : 'down'}-s-line ps-1`} />
              </Button>
            </div>

            {moreInfo ? (
              <div className="row">
                <div className="col-lg-6 mb-3">
                  <FormField
                    type="text"
                    name="address_line_1"
                    label={t('customer.address_line') + " 1"}
                    placeholder={t('customer.enter_address_line') + " 1"}
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-6 mb-3">
                  <FormField
                    type="text"
                    name="address_line_2"
                    label={t('customer.address_line') + " 2"}
                    placeholder={t('customer.enter_address_line') + " 2"}
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="country"
                    label={t('customer.country')}
                    placeholder={t('customer.enter_country')}
                    errors={errors}
                    register={register}
                  />
                </div>
                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="state"
                    label={t('customer.state')}
                    placeholder={t('customer.enter_state')}
                    errors={errors}
                    register={register}
                  />
                </div>
                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="city"
                    label={t('customer.city')}
                    placeholder={t('customer.enter_city')}
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="zip_code"
                    label={t('customer.zip')}
                    placeholder={t('customer.enter_zip')}
                    errors={errors}
                    register={register}
                  />
                </div>
                <hr />
                <FormField
                  type="text"
                  name="shipping_address"
                  label={t('customer.shipping_address')}
                  placeholder={t('customer.enter_shipping_address')}
                  errors={errors}
                  register={register}
                />
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
              <i className="ri-close-line me-1 align-middle" /> {t('customer.close')}
            </a>{' '}
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {}}>
                {showType == 'edit' ? t('customer.edit_customer') : t('customer.add_customer')}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CustomerModal;
