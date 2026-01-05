import React, { useState, useEffect } from "react";

//
import { useAuth } from "../../auth/hooks/AuthContext";
import { querySites } from "../../api/azureApi";
import { siteStatusColors } from "../../constants";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";

// Data Grid
import { DataGrid } from "@mui/x-data-grid";
import CreateWorkorderForm from "./components/CreateWorkorderForm";

function Sites() {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false); // Open state for Create Site modal

  // Open state for create work order modal
  const open = Boolean(selectedSite);
  const handleClose = () => {
    setSelectedSite(null);
  };

  const client = user?.client?.name;

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await querySites(
          `SELECT * FROM c WHERE c.client = '${client}'`
        );
        console.log("Fetched sites:", response);
        setSites(response);
      } catch (error) {
        console.error("Error fetching sites:", error);
      }
    };

    fetchSites();
  }, [user]);

  const columns = [
    {
      field: "client",
      headerName: "Client",
      flex: 1,
    },
    {
      field: "store",
      headerName: "Store",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1.5,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "state",
      headerName: "State",
      flex: 0.5,
    },
    {
      field: "zipcode",
      headerName: "Zip Code",
      flex: 0.7,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.status}
          color={siteStatusColors[params.row.status]}
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.75,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSite(params.row);
          }}
          sx={{ textTransform: "capitalize" }}
          startIcon={<AddIcon />}
        >
          Create Work Order
        </Button>
      ),
    },
  ];

  return (
    <>
      {selectedSite && (
        <CreateWorkorderForm
          selectedSite={selectedSite}
          open={open}
          closeModal={handleClose}
        />
      )}
      <Container maxWidth="80vw" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              gutterBottom
            >
              All Sites
            </Typography>
            {/*           <Typography variant="body2" color="text.secondary">
            Manage user accounts and permissions
          </Typography> */}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => setShowCreateModal(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              boxShadow: 2,
            }}
          >
            Add Site
          </Button>
        </Box>
        <Box
          sx={{
            height: "calc(100vh - 200px)",
            width: "100%",
            overflowY: "auto",
          }}
        >
          <DataGrid
            disableRowSelectionOnClick
            columns={columns}
            rows={sites}
            autoHeight
            showToolbar
            sx={{ overflowX: "scroll" }}
          />
        </Box>
      </Container>
    </>
  );
}

export default Sites;
