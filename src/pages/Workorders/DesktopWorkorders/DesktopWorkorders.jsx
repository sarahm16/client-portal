import React, { useContext } from "react";

// local imports
import { workorderTypes, workorderStatuses } from "../../../constants";

// MUI imports
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

// Context
import { WorkordersContext } from "../WorkOrders";
import DesktopStatusFilter from "./DesktopStatusFilter";

const columns = [
  // Identifiers and general type
  {
    field: "client",
    headerName: "Client",
    flex: 0.5,
    renderCell: (params) => params.row?.client?.name,
    valueGetter: (value, row) => row?.client?.name || "",
  },
  {
    field: "id",
    headerName: "NFC ID",
    width: 90,
  },
  {
    field: "workorderType",
    headerName: "Type",
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.row.workorderType || "Project"}
        color={workorderTypes[params.row.workorderType] || "secondary"}
        sx={{ textTransform: "capitalize" }}
        variant="outlined"
      />
    ),
  },
  // Context of the work order
  {
    field: "priority",
    headerName: "Priority",
    width: 100,
  },

  {
    field: "site",
    headerName: "Site",
    flex: 1,
    renderCell: (params) => params.row.site?.name,
    valueGetter: (value, row) => row.site?.name || "",
  },
  {
    field: "state",
    headerName: "State",
    width: 100,
    renderCell: (params) => params.row.site?.state || "",
    valueGetter: (value, row) => row.site?.state || "",
  },
  {
    field: "service",
    headerName: "Service",
    width: 200,
  },

  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.row.status}
        color={workorderStatuses[params.row.status] || "default"}
      />
    ),
  },
  // Dates and creation info
  {
    field: "createdDate",
    headerName: "Date Created",
    width: 150,
    renderCell: (params) =>
      new Date(params.row.createdDate).toLocaleDateString(),
  },
  {
    field: "projectManager",
    headerName: "Project Manager",
    width: 150,
    renderCell: (params) =>
      params.row.projectManager ? params.row.projectManager.displayName : "",
    valueGetter: (value, row) => row.projectManager?.displayName || "",
  },
  {
    field: "dueDate",
    headerName: "Complete NLT",
    renderCell: (params) => new Date(params.row.dueDate).toLocaleDateString(),
    width: 150,
  },
];

function DesktopWorkorders() {
  // Context
  const workordersContext = useContext(WorkordersContext);
  const { workorders, setOpen } = workordersContext;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
          maxWidth: "98vw",
          width: "100%",
          pt: 3,
          pb: 1,
        }}
      >
        <DesktopStatusFilter />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(true);
            }}
          >
            Create Work Order
          </Button>
        </Box>
      </Box>
      <Box
        sx={{ height: "calc(100vh - 200px)", width: "100%", overflowY: "auto" }}
      >
        <DataGrid
          onRowClick={(params) => {
            if (!params.id?.includes("auto-generated-row")) {
              window.open(`/workorders/${params.id}`, "_blank");
            }
          }}
          columns={columns}
          rows={workorders}
          autoHeight
          showToolbar
          sx={{ overflowX: "scroll" }}
        />
      </Box>
    </>
  );
}

export default DesktopWorkorders;
