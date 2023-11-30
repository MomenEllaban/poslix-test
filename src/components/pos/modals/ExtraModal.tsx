import React from 'react';
import { joiResolver } from '@hookform/resolvers/joi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import {useForm, useFieldArray} from 'react-hook-form'; 
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { Toastify } from 'src/libs/allToasts';
import api from 'src/utils/app-api';
import { Switch } from '@mui/base/Switch';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTranslation } from 'next-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';




const ExtraModal = (props: any) => {
  const { t } = useTranslation();
  const { openDialog, statusDialog, category, showType, shopId,selectId,extrasList } = props;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  type FormValues = {
    category_name: string,
    category_second_name: string,
    allow_multi_selection: boolean,
    extras:{
      name: string,
      second_name: string,
      price:string
    }[]
  };

  const form = useForm<FormValues>({
    defaultValues: {
      category_name: '',
      category_second_name: '',
      allow_multi_selection: false,
      extras: [{
        name: '',
        second_name: '',
        price: ''
      }]
    }
  });

  const {register, control, handleSubmit, formState} = form;
  const {errors} = formState;

  const {fields, append, remove} = useFieldArray({
    name:"extras",
    control,
  });

  const handleEditCategory = () => {
    // Retrieve form data
    const formData = form.getValues();

    api
      .put(`/extras-categories/${category.value}/edit-with-extras`, { params: { ...formData, location_id: shopId } })
      .then((res) => {
        Toastify('success', 'Successfully Update');
        handleClose();
      })
      .catch(() => Toastify('error', 'Has Error, Try Again...'))
      .finally(() => setIsLoading(false));
  };



  const handleAddCategory = () => {
    // Retrieve form data
    const formData = form.getValues();
    console.log('Form Data:', formData);
    api
      .post('/extras/category-with-list/', { ...formData, location_id: shopId })
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


  const handleModalIsForEditing = () => {
    // Set form values for editing
    form.reset({
      category_name: category.name,
      category_second_name: category.second_name,
      allow_multi_selection: category.allow_multi_selection,
      extras: extrasList,
    });
  
    setOpen(true);
  };

  //   // For initializing fields in case od editing
  const handleViewCategory = () => {
    setIsViewMode(true);
  }
  
  //submit logic
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    if (showType === 'edit') {
      handleEditCategory();
    } else {
      handleAddCategory();
    }
  };
  const onError = (errors: any, e: any) => console.log(errors, e);


  const emptyVariables = () => {
    // Reset form to default values
    form.reset({
      category_name: '',
      category_second_name: '',
      allow_multi_selection: false,
      extras: [{ name: '', second_name: '', price: '' }],
    });
  };

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
    // emptyVariables();
  };

  

  useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);

    if (showType === 'edit') {
      handleModalIsForEditing();
    }

  }, [statusDialog]);

  useEffect(() => {
    if (!open) {
      // reset();
      // clearErrors();
      emptyVariables();
    }
  }, [open]);

  // to set value in the form if showType is edit and to empty them if add 
  useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);  
    if (showType === 'show' || showType === 'edit') {
      handleModalIsForEditing();
    }
  }, [statusDialog, selectId, showType, extrasList]);
  
  
  

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType + ' extra'}
          
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <CircularProgress />
          </Box>
        </Modal.Body>
      </Modal>
    );
  return showType == 'show'? (
    <Modal show={open} onHide={handleClose} size="lg">
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
      {showType + ' extras'}
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} >
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <Modal.Body>
          <div className="d-flex">
            <div className="mr-3">
              <label htmlFor="categoryName">
                {t('extra.category_name')}
              </label>
              <input 
                id="categoryName"
                value={category.name}
                className="form-control mb-2"
                disabled
              />
            </div>
            <div className="mx-5">
              <label htmlFor="categorySecondName">
                {t('extra.category_second_name')}
              </label>
              <input 
                id="categorySecondName"
                value={category.second_name}
                className="form-control "
                disabled
              />
            </div>
            <div className="mx-5">
              <label htmlFor="categorySecondName">
                {t('extra.enable_multi_selection')}
              </label>
              {category.allow_multi_selection?
                (<Switch checked disabled/>) 
              : (<Switch disabled/>) }
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <h5 className="text-primary my-4">{t('extra.list_of_extras')}</h5>
              <tr>
                <th className="text-secondary">Id</th>
                <th className="text-secondary">{t('extra.extra_name')}</th>
                <th className="text-secondary">{t('extra.extra_second_name')}</th>
                <th className="text-secondary">{t('extra.extra_price')}</th>
              </tr>
            </thead>
            <tbody>
              {
                extrasList.map(extra=>{
                  return(
                    <tr key={extra.id}>
                      <td>{extra.id}</td>
                      <td>{extra.name}</td>
                      <td>{extra.second_name}</td>
                      <td>{extra.price}</td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>

          </Modal.Body>
        </Form>
      </Modal.Body>
      <Modal.Footer>
            <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
              <i className="ri-close-line me-1 align-middle" /> {t('extra.close')}
            </a>{' '}
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {}}>
                {showType} Category
              </Button>
            )}
          </Modal.Footer>
    </Modal>
  ) : (
    <Modal show={open} onHide={handleClose} size="lg">
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        {showType + ' extras'}
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} >
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <Modal.Body>
            <fieldset className='w-75 m-auto justify-content-center mb-3'>
            <label htmlFor="category_name" className="form-label">{t('extra.category_name')}</label>
            <input
              {...register('category_name')}
              id="category_name"
              type="text"
              name="category_name"
              className="form-control mb-2"
              placeholder="Arabic Name"
              // value={categoryName}
              // onChange={(e)=>{setCategoryName(e.target.value)}}
              required
            />
            <label htmlFor="category_second_name" className="form-label">{t('extra.category_second_name')}</label>
            <input
            {...register('category_second_name')}
              id="category_second_name"
              type="text"
              name="category_second_name"
              className="form-control mb-2"
              placeholder="English Name"
              // value={categorySecondName}
              // onChange={(e)=>{setCategorySecondName(e.target.value)}}
              required
            />
             <FormControlLabel
                control={
                  <Switch
                    {...register('allow_multi_selection')}
                    id='allow_multi_selection'
                    onChange={(e) => {
                      const currentValue = form.getValues('allow_multi_selection');
                      form.setValue('allow_multi_selection', !currentValue);
                    }}
                    className='px-2 '
                  />
                }
                label={t("extra.enable_multi_selection")}
              />

            </fieldset>
            {fields.map((field, index) => {
  return (
    <div className="d-flex justify-content-between my-2" key={field.id}>
      <fieldset style={{ width: '25%' }}>
        <input
          {...register(`extras.${index}.name`)}
          id={`extras.${index}.name`}
          type="text"
          name={`extras.${index}.name`}
          className="form-control"
          required
          placeholder={t("extra.extra_name")}
        />
      </fieldset>
      <fieldset style={{ width: '25%' }}>
        <input
          {...register(`extras.${index}.second_name`)}
          id={`extras.${index}.second_name`}
          type="text"
          name={`extras.${index}.second_name`}
          className="form-control"
          required
          placeholder={t("extra.extra_second_name")}
        />
      </fieldset>
      <fieldset style={{ width: '25%' }}>
        <input
          {...register(`extras.${index}.price`)}
          id={`extras.${index}.price`}
          type="number"
          name={`extras.${index}.price`}
          className="form-control"
          required
          placeholder={t("extra.extra_price")}
        />
      </fieldset>
      {index > 0 ? (
        <fieldset>
          <Button onClick={() => remove(index)}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </fieldset>
      ) : (
        <Button disabled>
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      )}
      <fieldset>
        <Button onClick={() => append({ name: '', second_name: '', price: '' })}>
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </fieldset>
    </div>
  );
})}
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
              <i className="ri-close-line me-1 align-middle" /> {t('extra.close')}
            </a>{' '}
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {}}>
                {showType} Category
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ExtraModal;
