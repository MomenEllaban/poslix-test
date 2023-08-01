import type { NextPage } from 'next'
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';
import { faTrash, faFloppyDisk, faPlus, faEye, faSpinner, faEdit, faSave } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonGroup, Card } from 'react-bootstrap'
import React, { useState, useEffect, useContext, useRef } from 'react'
import AlertDialog from 'src/components/utils/AlertDialog';
import AddGroupModal from 'src/components/utils/AddGroupModal';
import ShowDialog from 'src/components/utils/ShowDialog';
import { ITax, ITokenVerfy } from '@models/common-model';
import { apiFetch, apiFetchCtr, apiInsertCtr } from 'src/libs/dbUtils';
import { useRouter } from 'next/router'
import * as cookie from 'cookie'
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { darkModeContext } from "../../../../context/DarkModeContext";
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { paymentTypeData } from '@models/data';

const PaymentMethods: NextPage = (props: any) => {
    const { shopId, rules } = props;
    const [isLoading, setIsLoading] = useState(true)
    const { darkMode } = useContext(darkModeContext);
    const dataGridRef = useRef(null);
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 0, name: "Card", enabled: true },
        { id: 1, name: "Cash", enabled: true },
        { id: 2, name: "Bank", enabled: true },
        { id: 3, name: "Cheque", enabled: true }
    ]);

    async function initDataPage() {
        var result = await apiFetchCtr({ fetch: 'taxes', subType: 'getTaxs', shopId })
        const { success, newdata } = result;
        if (success) {
            if (rules.hasInsert) {
                newdata.push({ id: 0, name: '', amount: 0, type: '', isPrimary: false, taxType: 'primary', isNew: 1 })
                newdata.push({ id: 0, name: '', amount: 0, type: '', isPrimary: false, taxType: 'excise', isNew: 1 })
                newdata.push({ id: 0, name: '', amount: 0, type: '', amountType: "percentage", isPrimary: false, taxType: 'service', isNew: 1 })
            }
            setIsLoading(false)
        }

    }

    useEffect(() => {
        initDataPage();
    }, [])

    const columns: GridColDef[] = [
        { field: "label", headerName: "Method",
            minWidth: 50, 
            headerClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
            cellClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
        },
            { field: "enabled", headerName: "Enabled",
            flex: 0.5,
            headerClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
            cellClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
            renderCell: ({row}) => (
                <input type="checkbox" />
            ),
        }
      ];
      const onRowsSelectionHandler = (ids: any) => {
        // setSelectedItems(ids)
      };
      const handleCellClick = (params, event) => {
        // if (params.field === "qty") {
        //   let index = products.findIndex((p) => params.id == p.id);
        //   if (index == -1) return;
        //   if (products[index].type != "package" && products[index].qty > 0) {
        //     setSelectId(products[index].id);
        //     setType(products[index].type);
        //     setIsOpenPriceDialog(true);
        //   }
        // }
      };

    const handleInputChange = (e: any, i: number) => {
        const _paymentMethods = [...paymentMethods];
        _paymentMethods[i].name = e.target.value;
        setPaymentMethods(_paymentMethods)
    }

    const handlePrimarySwitchChange = (e: any, i: number) => {
        const _paymentMethods = [...paymentMethods];
        _paymentMethods[i].enabled = !_paymentMethods[i].enabled;
        setPaymentMethods(_paymentMethods)
    }

    const addNewMethod = (id = 0) => {
        setPaymentMethods([...paymentMethods, {id: paymentMethods.length, name: '', enabled: false}])
    }

    const saveMethods = () => {
        const finalMethods = paymentMethods.filter(method => method.enabled)
        localStorage.setItem("paymentMethods", JSON.stringify(finalMethods))
    }

    return (
        <>
            <AdminLayout shopId={shopId}>
                <ToastContainer />
                {/* {!isLoading ? (
                    <>
                        <div className="page-content-style card">
                        <h5>Payment Options</h5>
                        <DataGrid
                            ref={dataGridRef}
                            className="datagrid-style"
                            sx={{
                            ".MuiDataGrid-columnSeparator": {
                                display: "none",
                            },
                            "&.MuiDataGrid-root": {
                                border: "none",
                            },
                            }}
                            rows={paymentMethods}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            onSelectionModelChange={(ids: any) =>
                            onRowsSelectionHandler(ids)
                            }
                            onCellClick={handleCellClick}
                        />
                        </div>
                    </>
                    ) : (
                    <div className="d-flex justify-content-around">
                        <Spinner animation="grow" />
                    </div>
                    )} */}
                    {!isLoading ? <Table className="table table-hover remove-last-del-icon" responsive>
                        <thead className="thead-dark">
                            <tr>
                                <th style={{ width: '50%' }} >Method</th>
                                <th style={{ width: '15%' }}>Enabled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentMethods.map((method: any, i: number) => {
                                return (
                                    <tr key={i} style={{ background: method.id < 4 ? '#c6e9e6' : '', pointerEvents: method.id < 4 ? 'none' : 'auto' }}>
                                        <td><input type="text" name="tax-name" className="form-control p-2" disabled={!rules.hasInsert} placeholder="Enter New Method Name" value={method.name} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                        <td><Form.Check type="switch" id="custom-switch" disabled={!rules.hasInsert} className="custom-switch" checked={method.enabled ? true : false} onChange={(e) => { handlePrimarySwitchChange(e, i) }} /></td>
                                    </tr>
                                )
                            })
                            }
                        </tbody>
                        <div className='d-flex'>
                            <div className='m-3'><button style={{boxShadow: 'unset', backgroundColor: '#004e46'}} className='btn m-btn btn-primary btn-dark p-2' onClick={() => addNewMethod()}><FontAwesomeIcon icon={faPlus} /> Add New Method </button></div>
                            <div className='m-3'><button style={{boxShadow: 'unset', backgroundColor: '#004e46'}} className='btn m-btn btn-primary p-2' onClick={() => saveMethods()}><FontAwesomeIcon icon={faSave} /> Save </button></div>
                        </div>
                    </Table>
                        : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
            </AdminLayout >
        </>
    )
}
export default PaymentMethods;
export async function getServerSideProps(context: any) {
    const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
    var _isOk = true, _rule = true;
    //check page params
    var shopId = context.query.id;
    if (shopId == undefined)
        return { redirect: { permanent: false, destination: "/page403" } }

    //check user permissions
    var _userRules = {}
    await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
        _isOk = repo.status;
        if (_isOk) {
            var _rules = keyValueRules(repo.data.rules || []);
            if (_rules[-2] != undefined && _rules[-2][0].stuff != undefined && _rules[-2][0].stuff == 'owner') {
                _rule = true;
                _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
            }
            else if (_rules[shopId] != undefined) {
                var _stuf = '';
                _rules[shopId].forEach((dd: any) => _stuf += dd.stuff)
                const { userRules, hasPermission } = hasPermissions(_stuf, 'taxes')
                _rule = hasPermission
                _userRules = userRules
            } else
                _rule = false
        }

    })
    if (!_isOk) return { redirect: { permanent: false, destination: "/user/login" } }
    if (!_rule) return { redirect: { permanent: false, destination: "/page403" } }
    //status ok
    return {
        props: { shopId, rules: _userRules },
    };

}