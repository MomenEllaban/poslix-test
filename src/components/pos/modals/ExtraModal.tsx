import React from 'react';
import { joiResolver } from '@hookform/resolvers/joi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
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



const ExtraModal = (props: any) => {
  const { t } = useTranslation();
  const { openDialog, statusDialog, category, showType, shopId,selectId,extrasList } = props;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [isViewMode, setIsViewMode] = useState(false);
  const {register,handleSubmit,formState: { errors },reset,setValue,clearErrors,} = useForm({
    mode: 'onTouched',
    reValidateMode: 'onBlur',
  });

  const [categoryName,setCategoryName] = React.useState('');
  const [categorySecondName,setCategorySecondName] = React.useState('');
  const [multiSelection,setMultiSelection] = React.useState(false);


  const [name,setName] = React.useState('');
  const [second_name,setSecond_name] = React.useState('');
  const [price,setPrice] = React.useState('');

  const [categoryExtrasList,setCategoryExtrasList] = React.useState([]);


    ////////  submit button for Editing  ///////
  const handleEditCategory = () => {
    const request = {
      name: categoryName,
      second_name: categorySecondName,
      allow_multi_selection: multiSelection,
      extras: categoryExtrasList
    };
    api
      .put(`/extras-categories/${category.value}` ,{params:{...request,location_id:shopId}} )
      .then((res) => res.data.result)
      .then((res) => {
        Toastify('success', 'Successfully Update');
        handleClose();
      })
      .catch(() => Toastify('error', 'Has Error, Try Again...'))
      .finally(() => setIsLoading(false));
  };


    ////////  submit button for Adding  ///////
    const handleAddCategory = () => {
    const request = {
      category_name: categoryName,
      category_second_name: categorySecondName,
      allow_multi_selection: multiSelection,
      extras: categoryExtrasList
    };
    api.post('/extras/category-with-list/', {...request,location_id:shopId})
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
      setCategoryExtrasList([]);
  };

  // For initializing fields in case of editing or showing
  const handleModalIsForEditing = () => {
    setCategoryName(category.name);
    setCategorySecondName(category.second_name);
    setMultiSelection(category.allow_multi_selection);
    setCategoryExtrasList(extrasList);
    setOpen(true);
  };

  //   // For initializing fields in case od editing
  // const handleViewCategory = () => {
  //   setIsViewMode(true);
  // }
  
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

  const emptyVariables = () =>{
    setCategoryName("");
  setCategorySecondName("");
  setMultiSelection(false);
  setName("");
  setSecond_name("");
  setPrice("");
  setCategoryExtrasList([]);
  }

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
    emptyVariables();
  };

  const handleMultiSelect = () => {
    setMultiSelection((prev) => !prev);
  };

  //adding extras for the category
  const handleAdditem = () => {
    event.preventDefault();
    if(name === "" || second_name === "" || price === "")
      return;
    setCategoryExtrasList((prevList) => [
      ...prevList,
      {
        name: name,
        second_name:second_name,
        price: price,
      },
    ]);
    setName("");
    setSecond_name("");
    setPrice("");
  }

  //editing one extra for the category
  const handleEditItem = (item) => {
    setName(item.name);
    setSecond_name(item.second_name);
    setPrice(item.price);

    const updatedCategoryExtrasList = categoryExtrasList.filter(i => i.id !== item.id);
    setCategoryExtrasList(updatedCategoryExtrasList);
  }

  //deleting an extra for the category
  const handleDeleteItem = (item) => {
    const updatedCategoryExtrasList = categoryExtrasList.filter(i => i.id !== item.id);
    setCategoryExtrasList(updatedCategoryExtrasList);
  }
  

  useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);

    if (showType === 'edit') {
      handleModalIsForEditing();
    }

  }, [statusDialog]);

  useEffect(() => {
    if (!open) {
      reset();
      clearErrors();
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
                value={categoryName}
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
                value={categorySecondName}
                className="form-control "
                disabled
              />
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
                extrasList.map(e=>{
                  return(
                    <tr>
                      <td>{e.id}</td>
                      <td>{e.name}</td>
                      <td>{e.second_name}</td>
                      <td>{e.price}</td>
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
            <label htmlFor="categoryName" className="form-label">{t('extra.category_name')}</label>
            <input
              id="categoryName"
              type="text"
              name="categoryName"
              className="form-control mb-2"
              placeholder="Arabic Name"
              value={categoryName}
              onChange={(e)=>{setCategoryName(e.target.value)}}
              required
            />
            <label htmlFor="categorySecondName" className="form-label">{t('extra.category_second_name')}</label>
            <input
              id="categorySecondName"
              type="text"
              name="categorySecondName"
              className="form-control mb-2"
              placeholder="English Name"
              value={categorySecondName}
              onChange={(e)=>{setCategorySecondName(e.target.value)}}
              required
            />
             <FormControlLabel
                control={
                  <Switch
                   checked={multiSelection}
                   onChange={handleMultiSelect}
                   className='px-2 '
                  />}
                label={t("extra.enable_multi_selection")}
              />
            </fieldset>
            {/* <Card className='my-3'>
              <CardContent>
                
              </CardContent>
            </Card> */}

            <div className="d-flex justify-content-between">
              <fieldset style={{ width: '30%' }}>
              <input
                id="name"
                type="text"
                name="name"
                className="form-control"
                required
                placeholder={t("extra.extra_name")}
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />
            </fieldset>
            <fieldset style={{ width: '30%' }}>
              <input
                id="second_name"
                type="text"
                name="second_name"
                className="form-control"
                required
                placeholder={t("extra.extra_second_name")}
                value={second_name}
                onChange={(e)=>setSecond_name(e.target.value)}
              />
            </fieldset>
            <fieldset style={{ width: '30%' }}>
              <input
                id="price"
                type="number"
                name="price"
                className="form-control"
                required
                placeholder={t("extra.extra_price")}
                value={price}
                onChange={(e)=>setPrice(e.target.value)}
              />
            </fieldset>
          </div>
          <div className='d-flex justify-content-center mt-3 me-2' >
            <button
              className='btn btn-outline-warning text-black '
              onClick={handleAdditem}
            >
              {t('extra.add_item')}
            </button>
          </div>

            <Card className='my-3'>
              <CardContent>
                <h5 className='text-center text-primary'>{t('extra.list_of_extras')}</h5>
                <fieldset>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>{t('extra.extra_name')}</th>
                        <th>{t('extra.extra_second_name')}</th>
                        <th>{t('extra.extra_price')}</th>
                        <th>{t('extra.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryExtrasList.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.name}
                          </td>
                          <td>
                            {item.second_name}
                          </td>
                          <td>
                            {item.price}
                          </td>
                          <td>
                            <IconButton 
                              children = {<EditIcon />}
                              onClick={()=>{handleEditItem(item)}}
                            />
                            <IconButton 
                              children ={<DeleteIcon />} 
                              onClick={()=>{handleDeleteItem(item)}}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </fieldset>
              </CardContent>
            </Card>
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
