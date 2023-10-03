import { ITax } from '@models/pos.types';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { selectCartByLocation, setCartTax } from 'src/redux/slices/cart.slice';
import { useTaxesList } from 'src/services/pos.service';
import { IOrderMiniDetails } from '../../../models/common-model';
import { EditDiscountModal } from '../modals/edit-discount/EditDiscountModal';

interface IOrderCalcsProps {
  orderEditDetails: IOrderMiniDetails;
  lang: any;
  __WithDiscountFeature__total: any;
  shopId: number;
}

export const OrderCalcs = ({
  orderEditDetails,
  lang,
  __WithDiscountFeature__total,
  shopId,
}: IOrderCalcsProps) => {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();

  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const [taxList, setTaxList] = useState<any>()
  const { taxesList } = useTaxesList(shopId);
  useEffect(() => {
    setTaxList(taxesList?.taxes)
    const _tax: any = taxesList?.taxes?.filter((tax: any) => tax?.is_primary)
    const _taxGroup: any = taxesList?.taxes?.filter((tax: any) => tax?.is_tax_group && tax?.is_primary)
    let finalTax;
    let finalTaxType;
    if(_taxGroup.length > 0) {
      finalTax = _taxGroup[0].tax_group.reduce((total, tax) => total + (tax.amount || 0), 0);
    }
    else {
      finalTax = _tax[0]?.amount ?? 0
    }
    dispatch(
      setCartTax({ tax: finalTax, location_id: shopId, type: 'percentage' })
    );
  }, [taxesList])

  const totalDiscount =
    cart?.cartDiscountType === 'percentage'
      ? (+(cart?.cartDiscount ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartDiscount ?? 0);

  const totalTax =
    cart?.cartTaxType === 'percentage'
      ? (+(cart?.cartTax ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartTax ?? 0);

  const totalNoTax = +(cart?.cartSellTotal ?? 0) + +(cart?.shipping ?? 0);
  const totalAmount = totalNoTax + totalTax - totalDiscount;

  return (
    <div className="table calcs-table table-borderless  align-middle mb-0 border-top border-top-dashed mt-2">
      <div>
        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>
              {lang.cartComponent?.tax}
              <span>
                {cart?.cartTaxType === 'percentage' ? (
                  <>({+cart?.cartTax}%)</>
                ) : (
                  <>
                    ({+cart?.cartTax} {locationSettings?.currency_code})
                  </>
                )}
              </span>
            </div>
            <div>
              {(+cart?.cartSellTotal * (cart?.cartTax / 100)).toFixed(
                +locationSettings?.location_decimal_places
              )}{' '}
              <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
            </div>
          </div>

          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent?.shipping} (+)</div>
            <div>
              {(+(cart?.shipping ?? 0))?.toFixed(+locationSettings?.location_decimal_places)}{' '}
              <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
            </div>
          </div>
        </div>

        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent?.discount} (-)</div>
            <div>
              <EditIcon
                onClick={() => setIsDiscountModalOpen(true)}
                style={{
                  fontSize: '16px',
                  marginRight: '4px',
                  cursor: 'pointer',
                }}
              />
              <span>
                {totalDiscount?.toFixed(locationSettings?.location_decimal_places)}{' '}
                <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
              </span>
            </div>
          </div>
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent?.total}</div>
            <div>
              {totalAmount?.toFixed(locationSettings?.location_decimal_places)}{' '}
              <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
            </div>
          </div>
        </div>

        {cart?.orderId &&
          <div className="calcs-details-row">
            <div className="py-1 calcs-details-col">
              <div></div>
              <div></div>
            </div>
            <div className="py-1 calcs-details-col">
              <div>{lang.cartComponent.difference}</div>
              <div>{(+totalAmount - +cart.lastTotal + +cart.lastDue)
                .toFixed(locationSettings?.location_decimal_places)}{' '}
                <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
              </div>
            </div>
          </div>
        }
        <EditDiscountModal
          shopId={shopId}
          show={isDiscountModalOpen}
          setShow={setIsDiscountModalOpen}
        />
      </div>
    </div>
  );
};
