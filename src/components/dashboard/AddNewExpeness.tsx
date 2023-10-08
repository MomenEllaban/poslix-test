import { IExpenseList } from '@models/common-model';
import { ICategory } from '@models/pos.types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
import useSWR from 'swr';

const AddNewExpeness = ({
  shopId,
  setExpensesList,
  rows,

  setIsAddExpense,
  selectId,
}: any) => {
  const router = useRouter();
  const [cats, setCategories] = useState<ICategory[]>([]);

  const [formObj, setFormObj] = useState<any>({
    id: 0,
    expense_id: 0,
    name: '',
    amount: 0,
    date: new Date(),
    category_id: '',
    file: File
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
  async function addExpense() {
    const formData = new FormData()
    formData.append('id', formObj.id)
    formData.append('name', formObj.name)
    formData.append('amount', formObj.amount)
    formData.append('category_id', formObj.category_id)
    formData.append('date', formObj.date)
    formData.append('file', formObj.file)
    if (router.query.id) {
      const res = await createNewData(`expenses/${router.query.id}`, formData);
      console.log(res);
      if (res.data.success || res.data.status == 201) {
        Toastify('success', 'Successfully created');
        let _rows = [...rows];
        _rows.push({
          id: res.data.result.id,
          name: formObj.name,
          category: formObj.category_id,
          amount: formObj.amount,
          date: formObj.date,
        });
        setExpensesList(_rows);
        setIsAddExpense(false);
      }
    }
  }
  async function editEpense() {
    console.log(formObj);

    const res = await updateData('expenses', selectId, formObj);
    if (res.data.success) {
      let _i = rows.findIndex((rw: any) => rw.id == selectId);
      if (_i > -1) {
        let _rows = [...rows];
        _rows[_i].name = formObj.name;
        _rows[_i].category = formObj.category_id;
        _rows[_i].amount = formObj.amount;
        _rows[_i].date = formObj.date;
        setExpensesList(_rows);
      }

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
          category_id: rows[_i].category,
          name: rows[_i].name,
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
                Category Expense: <span className="text-danger">*</span>
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
                Name: <span className="text-danger">*</span>
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
                Amount: <span className="text-danger">*</span>
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
              <label>Date:</label>
              <DatePicker
                className="form-control p-2"
                selected={formObj.date}
                onChange={(date: Date) => setFormObj({ ...formObj, date: date })}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>Attach:</label>
              <input type="file" className="form-control" onChange={(e) => setFormObj({ ...formObj, file: e.target.files[0] })} />
            </div>
          </div>
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
          {selectId > 0 ? 'Edit' : 'Add'}
        </button>
      </form>
      <hr />
    </>
  );
};
export default AddNewExpeness;
