import { joiResolver } from '@hookform/resolvers/joi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { Toastify } from 'src/libs/allToasts';
import { addCustomerSchema } from 'src/modules/pos/_schema/add-customer.schema';
import api from 'src/utils/app-api';
import { useSWRConfig } from 'swr';
import { useProducts } from '../../../context/ProductContext';
import { apiUpdateCtr } from '../../../libs/dbUtils';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const label = { inputProps: { 'aria-label': 'printer status' } };
const customerTemplate = {
  id: 0,
  first_name: '',
  last_name: '',
  mobile: '',
  city: '',
  state: '',
  country: '',
  zip_code: '',
  address_line_1: '',
  address_line_2: '',
};

const PrinterModal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId } = props;
  const [open, setOpen] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState<any[]>([]);

  const [customerInfo, setCustomerInfo] = useState(customerTemplate);
  const { customers, setCustomers } = useProducts();

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
      .put('/customers/' + userdata.value, data)
      .then((res) => res.data.result)
      .then((res) => {
        mutate('/customers/' + shopId);
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
      .post('/customers/' + shopId, data)
      .then((res) => res.data.result)
      .then((res) => {
        mutate('/customers/' + shopId);
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
    setIsLoading(true);
    if (showType === 'edit') {
      handleEditCustomer(data);
    } else {
      handleAddCustomer(data);
    }
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
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
                label="Printer Name"
                placeholder="Printer Name"
                errors={errors}
                register={register}
              />
              <FormField
                type="text"
                required
                name="last_name"
                label="Printer IP"
                placeholder="Printer IP"
                errors={errors}
                register={register}
              />
              {/* <FormField
                required
                type="text"
                name="mobile"
                label="Mobile"
                placeholder="Enter customer mobile number"
                errors={errors}
                register={register}
              /> */}
              <SelectField
              label="Printer Type"
              name="PrinterType"
              options={[{value: "Resit",label:"Resit"},{value: "A4",label:"A4"}]} // Pass the business types options
              register={register}
              errors={errors}
              required
              
              />
              <SelectField
              label="connection method"
              name="connectionMethod"
              options={[{value: "Method1",label:"Method1"},{value: "Method2",label:"Method2"}]} // Pass the business types options
              register={register}
              errors={errors}
              required
              
              />
                    <FormControlLabel control={<Switch {...label} defaultChecked />} label="printer status" />

         
             
            </fieldset>
           
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
              <i className="ri-close-line me-1 align-middle" /> Close
            </a>{' '}
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {}}>
                {showType} Printer
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PrinterModal;
