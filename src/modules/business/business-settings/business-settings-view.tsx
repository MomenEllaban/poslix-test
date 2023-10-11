import { faArrowAltCircleLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type IUserBusiness } from '@models/auth.types';
import { Button } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ButtonGroup, Card, Form, Table, Tabs } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { Toastify } from 'src/libs/allToasts';
import businessService, { useCurrenciesList } from 'src/services/business.service';
import { createNewData, findAllData } from 'src/services/crud.api';
import { useSWRConfig } from 'swr';
import styles from './business-settings.module.scss';

function LocationUpdateForm({ businessId, location }) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [isEditedStuff, setIsEditedStuff] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const [currenciesList, setCurrenciesList] = useState<any[]>([]);
  const [users, setUsers] = useState<any>([]);
  const [roles, setRoles] = useState<any>([]);
  const initPageData = async () => {
    const currenciesRes = await findAllData('currencies')
    const _currenciesList = currenciesRes.data.result.map((itm: any) => {
      return { ...itm, value: itm.id, label: `${itm.currency} (${itm.country})` };
    });
    const currentCurrency = {..._currenciesList.filter(curr =>
      (curr.currency === location.currency_name && curr.code === location.currency_code))[0]}
    setLocationValue('currency_id', currentCurrency.value)
    setCurrenciesList(_currenciesList);
    const usersRes = await findAllData('users');
    const newUsers = usersRes.data.result.map((user) => {
      return { ...user, label: user.first_name, value: user.id };
    });
    setUsers([...newUsers]);
    const rolesRes = await findAllData('roles/get');
    const newRoles = rolesRes.data.result.map((role) => {
      return { ...role, label: role.name, value: role.id };
    });
    setRoles([...newRoles]);
  };

  useEffect(() => {
    initPageData();
  }, []);

  const {
    register: locationRegister,
    handleSubmit: handleLocationSubmit,
    formState: { errors: locationErrors },
    setValue: setLocationValue,
    clearErrors: clearLocationErrors,
  } = useForm({
    shouldUnregister: false,
    defaultValues: {
      name: location.location_name,
      currency_id: currenciesList ? {...currenciesList.filter(curr =>
        (curr.currency === location.currency_name && curr.code === location.currency_code))[0]} : {},
      decimal: location.location_decimal_places,
      status:location.location_status
    },
  });

  useEffect(() => {
    if (currenciesList && location.currency_name && location.currency_code) {
      const matchingCurrency = currenciesList.find(curr =>
        curr.currency === location.currency_name && curr.code === location.currency_code
      );

      if (matchingCurrency) {
        setLocationValue('currency_id', matchingCurrency.id);
      }
    }
  }, [currenciesList, location, setLocationValue]);

  function onLocationSubmit(data: any) {
    console.log(data)
    setLoading(true);
    businessService
      .updateLocationSettings(location.location_id, data)
      .then((res) => {
        Toastify('success', 'Location Settings Updated Successfully');

        mutate(`/business/${businessId}`);
      })
      .catch((err) => {
        Toastify('error', 'Error Updating Location Settings');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const asignRoleToUser = async () => {
    const res = await createNewData('roles/assign', {
      user_id: selectedUserId,
      role_id: selectedRoles[0].value,
      location_id: location.location_id,
    });
    if (res.data.success) {
      Toastify('success', 'User assigned successfully');
      setShowAddUser(false);
    } else {
      Toastify('error', 'Has Error ,try Again');
    }
  };
  const onLocationError = (errors: any, e: any) => console.error(errors, e);
  return (
    <>
      {!showAddUser && (
        <>
          <Form
            key={`${location.location_id}-form--location`}
            noValidate
            onSubmit={handleLocationSubmit(onLocationSubmit, onLocationError)}
            className={styles.form}>
            <FormField
              required
              name="name"
              type="text"
              label="Location Name"
              placeholder="Enter Location Name"
              errors={locationErrors}
              register={locationRegister}
            />
             <FormField
             label="Status"
             name="status"
             type="text"
             placeholder="Enter Status"
             register={locationRegister}
             required
             errors={locationErrors}
        />
            <SelectField
              label="Currency"
              name="currency_id"
              options={currenciesList}
              register={locationRegister}
              errors={locationErrors}
              required
            />
            <FormField
              required
              name="decimal"
              type="number"
              label="Decimal Places"
              placeholder="Enter Decimal Places"
              errors={locationErrors}
              register={locationRegister}
            />

            <button className="btn-login mt-auto" type="submit" disabled={loading}>
              {!!loading && (
                <Image
                  alt="loading"
                  width={25}
                  height={25}
                  className="login-loading"
                  src={'/images/loading.gif'}
                />
              )}
              Update Location Settings
            </button>
          </Form>
          <div className="row">
            <h4>User Stuff</h4>
            <br />
            <br />
            <Table className="">
              <thead className="thead-dark">
                <tr>
                  <th style={{ width: '6%' }}>#</th>
                  <th>User Name</th>
                  <th>Roles</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 &&
                  users.map((user, i) => {
                    return (
                      <tr key={i}>
                        <th scope="row"></th>
                        <td>{user.first_name}</td>
                        <td>
                          {user?.locations.filter((loc) => loc.id === location.location_id)[0]
                            ?.roles[0]?.name ?? 'No Permissions'}
                        </td>
                        <td>
                          <ButtonGroup className="mb-2 m-buttons-style">
                            <Button
                              onClick={() => {
                                // var _rows = pages;
                                var isNew = user.roles ? false : true;
                                //   businessUsers.findIndex(
                                //     (ee) =>
                                //       ee.value == user.value && ee.locationId == shopId
                                //   ) > -1;
                                // var _stuf = (
                                //   businessUsers.find(
                                //     (ee) =>
                                //       ee.value == user.value && ee.locationId == shopId
                                //   )?.stuff_ids || ' '
                                // ).split(',');
                                // var _myStuffs = roles.filter((rl) => {
                                //   return _stuf.includes(rl.value + '');
                                // });
                                user.roles ? setSelectedRoles(user.role) : null;
                                // for (let ix = 0; ix < _rows.length; ix++) {
                                //     _stuf = businessUsers.find((ee) => ee.value == user.value && ee.locationId == shopId)?.stuff || ' ';
                                //     _rows[ix].isChoosed_r = (',' + _stuf).indexOf(',' + _rows[ix].label + '_r,') != -1 ? true : false
                                //     _rows[ix].isChoosed_e = (',' + _stuf).indexOf(',' + _rows[ix].label + '_e,') != -1 ? true : false
                                //     _rows[ix].isChoosed_d = (',' + _stuf).indexOf(',' + _rows[ix].label + '_d,') != -1 ? true : false
                                //     _rows[ix].isChoosed_i = (',' + _stuf).indexOf(',' + _rows[ix].label + '_i,') != -1 ? true : false
                                // }
                                // setPages(_rows);
                                setSelectedUserId(user.id);
                                setIsEditedStuff(isNew);
                                setShowAddUser(true);
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
          </div>
        </>
      )}
      {showAddUser && (
        <form className="user-stuff-form">
          <button
            className="mb-4 btn btn-primary p-3"
            onClick={() => {
              setShowAddUser(false);
            }}>
            <FontAwesomeIcon icon={faArrowAltCircleLeft} /> back{' '}
          </button>
          <div className="row">
            <div className="col-md-6 col-lg-6 col-cm-6">
              <div className="form-group2">
                <h4>User Stuff Settings</h4>
              </div>
              {/* {JSON.stringify(pages)} */}
              <div className="form-group">
                <label>
                  Selected User : <span className="text-danger">*</span>
                </label>
                <Select
                  options={users}
                  isDisabled={true}
                  value={users.filter((f: any) => {
                    return f.id == selectedUserId;
                  })}
                  onChange={(itm) => {
                    setSelectedUserId(itm!.value);
                    // var _rows = pages;
                    // setPages(_rows);
                    setShowAddUser(true);
                  }}
                />
              </div>
              <div className="form-group">
                <label>
                  User Roles: <span className="text-danger">*</span>
                </label>
                <Select
                  options={roles}
                  isMulti={false}
                  value={selectedRoles}
                  onChange={(itm: any) => setSelectedRoles([itm])}
                />
              </div>
              <br />
            </div>
          </div>

          <button
            type="button"
            className="btn m-btn btn-primary p-2 "
            onClick={(e) => {
              e.preventDefault();
              asignRoleToUser();
            }}>
            Save
          </button>
        </form>
      )}
    </>
  );
}

export default function BusinessSettingsView({ business }: { business: IUserBusiness }) {
  const { mutate } = useSWRConfig();

  const [key, setKey] = useState<string | number>(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: business.name,
      type: business.type,
      email: business.email,
    },
  });

  function onSubmit(data: any) {
    setLoading(true);
    console.log(data)
    businessService
      .updateBusinessSettings(business.id, data)
      .then((res) => {
        Toastify('success', 'Business Settings Updated Successfully');

        mutate(`/business/${business.id}`);
      })
      .catch((err) => {
        Toastify('error', 'Error Updating Business Settings');
      })
      .finally(() => {
        setLoading(false);
      });
  }
  const onError = (errors: any, e: any) => console.error(errors, e);

  return (
    <Tabs
      id="business-settings-tabs"
      fill
      activeKey={key}
      onSelect={(k) => setKey(k)}
      className="mb-3">
      <Tab eventKey={0} title="General">
        <Card>
          <Card.Header className="p-3 bg-white">
            <h5>General Settings for {business.name}</h5>
          </Card.Header>
          <Card.Body>
            <Form
              key={1}
              noValidate
              onSubmit={handleSubmit(onSubmit, onError)}
              className={styles.form}>
              <FormField
                label="Business Type"
                name="type"
                type="text"
                register={register}
                errors={errors}
                placeholder="Enter Business Type"
                disabled
              />
              <FormField
                label="Business Name"
                name="name"
                type="text"
                placeholder="Enter Business Name"
                required
                register={register}
                errors={errors}
              />
              <FormField
                label="Business Email"
                name="email"
                type="text"
                placeholder="Enter Business Email"
                required
                register={register}
                errors={errors}
              />
              <button className="btn-login mt-auto" type="submit" disabled={loading}>
                {!!loading && (
                  <Image
                    alt="loading"
                    width={25}
                    height={25}
                    className="login-loading"
                    src={'/images/loading.gif'}
                  />
                )}
                Update Settings
              </button>
            </Form>
          </Card.Body>
        </Card>
      </Tab>
      {business.locations?.map((location) => {
        return (
          <Tab
            key={location.location_id}
            eventKey={location.location_id}
            title={location.location_name}>
            <Card>
              <Card.Header className="p-3 bg-white">
                <h6 className={styles['location-header']}>
                  General settings for {location.location_name}
                </h6>
              </Card.Header>
              <Card.Body>
                <LocationUpdateForm businessId={business.id} location={location} />
              </Card.Body>
            </Card>
          </Tab>
        );
      })}
    </Tabs>
  );
}
