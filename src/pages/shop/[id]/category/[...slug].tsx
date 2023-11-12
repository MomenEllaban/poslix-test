import { AdminLayout } from '@layout';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/dist/client/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { useTranslation } from 'next-i18next';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';

const CategorySlug: NextPage = (props: any) => {
  const { editId, id } = props;
  const { t } = useTranslation();
  const [shopId, setShopId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formObj, setFormObj] = useState({
    id: 0,
    name: '',
    description: 'category description',
    tax_id: null,
  });
  const [errorForm, setErrorForm] = useState({ name: false });
  const colourStyles = {
    control: (style: any) => ({ ...style, borderRadius: '10px' }),
  };
  const [taxGroup, setTaxGroup] = useState<{ value: number; label: string }[]>([]);
  const [selectedTax, setSelectedTax] = useState();
  const [type, setType] = useState('categories');
  const [typeName, setTypeName] = useState('Category');

  const [isEdit, setIsEdit] = useState(false);

  const router = useRouter();
  let formObjRef = useRef<any>();
  formObjRef.current = formObj;

  async function initDataPage() {
    if (router.isReady) {
      setType(router.query.type.toString());
      setTypeName(router.query.type === 'categories' ? 'Category' : 'Brand');
      setShopId(router.query.id.toString());
      const routerParams = router.query.slug;
      const res = await findAllData(`taxes/${router.query.id}`);
      res.data.result.taxes.map((tax) => (tax.label = tax.name));
      setTaxGroup(res.data.result.taxes);
      setSelectedTax(
        res.data.result.taxes.filter((f: any) => {
          return f.id == formObj.tax_id;
        })
      );
      if (routerParams[0] === 'edit') {
        setIsEdit(true);
        const res = await findAllData(`${router.query.type}/${routerParams[1]}/show`);
        const itm = res.data.result;
        itm.tax_id = itm.tax_id == 0 ? null : itm.tax_id;
        setFormObj({
          ...formObj,
          id: itm.id,
          name: itm.name,
          description: itm.description,
          tax_id: itm.never_tax == 1 ? -1 : itm.tax_id,
        });
      }
    }
    setLoading(false);
    // setTaxGroup([
    //   { value: null, label: 'Default Tax' },
    //   { value: -1, label: 'Never Tax' },
    //   ...newdata.taxes,
    // ]);
  }

  async function insertHandle() {
    setLoading(true);
    const data = formObjRef.current;
    delete data.id;
    const res = await createNewData(`${type}/${router.query.id}`, data);
    if (res.data.success || res.data.status === 201) {
      Toastify('success', 'successfuly added');
      setTimeout(() => {
        router.push('/shop/' + shopId + '/category');
      }, 1000);
    } else {
      alert('Has Error ,try Again');
    }
    setLoading(false);
  }
  async function editHandle() {
    setLoading(true);

    const res = await updateData(`${type}`, router.query.slug[1], formObjRef.current);
    if (res.data.success) {
      Toastify('success', 'successfuly added');
      setTimeout(() => {
        router.push('/shop/' + shopId + '/category');
      }, 1000);
    } else {
      alert('Has Error ,try Again');
    }
    setLoading(false);
  }

  let errors = [];

  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  return (
    <AdminLayout shopId={shopId}>
      <ToastContainer />
      <div className="row">
        <div className="mb-4">
          <Link
            className="btn btn-primary p-3"
            href={'/shop/' + shopId + '/category'}
            onClick={(e) => {
              e.preventDefault();
              router.push('/shop/' + shopId + '/category');
            }}>
            {t('category.back_to_list')}
          </Link>
        </div>
      </div>
      <Card className="mb-4">
        <Card.Header className="p-3 bg-white">
          <h5>
            {isEdit
              ? typeName === 'Category'
                ? t('category.edit_category')
                : t('category.edit_brand')
              : typeName === 'Category'
              ? t('category.add_new_category')
              : t('category.add_new_brand')}
          </h5>
        </Card.Header>
        <Card.Body>
          {!loading ? (
            <form className="form-style">
              <div className="form-group2">
                <label>
                  {t('category.name')}: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('category.enter_name')}
                  value={formObj.name}
                  onChange={(e) => {
                    setFormObj({ ...formObj, name: e.target.value });
                  }}
                />
                {errorForm.name && <p className="p-1 h6 text-danger ">Enter {typeName} name</p>}
              </div>
              <div className="row">
                <div className="form-group">
                  <label>{t('category.description')}:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('category.description')}
                    value={formObj.description}
                    onChange={(e) => {
                      setFormObj({ ...formObj, description: e.target.value });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>{t('category.custom_tax')} :</label>
                  <Select
                    // styles={colourStyles}
                    options={taxGroup}
                    value={selectedTax || undefined}
                    onChange={(itm) => {
                      console.log(itm);
                      setSelectedTax(itm);
                      setFormObj({ ...formObj, tax_id: itm?.id });
                    }}
                  />
                </div>
              </div>
              <br />
              <button
                type="button"
                disabled={loading}
                className="btn m-btn btn-primary p-2 "
                onClick={(e) => {
                  e.preventDefault();
                  errors = [];

                  if (loading) return Toastify('warning', 'There is a current process');

                  if (formObj.name.length == 0) errors.push('error');

                  setErrorForm({
                    ...errorForm,
                    name: formObj.name.length == 0 ? true : false,
                  });
                  if (errors.length == 0) {
                    isEdit ? editHandle() : insertHandle();
                  } else alert('Enter Required Field');
                }}>
                {isEdit ? t('category.edit') : t('category.save')}
              </button>
            </form>
          ) : (
            <div className="d-flex justify-content-around">
              <Spinner animation="grow" />
            </div>
          )}
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};
export default withAuth(CategorySlug);
export async function getServerSideProps({ locale }) {
  return {
    props: { ...(await serverSideTranslations(locale)) },
  };
}
