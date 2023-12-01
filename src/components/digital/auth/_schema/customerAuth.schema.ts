import Joi from 'joi';

export const customerSingUpSchema = Joi.object()
  .keys({
    full_name: Joi.string().required().messages({
      'string.empty': 'Full name is required',
    }),
    last_name: Joi.string().required().messages({
      'string.empty': 'Last name is required',
    }),
    mobile: Joi.string().required().messages({
      'string.empty': 'Mobile number is required',
    }),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    country: Joi.string().allow(''),
    address_line_1: Joi.string().allow(''),
    address_line_2: Joi.string().allow(''),
    zip_code: Joi.string().allow(''),
    shipping_address: Joi.string().allow(''),
    email: Joi.string().required().messages({
      'string.empty': 'Email  is required',
    }),
  
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  })
  .unknown(true);

export const customerLoginSchema = Joi.object()
  .keys({
    email: Joi.string().required().messages({
      'string.empty': 'Email  is required',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  })
  .unknown(true);
