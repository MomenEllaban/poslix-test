import { joiResolver } from '@hookform/resolvers/joi';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import loginSchema from '../login.schema';

type Inputs = {
  email: string;
  password: string;
};

const initState = {
  email: '',
  password: '',
};

export default function LoginView() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onTouched',
    resolver: joiResolver(loginSchema),
    reValidateMode: 'onBlur',
    defaultValues: initState,
  });

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setLoading(true);
    signIn('credentials', { redirect: false, ...data }).finally(() => {
      setLoading(false);
      window.location.href = '/';
    });
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="p-2 my-2 d-flex gap-3 flex-column">
        <Form.Group controlId="login-email-input">
          <Form.Label className="fw-semibold fs-6">Email</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              isInvalid={!!errors.email}
              autoComplete="off"
              placeholder="Enter Email"
              type="text"
              name="email"
              {...register('email')}
            />
          </InputGroup>
          {errors?.email ? (
            <Form.Text className="text-danger">{errors?.email?.message}</Form.Text>
          ) : null}{' '}
        </Form.Group>

        <Form.Group controlId="login-password-input">
          <Form.Label className="fw-semibold fs-6">Password</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              autoComplete="off"
              isInvalid={!!errors.password}
              placeholder="Enter Password"
              type={showPass ? 'text' : 'password'}
              name="password"
              {...register('password')}
            />
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '3rem',
              }}
              onClick={() => setShowPass((p) => !p)}>
              {showPass ? <MdVisibility /> : <MdVisibilityOff />}
            </Button>
          </InputGroup>
          {errors?.password ? (
            <Form.Text className="text-danger">{errors?.password?.message}</Form.Text>
          ) : null}
        </Form.Group>
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
          Sign in
        </button>
      </div>
    </Form>
  );
}
