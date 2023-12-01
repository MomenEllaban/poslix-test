import { joiResolver } from '@hookform/resolvers/joi';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import { Toastify } from 'src/libs/allToasts';
import { customerSingUpSchema, customerLoginSchema } from '../_schema/customerAuth.schema';
import api from 'src/utils/app-api';
import { findAllData } from 'src/services/crud.api';

import { useTranslation } from 'next-i18next';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-number-input/style.css';
import { useDigitalContext } from 'src/modules/digital/_context/DigitalContext';

const ModelCustomer = (props: any) => {
  const { open, setOpen, shopId } = props;

  // ** var
  const LOGIN = 'login';
  const SIGN_UP = 'signup';

  const { t } = useTranslation();
  const [showType, setShowType] = useState(SIGN_UP);
  const [isLoading, setIsLoading] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [currentPricingGroup, setCurrentPricingGroup] = useState<number | null>();
  const [pricingGroups, setPricingGroups] = useState([]);
  const [initState, setInitState] = useState(customerSingUpSchema);
  const { lang, setLang } = useDigitalContext();

  const router = useRouter();

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
    resolver: joiResolver(initState),
    // defaultValues: initState,
  });

  const handleCustomer = (data: any, endpoing = `/customers/${shopId}`) => {
    let body = {};
    if (showType === SIGN_UP) {
      body = {
        ...data,
        mobile: +data.mobile,
        digital_menu: true,
        price_groups_id: currentPricingGroup,
      };
    } else {
      body = {
        digital_menu: true,
        email: data.email,
        password: data.password,
      };
    }
    api
      .post(endpoing, body)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data?.result;
          const user = data?.user ? data?.user : data?.customer;
          const _user = {
            last_name: user.last_name,
            first_name: user?.first_name,
            id: user?.id,
            email: user?.email,
            user_type: user?.user_type,
            customer_id: data?.customer_id ? data?.customer_id : user?.id,
            token: data?.authorization?.token,
            shipping_address: user?.shipping_address,
          };
          localStorage.setItem('userdata', JSON.stringify(_user));
          Toastify('success', 'Successfully Created');
          handleClose();
        }
      })
      .catch((err) => {
        console.log(err);
        const { error, status } = err?.response?.data;
        if (status === 401) {
          Toastify('error', error?.message);
        } else if (status === 422) {
          for (const v of Object.values(error)) {
            const message: any = v || ['Has Error, Try Again...'];
            Toastify('error', message?.join(''));
          }
        } else {
          Toastify('error', 'Has Error, Try Again...');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  const onSubmit = async (data: any) => {
    setIsLoading(true);
    if (showType === SIGN_UP) {
      handleCustomer(data);
    } else {
      handleCustomer(data, '/login');
    }
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
    setOpen(false);
    reset();
    clearErrors();
    setMoreInfo(false);
    setCurrentPricingGroup(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!open) {
      reset();
      clearErrors();
    }
  }, [open]);

  const { name, ref } = register('mobile');

  const handleSwitchAuth = () => {
    if (showType === LOGIN) {
      setShowType(SIGN_UP);
      setInitState(customerSingUpSchema);
      return;
    }
    setShowType(LOGIN);
    setInitState(customerLoginSchema);
  };

  const getPricingGroups = async () => {
    const res = await findAllData(`pricing-group/${router.query.id}?digital_menu=true`);
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

  return (
    <Modal show={open} onHide={handleClose}>
      <Button
        type="submit"
        className="text-capitalize"
        onClick={handleSwitchAuth}
        disabled={isLoading}>
        {showType === LOGIN ? lang.Customer.signup : lang.Customer.login}
      </Button>
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        {showType === LOGIN ? lang.Customer.login : lang.Customer.signup}
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          {showType === SIGN_UP ? (
            // **  TODO: Sing_up
            <Modal.Body>
              <fieldset>
                <FormField
                  required
                  type="text"
                  name="full_name"
                  label={lang.Customer.fullName}
                  placeholder={lang.Customer.fullName}
                  errors={errors}
                  register={register}
                />
                <FormField
                  type="text"
                  name="last_name"
                  label={lang.Customer.last_name}
                  placeholder={lang.Customer.last_name}
                  errors={errors}
                  register={register}
                />
                <div>
                  <label className="fw-semibold fs-6 form-label">
                    {lang.Customer.mobile}
                    <span className="text-danger ms-2">*</span>
                  </label>
                  <PhoneInput
                    country={'om'}
                    enableAreaCodes
                    enableTerritories
                    specialLabel=""
                    countryCodeEditable
                    inputProps={{ ref: ref, name: name }}
                    onlyCountries={['om']}
                    autoFormat={true}
                    onChange={(e) => setValue('mobile', e)}
                  />
                  {errors.mobile && (
                    <Form.Text className="text-danger">Mobile is required</Form.Text>
                  )}
                </div>
                <FormField
                  type="text"
                  name="email"
                  label={lang.Customer.email}
                  placeholder={lang.Customer.email}
                  errors={errors}
                  register={register}
                  required
                />
                <div className=" mb-3">
                  <FormField
                    type="password"
                    name="password"
                    label={lang.Customer.password}
                    placeholder={lang.Customer.password}
                    errors={errors}
                    register={register}
                    required
                  />
                </div>

                <div className="col-lg-6 mb-3">
                  <label>{lang.Customer.pricing_group}</label>
                  <select
                    className="form-select"
                    name="pricing_group"
                    placeholder={lang.Customer.selected_pricing_group}
                    defaultValue={0}
                    value={currentPricingGroup ? currentPricingGroup : null}
                    onChange={(e) => setCurrentPricingGroup(+e.target.value)}>
                    <option value={0} disabled>
                      {lang.Customer.selected_pricing_group}
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
                  {moreInfo ? lang.Customer.less_info : lang.Customer.more_info}
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
                      label={lang.Customer.address_line + ' 1'}
                      placeholder={lang.Customer.enter_address_line + ' 1'}
                      errors={errors}
                      register={register}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <FormField
                      type="text"
                      name="address_line_2"
                      label={lang.Customer.address_line + ' 2'}
                      placeholder={lang.Customer.enter_address_line + ' 2'}
                      errors={errors}
                      register={register}
                    />
                  </div>

                  <div className="col-lg-3 mb-3">
                    <FormField
                      type="text"
                      name="country"
                      label={lang.Customer.country}
                      placeholder={lang.Customer.enter_country}
                      errors={errors}
                      register={register}
                    />
                  </div>
                  <div className="col-lg-3 mb-3">
                    <FormField
                      type="text"
                      name="state"
                      label={lang.Customer.state}
                      placeholder={lang.Customer.enter_state}
                      errors={errors}
                      register={register}
                    />
                  </div>
                  <div className="col-lg-3 mb-3">
                    <FormField
                      type="text"
                      name="city"
                      label={lang.Customer.city}
                      placeholder={lang.Customer.enter_city}
                      errors={errors}
                      register={register}
                    />
                  </div>

                  <div className="col-lg-3 mb-3">
                    <FormField
                      type="text"
                      name="zip_code"
                      label={lang.Customer.zip}
                      placeholder={lang.Customer.enter_zip}
                      errors={errors}
                      register={register}
                    />
                  </div>
                  <hr />
                  <FormField
                    type="text"
                    name="shipping_address"
                    label={lang.Customer.shipping_address}
                    placeholder={lang.Customer.enter_shipping_address}
                    errors={errors}
                    register={register}
                  />
                </div>
              ) : null}
            </Modal.Body>
          ) : (
            // **  TODO: logIn
            <Modal.Body>
              <fieldset>
                <FormField
                  type="text"
                  name="email"
                  label={lang.Customer.email}
                  placeholder={lang.Customer.email}
                  errors={errors}
                  register={register}
                  required
                />
                <div className=" mb-3">
                  <FormField
                    type="password"
                    name="password"
                    label={lang.Customer.password}
                    placeholder={lang.Customer.password}
                    errors={errors}
                    register={register}
                    required
                  />
                </div>
              </fieldset>
            </Modal.Body>
          )}
          <Modal.Footer>
            <Button type="submit" className="text-capitalize" disabled={isLoading}>
              {showType === LOGIN ? lang.Customer.login : lang.Customer.signup}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModelCustomer;
