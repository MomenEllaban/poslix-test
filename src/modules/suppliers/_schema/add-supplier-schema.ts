import Joi from 'joi';

export const addSuplierSchema = Joi.object()
  .keys({
    name: Joi.string().required().messages({
      'string.empty': 'Name is required',
    }),
    email: Joi.string().email({ tlds: false }).messages({
      'string.empty': 'Email is  required',
      'string.email': 'Please enter a valid email',
    }),
    phone: Joi.string().required().messages({
      'string.empty': 'Phone is required',
    }),
    facility_name: Joi.string().required().messages({
      'string.empty': 'Facility Name is required',
    }),
    tax_number: Joi.string().required().messages({
      'string.empty': 'Tax Number is required',
    }),
    invoice_address: Joi.string().allow(''),
    invoice_City: Joi.string().allow(''),
    invoice_Country: Joi.string().allow(''),
    postal_code: Joi.number().allow(''),
  })
  .unknown(true);
/*


*/
