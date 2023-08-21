import { joiResolver } from '@hookform/resolvers/joi';
import { IHold, IHoldItems } from '@models/common-model';
import Joi from 'joi';
import { nanoid } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { Toastify } from 'src/libs/allToasts';
import { clearCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
const holdSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': `Name is required`,
    'any.required': `Name is required`,
  }),
});
const HoldModal = ({ show, setShow, shopId }: any) => {
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation); // current location order
  const dispatch = useAppDispatch();
  const [holdItems, setHoldItems] = useState<IHoldItems[]>([]);

  // assumption of one order at a time / one cart
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ resolver: joiResolver(holdSchema) });

  const handleClose = () => setShow(false);

  const handleSaveOrder = (data) => {
    if (!data?.name) return Toastify('error', 'Enter Hold Name First!');
    if (!cart?.cartItems?.length) return Toastify('error', 'There Is Nothing For Hold!');

    const _holdOrder = { id: nanoid(5), name: data.name, length: cart.cartItems.length, ...cart };

    const _newHoldArr = [...holdItems, _holdOrder];
    localStorage.setItem(`holdItems[${shopId}]`, JSON.stringify(_newHoldArr));
    Toastify('success', 'Products Saved');
    dispatch(clearCart({ location_id: shopId }));
    setShow(false);
  };

  useEffect(() => {
    reset();
    if (show) {
      const holdItemsFromStorage = localStorage.getItem(`holdItems[${shopId}]`);
      if (holdItemsFromStorage) {
        const _holdItems = JSON.parse(holdItemsFromStorage);
        setHoldItems([..._holdItems]);
      } else {
        setHoldItems([]);
      }
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit(handleSaveOrder)}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          Hold Orders
        </Modal.Header>
        <Modal.Body>
          <FormField
            required
            name="name"
            type="text"
            label="Name"
            errors={errors}
            register={register}
            placeholder="Enter Name"
          />
        </Modal.Body>
        <Modal.Footer>
          <a className="btn btn-link link-success fw-medium" onClick={handleClose}>
            Close <i className="ri-close-line me-1 align-middle" />
          </a>
          <Button type="submit" variant="primary" className="p-2">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default HoldModal;
