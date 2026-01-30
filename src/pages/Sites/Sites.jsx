import React, { useState, useEffect } from "react";

// Auth & API
import { useAuth } from "../../auth/hooks/AuthContext";
import { querySites, saveItemToAzure } from "../../api/azureApi";
import { siteStatusColors } from "../../constants";

// MUI Components
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import MapIcon from "@mui/icons-material/Map";

// Data Grid
import { DataGrid } from "@mui/x-data-grid";

// Components
import CreateSiteForm from "./components/CreateSiteForm";

// Helper function to display status
const getDisplayStatus = (status) => {
  if (["Sourcing", "Unassigned"].includes(status)) {
    return "Active";
  }
  return status;
};

function Sites() {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const client = user?.client?.name;

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await querySites(
          `SELECT * FROM c WHERE c.client = '${client}'`,
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
      field: "store",
      headerName: "Location",
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            height: "100%",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 36,
              height: 36,
              fontSize: "0.875rem",
            }}
          >
            <LocationOnIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              {params.value}
            </Typography>
            {params.row.company && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.2 }}
              >
                {params.row.company}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
            {params.value}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1.3 }}
          >
            {params.row.city}, {params.row.state} {params.row.zipcode}
          </Typography>
        </Box>
      ),
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "state",
      headerName: "State",
      flex: 0.6,
      minWidth: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderWidth: 2,
            }}
          />
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const displayStatus = getDisplayStatus(params.value);
        const statusColor = siteStatusColors[displayStatus] || "#95A5A6";

        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip
              label={displayStatus}
              size="small"
              sx={{
                bgcolor: statusColor,
                color: "white",
                fontWeight: 600,
                borderRadius: "6px",
                height: 28,
                "& .MuiChip-label": {
                  px: 1.5,
                },
              }}
            />
          </Box>
        );
      },
    },
  ];

  const handleSaveSite = async (newSite) => {
    const savedSite = await saveItemToAzure(newSite, "sites");
    if (savedSite) {
      setSites((prevSites) => [savedSite, ...prevSites]);
      setShowCreateModal(false);
    }
  };

  return (
    <>
      {showCreateModal && (
        <CreateSiteForm
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={(newSite) => handleSaveSite(newSite)}
        />
      )}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 56,
                  height: 56,
                }}
              >
                <MapIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, mb: 0.5 }}
                >
                  Locations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your site locations
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              onClick={() => setShowCreateModal(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Add Location
            </Button>
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                flex: 1,
                bgcolor: "primary.50",
                border: "2px solid",
                borderColor: "primary.200",
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Total Locations
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                {sites.length}
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                flex: 1,
                bgcolor: "success.50",
                border: "2px solid",
                borderColor: "success.200",
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Active Sites
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "success.dark" }}
              >
                {
                  sites.filter((s) =>
                    ["Active", "Sourcing", "Unassigned"].includes(s.status),
                  ).length
                }
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                flex: 1,
                bgcolor: "grey.100",
                border: "2px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                States Covered
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {new Set(sites.map((s) => s.state)).size}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Data Grid */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <DataGrid
            rows={sites}
            columns={columns}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            getRowHeight={() => "auto"}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "grey.50",
                borderBottom: "2px solid",
                borderColor: "divider",
                fontSize: "0.875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              },
              "& .MuiDataGrid-columnHeader": {
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid",
                borderColor: "grey.200",
                py: 1.5,
                display: "flex",
                alignItems: "center",
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  bgcolor: "primary.50",
                  cursor: "pointer",
                },
                "&.Mui-selected": {
                  bgcolor: "primary.50",
                  "&:hover": {
                    bgcolor: "primary.100",
                  },
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "2px solid",
                borderColor: "divider",
                bgcolor: "grey.50",
              },
              "& .MuiDataGrid-virtualScroller": {
                minHeight: sites.length === 0 ? "200px" : "auto",
              },
              "& .MuiDataGrid-overlay": {
                bgcolor: "background.paper",
              },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 2,
                  }}
                >
                  <MapIcon sx={{ fontSize: 64, color: "text.disabled" }} />
                  <Typography variant="h6" color="text.secondary">
                    No locations found
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Add Your First Location
                  </Button>
                </Box>
              ),
            }}
          />
        </Paper>
      </Container>
    </>
  );
}

export default Sites;
