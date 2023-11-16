import { faAdd, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import useSWR from 'swr';
import { useTranslation } from 'next-i18next';


export default function ExpensesCategoriesView() {
  const router = useRouter();
  const shopId = router.query.id;
  const { t } = useTranslation();
  const [show, setShow] = useState(-1);

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catPermissions, setCatPermissions] = useState<any>();

  const { isLoading, mutate } = useSWR(
    !!shopId ? [`expenses-categories/${shopId}`, catPermissions] : null,
    ([url]) => findAllData(url),
    {
      revalidateOnFocus: true,

      onSuccess: ({ data }, key, config) => {
        const _categories = data.result;
        if (catPermissions?.hasInsert) _categories.push({ id: 0, name: '', isNew: true });
        setCategories(_categories);
      },
    }
  );

  const handleDeleteCategory = (_id) => {
    setIsDeleteLoading(true);
    api
      .delete(`expenses-categories/${_id}`)
      .then(() => {
        Toastify('success', 'Category deleted successfully!');
        mutate();
      })
      .catch(() => {
        Toastify('error', 'Something went wrong, please try again later!');
      })
      .finally(() => {
        setIsDeleteLoading(false);
      });
  };
  const handleEditCategory = (_id) => {
    setIsEditLoading(true);
    const _category = categories.find((cat) => cat.id === _id);

    if (!_category) {
      Toastify('error', 'Please refresh the page and try again!');
      return setIsEditLoading(false);
    }

    api
      .put(`expenses-categories/${_id}`, {
        ..._category,
      })
      .then(() => {
        Toastify('success', 'Category updated successfully!');
        mutate();
      })
      .catch(() => {
        Toastify('error', 'Something went wrong, please try again later!');
      })
      .finally(() => {
        setIsEditLoading(false);
      });
  };

  const handleAddCategory = (text) => {
    setIsAddLoading(true);

    api
      .post(`expenses-categories/${shopId}`, {
        name: text,
      })
      .then(() => {
        Toastify('success', 'Category added successfully!');
        mutate();
      })
      .catch(() => {
        Toastify('error', 'Something went wrong, please try again later!');
      })
      .finally(() => {
        setIsAddLoading(false);
      });
  };

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => +loc.id == +shopId
    );

    const getCatPermissions = {
      hasCategories: false,
      hasView: false,
      hasInsert: false,
      hasEdit: false,
      hasDelete: false,
    };

    perms[0].permissions.forEach((perm) =>
      perm.name.includes('expense-category/show')
        ? (getCatPermissions.hasCategories = true)
        : perm.name.includes('expense-category/show')
        ? (getCatPermissions.hasView = true)
        : perm.name.includes('expense-category/update')
        ? (getCatPermissions.hasEdit = true)
        : perm.name.includes('expense-category/add')
        ? (getCatPermissions.hasInsert = true)
        : perm.name.includes('expense-category/delete')
        ? (getCatPermissions.hasDelete = true)
        : null
    );

    setCatPermissions(getCatPermissions);
  }, []);

  return (
    <Card>
      <Card.Header className="p-3 bg-white">
        <h5>{t('expenses.category_list')}</h5>
      </Card.Header>
      <Card.Body className="table-responsive text-nowrap">
        {!isLoading ? (
          <Table responsive>
            <thead className="thead-dark">
              <tr>
                <th style={{ width: '6%' }}>#</th>
                <th>{t('expenses.name')}</th>
                <th>{t('expenses.action')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category: any, i: number) => {
                return (
                  <tr
                    key={category.id || `new-category-${i}`}
                    style={{ background: category.isNew ? '#c6e9e683' : '' }}>
                    <th scope="row">{i + 1}</th>
                    <td>
                      <input
                        type="text"
                        disabled={!catPermissions.hasInsert}
                        name="tax-name"
                        className="form-control p-2"
                        placeholder={t('expenses.new_category_name')}
                        value={category.name}
                        onChange={(e) => {
                          setCategories((list) => {
                            list[i].name = e.target.value;

                            return [...list];
                          });
                          // handleInputChange(e, i);
                        }}
                      />
                    </td>
                    <td>
                      <ButtonGroup>
                        {catPermissions.hasInsert && (
                          <Button
                            variant={category.isNew ? 'outline-success' : 'outline-info'}
                            disabled={isEditLoading || isAddLoading}
                            onClick={() => {
                              if (category.isNew) {
                                handleAddCategory(category.name);
                                // adding
                                return;
                              }
                              // editing
                              handleEditCategory(category.id);
                            }}>
                            {category.isNew ? (
                              <FontAwesomeIcon icon={faAdd} />
                            ) : (
                              <FontAwesomeIcon icon={faEdit} />
                            )}
                          </Button>
                        )}
                        {catPermissions.hasDelete && (
                          <>
                            <Button
                              variant="outline-danger"
                              disabled={category.isNew || isDeleteLoading}
                              onClick={() => {
                                if (category.isNew) return;
                                setShow(category.id);
                              }}>
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                            <ConfirmationModal
                              loading={isDeleteLoading}
                              onClose={() => setShow(-1)}
                              onConfirm={() => handleDeleteCategory(category.id)}
                              message={t('alert_dialog.delete_category')}
                              show={category.id === show}
                            />
                          </>
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
  );
}
