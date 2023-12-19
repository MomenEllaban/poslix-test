import { useEffect, useState } from 'react';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import { useRouter } from 'next/router';
import { createNewData, findAllData } from 'src/services/crud.api';
import MainModal from 'src/components/modals/MainModal';
import { Button, Container, Spinner } from 'react-bootstrap';
import classNames from 'classnames';
import { Toastify } from 'src/libs/allToasts';

type Location = {
  location_id: number;
  location_name: string;
};

export default function ModelSendProduct({ show, setShow, selectedItems, products }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const shopId = +router.query.id ?? 0;
  const [isLocation, setIsLocation] = useState<Location>();
  const [locations, setLocations] = useState([]);
  const [currentShopId, setCurrentShopId] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [sendProducts, setSendProducts] = useState([]);

  const getLocations = async () => {
    setIsLoading(true);
    const businessId = localStorage.getItem('businessId');
    const res = await findAllData(`/business/${businessId}`);
    const result = res.data.result;
    const locations = result[0]?.locations;
    setLocations(locations);
    setIsLocation(locations?.find((el) => el.location_id === shopId));
    setIsLoading(false);
  };

  const handleLocationChange = (e: any) => {
    setCurrentShopId(e.target?.value);
  };

  async function handleSendProducts() {
    const data = {
      location_id: shopId,
      transferred_location_id: +currentShopId,
      cart: sendProducts,
    };

    try {
      setIsPending(true);
      const res = await createNewData(`/send-products`, data);
      if (res.data.success) {
        Toastify('success', 'success send product');
        setShow(false);
        // setSendProducts([]);
      }
    } catch (e) {
      console.log(e);
      alert('error..Try Again');
    } finally {
      setIsPending(false);
      setSendProducts([]);
    }
  }

  useEffect(() => {
    const locs = getLocalStorage<any[]>(ELocalStorageKeys.CUSTOEMR_LOCATIONS) ?? [];
    setLocations(locs?.[0]?.locations);
    getLocations();
  }, []);

  const handleFilterDataSelect = () => {
    const data = [];
    products.forEach((product) => {
      if (selectedItems.includes(product.id)) {
        data.push(product);
      }
    });

    return data;
  };

  const handleData = () => {
    const _products = handleFilterDataSelect();

    for (const item of _products) {
      if (item?.variations.length) {
        setSendProducts((prev) => [
          ...prev,
          {
            product_id: item.id,
            variations: item.variations.map((variation) => variation.id),
          },
        ]);
        continue;
      }
      setSendProducts((prev) => [
        ...prev,
        {
          product_id: item.id,
        },
      ]);
    }
  };

  useEffect(() => {
    if (!show) {
      return;
    }
    handleData();
  }, [show]);

  return (
    <div>
      <MainModal
        title={`Send Products (${selectedItems?.length})`}
        show={show}
        setShow={setShow}
        body={
          <Container fluid>
            <div className="send-products">
              <div className="col-lg-3 mb-3">
                <label>Location</label>
                <input className="form-input" disabled value={isLocation?.location_name} />
              </div>
              <div className="col-lg-5 mb-3">
                <label>Transferred Location</label>
                <select
                  disabled={isLoading || !locations?.length}
                  defaultValue={currentShopId}
                  className="form-select"
                  onChange={handleLocationChange}>
                  {locations?.length == 0 ? (
                    <option value={0} disabled>
                      Loading...
                    </option>
                  ) : (
                    <>
                      <option value={''} disabled>
                        Select Location
                      </option>
                      {locations?.map((el) => (
                        <option
                          key={el.location_id}
                          value={el.location_id}
                          disabled={el.location_id === shopId}>
                          {el.location_name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </Container>
        }
        footer={
          <div>
            <Button
              disabled={isPending || currentShopId?.length <= 0}
              type="button"
              onClick={handleSendProducts}
              form="hook-form"
              className={classNames(
                'btn btn-label d-flex flex-row align-items-center gap-3',
                'btn-primary',
                ' right nexttab'
              )}>
              {isPending ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                <span>{'send'}</span>
              )}
            </Button>
          </div>
        }
      />
    </div>
  );
}
