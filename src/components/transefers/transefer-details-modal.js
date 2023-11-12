import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'next-i18next';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'white',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  display: 'flex', // Use flex display
};

const leftColumnStyle = {
  flex: 1, // Adjust the width of the left column
  padding: '0 16px', // Add padding
  borderRight: '1px solid #ccc', // Add a border to separate columns
};

const rightColumnStyle = {
  flex: 1, // Adjust the width of the right column
  padding: '0 16px', // Add padding
};

const labelStyle = {
  fontWeight: 'bold',
};

const listItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '8px 0',
};

const listItemLabelStyle = {
  flex: 1,
  fontWeight: 'bold',
  marginRight: '16px',
};

export function TransferDetailsModal({ transfer, locations, shopId }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { t } = useTranslation();

  return (
    <div>
      <Button
        sx={{ width: '25px', height: '100%' }}
        onClick={handleOpen}
      >
        <FontAwesomeIcon icon={faEye} />
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div style={leftColumnStyle}>
            <Typography variant="h6" component="div" style={{ marginBottom: '16px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
              {t("transfers.Transfer_Details")}
            </Typography>
            <div>
              <div style={listItemStyle}>
                <span style={listItemLabelStyle}>{t("transfers.Transfer_ID")}:</span>
                <span>{transfer?.id}</span>
              </div>
              <div style={listItemStyle}>
                <span style={listItemLabelStyle}>{t("transfers.From")}:</span>
                <span>{transfer?.location_from_name}</span>
              </div>
              <div style={listItemStyle}>
                <span style={listItemLabelStyle}>{t("transfers.To")}:</span>
                <span>{transfer?.location_to_name}</span>
              </div>
              <div style={listItemStyle}>
                <span style={listItemLabelStyle}>{t("transfers.Status")}:</span>
                <span>{transfer?.status}</span>
              </div>
              <div style={listItemStyle}>
                <span style={listItemLabelStyle}>{t("transfers.Reference_Number")}:</span>
                <span>{transfer?.ref_no}</span>
              </div>
              <div style={listItemStyle}>
                <span style={listItemLabelStyle}>{t("transfers.Total_Price")}:</span>
                <span>{+transfer?.total_price}</span>
              </div>
            </div>
          </div>
          <div style={rightColumnStyle}>
            <div style={listItemStyle}>
              <span style={labelStyle}>{t("transfers.Products")}:</span>
            </div>
            <ul>
              {transfer?.products?.map((prod) => (
                <li key={prod?.id} style={listItemStyle}>
                  <span>{prod?.name}</span>
                  <span>{t("transfers.Qty")}: {+prod?.pivot?.qty}</span>
                </li>
              ))}
            </ul>
            <div style={listItemStyle}>
              <span style={labelStyle}>{t("transfers.Stocks")}:</span>
            </div>
            <ul>
              {transfer?.stocks?.map((stock) => (
                <li key={stock?.id} style={listItemStyle}>
                  <span>{t("transfers.Qty_Received")}: {+stock?.qty_received}</span>
                  <span>{t("transfers.Qty_Sold")}: {+stock?.qty_sold}</span>
                </li>
              ))}
            </ul>
            <div style={listItemStyle}>
              <span style={listItemLabelStyle}>{t("transfers.Exchange_Rate")}:</span>
              <span>{+transfer?.exchange_rate}</span>
            </div>
            <div style={listItemStyle}>
              <span style={listItemLabelStyle}>{t("transfers.Created_By")}:</span>
              <span>
                {
                  locations.find((l) => l[transfer?.created_by] === shopId)?.location_name
                }
              </span>
            </div>
            <div style={listItemStyle}>
              <span style={listItemLabelStyle}>{t("transfers.Created_At")}:</span>
              <span>{transfer?.created_at?new Date(transfer?.created_at)?.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }):''}</span>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
