import { faCancel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { defaultDetails } from '@models/data';
import * as cookie from 'cookie';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import storage from 'firebaseConfig';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, Form, Tab, Tabs } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import { Toastify } from 'src/libs/allToasts';
import { generateUniqueString } from 'src/libs/toolsUtils';
import { createNewData, findAllData } from 'src/services/crud.api';
import withAuth from 'src/HOCs/withAuth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
//
function findFalsyKeys(obj): any {
  const falsyKeys = [];

  function exploreObject(obj, currentPath = '') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const path = currentPath ? `${currentPath}.${key}` : key;

        if (typeof value === 'object') {
          exploreObject(value, path);
        } else if (!value && key !== 'is_multi_language') {
          falsyKeys.push(path);
        }
      }
    }
  }

  exploreObject(obj);
  return falsyKeys;
}
//
const Appearance: NextPage = (props: any) => {
  const { shopId, id } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const [key, setKey] = useState('Recipt');
  const [formObj, setFormObj] = useState<any>(defaultDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  const [img, setImg] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  // const [digitalMenuFormValues, setDigitalMenuFormValues] = useState<any>({
  //   whatapp:'',
  //   instagram:'',
  //   website:''
  // });

  async function initDataPage() {
    const res = await findAllData(`appearance/${router.query.id}`);
    console.log(localStorage.getItem('lang'));

    if (!res.data.success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    setFormObj({
      ...formObj,
      ...res.data.result,
      is_multi_language: !!res.data.result.en.is_multi_language,
    });
    // if (res.data.result.details != undefined && res.data.result.details != null && res.data.result.details.length > 10) {
    //   const _data= JSON.parse(res.data.details);
    // }
    setIsLoading(false);
  }
  async function editInvoice(url = '0') {
    if (!formObj.en.logo) delete formObj.en.logo;
    if (!formObj.ar.logo) delete formObj.ar.logo;
    formObj.location_id = router.query.id;

    if (findFalsyKeys(formObj)?.length > 0) {
      Toastify(
        'error',
        `${findFalsyKeys(formObj)
          ?.join(', ')
          .replace(/en\.|ar\./g, '')} required`
      );
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    const res = await createNewData(`appearance`, formObj);
    if (res.data.success) {
      Toastify('success', 'successfully updated');
      setPreviewUrl('');
      setFormObj({
        ...formObj,
        en: { ...formObj.en, logo: formObj.logo },
        ar: { ...formObj.ar, logo: formObj.logo },
      });
    } else Toastify('error', 'Somthing wrong!!, try agian');
    setIsLoading(false);
  }
  const imageChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };
  useEffect(() => {
    if (router.query.id) initDataPage();
  }, [router.asPath]);

  useEffect(() => {
    handleUpload();
  }, [previewUrl]);
  const handleRemoveImg = () => {
    if (img) {
      const desertRef = ref(storage, formObj.logo);
      deleteObject(desertRef)
        .then(() => {
          handleUpload();
        })
        .catch((error: any) => {
          handleUpload();
        });
    } else handleUpload();
  };

  const handleSave = () => {
    if (previewUrl === '') delete formObj.logo;
    editInvoice();
  };
  async function handleUpload() {
    if (previewUrl.length < 2) {
      // Toastify('error', 'Error ,Please Select Logo First');
    } else {
      const storageRef = ref(storage, `/files/logo/${generateUniqueString(12)}${id}`);
      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

          // setPercent(percent);
        },
        (err) => {
          Toastify('error', 'error occurred while uploading the logo...');
        },
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setFormObj({ ...formObj, logo: url });
          });
        }
      );
    }
  }

  return (
    <>
      <AdminLayout shopId={id}>
        <ToastContainer />
        {!isLoading ? (
          <>
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3">
              <Tab eventKey="Recipt" title={t('apperance.receipt')}>
                <div className="row">
                  <div className="col-md-12">
                    <Card>
                      <Card.Header className="p-3 bg-white">
                        <h5>{t('apperance.print_recipt')}</h5>
                        <div className="appear-toolbar">
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          t('apperance.loading')
                        ) : (
                          <div className="appear-body">
                            <div className="appear-body-item">
                              {previewUrl.length == 0 ? (
                                <div>
                                  <label>
                                    {t('apperance.logo')}: <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    id="product-image"
                                    name="product-image"
                                    onChange={imageChange}
                                  />
                                </div>
                              ) : (
                                <div className="invoice-accept-btns">
                                  <button
                                    type="button"
                                    className="btn btn-danger p-2"
                                    onClick={() => setPreviewUrl('')}
                                    style={{ width: '100%', maxWidth: '100%' }}>
                                    <FontAwesomeIcon icon={faCancel} /> {t('apperance.cancel')}
                                  </button>
                                </div>
                              )}
                              <div className="form-group2">
                                <label>
                                  {t('apperance.business_name')}:{' '}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.name}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        name: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.phone')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.tell}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        tell: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.customer')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtCustomer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtCustomer: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.order_no')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.orderNo}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        orderNo: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.order_date')}:{' '}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtDate}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtDate: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.qty')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtQty}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtQty: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.item')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtItem}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtItem: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.amount')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtAmount}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtAmount: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.tax')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtTax}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtTax: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.total')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtTotal}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtTotal: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.footer')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.footer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        footer: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="invoice-settings-body">
                                <div className="invoice-settings-item">
                                  <div>{t('apperance.multi_language')}</div>
                                  <div>
                                    <Form.Check
                                      type="switch"
                                      className="custom-switch"
                                      checked={formObj.is_multi_language}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          is_multi_language: !formObj.is_multi_language,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {formObj.is_multi_language && (
                                <>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.customer')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtCustomer}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtCustomer: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.order_no')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj?.ar?.orderNo}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            orderNo: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.order_date')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj?.ar?.txtDate}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtDate: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.qty')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtQty}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtQty: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.item')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtItem}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtItem: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.amount')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtAmount}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtAmount: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.tax')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.ar?.txtTax}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtTax: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.total')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar.txtTotal}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtTotal: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.footer')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.footer}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            footer: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                              <button
                                type="button"
                                className="btn btn-primary p-2"
                                onClick={() => handleSave()}
                                style={{
                                  width: '100%',
                                  maxWidth: '100%',
                                  marginTop: '10px',
                                }}>
                                {t('apperance.save')}
                              </button>
                            </div>
                            <div className="appear-body-item">
                              <div className="preview-invoice-box">
                                {previewUrl.length > 0 ? (
                                  <img src={previewUrl} />
                                ) : (
                                  <img src={formObj.en.logo} />
                                )}
                                <div className="top-content">
                                  <h6 className="text-primary">{formObj.en.name}</h6>
                                  <h6 className="text-primary">{formObj.en.tell}</h6>
                                </div>
                                <div className="order-details-top">
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.en.txtCustomer}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtCustomer}
                                    </div>
                                    <div>Walk-in-customer</div>
                                  </div>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.en.orderNo}{' '}
                                      {formObj.is_multi_language && formObj.ar.orderNo}
                                    </div>
                                    <div>1518</div>
                                  </div>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.en.txtDate}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtDate}
                                    </div>
                                    <div>2023-03-31</div>
                                  </div>
                                </div>
                                <div className="order-details-top" style={{ marginTop: '5px' }}>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.en.txtQty}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtQty}
                                    </div>
                                    <div>
                                      {formObj.en.txtItem}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtItem}
                                    </div>
                                    <div>
                                      {formObj.en.txtAmount}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtAmount}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: '5px',
                                    borderBottom: '1px solid #eaeaea',
                                  }}>
                                  <div className="order-details-top-item">
                                    <div>1</div>
                                    <div>Product Name 1</div>
                                    <div>5.000</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: '5px',
                                    borderBottom: '1px solid #eaeaea',
                                  }}>
                                  <div className="order-details-top-item">
                                    <div>1</div>
                                    <div>Product Name 2</div>
                                    <div>4.000</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: '5px',
                                    borderBottom: '1px solid #696969',
                                  }}>
                                  <div className="order-details-top-item">
                                    <div></div>
                                    <div>
                                      {formObj.en.txtTax}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtTax}
                                    </div>
                                    <div>0.540</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: '5px',
                                    borderBottom: '1px solid #696969',
                                  }}>
                                  <div className="order-details-top-item">
                                    <div></div>
                                    <div>
                                      {formObj.en.txtTotal}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtTotal}
                                    </div>
                                    <div>9.540</div>
                                  </div>
                                </div>
                                <div
                                  className="top-content"
                                  style={{
                                    marginTop: '20px',
                                    marginBottom: '20px',
                                  }}>
                                  <h6 className="text-primary">
                                    {formObj.en.footer}
                                    <br />
                                    {formObj.is_multi_language && formObj.ar.footer}
                                  </h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab>
              <Tab eventKey="Invoice" title={t('apperance.invoice') + ' A4'}>
                <div className="row">
                  <div className="col-md-12">
                    <Card>
                      <Card.Header className="p-3 bg-white">
                        <h5>{t('apperance.print_invoice')}</h5>
                        <div className="appear-toolbar">
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          t('apperance.loading')
                        ) : (
                          <div className="appear-body">
                            <div className="appear-body-item">
                              {previewUrl.length == 0 ? (
                                <div>
                                  <label>
                                    {t('apperance.logo')}: <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    id="product-image"
                                    name="product-image"
                                    onChange={imageChange}
                                  />
                                </div>
                              ) : (
                                <div className="invoice-accept-btns">
                                  <button
                                    type="button"
                                    className="btn btn-danger p-2"
                                    onClick={() => setPreviewUrl('')}
                                    style={{ width: '100%', maxWidth: '100%' }}>
                                    <FontAwesomeIcon icon={faCancel} /> Cancel
                                  </button>
                                </div>
                              )}
                              <div className="form-group2">
                                <label>
                                  {t('apperance.business_name')}:{' '}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.name}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        name: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.email')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.email}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        email: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.phone')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.tell}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        tell: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.address')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.address}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        address: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.vat_number')}:{' '}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.vatNumber}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        vatNumber: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.customer')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtCustomer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtCustomer: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.order_no')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.orderNo}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        orderNo: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.order_date')}:{' '}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtDate}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtDate: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.qty')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtQty}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtQty: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.item')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtItem}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtItem: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.amount')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtAmount}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtAmount: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.tax')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtTax}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtTax: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.total')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.txtTotal}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        txtTotal: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  {t('apperance.footer')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.footer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: {
                                        ...formObj.en,
                                        footer: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="invoice-settings-body">
                                <div className="invoice-settings-item">
                                  <div>{t('apperance.multi_language')}</div>
                                  <div>
                                    <Form.Check
                                      type="switch"
                                      className="custom-switch"
                                      checked={formObj.is_multi_language}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          is_multi_language: !formObj.is_multi_language,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {formObj.is_multi_language && (
                                <>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.customer')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtCustomer}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtCustomer: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.order_no')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj?.ar?.orderNo}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            orderNo: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.order_date')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj?.ar?.txtDate}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtDate: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.qty')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtQty}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtQty: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.item')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtItem}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtItem: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.amount')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtAmount}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtAmount: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.tax')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtTax}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtTax: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.total')}: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.txtTotal}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            txtTotal: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      {t('apperance.footer')}:{' '}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj?.ar?.footer}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          ar: {
                                            ...formObj.ar,
                                            footer: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                              <button
                                type="button"
                                className="btn btn-primary p-2"
                                onClick={() => handleSave()}
                                style={{
                                  width: '100%',
                                  maxWidth: '100%',
                                  marginTop: '10px',
                                }}>
                                {t('apperance.save')}
                              </button>
                            </div>
                            <div className="appear-body-item a4">
                              <div className="bill2">
                                <div className="brand-logo">
                                  {previewUrl.length > 0 ? (
                                    <img
                                      src={previewUrl}
                                      style={{ width: '50%', height: 'auto', objectFit: 'contain' }}
                                    />
                                  ) : (
                                    <img
                                      src={formObj.en.logo}
                                      style={{ width: '50%', height: 'auto', objectFit: 'contain' }}
                                    />
                                  )}
                                  <div className="invoice-print">
                                    {t('apperance.invoice')}
                                    <div>
                                      <table className="GeneratedTable">
                                        <tbody>
                                          <tr>
                                            <td className="td_bg">
                                              {formObj.en.orderNo}{' '}
                                              {formObj.is_multi_language && formObj.ar.orderNo}
                                            </td>
                                            <td></td>
                                          </tr>
                                          <tr>
                                            <td className="td_bg">
                                              {formObj.en.txtDate}{' '}
                                              {formObj.is_multi_language && formObj.ar.txtDate}
                                            </td>
                                            <td>{new Date().toISOString().slice(0, 10)}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                                <br />
                                <div className="up_of_table flex justify-between">
                                  <div className="left_up_of_table">
                                    <div>{t('apperance.billed_from')}</div>
                                    <div>{formObj.en.name}</div>
                                    <div>{formObj.en.email}</div>
                                    <div>{formObj.en.tell}</div>
                                    <div>{formObj.en.address}</div>
                                    <div>
                                      {t('apperance.vat_number')}: {formObj.en.vatNumber}
                                    </div>
                                  </div>
                                  <div className="right_up_of_table">
                                    <div>{t('apperance.billed_to')}</div>
                                    <div>
                                      {formObj.en.txtCustomer}{' '}
                                      {formObj.is_multi_language && formObj.ar.txtCustomer}
                                    </div>
                                  </div>
                                </div>
                                <br />

                                <table className="GeneratedTable2">
                                  <thead>
                                    <tr>
                                      <th>
                                        {formObj.en.txtItem}{' '}
                                        {formObj.is_multi_language && formObj.ar.txtItem}
                                      </th>
                                      <th>
                                        {' '}
                                        {formObj.en.txtQty}
                                        <br />
                                        {formObj.is_multi_language && formObj.ar.txtQty}
                                      </th>
                                      <th>{t('apperance.unit_price')}</th>
                                      {/* <th> {invoicDetails.txtItem}<br />{invoicDetails.is_multi_language && invoicDetails.txtItem2}</th> */}
                                      <th>
                                        {formObj.en.txtTax}{' '}
                                        {formObj.is_multi_language && formObj.ar.txtTax}
                                      </th>
                                      <th>
                                        {' '}
                                        {formObj.en.txtAmount}
                                        <br />
                                        {formObj.is_multi_language && formObj.ar.txtAmount}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      {/* <td>{invoicDetails.txtTax} {invoicDetails.is_multi_language && invoicDetails.txtTax2}</td> */}
                                      <td colSpan={4} className="txt_bold_invoice">
                                        Sub Total
                                      </td>
                                      <td></td>
                                    </tr>
                                    <tr>
                                      <td colSpan={4} className="txt_bold_invoice">
                                        {formObj.en.txtTotal}{' '}
                                        {formObj.is_multi_language && formObj.ar.txtTotal}
                                      </td>
                                      <td className="txt_bold_invoice"></td>
                                    </tr>
                                  </tbody>
                                </table>

                                <p className="recipt-footer">
                                  {formObj.en.footer}
                                  <br />
                                  {formObj.is_multi_language && formObj.ar.footer}
                                </p>
                                <br />
                              </div>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab>
              {/*  */}
              <Tab eventKey="Digital Menu" title="Digital Menu">
                <div className="row">
                  <div className="col-md-12">
                    <Card>
                      <Card.Header className="p-3 bg-white">
                        <h5>{t('apperance.digital')}</h5>
                        <div className="appear-toolbar">
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          t('apperance.loading')
                        ) : (
                          <div className="appear-body">
                            <div className="appear-body-item">
                              {previewUrl.length == 0 ? (
                                <div>
                                  <label>
                                    {t('apperance.logo')}: <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    id="product-image"
                                    name="product-image"
                                    onChange={imageChange}
                                  />
                                </div>
                              ) : (
                                <div className="invoice-accept-btns">
                                  <button
                                    type="button"
                                    className="btn btn-danger p-2"
                                    onClick={() => setPreviewUrl('')}
                                    style={{ width: '100%', maxWidth: '100%' }}>
                                    <FontAwesomeIcon icon={faCancel} /> Cancel
                                  </button>
                                </div>
                              )}
                              <div className="form-group2">
                                <label>
                                  {t('apperance.whatsapp')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.whatsapp}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      en: { ...formObj?.en, whatsapp: e.target.value },
                                      whatsapp: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.instagram')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.instagram}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,

                                      en: { ...formObj?.en, instagram: e.target.value },
                                      instagram: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  {t('apperance.website')}: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj?.en?.website}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,

                                      en: { ...formObj?.en, website: e.target.value },
                                      website: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="invoice-settings-body"></div>
                              <button
                                type="button"
                                className="btn btn-primary p-2"
                                onClick={() => handleSave()}
                                style={{
                                  width: '100%',
                                  maxWidth: '100%',
                                  marginTop: '10px',
                                }}>
                                {t('apperance.save')}
                              </button>
                            </div>
                            <div className="appear-body-item">
                              <div className="preview-invoice-box">
                                {previewUrl.length > 0 ? (
                                  <img src={previewUrl} />
                                ) : (
                                  <img src={formObj.en.logo} />
                                )}
                                <div className="top-content"></div>

                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: '5px',
                                    borderBottom: '1px solid #eaeaea',
                                  }}>
                                  <div className="order-details-top-item">
                                    <div>{t('apperance.whatsapp')}</div>
                                    <div></div>
                                    <div>{formObj.en.whatsapp}</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: '5px',
                                    borderBottom: '1px solid #696969',
                                  }}>
                                  <div className="order-details-top-item">
                                    <div>{t('apperance.instagram')}</div>
                                    <div></div>
                                    <div>{formObj.en.instagram}</div>
                                  </div>
                                </div>
                                <div
                                  className="order-details-top"
                                  style={{
                                    marginTop: '5px',
                                    borderBottom: '1px solid #696969',
                                  }}>
                                  <div className="order-details-top-item">
                                    <div>{t('apperance.website')}</div>
                                    <div></div>
                                    <div>{formObj.en.website}</div>
                                  </div>
                                </div>
                                <div
                                  className="top-content"
                                  style={{
                                    marginTop: '20px',
                                    marginBottom: '20px',
                                  }}>
                                  <h6 className="text-primary">
                                    {formObj.en.footer}
                                    <br />
                                    {formObj.is_multi_language && formObj.ar.footer}
                                  </h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab>
              {/*  */}
            </Tabs>
          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
    </>
  );
};
export default withAuth(Appearance);
export async function getServerSideProps({ params, locale }) {
  const { id } = params;
  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}
