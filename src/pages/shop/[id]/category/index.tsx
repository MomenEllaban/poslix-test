import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import { faTrash, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { apiFetchCtr } from '../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import * as cookie from 'cookie';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { ITokenVerfy } from '@models/common-model';
import { Toastify } from 'src/libs/allToasts';
import withAuth from 'src/HOCs/withAuth';
import { findAllData } from 'src/services/crud.api';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { NextPage } from 'next';

const Category: NextPage = ({ id }: any) => {
  const { t } = useTranslation();
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [shopId, setShopId] = useState('');
  const [type, setType] = useState('');
  const [selectId, setSelectId] = useState(0);
  const [key, setKey] = useState('categories');
  const [isloading, setIsloading] = useState(true);

  async function initDataPage() {
    if (router.isReady) {
      setShopId(router.query.id.toString());
      const resCategories = await findAllData(`categories/${router.query.id}`);
      const resBrands = await findAllData(`brands/${router.query.id}`);
      if (resCategories.data.success) {
        setCats(resCategories.data.result);
      }
      if (resBrands.data.success) {
        setBrands(resBrands.data.result);
      }
      setIsloading(false);
    }
  }
  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  const [categoryPermissions, setCategoryPermissions] = useState<any>();
  const [brandPermissions, setBrandPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getCategoryPermissions = {
      hasView: false,
      hasInsert: false,
      hasEdit: false,
      hasDelete: false,
    };
    const getBrandPermissions = {
      hasView: false,
      hasInsert: false,
      hasEdit: false,
      hasDelete: false,
    };
    perms[0]?.permissions.map((perm) =>
      perm.name.includes('categories/view')
        ? (getCategoryPermissions.hasView = true)
        : perm.name.includes('categories/add')
        ? (getCategoryPermissions.hasInsert = true)
        : perm.name.includes('categories/update')
        ? (getCategoryPermissions.hasEdit = true)
        : perm.name.includes('categories/delete')
        ? (getCategoryPermissions.hasDelete = true)
        : null
    );
    perms[0]?.permissions.map((perm) =>
      perm.name.includes('brands/view')
        ? (getBrandPermissions.hasView = true)
        : perm.name.includes('brands/add')
        ? (getBrandPermissions.hasInsert = true)
        : perm.name.includes('brands/update')
        ? (getBrandPermissions.hasEdit = true)
        : perm.name.includes('brands/delete')
        ? (getBrandPermissions.hasDelete = true)
        : null
    );

    setCategoryPermissions(getCategoryPermissions);
    setBrandPermissions(getBrandPermissions);
  }, [router.asPath]);
  return (
    <>
      <AdminLayout shopId={id}>
        <AlertDialog
          alertShow={show}
          alertFun={(e: boolean) => {
            setShow(false);
            Toastify('success', 'successfuly Done!');
            initDataPage();
          }}
          id={selectId}
          expenses={cats}
          url={type}>
          {t('alert_dialog.delete_msg')}
        </AlertDialog>
        <div className="row">
          {!isloading && (categoryPermissions.hasInsert || brandPermissions.hasInsert) && (
            <div className="mb-4">
              <button
                className="btn btn-primary p-3"
                onClick={() => {
                  if (key === 'categories' && categoryPermissions.hasInsert)
                    router.push({
                      pathname: '/shop/' + id + '/category/add',
                      query: { type: 'categories' },
                    });
                  else if (key === 'brands' && brandPermissions.hasInsert)
                    router.push({
                      pathname: '/shop/' + id + '/category/add',
                      query: { type: 'brands' },
                    });
                  else Toastify('error', 'Error On Add New');
                }}>
                <FontAwesomeIcon icon={faPlus} />
                {key === 'categories' ? t('category.add_category') : t('category.add_brand')}{' '}
              </button>
            </div>
          )}
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k: any) => setKey(k)}
            className="mb-3 p-3">
            <Tab eventKey="categories" title={t('category.categories')}>
              <Card>
                <Card.Header className="p-3 bg-white">
                  <h5>{t('category.categories_list')}</h5>
                </Card.Header>
                <Card.Body className="table-responsive text-nowrap">
                  {!isloading ? (
                    <Table className="table table-hover" responsive>
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: '6%' }}>#</th>
                          <th>{t('category.name')}</th>
                          <th>{t('category.tax')}</th>
                          <th>{t('category.action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cats.map((ex: any, i: number) => {
                          return (
                            <tr key={i} className="td-style-table">
                              <th scope="row">{ex.id}</th>
                              <td>{ex.name}</td>
                              <td>{ex.tax_name}</td>
                              <td>
                                <ButtonGroup className="mb-2 m-buttons-style">
                                  {categoryPermissions.hasEdit && (
                                    <Button
                                      onClick={() =>
                                        router.push({
                                          pathname: '/shop/' + id + '/category/edit/' + ex.id,
                                          query: { type: 'categories' },
                                        })
                                      }>
                                      <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                  )}
                                  {categoryPermissions.hasDelete && (
                                    <Button
                                      onClick={() => {
                                        setSelectId(ex.id);
                                        setShow(true);
                                        setType('categories');
                                      }}>
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  )}
                                </ButtonGroup>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="d-flex justify-content-around">
                      <Spinner animation="grow" />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="brands" title={t('category.brands')}>
              <Card>
                <Card.Header className="p-3 bg-white">
                  <h5>{t('category.brands_list')}</h5>
                </Card.Header>
                <Card.Body className="table-responsive text-nowrap">
                  {!isloading ? (
                    <Table className="table table-hover" responsive>
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: '6%' }}>#</th>
                          <th>{t('category.name')}</th>
                          <th>{t('category.tax')}</th>
                          <th>{t('category.action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brands.map((ex: any, i: number) => {
                          return (
                            <tr key={i} className="td-style-table">
                              <th scope="row">{ex.id}</th>
                              <td
                                style={{
                                  color: ex.tax_name != null || ex.never_tax == 1 ? '#eb8181' : '',
                                }}>
                                {ex.name}
                              </td>
                              <td>{ex.tax_name}</td>
                              <td>
                                <ButtonGroup className="mb-2 m-buttons-style">
                                  {brandPermissions.hasEdit && (
                                    <Button
                                      onClick={() =>
                                        router.push({
                                          pathname: '/shop/' + id + '/category/edit/' + ex.id,
                                          query: { type: 'brands' },
                                        })
                                      }>
                                      <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                  )}
                                  {brandPermissions.hasDelete && (
                                    <Button
                                      onClick={() => {
                                        setSelectId(ex.id);
                                        setShow(true);
                                        setType('brands');
                                      }}>
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  )}
                                </ButtonGroup>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="d-flex justify-content-around">
                      <Spinner animation="grow" />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
};
export default withAuth(Category);
export async function getServerSideProps({ params, locale }) {
 const { id } = params;
  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}
