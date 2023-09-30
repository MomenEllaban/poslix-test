import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap';
import { apiFetch, apiInsert } from 'src/libs/dbUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faStreetView,
  faFolderOpen,
  faArrowAltCircleLeft,
  faGear,
  faDesktop,
  faChartPie,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { userDashboard } from '@models/common-model';
import Select, { StylesConfig } from 'react-select';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
const AddNewRole = (props: any) => {
  const [formObj, setFormObj] = useState({ isNew: true, name: '', stuff: '' });
  const [errorForm, setErrorForm] = useState({ name: false, stuff: false });
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(-1);
  const [pages, setPages] = useState<
    { value: string; label: string; stuffs: object[]; icon?: IconProp   }[]
  >([]);

  async function insertUpdateUsers() {
    let res;
    if (selectedRole > -1)
      res = await updateData('roles/update', selectedRole, {
        name: formObj.name,
        permissions,
      });
    else
      res = await createNewData('roles/store', {
        name: formObj.name,
        permissions,
      });
    props.setIsAddNew(false);
    props.initPage()
  }
  function handelChange(checked: boolean, value: string, name: string) {
    const perms = [...permissions]
    if(checked && perms.indexOf(value) < 0)
      perms.push(value)
    else perms.splice(perms.indexOf(value), 1)
    setPermissions([...perms])
  }

  var errors = [];
  const [fields, setFields] = useState<any>([])
  const [permissions, setPermissions] = useState([])
  const initPageData = async () => {
    const res = await findAllData('permissions');
    let finalRes: any = {}
    Object.keys(res.data.result).forEach(field => {
      let currentField: any = []
      if(field === 'customers')
        finalRes = {...finalRes, [field]: {[field]: [...res.data.result[field]]}}
      Object.keys(res.data.result[field]).forEach(role => {
        if(role === 'reports')
          finalRes = {...finalRes, reports: {...res.data.result[field][role]}}
        else if(Array.isArray(res.data.result[field][role])){
          if(currentField.length > 0) {
            finalRes = {...finalRes, [field]: {...finalRes[field], others: [...currentField]}}
          }
          finalRes = {...finalRes, [field]: {...finalRes[field], [role]: [...res.data.result[field][role]]}}
        }
        else currentField.push({...res.data.result[field][role]})
      })
    })
    delete finalRes.tailoring
    setFields(finalRes)
  }

  useEffect(() => {
    initPageData()
    if (props.index > -1) {
      setSelectedRole(props.selectedRole);
      setRoles(props.selectedStuff);
      setPermissions(props.selectedStuff)
      setFormObj({ ...props.stuffs[props.index], isNew: false, name: props.selectedName  });
    }
  }, []);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>{props.index > -1 ? 'Edit' : 'Add New'} Role</h5>
            </Card.Header>
            <Card.Body>
              <form className="form-style">
                <div className="col-md-12">
                  <div className="col-md-6">
                    <div>
                      <label>
                        Rule Name: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder=""
                        value={formObj.name!}
                        onChange={(e) => {
                          setFormObj({ ...formObj, name: e.target.value });
                        }}
                      />
                      {errorForm.name && <p className="p-1 h6 text-danger ">Enter Rule Name</p>}
                    </div>
                  </div>
                  <div className="row">
                    <form className="user-stuff-form">
                      <div className="col-sm-6 col-md-8 col-lg-6 col-cm-6">
                        <label>
                          Rules: <span className="text-danger">*</span>
                        </label>
                        <ul className="list-group">
                          {Object.keys(fields).map(key => {
                            return <>
                              <li className="list-group-item bg-primary">
                                <span>
                                  <FontAwesomeIcon icon={'page'} size="1x" /> {key.charAt(0).toUpperCase() + key.slice(1)}
                                </span>
                                <div className="checkbox-rols"></div>
                              </li>
                              {Object.keys(fields[key]).map(field => {
                                return <>
                                    <li className="list-group-item">
                                      {field !== 'others' && <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>}
                                      <div className="checkbox-rols flex-wrap">
                                        {fields[key][field].map(role => {
                                          return <>
                                            <div className="form-control" style={{ width: 'fit-content' }}>
                                              <input className="form-check-input me-1" type="checkbox"
                                                onClick={(e: any) => {
                                                  handelChange(e.target.checked, role.id, role);
                                                }}
                                                defaultChecked={props.selectedStuff.indexOf(role.id) > -1} />
                                              <label>{role.name}</label>
                                            </div>
                                          </>
                                        })}
                                      </div>
                                    </li>
                                  </>
                                }
                              )}
                            </>
                          })}
                        </ul>
                      </div>
                    </form>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn m-btn btn-primary p-2 mt-4 "
                  onClick={(e) => {
                    e.preventDefault();
                    errors = [];
                    if (formObj.name.length == 0) errors.push('error');

                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0 ? true : false,
                    });
                    if (errors.length == 0) {
                      insertUpdateUsers();
                    }
                  }}>
                  Save
                </button>
              </form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};
export default AddNewRole;
