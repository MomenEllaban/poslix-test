import DarkModeToggle from '@layout/AdminLayout/DarkModeToggle';
import { IUserBusiness } from '@models/auth.types';
import { BusinessTypeData } from '@models/data';
import { ICustomResponse } from '@models/global.types';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { setCookie } from 'cookies-next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import { darkModeContext } from 'src/context/DarkModeContext';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneNumber,
} from 'src/libs/toolsUtils';
import LoginView from 'src/modules/auth/_views/login-view';
import api from 'src/utils/app-api';
import { ELocalStorageKeys } from 'src/utils/app-contants';
import { colourStyles } from 'src/utils/color.style';
import { apiInsertCtr } from '../../../libs/dbUtils';
import { clearLocalStorageItems } from 'src/utils/clearLocalStorageItems';

const initalInputState = {
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  mail: '',
  businessname: '',
  businesstype: 0,
};

export default function RegisterPage() {
  const router = useRouter();

  const { user, setUser } = useUser();
  const { darkMode } = useContext(darkModeContext);

  const [phone, setPhone] = useState('');
  const [isStep1, setIsStep1] = useState(true);

  const [warName, setWarName] = useState(false);
  const [warnpass, setwarnpass] = useState(false);
  const [warPhone, setWarPhone] = useState(false);
  const [warBType, setWarBType] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [warnemail, setwarnemail] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasErrorMsg, setHasErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [inputs, setinputs] = useState(initalInputState);
  const [showLoginDialog, setShowLoginDialog] = useState(true);
  const [warBusinessName, setWarBusinessName] = useState(false);
  const [busniessType, setBusniessType] = useState(BusinessTypeData);
  const { data: session } = useSession();

  const inputEvent = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name == 'mail') {
      if (value.length > 0 && !validateEmail(value)) setwarnemail(true);
      else setwarnemail(false);
    } else if (name == 'name') {
      if (value.length > 0 && !validateName(value)) setWarName(true);
      else setWarName(false);
    } else if (name == 'password') {
      setwarnpass(value.length > 0 && !validatePassword(value));
    }
    setinputs((lastValue) => {
      return {
        ...lastValue,
        [name]: value,
      };
    });
  };

  const submitForm = (e: any) => {
    e.preventDefault();
    setHasError(false);
    if (showLoginDialog) {
      setwarnemail(false);
      setwarnpass(false);
      if (inputs.password.length < 3 || !validatePassword(inputs.password)) {
        setwarnpass(true);
      }
      if (inputs.mail.length < 3 || !validateEmail(inputs.mail)) {
        setwarnemail(true);
      }
    } else {
      if (isStep1) {
        let isOK = true;
        setwarnpass(false);
        setwarnemail(false);
        setWarName(false);
        setWarPhone(false);
        if (inputs.password.length < 3 || !validatePassword(inputs.password)) {
          setwarnpass(true);
          isOK = false;
        }
        if (inputs.mail.length < 3 || !validateEmail(inputs.mail)) {
          setwarnemail(true);
          isOK = false;
        }
        if (inputs.name.length < 3 || !validateName(inputs.name)) {
          setWarName(true);
          isOK = false;
        }
        if (phone.length < 11 || !validatePhoneNumber(phone)) {
          setWarPhone(true);
          isOK = false;
        }
        if (isOK) registeration('newRegister');
      } else {
        let isOK = true;
        setWarBusinessName(false);
        setWarBType(false);
        if (inputs.businessname.length < 3 || !validateName(inputs.businessname)) {
          setWarBusinessName(true);
          isOK = false;
        }
        if (inputs.businesstype < 1) {
          setWarBType(true);
          isOK = false;
        }
        if (isOK) registeration('userNewBusiness');
      }

      return;
    }
  };

  async function registeration(steps: string) {
    if (isWaiting) return;
    const { success, newdata, msg } = await apiInsertCtr({
      type: 'user',
      subType: steps,
      data: inputs,
    });
    setIsWaiting(false);
    if (!success) {
      setHasErrorMsg(msg);
      setHasError(true);
      return;
    }
    if (isStep1) {
      setinputs({ ...inputs, id: newdata.id });
      setIsStep1(false);
      Toastify('success', 'Done, Pass The Last Step');
    } else {
      Toastify('success', 'Your registration has been successfully completed');
      setSuccessMsg(true);
      setIsStep1(true);
      setShowLoginDialog(true);
      // signin();
    }
  }

  const RenderRegisterStep = () => {
    if (isStep1)
      return (
        <div className="step1">
          <form className="formfileds" onSubmit={submitForm}>
            <div className="input_text">
              <input
                type="text"
                placeholder="Your Full Name"
                name="name"
                value={inputs.name}
                onChange={inputEvent}
              />
              {warName && <p>Please enter a valid Name.</p>}
            </div>
            <div className="input_text">
              <input
                type="text"
                placeholder="Email Address"
                name="mail"
                value={inputs.mail}
                onChange={inputEvent}
              />
              {warnemail && <p>Please enter a valid email address.</p>}
            </div>
            <div className="input_text">
              <PhoneInput
                country={'om'}
                value={phone}
                autoFormat={true}
                onChange={(phone) => setPhone(phone)}
              />
              {warPhone && <p>Please enter a valid Phone Number.</p>}
            </div>
            <div className="input_text">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={inputs.password}
                onChange={inputEvent}
              />
              {warnpass && (
                <p>
                  Password must contain at least one digit,lowercase letter,uppercase letter and be
                  at least 6 characters
                </p>
              )}
            </div>
            <button className="btn-login mt-auto" type="submit">
              {isWaiting && <img className="login-loading" src={'/images/loading.gif'} />}
              Sign Up
            </button>
          </form>
        </div>
      );

    return (
      <div className="step2">
        <div className="login-register-box">
          <h3>Business Info</h3>
          <p>You Haven't Business , Create One!</p>
        </div>
        <h5></h5>
        {/* {JSON.stringify(inputs)} */}
        <form className="formfileds" onSubmit={submitForm}>
          <div className="input_text">
            <input
              type="text"
              className="form-control m-input"
              placeholder="Your Business Name"
              name="businessname"
              value={inputs.businessname}
              onChange={inputEvent}
            />
            {warBusinessName && <p>Enter Your Business Name First</p>}
          </div>
          <div className="form-group">
            <label>Business Type:</label>
            <Select
              styles={colourStyles}
              options={busniessType}
              value={busniessType.filter((f: any) => {
                return f.value == inputs.businesstype;
              })}
              onChange={(itm) => {
                setinputs({ ...inputs, businesstype: Number(itm!.value) });
              }}
            />
            {warBType && <p className="lg-msg-error">Select Your Business Type First!</p>}
          </div>
          <div className="">
            <button className="btn-login" type="submit">
              {isWaiting && <img className="login-loading" src={'/images/loading.gif'} />}
              Create New Business
            </button>
          </div>
        </form>
      </div>
    );
  };
  const RenderForm = () => {
    // a refactor but that behaviour is not the best one
    if (showLoginDialog) return <LoginView />;

    return (
      <div className="regformform">
        <RenderRegisterStep />
      </div>
    );
  };

  async function getBusiness(user) {
    const { data } = await api.get<any, AxiosResponse<ICustomResponse<IUserBusiness>>, any>(
      '/business'
    );
    console.log(data.result);
    const { success, result } = data;
    const { locations } = result;
    localStorage.setItem(ELocalStorageKeys.USER_LOCATIONS, JSON.stringify(locations));
    if (user.user_type === 'user') {
      router.push('/shop/' + result[0].id);
    } else router.push('/' + user.username + '/business');
  }

  useEffect(() => {
    if (session) {
      const { user } = session;
      console.log(session);
      console.log(user);
      setCookie('tokend', user.token);
      setUser(user);

      localStorage.setItem('userdata', JSON.stringify(user));
      localStorage.setItem(ELocalStorageKeys.TOKEN, user.token);
      localStorage.setItem(
        ELocalStorageKeys.FULL_NAME,
        `${user.first_name} ${user.last_name ?? ''}`
      );
      localStorage.setItem(ELocalStorageKeys.USER_NAME, user.username);
      localStorage.setItem(ELocalStorageKeys.LEVELS, user.user_type);
      console.log(user.user_type);
      if (user.user_type === 'owner') getBusiness(user);

      // if (newdata.user.level == 'user') router.push('/shop/' + newdata.myBusiness[0].value);
      // else router.push('/' + newdata.user.username + '/business');
    }
  }, [session]);

  useEffect(() => {
    setSuccessMsg(false);
    setHasError(false);
  }, [showLoginDialog]);

  useEffect(() => {
    if (phone.length > 0 && !validatePhoneNumber(phone)) setWarPhone(true);
    else setWarPhone(false);
    setinputs({ ...inputs, phone: phone });
  }, [phone]);

  useEffect(() => {
    // this is in logout only
    // deleteCookie('tokend');
    clearLocalStorageItems();
  }, []);

  // if the user already logged then redirect to another page

  if (user?.user_type === 'owner') {
    getBusiness(user);
  }

  return (
    <div>
      <style jsx>{`
        .login-body {
          transition: background-color 0.3s ease-in-out;
        }
        .card {
          border-radius: 1rem;
          overflow: hidden;
          .form {
            min-height: 70vh;
            max-height: 90vh;

            .form-item.right-side {
              max-height: 100%;
              overflow-y: auto;
            }
          }
        }
      `}</style>

      <div className="position-absolute m-3 end-0">
        <DarkModeToggle />
      </div>
      <div
        className={clsx('login-body', {
          'dark-mode-body': darkMode,
          'light-mode-body': !darkMode,
        })}>
        <div className="container-login">
          <div className="card">
            <div className="form">
              <div className="form-item left-side">
                <img src="https://app.dubbpie.com/assets/images/login-img.png" />
                <div className="login-ads-text">
                  <h3>Manage Your Business</h3>
                  <p>
                    Easily manage your store with
                    <br /> POSLIX POS Screen
                  </p>
                </div>
                <div className="login-footer-dots">
                  <div className="footer-arrows">⮜</div>
                  <div className="footer-dots">
                    <div className="footer-dots-item"></div>
                    <div className="footer-dots-item active"></div>
                    <div className="footer-dots-item"></div>
                  </div>
                  <div className="footer-arrows">⮞</div>
                </div>
              </div>
              <div className="form-item right-side">
                <div className="login-logo-box">
                  <img src="/images/logo1.png" />
                </div>
                {isStep1 && (
                  <div className="login-register-box">
                    <h3>Welcome Back</h3>
                    <p>To Start Working, First Login Or Register</p>
                    <div className="switcher-box">
                      <div
                        className={`switcher-box-item ${showLoginDialog ? 'active' : ''}`}
                        onClick={() => setShowLoginDialog(true)}>
                        Login In
                      </div>
                      <div
                        className={`switcher-box-item ${!showLoginDialog ? 'active' : ''}`}
                        onClick={() => setShowLoginDialog(false)}>
                        Sign Up
                      </div>
                    </div>
                  </div>
                )}
                {hasError && <div className="login-error-msg">{hasErrorMsg}</div>}
                {successMsg && (
                  <div className="login-success-msg">You Successfully Registered, Login Please</div>
                )}
                <RenderForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function setUserAuth(userData: any, setUser: (user: any) => void) {
  setCookie('tokend', userData.token);
  setUser(userData.user);

  localStorage.setItem('userdata', JSON.stringify(userData.user));
  localStorage.setItem(ELocalStorageKeys.USER_LOCATIONS, JSON.stringify(userData.myBusiness));
  localStorage.setItem(ELocalStorageKeys.TOKEN, userData.token);
  localStorage.setItem(ELocalStorageKeys.FULL_NAME, userData.user.name);
  localStorage.setItem(ELocalStorageKeys.USER_NAME, userData.user.username);
  localStorage.setItem(ELocalStorageKeys.LEVELS, userData.user.level);
}
