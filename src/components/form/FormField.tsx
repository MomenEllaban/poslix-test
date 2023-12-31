'use client';
import React, { useId, useState } from 'react';
import { Form, InputGroup, Spinner } from 'react-bootstrap';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register?: any;
  errors: any;
  textArea?: boolean;
  loading?: boolean;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  register,
  errors,
  loading = false,
  required = false,
  textArea = false,
  ...props
}) => {
  const isInvalid = !!errors?.[name];
  const formId = useId();
  const [value, setValue] = useState(props.defaultValue ?? type === 'number' ? 0 : '');

  return (
    <Form.Group controlId={`form-field-${name}-${formId}`} className="w-100">
      <Form.Label className="fw-semibold fs-6">
        {label}
        {required && <span className="text-danger ms-2">*</span>}{' '}
        {/* Display asterisk if required */}
      </Form.Label>
      <InputGroup className="mb-3">
        <Form.Control
          {...props}
          autoComplete="off"
          isInvalid={isInvalid}
          placeholder={placeholder}
          type={type}
          name={name}
          as={textArea ? 'textarea' : 'input'}
          {...(register && { ...register(name) })}
        />
      </InputGroup>
      {isInvalid && <Form.Text className="text-danger">{errors[name]?.message}</Form.Text>}{' '}
      {loading && <Spinner animation="border" size="sm" />}
    </Form.Group>
  );
};

export default FormField;
