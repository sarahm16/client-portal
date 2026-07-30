import { useState, useEffect, useCallback, useMemo } from "react";
import { azureClient } from "../../api/azureClient";
import * as XLSX from "xlsx";
import { useAuth } from "../../auth/hooks/AuthContext";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";

// MUI Icons
import HandymanIcon from "@mui/icons-material/Handyman";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";

// Data Grid
import { DataGrid } from "@mui/x-data-grid";

// ─── Constants ────────────────────────────────────────────────────────────────

// Per-client config: the id used on equipment docs, and the equipment
// (display) services that client can have. Add a client here to enable the tab
// for them.
const CLIENTS = {
  MetroNet: {
    name: "MetroNet",
    id: "8b290612-3ae1-4f2d-9088-d79c1d05a3ef",
    services: ["HVAC", "Exhaust Fan", "Ice Machine"],
  },
  "IVX Health": {
    name: "IVX Health",
    id: "646be904-fe5e-43e0-80b9-56f75ee0ffe6",
    services: ["HVAC"],
  },
};

const CLIENT_ID_TO_NAME = Object.fromEntries(
  Object.values(CLIENTS).map((c) => [c.id, c.name]),
);

// Raw service string on the equipment doc -> display label used in the grid.
const SERVICE_DISPLAY_MAP = {
  "HVAC PM": "HVAC",
  Assessment: "HVAC",
  "Exhaust Fan PM": "Exhaust Fan",
  "Ice Machine": "Ice Machine",
  "HVAC Assessment and PM": "HVAC", // IVX Health
};

