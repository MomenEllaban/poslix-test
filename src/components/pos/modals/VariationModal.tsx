import { IVariation } from '@models/pos.types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useRecoilState } from 'recoil';
import { useUser } from 'src/context/UserContext';
import { cartJobType } from 'src/recoil/atoms';

const VariationModal = (props: any) => {
  const {
    selectedProductForVariation,
    isOpenVariationDialog,
    setIsOpenVariationDialog,
    variations,
  } = props;
  console.log(variations);

  const [, setJobType] = useRecoilState(cartJobType);
  const style = {
    minWidth: '500px',
  };
  const { locationSettings } = useUser();

  const handleClick = (variation_id: number) => {
    setJobType({ req: 4, val: variation_id.toString() });
    setIsOpenVariationDialog(false);
  };
  return (
    <>
      <Dialog
        open={isOpenVariationDialog}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="poslix-modal">
        <DialogTitle className="poslix-modal-title text-primary">Choose One</DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="modal-content">
            <div className="modal-body">
              <div className="packitems-container">
                {!!(variations.length > 0) &&
                  variations.map((vr: IVariation, idx: number) => {
                    return (
                      <div
                        key={vr.id + 'dialog'}
                        className="packitems-var"
                        onClick={() => {
                          handleClick(vr.id);
                        }}>
                        <div className="var-name">{vr.name}</div>
                        <div className="var-price">
                          {(vr as any).total_qty > 0
                            ? Number(vr.price).toFixed(3)
                            : Number(vr.price).toFixed(3)}{' '}
                          {locationSettings?.currency_code}
                        </div>
                        {/* <div className="var-remaining-qty">
                            {Number(vr.total_qty).toFixed(0)} Remaining
                          </div> */}
                        <div className="item-icons">
                          {vr.sell_over_stock == 1 && (
                            <div className="inner-icon">
                              <img src="/images/pos/card/over_sell.png" />
                            </div>
                          )}
                          {vr.sell_over_stock == 0 && (vr as any).total_qty == 0 && (
                            <span className="out-of-stock">Out OF Stock</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <br />
              <br />
            </div>

            <div className="modal-footer">
              <a
                className="btn btn-link link-success fw-medium"
                onClick={() => {
                  setIsOpenVariationDialog(false);
                }}>
                Close <i className="ri-close-line me-1 align-middle" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VariationModal;
