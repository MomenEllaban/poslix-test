import Joi from 'joi';

export const addSuplierSchema = Joi.object()
  .keys({
    name: Joi.string().required().messages({
      'string.empty': 'Name is required',
    }),
    email: Joi.string().email({ tlds: false }),
    phone: Joi.string().required().messages({
      'string.empty': 'Phone is required',
    }),
    facility_name: Joi.string().required(),
    tax_number: Joi.string().required(),
    invoice_address: Joi.string().allow(''),
    invoice_City: Joi.string().allow(''),
    invoice_Country: Joi.string().allow(''),
    postal_code: Joi.string().allow(''),
  })
  .unknown(true);
