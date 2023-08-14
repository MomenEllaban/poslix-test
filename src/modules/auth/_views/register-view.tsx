import { joiResolver } from '@hookform/resolvers/joi';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import registerSchema from '../register.schema';

import 'react-phone-number-input/style.css';
import { Toastify } from 'src/libs/allToasts';
import api from 'src/utils/app-api';
import { ROUTES } from 'src/utils/app-routes';
import FormField, { FormFieldProps } from 'src/components/form/FormField';
import PasswordField from 'src/components/form/PasswordField';

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

export default function RegisterView({
  setIsRegisterDone,
}: {
  setIsRegisterDone: Dispatch<SetStateAction<boolean>>;
}) {
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
        // setTimeout(() => {
        //   setIsRegisterDone(true);
        // }, 500);
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
        {_fields.map((field) => {
          if (field.type === 'password')
            return (
              <PasswordField
                key={field.name}
                {...field}
                register={register}
                errors={errors}
                control={control}
              />
            );
          return (
            <FormField
              key={field.name}
              {...field}
              register={register}
              errors={errors}
              control={control}
            />
          );
        })}

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
          Register{' '}
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
