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



const ExtraModal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId,selectId,extrasList } = props;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {register,handleSubmit,formState: { errors },reset,setValue,clearErrors,} = useForm({
    mode: 'onTouched',
    reValidateMode: 'onBlur',
  });

  const [categoryName,setCategoryName] = React.useState('');
  const [categorySecondName,setCategorySecondName] = React.useState('');
  const [multiSelection,setMultiSelection] = React.useState(false);


  const [name,setName] = React.useState('');
  const [secondName,setSecondName] = React.useState('');
  const [price,setPrice] = React.useState('');

    ////////  to be Edited  ///////
  const handleEditextra = (data: any) => {
    api
      .put('/extra-settings/' + userdata.value,{},{params:{...data,location_id:shopId}} )
      .then((res) => res.data.result)
      .then((res) => {
        Toastify('success', 'Successfully Update');
        handleClose();
      })
      .catch(() => Toastify('error', 'Has Error, Try Again...'))
      .finally(() => setIsLoading(false));
  };
    ////////  to be Edited  ///////
  const handleAddextra = (data: any) => {
    api.post('/extra-settings/', {...data,location_id:shopId})
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
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    if (showType === 'edit') {
      handleEditextra(data);
    } else {
      handleAddextra(data);
    }
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
    setCategoryExtrasList([]);
    
    setName("");
    setSecondName("");
    setPrice("");
  };

  const [multiSelectChecked, setMultiSelectChecked] = React.useState(false);

  const handleMultiSelect = () => {
    setMultiSelectChecked((prev) => !prev);
  };


  const [categoryExtrasList,setCategoryExtrasList] = React.useState([]);

  const handleAdditem = () => {
    event.preventDefault();
    if(name === "" || secondName === "" || price === "")
      return;

      
    setCategoryExtrasList((prevList) => [
      ...prevList,
      {
        id:Date.now(), 
        name: name,
        secondName:secondName,
        price: price,
      },
    ]);
    setName("");
    setSecondName("");
    setPrice("");
  }

  const handleEditItem = (item) => {
    setName(item.name);
    setSecondName(item.secondName);
    setPrice(item.price);

    const updatedCategoryExtrasList = categoryExtrasList.filter(i => i.id !== item.id);
    setCategoryExtrasList(updatedCategoryExtrasList);
  }

  const handleDeleteItem = (item) => {
    const updatedCategoryExtrasList = categoryExtrasList.filter(i => i.id !== item.id);
    setCategoryExtrasList(updatedCategoryExtrasList);
  }
  

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
    const selectedExtra = extrasList.filter((object) => { return object.id==selectId  });

    selectedExtra.forEach(function(item, index) {
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
          {showType + ' extra'}
          
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <CircularProgress />
          </Box>
        </Modal.Body>
      </Modal>
    );
  return (
    <Modal show={open} onHide={handleClose} size="lg">
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        {showType + ' extras'}
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} >
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <Modal.Body>
            <fieldset className='w-75 m-auto justify-content-center mb-3'>
            <label htmlFor="categoryName" className="form-label">Category Name</label>
            <input
              id="categoryName"
              type="text"
              name="categoryName"
              className="form-control mb-2"
              // placeholder="Category Name"
              value={categoryName}
              onChange={(e)=>{setCategoryName(e.target.value)}}
              required
            />
            <label htmlFor="categorySecondName" className="form-label">Category Second Name</label>
            <input
              id="categorySecondName"
              type="text"
              name="categorySecondName"
              className="form-control mb-2"
              // placeholder="Category Second Name"
              value={categorySecondName}
              onChange={(e)=>{setCategorySecondName(e.target.value)}}
              required
            />
             <FormControlLabel
                control={
                  <Switch
                   checked={multiSelectChecked}
                   onChange={handleMultiSelect}
                   className='px-2 '
                  />}
                label="Enable multi-selection"
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
                placeholder="Extra Name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />
            </fieldset>
            <fieldset style={{ width: '30%' }}>
              <input
                id="secondName"
                type="text"
                name="secondName"
                className="form-control"
                required
                placeholder="Extra Second Name"
                value={secondName}
                onChange={(e)=>setSecondName(e.target.value)}
              />
            </fieldset>
            <fieldset style={{ width: '30%' }}>
              <input
                id="price"
                type="number"
                name="price"
                className="form-control"
                required
                placeholder="Extra Price"
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
              Add Item
            </button>
          </div>

            <Card className='my-3'>
              <CardContent>
                <h5 className='text-center text-primary'>List of Extras</h5>
                <fieldset>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Extra Name</th>
                        <th>Extra Second Name</th>
                        <th>Extra Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryExtrasList.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.name}
                          </td>
                          <td>
                            {item.secondName}
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
              <i className="ri-close-line me-1 align-middle" /> Close
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
