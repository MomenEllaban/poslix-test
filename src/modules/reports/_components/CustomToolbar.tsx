import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';

export default function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
      <GridToolbarColumnsButton placeholder="grid"/>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}
