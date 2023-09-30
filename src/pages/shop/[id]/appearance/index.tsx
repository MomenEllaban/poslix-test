import { faCancel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ITokenVerfy, IinvoiceDetails } from '@models/common-model';
import { defaultInvoiceDetials } from '@models/data';
import * as cookie from 'cookie';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import storage from 'firebaseConfig';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, Form, Tab, Tabs } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import { Toastify } from 'src/libs/allToasts';
import { generateUniqueString } from 'src/libs/toolsUtils';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { apiFetchCtr, apiUpdateCtr } from '../../../../libs/dbUtils';
import { createNewData, findAllData } from 'src/services/crud.api';
import withAuth from 'src/HOCs/withAuth';

const Appearance: NextPage = (props: any) => {
  const { shopId, id } = props;
  const router = useRouter();
  const [key, setKey] = useState('Recipt');
  const [formObj, setFormObj] = useState<IinvoiceDetails>(defaultInvoiceDetials);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  const [img, setImg] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  async function initDataPage() {
    const res = await findAllData(`appearance/${router.query.id}`)
    if (!res.data.success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    setFormObj({ ...formObj, ...res.data.result });
    // if (res.data.result.details != undefined && res.data.result.details != null && res.data.result.details.length > 10) {
    //   const _data= JSON.parse(res.data.details);
    // }
    setIsLoading(false);
  }
  async function editInvoice(url = '0') {
    if (isLoading) return;
    setIsLoading(true);
    const res = await createNewData(`appearance`, {...formObj, location_id: router.query.id})
    if (!res.data.success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    setIsLoading(false);
    setPreviewUrl('');
    Toastify('success', 'successfully updated');
  }
  const imageChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };
  useEffect(() => {
    if(router.query.id) initDataPage();
  }, [router.asPath]);

  useEffect(() => {
    handleUpload()
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
    if(previewUrl === '') delete formObj.logo
    editInvoice();
  };
  async function handleUpload() {
    if (previewUrl.length < 2) {
      console.log('hey')
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
            console.log(url)
            setFormObj({ ...formObj, logo: url });
            // editInvoice(url);
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
              <Tab eventKey="Recipt" title="Receipt">
                <div className="row">
                  <div className="col-md-12">
                    <Card>
                      <Card.Header className="p-3 bg-white">
                        <h5>Print Receipt</h5>
                        <div className="appear-toolbar">
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          'loading...'
                        ) : (
                          <div className="appear-body">
                            <div className="appear-body-item">
                              {previewUrl.length == 0 ? (
                                <div>
                                  <label>
                                    Your Logo: <span className="text-danger">*</span>
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
                                  Business Name: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.name}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      name: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  Phone: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.tell}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      tell: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Customer: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtCustomer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtCustomer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order No: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.orderNo}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      orderNo: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order Date: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtDate}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtDate: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Qty: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtQty}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtQty: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Item: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtItem}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtItem: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Amount: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtAmount}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtAmount: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Tax: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTax}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTax: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Total: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTotal}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTotal: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Footer: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.footer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      footer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="invoice-settings-body">
                                <div className="invoice-settings-item">
                                  <div>Enable Multi Language</div>
                                  <div>
                                    <Form.Check
                                      type="switch"
                                      className="custom-switch"
                                      checked={formObj.isMultiLang}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          isMultiLang: !formObj.isMultiLang,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {formObj.isMultiLang && (
                                <>
                                  <div className="form-group2">
                                    <label>
                                      Customer: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtCustomer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtCustomer2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order No: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.orderNo2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          orderNo2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order Date: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.txtDate2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtDate2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Qty: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtQty2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtQty2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Item: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtItem2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtItem2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Amount: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtAmount2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtAmount2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Tax: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTax2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTax2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Total: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTotal2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTotal2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Footer: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.footer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          footer2: e.target.value,
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
                                Save
                              </button>
                            </div>
                            <div className="appear-body-item">
                              <div className="preview-invoice-box">
                                {previewUrl.length > 0 ? (
                                  <img src={previewUrl} />
                                ) : (
                                  <img src={formObj.logo} />
                                )}
                                <div className="top-content">
                                  <h6 className="text-primary">{formObj.name}</h6>
                                  <h6 className="text-primary">{formObj.tell}</h6>
                                </div>
                                <div className="order-details-top">
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.txtCustomer}{' '}
                                      {formObj.isMultiLang && formObj.txtCustomer2}
                                    </div>
                                    <div>Walk-in-customer</div>
                                  </div>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.orderNo} {formObj.isMultiLang && formObj.orderNo2}
                                    </div>
                                    <div>1518</div>
                                  </div>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.txtDate} {formObj.isMultiLang && formObj.txtDate2}
                                    </div>
                                    <div>2023-03-31</div>
                                  </div>
                                </div>
                                <div className="order-details-top" style={{ marginTop: '5px' }}>
                                  <div className="order-details-top-item">
                                    <div>
                                      {formObj.txtQty} {formObj.isMultiLang && formObj.txtQty2}
                                    </div>
                                    <div>
                                      {formObj.txtItem} {formObj.isMultiLang && formObj.txtItem2}
                                    </div>
                                    <div>
                                      {formObj.txtAmount}{' '}
                                      {formObj.isMultiLang && formObj.txtAmount2}
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
                                      {formObj.txtTax} {formObj.isMultiLang && formObj.txtTax2}
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
                                      {formObj.txtTotal} {formObj.isMultiLang && formObj.txtTotal2}
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
                                    {formObj.footer}
                                    <br />
                                    {formObj.isMultiLang && formObj.footer2}
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
              <Tab eventKey="Invoice" title="Invoice A4">
                <div className="row">
                  <div className="col-md-12">
                    <Card>
                      <Card.Header className="p-3 bg-white">
                        <h5>Print Invoice</h5>
                        <div className="appear-toolbar">
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                          <div className="toolitem"></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          'loading...'
                        ) : (
                          <div className="appear-body">
                            <div className="appear-body-item">
                              {previewUrl.length == 0 ? (
                                <div>
                                  <label>
                                    Your Logo: <span className="text-danger">*</span>
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
                                  Business Name: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.name}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      name: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="form-group2">
                                <label>
                                  Phone: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.tell}
                                  min={0}
                                  step={0.1}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      tell: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Customer: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtCustomer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtCustomer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order No: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.orderNo}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      orderNo: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Order Date: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtDate}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtDate: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Qty: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtQty}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtQty: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Item: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtItem}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtItem: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Amount: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtAmount}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtAmount: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Tax: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTax}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTax: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Total: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.txtTotal}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      txtTotal: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="form-group2">
                                <label>
                                  Footer: <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formObj.footer}
                                  onChange={(e) => {
                                    setFormObj({
                                      ...formObj,
                                      footer: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="invoice-settings-body">
                                <div className="invoice-settings-item">
                                  <div>Enable Multi Language</div>
                                  <div>
                                    <Form.Check
                                      type="switch"
                                      className="custom-switch"
                                      checked={formObj.isMultiLang}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          isMultiLang: !formObj.isMultiLang,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {formObj.isMultiLang && (
                                <>
                                  <div className="form-group2">
                                    <label>
                                      Customer: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtCustomer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtCustomer2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order No: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.orderNo2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          orderNo2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Order Date: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder=""
                                      value={formObj.txtDate2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtDate2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Qty: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtQty2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtQty2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Item: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtItem2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtItem2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Amount: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtAmount2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtAmount2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Tax: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTax2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTax2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Total: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.txtTotal2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          txtTotal2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="form-group2">
                                    <label>
                                      Footer: <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={formObj.footer2}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          footer2: e.target.value,
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
                                Save
                              </button>
                            </div>
                            <div className="appear-body-item a4">
                              <div className="bill2">
                                <div className="brand-logo">
                                  <img src={formObj.logo} />
                                  <div className="invoice-print">
                                    INVOICE
                                    <div>
                                      <table className="GeneratedTable">
                                        <tbody>
                                          <tr>
                                            <td className="td_bg">INVOICE NUMBER </td>
                                            <td>{formObj.orderNo}</td>
                                          </tr>
                                          <tr>
                                            <td className="td_bg">INVOICE DATE </td>
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
                                    <div>Billed From</div>
                                    <div>{formObj.name}</div>
                                    <div>info@poslix.com</div>
                                    <div>{formObj.tell}</div>
                                    <div>Office 21-22, Building 532, Mazoon St. Muscat, Oman</div>
                                    <div>VAT Number: OM1100270001</div>
                                  </div>
                                  <div className="right_up_of_table">
                                    <div>Billed To</div>
                                    <div>{formObj.txtCustomer}</div>
                                    {/* <span>Billed To</span> */}
                                  </div>
                                </div>
                                <br />

                                <table className="GeneratedTable2">
                                  <thead>
                                    <tr>
                                      <th>Description</th>
                                      <th>
                                        {' '}
                                        {formObj.txtQty}
                                        <br />
                                        {formObj.isMultiLang && formObj.txtQty2}
                                      </th>
                                      <th>Unit Price</th>
                                      {/* <th> {invoicDetails.txtItem}<br />{invoicDetails.isMultiLang && invoicDetails.txtItem2}</th> */}
                                      <th>Tax</th>
                                      <th>
                                        {' '}
                                        {formObj.txtAmount}
                                        <br />
                                        {formObj.isMultiLang && formObj.txtAmount2}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      {/* <td>{invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}</td> */}
                                      <td colSpan={4} className="txt_bold_invoice">
                                        Sub Total
                                      </td>
                                      <td></td>
                                    </tr>
                                    <tr>
                                      <td colSpan={4} className="txt_bold_invoice">
                                        Total
                                      </td>
                                      <td className="txt_bold_invoice">
                                        {formObj.txtTotal}{' '}
                                        {formObj.isMultiLang && formObj.txtTotal2}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                <p className="recipt-footer">
                                  {formObj.footer}

                                  {formObj.isMultiLang && formObj.footer2}
                                </p>
                                {/* <p className="recipt-footer">{formObj.notes}</p> */}
                                <br />
                              </div>

                              {/* <div className="preview-invoice-box">
                                            {previewUrl.length > 0 ? <img src={previewUrl} /> : <img src={formObj.logo} />}
                                            <div className='top-content'>
                                                <h6 className='text-primary'>{formObj.name}</h6>
                                                <h6 className='text-primary'>{formObj.tell}</h6>
                                            </div>
                                            <div className='order-details-top'>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.txtCustomer} {formObj.isMultiLang && formObj.txtCustomer2}</div>
                                                    <div>Walk-in-customer</div>
                                                </div>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.orderNo} {formObj.isMultiLang && formObj.orderNo2}</div>
                                                    <div>1518</div>
                                                </div>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.txtDate} {formObj.isMultiLang && formObj.txtDate2}</div>
                                                    <div>2023-03-31</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px' }}>
                                                <div className="order-details-top-item">
                                                    <div>{formObj.txtQty} {formObj.isMultiLang && formObj.txtQty2}</div><div>{formObj.txtItem} {formObj.isMultiLang && formObj.txtItem2}</div><div>{formObj.txtAmount} {formObj.isMultiLang && formObj.txtAmount2}</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #eaeaea' }}>
                                                <div className="order-details-top-item">
                                                    <div>1</div><div>Product Name 1</div><div>5.000</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #eaeaea' }}>
                                                <div className="order-details-top-item">
                                                    <div>1</div><div>Product Name 2</div><div>4.000</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #696969' }}>
                                                <div className="order-details-top-item">
                                                    <div></div><div>{formObj.txtTax} {formObj.isMultiLang && formObj.txtTax2}</div><div>0.540</div>
                                                </div>
                                            </div>
                                            <div className='order-details-top' style={{ marginTop: '5px', borderBottom: '1px solid #696969' }}>
                                                <div className="order-details-top-item">
                                                    <div></div><div>{formObj.txtTotal} {formObj.isMultiLang && formObj.txtTotal2}</div><div>9.540</div>
                                                </div>
                                            </div>
                                            <div className='top-content' style={{ marginTop: '20px', marginBottom: '20px' }}>
                                                <h6 className='text-primary'>{formObj.footer}<br />{formObj.isMultiLang && formObj.footer2}</h6>
                                            </div>
                                        </div> */}
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab>
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
export async function getServerSideProps({ params }) {
  const { id } = params
  return {
    props: {id},
  }
}