const SERVICE_COLORS = {
  HVAC: "primary",
  "Exhaust Fan": "warning",
  "Ice Machine": "info",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDisplayService = (service) => SERVICE_DISPLAY_MAP[service] ?? service;

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function EquipmentToolbar({
  search,
  onSearch,
  serviceFilter,
  onServiceFilter,
  services,
  onExport,
  totalCount,
  filteredCount,
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "grey.50",
      }}
    >
      {/* Search */}
      <TextField
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search equipment..."
        size="small"
        sx={{ width: 260 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearch("")}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Service type filter — only shown when there's more than one option */}
      {services.length > 2 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {services.map((svc) => (
              <Chip
                key={svc}
                label={svc}
                size="small"
                onClick={() => onServiceFilter(svc)}
                color={
                  serviceFilter === svc
                    ? (SERVICE_COLORS[svc] ?? "primary")
                    : "default"
                }
                variant={serviceFilter === svc ? "filled" : "outlined"}
                sx={{
                  fontWeight: serviceFilter === svc ? 700 : 500,
                  cursor: "pointer",
                  fontSize: "0.72rem",
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Row count */}
      <Typography variant="caption" color="text.secondary">
        {filteredCount === totalCount
          ? `${totalCount} items`
          : `${filteredCount} of ${totalCount}`}
      </Typography>

      {/* Export */}
      <Tooltip title="Export to Excel">
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
        >
          Export
        </Button>
      </Tooltip>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function Equipment() {
  const { user } = useAuth();
  const client = user?.client?.name;
  const role = user?.role;
  const isAdmin = role === "Admin";

  // Which clients this user can see: all of them for Admin, otherwise just theirs.
  const visibleClientNames = useMemo(
    () => (isAdmin ? Object.keys(CLIENTS) : client ? [client] : []),
    [isAdmin, client],
  );
  const visibleClientIds = useMemo(
    () =>
      new Set(visibleClientNames.map((n) => CLIENTS[n]?.id).filter(Boolean)),
    [visibleClientNames],
  );

  // Service-filter options = union of the visible clients' services.
  const availableServices = useMemo(() => {
    const set = new Set();
    visibleClientNames.forEach((n) =>
      (CLIENTS[n]?.services || []).forEach((s) => set.add(s)),
    );
    return ["All", ...set];
  }, [visibleClientNames]);

  const [equipmentWithSites, setEquipmentWithSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");

  useEffect(() => {
    if (visibleClientNames.length === 0) {
      setEquipmentWithSites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const clientList = visibleClientNames.map((n) => `'${n}'`).join(", ");

    const fetchEquipment = azureClient.get(
      "/getAll?databaseId=procurement&containerId=equipment",
    );

    const fetchSites = azureClient.post(
      "/nosqlquery?databaseId=procurement&containerId=sites",
      { query: `SELECT * FROM c WHERE c.client IN (${clientList})` },
    );

    Promise.all([fetchEquipment, fetchSites])
      .then(([equipmentResponse, sitesResponse]) => {
        const sites = sitesResponse.data || [];
        const siteById = new Map(sites.map((s) => [s.id, s]));
        const visibleSiteIds = new Set(sites.map((s) => s.id));

        const transformed = (equipmentResponse.data || [])
          // keep only equipment belonging to a visible client
          .filter(
            (eq) =>
              (visibleClientIds.has(eq.clientId) ||
                visibleSiteIds.has(eq.siteId)) &&
              !eq.demo,
          )
          .map((eq) => {
            const site = siteById.get(eq.siteId);
            return {
              ...eq,
              clientName: site?.client ?? CLIENT_ID_TO_NAME[eq.clientId] ?? "—",
              location: site?.store ?? "—",
              address: site?.address ?? "—",
              city: site?.city ?? "—",
              state: site?.state ?? "—",
              zip: site?.zipcode ?? "—",
            };
          });

        setEquipmentWithSites(transformed);
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, [visibleClientNames, visibleClientIds]);

  // ── Filtering ────────────────────────────────────────────────────────────

  const filteredRows = useMemo(() => {
    let rows = equipmentWithSites;

    if (serviceFilter !== "All") {
      rows = rows.filter(
        (eq) => getDisplayService(eq.service) === serviceFilter,
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter((eq) =>
        [
          eq.barcode,
          eq.service,
          eq.clientName,
          eq.location,
          eq.address,
          eq.city,
          eq.state,
          eq.zip,
          eq.make,
          eq.model,
          eq.serialNumber,
          eq.tonnage,
          eq.age,
          eq.condition,
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(term)),
      );
    }

    return rows;
  }, [equipmentWithSites, search, serviceFilter]);

  // ── Export ───────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    const exportData = filteredRows.map((eq) => ({
      ...(isAdmin ? { Client: eq.clientName } : {}),
      Barcode: eq.barcode ?? "",
      "Equipment Type": getDisplayService(eq.service),
      Location: eq.location,
      Address: eq.address,
      City: eq.city,
      State: eq.state,
      "Zip Code": eq.zip,
      Make: eq.make ?? "",
      Model: eq.model ?? "",
      "Serial Number": eq.serialNumber ?? "",
      Tonnage: eq.tonnage ?? "",
      Age: eq.age ?? "",
      Condition: eq.condition ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment");
    XLSX.writeFile(wb, "equipment-export.xlsx");
  }, [filteredRows, isAdmin]);

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns = useMemo(() => {
    const cols = [
      {
        field: "barcode",
        headerName: "Barcode",
        width: 150,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", fontWeight: 600 }}
          >
            {params.value ?? "—"}
          </Typography>
        ),
      },
      {
        field: "service",
        headerName: "Type",
        width: 130,
        renderCell: (params) => {
          const display = getDisplayService(params.value);
          const color = SERVICE_COLORS[display] ?? "default";
          return (
            <Chip
              label={display}
              size="small"
              color={color}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.72rem" }}
            />
          );
        },
      },
      {
        field: "location",
        headerName: "Location",
        flex: 1,
        minWidth: 160,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        ),
      },
      { field: "address", headerName: "Address", flex: 1.2, minWidth: 180 },
      { field: "city", headerName: "City", width: 130 },
      {
        field: "state",
        headerName: "State",
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, borderWidth: 2, fontSize: "0.72rem" }}
          />
        ),
      },
      { field: "zip", headerName: "Zip", width: 90 },
      {
        field: "make",
        headerName: "Make",
        width: 120,
        renderCell: (params) => (
          <Typography
            variant="body2"
            color={params.value ? "text.primary" : "text.disabled"}
          >
            {params.value ?? "—"}
          </Typography>
        ),
      },
      {
        field: "model",
        headerName: "Model",
        width: 130,
        renderCell: (params) => (
          <Typography
            variant="body2"
            color={params.value ? "text.primary" : "text.disabled"}
          >
            {params.value ?? "—"}
          </Typography>
        ),
      },
      {
        field: "serialNumber",
        headerName: "Serial Number",
        width: 150,
        renderCell: (params) => (
          <Typography
            variant="body2"
            color={params.value ? "text.primary" : "text.disabled"}
          >
            {params.value ?? "—"}
          </Typography>
        ),
      },
      {
        field: "tonnage",
        headerName: "Tonnage",
        width: 100,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Typography
            variant="body2"
            color={params.value ? "text.primary" : "text.disabled"}
          >
            {params.value ?? "—"}
          </Typography>
        ),
      },
      {
        field: "age",
        headerName: "Age",
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Typography
            variant="body2"
            color={params.value ? "text.primary" : "text.disabled"}
          >
            {params.value ?? "—"}
          </Typography>
        ),
      },
      {
        field: "condition",
        headerName: "Condition",
        width: 120,
        renderCell: (params) => {
          if (!params.value)
            return (
              <Typography variant="body2" color="text.disabled">
                —
              </Typography>
            );
          const conditionColors = {
            Good: "success",
            Fair: "warning",
            Poor: "error",
          };
          const color = conditionColors[params.value] ?? "default";
          return (
            <Chip
              label={params.value}
              size="small"
              color={color}
              variant="filled"
              sx={{ fontWeight: 600, fontSize: "0.72rem" }}
            />
          );
        },
      },
    ];

    // Admins view multiple clients, so lead with a Client column.
    if (isAdmin) {
      cols.unshift({
        field: "clientName",
        headerName: "Client",
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: "0.72rem" }}
          />
        ),
      });
    }

    return cols;
  }, [isAdmin]);

  // ── Render ────────────────────────────────────────────────────────────────

  const subtitle = isAdmin
    ? "All equipment across all client locations"
    : `All equipment across ${client || "your"} locations`;

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, height: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <HandymanIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Equipment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Grid */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <EquipmentToolbar
          search={search}
          onSearch={setSearch}
          serviceFilter={serviceFilter}
          onServiceFilter={setServiceFilter}
          services={availableServices}
          onExport={handleExport}
          totalCount={equipmentWithSites.length}
          filteredCount={filteredRows.length}
        />

        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{
            flex: 1,
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "grey.50",
              borderBottom: "2px solid",
              borderColor: "divider",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
            "& .MuiDataGrid-columnHeader": {
              "&:focus, &:focus-within": { outline: "none" },
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid",
              borderColor: "grey.100",
              display: "flex",
              alignItems: "center",
              "&:focus, &:focus-within": { outline: "none" },
            },
            "& .MuiDataGrid-row:hover": { bgcolor: "primary.50" },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "2px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            },
            "& .MuiDataGrid-overlay": { bgcolor: "background.paper" },
          }}
        />
      </Paper>
    </Container>
  );
}

export default Equipment;
