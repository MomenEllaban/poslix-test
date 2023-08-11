// {
//   name: '',
//   mobile: '',
//   mobile: '',
//   email: '',
//   business_type_id: '',
// }

import Joi from 'joi';

// create validation schema for the previous object

export const createBusinessSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  mobile: Joi.string().required().messages({
    'string.empty': 'Mobile is required',
    'any.required': 'Mobile is required',
  }),
  email: Joi.string()
    .email({
      tlds: { allow: false },
    })
    .required()
    .messages({
      'string.email': 'Email must be a valid email',
      'string.empty': 'Email is required',

      'any.required': 'Email is required',
    }),
  business_type_id: Joi.number().required(),
});
