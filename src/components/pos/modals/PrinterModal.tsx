import { joiResolver } from '@hookform/resolvers/joi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { Toastify } from 'src/libs/allToasts';
// import { addprinterSchema } from 'src/modules/pos/_schema/add-printer.schema';
import api from 'src/utils/app-api';


const label = { inputProps: { 'aria-label': 'printer status' } };
const PrinterModal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, t, shopId,selectId,printersList } = props;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {register,handleSubmit,formState: { errors },reset,setValue,clearErrors,} = useForm({
    mode: 'onTouched',
    reValidateMode: 'onBlur',
    // resolver: joiResolver(addprinterSchema),
    // defaultValues: initState,
  });
  const handleEditprinter = (data: any) => {
    // userdata==selectId
    api
      .put('/print-settings/' + userdata.value,{},{params:{...data,location_id:shopId}} )
      .then((res) => res.data.result)
      .then((res) => {
        Toastify('success', 'Successfully Update');
        handleClose();
      })
      .catch(() => Toastify('error', 'Has Error, Try Again...'))
      .finally(() => setIsLoading(false));
  };

  const handleAddprinter = (data: any) => {
    api.post('/print-settings/', {...data,location_id:shopId})
      .then((res) => res.data.result)
      .then((res) => {
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
      handleEditprinter(data);
    } else {
      handleAddprinter(data);
    }
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
  };



  useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);

  }, [statusDialog]);

  useEffect(() => {
    if (!open) {
      reset();
      clearErrors();
    }
  }, [open]);
  // to set value in the form if showType is edit and to empty them if add 
  useEffect(() => {
    const selectedPrinter = printersList.filter((object) => { return object.id==selectId  });

    selectedPrinter.forEach(function(item, index) {
    for (let [key, value] of Object.entries(item)) {
      if (showType == "edit") {
          setValue(key, value);

      } else {
        value = '';
        setValue(key, value);
      }
    }
  });
  },[open])
  

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType ==='add' ? t('printer.add_printer') : t('printer.edit_printer')}
          
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
      {showType ==='add' ? t('printer.add_printer') +" "+ selectId : t('printer.edit_printer') + " " + selectId}
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <Modal.Body>
            <fieldset >
              <FormField
                required
                type="text"
                name="name"
                label={t('printer.printer_name')}
                placeholder={t('printer.printer_name')}
                errors={errors}
                register={register}
              />
              <FormField
                type="text"
                name="ip"
                label="Printer IP"
                required
                placeholder="Printer IP"
                errors={errors}
                register={register}
              />
              <SelectField
              label={t('printer.printer_type')}
              name="print_type"
              options={[{value: "receipt",label:"receipt"},{value: "A4",label:"A4"}]} // Pass the business types options
              register={register}
              errors={errors}
              required
              
              />
              <SelectField
              label={t('printer.connection_method')}
              name="connection"
              options={[{value: "Wifi",label:"Wifi"},{value: "USB",label:"USB"},{value: "Bluetooth",label:"Bluetooth"}]} // Pass the business types options
              register={register}
              errors={errors}
              required
              
              />
              <SelectField
              label={t('printer.printer_status')}
              name="status"
              options={[{value: "0",label:"off"},{value: "1",label:"on"}]} // Pass the business types options
              register={register}
              errors={errors}
              required
              
              />
          {/* <Switch {...label} defaultChecked label="printer status" name="status" />   */}

         
             
            </fieldset>
           
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
              <i className="ri-close-line me-1 align-middle" /> {t('printer.close')}
            </a>{' '}
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {}}>
               {showType ==='add' ? t('printer.add_printer') : t('printer.edit_printer')}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PrinterModal;
