import { joiResolver } from '@hookform/resolvers/joi';
import { BusinessTypeData } from '@models/data';
import { getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import 'react-phone-number-input/style.css';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import { Toastify } from 'src/libs/allToasts';
import { createBusinessSchema } from 'src/modules/business/create-business/create-business.schema';
import { useBusinessTypesList } from 'src/services/business.service';
import { createNewData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-number-input/style.css';

type Inputs = {
  name: string;
  mobile: string;
  email: string;
  business_type_id: string | number;
};

export default function RegisterBusinessView() {
  const [busniessTypesList, setBusniessTypesList] = useState(BusinessTypeData());

  const router = useRouter();
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onTouched',
    resolver: joiResolver(createBusinessSchema),
    reValidateMode: 'onBlur',
  });

  useBusinessTypesList({
    onSuccess(data, key, config) {
      const _businessTypesList = data.result.map((itm: any) => ({
        value: itm.id,
        label: itm.name,
      }));
      setBusniessTypesList(_businessTypesList);
    },
  });
  const [isLoading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const _user = window.localStorage.getItem('uncompleted_user')
      ? JSON.parse(window.localStorage.getItem('uncompleted_user'))
      : null;
    if (!_user) {
      setLoading(false);
      Toastify('error', 'error occurred, try agian');
      router.reload();
    }
    api
      .postForm('/business', data, {
        headers: {
          Authorization: `Bearer ${_user.token}`,
        },
      })
      .then(async (res) => {
        const addLoc = await api.post(
          'business/locations',
          {
            business_id: res.data.result.id,
            name: `${data.name} - location 1`,
            state: 'egy',
            status: 'soon',
            currency_id: 35,
            decimal: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${_user.token}`,
            },
          }
        );
        if (addLoc.data.success) {
          Toastify('success', 'Business created successfully');
          router.push('/[username]/business', `/${session?.user?.username}/business`);
        }
      })
      .then((res) => {
        Toastify('success', 'Business created successfully');
        window.localStorage.removeItem('uncompleted_user');
        setTimeout(() => {
          router.reload();
        }, 500);
      })
      .catch((err) => {
        Toastify('error', 'error occurred, try agian');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onError = (errors: any, e: any) => console.error(errors, e);
  const { name, ref } = register('mobile');

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
        {/* <FormField
          label="Mobile"
          name="mobile"
          type="text"
          placeholder="Enter Mobile number"
          register={register}
          required
          errors={errors}
        /> */}

        <div>
          <label className="fw-semibold fs-6 form-label">
            Mobile<span className="text-danger ms-2">*</span>
          </label>
          <PhoneInput
            country={'om'}
            enableAreaCodes
            enableTerritories
            placeholder="Enter Mobile number"
            countryCodeEditable
            inputProps={{ required: true, ref: ref, name: name }}
            onlyCountries={['om']}
            autoFormat={true}
            onChange={(e) => setValue('mobile', e)}
          />
          {errors.mobile && <Form.Text className="text-danger">{errors.mobile?.message}</Form.Text>}
        </div>
        <SelectField
          label="Business Type"
          name="business_type_id"
          options={busniessTypesList} // Pass the business types options
          register={register}
          errors={errors}
          required
        />

        <button className="btn-login mt-auto" type="submit">
          {isLoading && (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
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
        redirect: { destination: `/${session.user.id}/business`, permenant: false },
        props: { session },
      };
    }
    return {
      redirect: { destination: '/shop', permenant: false },
      props: { session },
    };
  }

  return {
    props: {},
  };
}
