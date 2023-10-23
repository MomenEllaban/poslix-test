import { IItemReportData, IItemsReport, IProduct } from '@models/pos.types';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useUser } from 'src/context/UserContext';
import { useGetItemsSalesReport } from 'src/services/pos.service';

export default function OrderInfoTable({ isOrderDetails, setIsOrderDetails, orderId, shopId }) {
  const { locationSettings } = useUser();
  // const orderItems = order.products
  const [orderDetails, setOrderDetails] = useState<IItemReportData>({} as IItemReportData);
  const [orderItems, setOrderItems] = useState<IProduct[] | null>([]);
  const [total, setTotal] = useState<number>(0);

  const { isLoading, refetch } = useGetItemsSalesReport(shopId, orderId, {
    onSuccess: (data) => {
      setOrderDetails(data.result.data[0]);
      setOrderItems(data.result.data[0].products);
    },
  });

  useEffect(() => {
    refetch();
  }, [isOrderDetails]);

  useEffect(() => {
    let total = 0;
    if (orderItems !== null) {
      orderItems.forEach((ele) => {
        const productTotal = ele.product_qty * +ele.cost_price;
        total += productTotal;
      });
      setTotal(total);
    }
  }, [orderItems]);

  return (
    <div
      className={classNames({
        'd-none': !isOrderDetails,
      })}>
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center">Loading...</div>
      )}
      {!isLoading && (
        <>
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div className="d-flex flex-row justify-content-space-between align-items-center">
              <p>Orider ID</p>
              <p>{orderDetails.order_id}</p>
            </div>
            <div className="d-flex flex-row justify-content-space-between align-items-center">
              <p>Customer</p>
              <p>
                {orderDetails.contact_first_name} {orderDetails.contact_last_name}
              </p>
            </div>
          </div>
          <Table responsive>
            {' '}
            <thead className="text-muted table-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Rate</th>
                <th scope="col">Qty</th>
              </tr>
            </thead>
            <tbody>
              {orderItems?.map((item) => (
                <tr key={item.id}>
                  <th style={{ fontSize: '0.7rem' }}># {item.id}</th>
                  <td>
                    {/* {item.contact_first_name} {item.contact_last_name} */}
                    {item.name}
                  </td>
                  <td>
                    {(+(item.cost_price ?? 0)).toFixed(locationSettings.location_decimal_places)}{' '}
                    {locationSettings.currency_name}
                  </td>{' '}
                  {/* <td>
                  {(+(item.tax ?? 0)).toFixed(locationSettings.location_decimal_places)}{' '}
                  {locationSettings.currency_name}
                </td> */}
                  {/* <td>{item.products.map((prod) => {return prod.name + ', '})}</td> */}
                  <td>{(+(item?.product_qty ?? 0)).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={2}>
                  Total
                </th>
                <td>
                  {total.toFixed(locationSettings.location_decimal_places)}{' '}
                  {locationSettings.currency_name}
                </td>
                <td></td>
                <td>{orderItems?.length ?? 0}</td>
              </tr>
            </tfoot>
          </Table>
        </>
      )}

      <Button
        variant="primary"
        onClick={() => {
          setOrderItems(null);
          setIsOrderDetails(false);
        }}
        className="d-flex flex-row gap-3 justify-content-center align-items-center">
        <MdKeyboardArrowLeft size="20" /> Go Back to the list
      </Button>
    </div>
  );
}
