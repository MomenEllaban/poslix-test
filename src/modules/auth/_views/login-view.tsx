import { joiResolver } from '@hookform/resolvers/joi';
import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import loginSchema from '../login.schema';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';
import { createNewData } from 'src/services/crud.api';
import { useUser } from 'src/context/UserContext';
import { setCookie } from 'cookies-next';
import { ELocalStorageKeys } from 'src/utils/app-constants';

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
  const router = useRouter();
  const { setUser } = useUser();

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleSetDataLocalStorage = (user: any): void => {
    setCookie('tokend', user.token);
    setUser(user);

    localStorage.setItem('userdata', JSON.stringify(user));
    localStorage.setItem(ELocalStorageKeys.TOKEN, user.token);
    localStorage.setItem(ELocalStorageKeys.FULL_NAME, `${user.first_name} ${user.last_name ?? ''}`);
    localStorage.setItem(ELocalStorageKeys.USER_NAME, user.username);
    localStorage.setItem(ELocalStorageKeys.LEVELS, user.user_type);
  };

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setLoading(true);
    const res = await signIn('credentials', { redirect: false, ...data })
      .then(async (res) => {
        if (res.error) throw new Error(res.error);
        const session = await getSession();
        const again = await createNewData('login', data);
        // console.log(again);
        handleSetDataLocalStorage(session.user);

        localStorage.setItem('permissions', JSON.stringify(again.data.result.user?.locations));
        Toastify('success', 'Login Success');
        if (session.user.user_type === 'owner') {
          router.push(`/${session.user.id}/business`);
        } else {
          router.push(`/shop/${again.data.result.user?.locations[0].id}`);
        }
      })
      .catch(() => {
        Toastify('error', 'Login Failed');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
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
        <button className="btn-login mt-auto" type="submit" disabled={isLoading}>
          {isLoading ? (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </div>
    </Form>
  );
}

// export async function getServerSideProps(context) {
//   const session = await getSession({ req: context.req });

//   if (session) {
//     if (session.user.user_type === 'owner' && session.user.business > 0) {
//       return {
//         redirect: { destination: '/' + session.user.id + '/business', permenant: false },
//         props: { session },
//       };
//     } else if (session.user.user_type === 'user') {
//       return {
//         redirect: { destination: '/shop', permenant: false },
//         props: { session },
//       };
//     }
//   }

//   return {
//     props: {},
//   };
// }