import { IItemReportData, IItemsReport } from '@models/pos.types';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useUser } from 'src/context/UserContext';
import { useGetItemsSalesReport } from 'src/services/pos.service';

export default function OrderInfoTable({ isOrderDetails, setIsOrderDetails, orderId, shopId }) {
  const { locationSettings } = useUser();
  const [orderDetails, setOrderDetails] = useState<IItemsReport | null>(null);
  const [orderItems, setOrderItems] = useState<IItemReportData[] | null>(null);

  const { isLoading, refetch } = useGetItemsSalesReport(shopId, orderId, {
    onSuccess: (data) => {
      setOrderDetails(data.result);
      setOrderItems(data.result.data);
      console.log(data, 'data');
    },
  });

  useEffect(() => {
    refetch()
  }, [isOrderDetails])

  return (
    <div
      className={classNames({
        'd-none': !isOrderDetails,
      })}>
      <Table responsive>
        {' '}
        <thead className="text-muted table-light">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Contact</th>
            <th scope="col">Price</th>
            <th scope="col">Tax</th>
            <th scope="col">Products</th>
            <th scope="col">Qty</th>
          </tr>
        </thead>
        <tbody>
          {(isLoading && (
            <tr>
              <td colSpan={5} className="text-center">
                Loading...
              </td>
            </tr>
          )) ||
            orderItems?.map((item) => (
              <tr key={item.order_id}>
                <th scope="row" style={{ fontSize: '0.7rem' }}>
                  {item.order_id}<br />{moment(item.date).format('DD/MM/YYYY')}
                </th>
                <td>
                  {item.contact_first_name} {item.contact_last_name}
                </td>
                <td>
                  {(+(item.price ?? 0)).toFixed(locationSettings.location_decimal_places)}{' '}
                  {locationSettings.currency_name}
                </td>{' '}
                <td>
                  {(+(item.tax ?? 0)).toFixed(locationSettings.location_decimal_places)}{' '}
                  {locationSettings.currency_name}
                </td>
                <td>{item.products.map((prod) => {return prod.name + ', '})}</td> 
                <td>{(+(item?.qty ?? 0)).toFixed(0)}</td>
              </tr>
            ))}
        </tbody>
        <tfoot
          className={classNames({
            'd-none': isLoading,
          })}>
          <tr>
            <th scope="row" colSpan={2}>
              Total
            </th>
            <td>
              {(+(orderDetails?.total ?? 0)).toFixed(locationSettings.location_decimal_places)}{' '}
              {locationSettings.currency_name}
            </td>
            <td></td>
            <td>{orderItems?.length ?? 0}</td>
          </tr>
        </tfoot>
      </Table>
      <Button
        variant="primary"
        onClick={() => {
          setOrderItems(null)
          setIsOrderDetails(false)
        }}
        className="d-flex flex-row gap-3 justify-content-center align-items-center">
        <MdKeyboardArrowLeft size="20" /> Go Back to the list
      </Button>
    </div>
  );
}
