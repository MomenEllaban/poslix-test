import { ICategory } from '@models/pos.types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
import useSWR from 'swr';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import storage from 'firebaseConfig';
import { generateUniqueString } from 'src/libs/toolsUtils';
import { useTranslation } from 'next-i18next';

const AddNewExpeness = ({
  shopId,
  setExpensesList,
  rows,
  setIsAddExpense,
  selectId,
  initData,
}: any) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [cats, setCategories] = useState<ICategory[]>([]);

  const [formObj, setFormObj] = useState<any>({
    id: 0,
    expense_id: 0,
    name: '',
    amount: 0,
    date: new Date(),
    category_id: '',
    file: File,
  });
  const [cateData, setCateData] = useState<{ id: number; label: string; value: number }[]>([]);
  const [errorForm, setErrorForm] = useState({ expense_id: false, name: false, amount: false });
  const colourStyles = { control: (style: any) => ({ ...style, borderRadius: '10px' }) };
  const { isLoading, mutate } = useSWR(
    !!shopId ? `expenses-categories/${shopId}` : null,

    findAllData,
    {
      revalidateOnFocus: true,

      onSuccess: ({ data }, key, config) => {
        const _categories = data.result;

        setCategories(_categories);
      },
    }
  );

  const uploadImage = async (img) => {
    const storageRef = ref(storage, `/files/logo/${generateUniqueString(12)}${shopId}`);
    const uploadTask = uploadBytesResumable(storageRef, img);
    const snapshot = await uploadTask;
    const url = await getDownloadURL(snapshot.ref);
    return url;
  };

  async function addExpense() {
    const image = await uploadImage(formObj.file);
    delete formObj.file;
    delete formObj.path;
    if (router.query.id) {
      const res = await createNewData(`expenses/${router.query.id}`, { ...formObj, image });
      if (res.data.success || res.data.status == 201) {
        Toastify('success', 'Successfully created');
        initData();
        setIsAddExpense(false);
      }
    }
  }
  async function editEpense() {
    const image = await uploadImage(formObj.file);
    delete formObj.file;
    const res = await updateData('expenses/update-expense', selectId, { ...formObj, image });
    if (res.data.success) {
      initData();
      setIsAddExpense(false);
    }
  }
  var errors = [];
  useEffect(() => {
    const _categoriesData = cats?.map((c) => ({ id: c.id, label: c.name, value: c.id }));
    setCateData(_categoriesData);
    if (selectId > 0) {
      let _i = rows.findIndex((rw: any) => rw.id == selectId);
      if (_i > -1)
        setFormObj({
          amount: rows[_i].amount,
          date: rows[_i].date.length > 0 ? new Date(rows[_i].date) : new Date(),
          expense_id: rows[_i].expense_id,
          id: rows[_i].id,
          category_id: rows[_i].expense_category.id,
          name: rows[_i].name,
          path: rows[_i].path,
        });
    }
  }, [cats]);

  return (
    <>
      <form className="form-style">
        <div className="col-md-12">
          <div className="col-md-6">
            <div className="form-group2">
              <label>
                {t('expenses.category_expense')}: <span className="text-danger">*</span>
              </label>
              <Select
                styles={colourStyles}
                options={cateData}
                isLoading={isLoading}
                value={cateData.filter((f: any) => +f.value === +formObj.expense_id)}
                onChange={(itm: any) => {
                  setFormObj({ ...formObj, expense_id: itm!.value, category_id: itm!.value });
                }}
              />
              {errorForm.expense_id && <p className="p-1 h6 text-danger ">Select Category</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>
               {t('expenses.name')}: <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder=""
                value={formObj.name}
                min={0}
                step={0.1}
                onChange={(e) => {
                  setFormObj({ ...formObj, name: e.target.value });
                }}
              />
              {errorForm.name && <p className="p-1 h6 text-danger ">Enter Name</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>
                {t('expenses.amount')}: <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                placeholder=""
                value={formObj.amount}
                min={0}
                step={0.1}
                onChange={(e) => {
                  setFormObj({ ...formObj, amount: Number(e.target.value) });
                }}
              />
              {errorForm.name && <p className="p-1 h6 text-danger ">Enter Amount</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>{t('expenses.date')}:</label>
              <DatePicker
                className="form-control p-2"
                selected={formObj.date}
                onChange={(date: Date) => setFormObj({ ...formObj, date: date })}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>{t('expenses.attach')}:</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFormObj({ ...formObj, file: e.target.files[0] })}
              />
            </div>
          </div>
          {formObj?.path && !formObj.file && (
            <img
              src={formObj.path}
              style={{ width: '200px', height: '200px', objectFit: 'contain' }}
            />
          )}
        </div>
        <br />
        <button
          type="button"
          className="btn m-btn btn-primary p-2 "
          onClick={(e) => {
            e.preventDefault();
            errors = [];
            if (formObj.expense_id == 0) errors.push('id');
            if (formObj.name.length <= 1) errors.push('name');
            if (formObj.amount == 0) errors.push('amount');
            setErrorForm({
              ...errorForm,
              expense_id: formObj.expense_id == 0,
              name: formObj.name.length <= 1,
              amount: formObj.amount == 0,
            });
            if (errors.length == 0) {
              if (selectId > 0) editEpense();
              else addExpense();
            } else Toastify('error', 'Fix The Error Fist');
            // editExpenses();
          }}>
          {selectId > 0 ? t('expenses.edit') : t('expenses.add')}
        </button>
      </form>
      <hr />
    </>
  );
};
export default AddNewExpeness;
