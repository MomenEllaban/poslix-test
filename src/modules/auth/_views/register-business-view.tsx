import { joiResolver } from '@hookform/resolvers/joi';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import registerSchema from '../register.schema';

import 'react-phone-number-input/style.css';
import FormField from 'src/components/form/FormField';
import PasswordField from 'src/components/form/PasswordField';
import { Toastify } from 'src/libs/allToasts';
import api from 'src/utils/app-api';
import SelectField from 'src/components/form/SelectField';
import { BusinessTypeData } from '@models/data';
import { useBusinessTypesList } from 'src/services/business.service';

type Inputs = {
  first_name: string;
  last_name: string;
  number: string;
  email: string;
  password: string;
  repeat_password: string;
};

const initState = {
  email: '',
  first_name: '',
  last_name: '',
  number: '',
  password: '',
  repeat_password: '',
};

export default function RegisterBusinessView() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onTouched',
    resolver: joiResolver(registerSchema),
    reValidateMode: 'onBlur',
    defaultValues: initState,
  });
  const [busniessTypesList, setBusniessTypesList] = useState(BusinessTypeData());
  useBusinessTypesList({
    onSuccess(data, key, config) {
      const _businessTypesList = data.result.map((itm: any) => {
        return { value: itm.id, label: itm.name };
      });
      setBusniessTypesList(_businessTypesList);
    },
  });
  const [showPass, setShowPass] = useState({
    password: false,
    repeat_password: false,
  });
  const [isLoading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const { repeat_password, ..._data } = data;
    api
      .post('/register', _data)
      .then((res) => {
        Toastify('success', 'Register Success');
        setTimeout(() => {
          
        }, 500);
      })
      .catch((err) => {
        Toastify('error', err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onError = (errors: any, e: any) => console.error(errors, e);

  const _fields: any[] = [
    {
      label: 'First name',
      name: 'first_name',
      type: 'text',
      placeholder: 'Enter First Name',
      autoComplete: 'off',
      required: true,
    },
    {
      label: 'Last name',
      name: 'last_name',
      type: 'text',
      placeholder: 'Enter Last Name',
      autoComplete: 'off',
    },
    {
      label: 'Phone Number',
      name: 'number',
      type: 'text',
      placeholder: 'Enter Phone Number',
      autoComplete: 'off',
      required: true,
    },
    {
      label: 'Email',
      name: 'email',
      type: 'text',
      placeholder: 'Enter Email',
      autoComplete: 'off',
      required: true,
    },
    {
      label: 'Password',
      name: 'password',
      type: 'password',
      placeholder: 'Enter Password',
      autoComplete: 'off',
      required: true,
    },
    {
      label: 'Confirm Password',
      name: 'repeat_password',
      type: 'password',
      placeholder: 'Enter Password',
      autoComplete: 'off',
      required: true,
    },
  ];

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="p-2 my-2 d-flex gap-3 flex-column">
        <FormField
          label="Business Name"
          name="name"
          type="text"
          placeholder="Enter Business Name"
          register={register}
          required
          errors={errors}
        />
        <FormField
          label="Email"
          name="email"
          type="text"
          placeholder="Enter Email"
          register={register}
          required
          errors={errors}
        />
        <FormField
          label="Mobile"
          name="mobile"
          type="text"
          placeholder="Enter Mobile number"
          register={register}
          required
          errors={errors}
        />

        <SelectField
          label="Business Type"
          name="business_type_id"
          options={busniessTypesList} // Pass the business types options
          register={register}
          errors={errors}
          required
        />
        {/* <SelectField
        label="Country"
        name="country_id"
        options={countries} // Pass the business types options
        register={register}
        errors={errors}
        required
      /> */}
        <button className="btn-login mt-auto" type="submit">
          {isLoading && (
            <Image
              alt="loading"
              width={25}
              height={25}
              className="login-loading"
              src={'/images/loading.gif'}
            />
          )}
          Create business
        </button>
      </div>
    </Form>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (session) {
    if (session.user.user_type === 'owner') {
      return {
        redirect: { destination: '/' + session.user.username + '/business', permenant: false },
        props: { session },
      };
    } else {
      return {
        redirect: { destination: '/shop', permenant: false },
        props: { session },
      };
    }
  }

  return {
    props: {},
  };
}
