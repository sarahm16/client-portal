import React, { useContext, useEffect, useState, useMemo } from "react";

// MUI imports
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import Chip from "@mui/material/Chip";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PendingIcon from "@mui/icons-material/Pending";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { WorkordersContext } from "../WorkOrders";

// Mock data - replace with actual API call
const mockWorkOrders = [
  {
    id: "NFC-12345",
    site: { name: "Store #101 - Seattle", state: "WA" },
    service: "HVAC Repair",
    status: "New",
    priority: "P-2",
    clientPrice: 500,
    currency: "USD",
    dueDate: "2024-01-20T10:00:00Z",
    description: "AC unit not cooling properly",
    createdDate: 1704067200000, // Jan 1, 2024
  },
  {
    id: "NFC-12346",
    site: { name: "Store #205 - Portland", state: "OR" },
    service: "Plumbing",
    status: "In Progress",
    priority: "P-1",
    clientPrice: 1200,
    currency: "USD",
    dueDate: "2024-01-18T08:00:00Z",
    description: "Leak in main water line",
    createdDate: 1703980800000, // Dec 31, 2023
  },
  {
    id: "NFC-12347",
    site: { name: "Store #310 - Vancouver", state: "BC" },
    service: "Electrical",
    status: "Completed",
    priority: "P-3",
    clientPrice: 750,
    currency: "CAD",
    dueDate: "2024-01-15T12:00:00Z",
    description: "Replace faulty circuit breaker",
    createdDate: 1703808000000, // Dec 29, 2023
  },
  {
    id: "NFC-12348",
    site: { name: "Store #420 - Tacoma", state: "WA" },
    service: "Roofing",
    status: "Sourced",
    priority: "P-3",
    clientPrice: 2500,
    currency: "USD",
    dueDate: "2024-01-25T09:00:00Z",
    description: "Roof leak repair near HVAC unit",
    createdDate: 1704153600000, // Jan 2, 2024
  },
];

const statusColors = {
  New: "warning",
  Sourced: "info",
  "In Progress": "primary",
  Completed: "success",
  Cancelled: "error",
};

const priorityColors = {
  "P-1": "error",
  "P-2": "warning",
  "P-3": "info",
  "P-4": "default",
};

const statusIcons = {
  New: PendingIcon,
  Sourced: BuildCircleIcon,
  "In Progress": BuildCircleIcon,
  Completed: CheckCircleIcon,
  Cancelled: CancelIcon,
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Fast deep search
const deepSearch = (obj, searchTerms) => {
  if (!obj || searchTerms.length === 0) return false;
  const jsonStr = JSON.stringify(obj).toLowerCase();
  return searchTerms.every((term) => jsonStr.includes(term));
};

function CountTile({ status, count, color, Icon, onClick }) {
  return (
    <Box
      component="button"
      sx={{
        width: "100%",
        bgcolor: "white",
        pb: 2,
        pt: 1,
        borderRadius: 2,
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        border: 0,
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1, pr: 1 }}>
        <Icon
          sx={{ color: (theme) => theme.palette[color].main }}
          fontSize="small"
        />
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bolder",
          textAlign: "center",
          color: (theme) => theme.palette[color].main,
        }}
      >
        {count}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: "600",
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        {status}
      </Typography>
    </Box>
  );
}

function WorkOrderTile({ workOrder, onClick }) {
  const dueDate = new Date(workOrder.dueDate);
  const StatusIcon = statusIcons[workOrder.status];

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 2,
        borderLeft: (theme) =>
          `4px solid ${theme.palette[statusColors[workOrder.status]].main}`,
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "rgba(149, 157, 165, 0.3) 0px 12px 32px",
        },
      }}
    >
      <CardActionArea onClick={() => onClick(workOrder.id)}>
        <CardContent sx={{ p: `12px !important` }}>
          <Grid container spacing={0}>
            <Grid size={3}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  {months[dueDate.getMonth()]?.toUpperCase()}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bolder",
                    textAlign: "center",
                    lineHeight: 1.2,
                    color: (theme) =>
                      theme.palette[statusColors[workOrder.status]].main,
                  }}
                >
                  {dueDate.getDate()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  {dueDate.getFullYear()}
                </Typography>
              </Box>
            </Grid>
            <Grid size={9} pl={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {workOrder.id}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Chip
                    label={workOrder.priority}
                    size="small"
                    color={priorityColors[workOrder.priority]}
                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
                  />
                  <Chip
                    icon={<StatusIcon />}
                    label={workOrder.status}
                    size="small"
                    color={statusColors[workOrder.status]}
                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
                  />
                </Box>
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  color: (theme) =>
                    theme.palette[statusColors[workOrder.status]].main,
                  mb: 0.5,
                }}
              >
                {workOrder.service}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <LocationOnIcon
                  sx={{ fontSize: 14, color: "text.secondary" }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.8rem",
                  }}
                >
                  {workOrder.site.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AttachMoneyIcon
                    sx={{ fontSize: 14, color: "text.secondary" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    {workOrder.currency} $
                    {workOrder.clientPrice.toLocaleString()}
                  </Typography>
                </Box>
                <ArrowForwardIosIcon
                  fontSize="small"
                  sx={{ color: "text.secondary", fontSize: 16 }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function MobileWorkOrders() {
  const workordersContext = useContext(WorkordersContext);
  const { workorders, setOpen } = workordersContext;
  const [status, setStatus] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inputKey, setInputKey] = useState(0);

  // Debounce search
  const handleSearchInput = (event) => {
    const value = event.target.value;
    if (handleSearchInput.timer) {
      clearTimeout(handleSearchInput.timer);
    }
    handleSearchInput.timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 150);
  };

  // Filter by status first
  const statusFilteredWorkOrders = useMemo(() => {
    if (status === "All") {
      return workorders;
    }
    if (status === "Open") {
      return workorders.filter(
        (wo) =>
          wo.status === "New" ||
          wo.status === "Sourced" ||
          wo.status === "In Progress"
      );
    }
    return workorders.filter((wo) => wo.status === status);
  }, [workorders, status]);

  // Then apply search filter
  const list = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return statusFilteredWorkOrders;
    }

    const searchTerms = debouncedSearch
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    return statusFilteredWorkOrders.filter((wo) => deepSearch(wo, searchTerms));
  }, [statusFilteredWorkOrders, debouncedSearch]);

  // Count tiles
  const openWorkOrders = useMemo(
    () =>
      workorders.filter(
        (wo) =>
          wo.status === "New" ||
          wo.status === "Sourced" ||
          wo.status === "In Progress"
      ),
    [workorders]
  );

  const inProgressWorkOrders = useMemo(
    () => workorders.filter((wo) => wo.status === "In Progress"),
    [workorders]
  );

  const completedWorkOrders = useMemo(
    () => workorders.filter((wo) => wo.status === "Completed"),
    [workorders]
  );

  const handleClick = (newStatus) => {
    setStatus(newStatus);
  };

  const handleClearSearch = () => {
    setDebouncedSearch("");
    setInputKey((prev) => prev + 1);
  };

  const handleWorkOrderClick = (workOrderId) => {
    console.log("Navigate to work order:", workOrderId);
    // navigate(`/workorders/${workOrderId}`);
  };

  const handleCreateWorkOrder = () => {
    console.log("Open create work order modal");
    // setOpen(true);
  };

  return (
    <Box sx={{ px: 2, py: 3, pb: 10 }}>
      {/* Header */}
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", color: "text.primary" }}
      >
        My Work Orders
      </Typography>

      {/* Count Tiles */}
      <Grid
        container
        spacing={2}
        sx={{ bgcolor: "rgba(0,0,0,.03)", p: 2, borderRadius: 2, mb: 3 }}
      >
        <Grid size={4}>
          <CountTile
            status="Open"
            color="warning"
            count={openWorkOrders.length}
            Icon={PendingIcon}
            onClick={() => handleClick("Open")}
          />
        </Grid>
        <Grid size={4}>
          <CountTile
            Icon={BuildCircleIcon}
            count={inProgressWorkOrders.length}
            color="primary"
            status="Active"
            onClick={() => handleClick("In Progress")}
          />
        </Grid>
        <Grid size={4}>
          <CountTile
            Icon={CheckCircleIcon}
            count={completedWorkOrders.length}
            color="success"
            status="Complete"
            onClick={() => handleClick("Completed")}
          />
        </Grid>
      </Grid>

      {/* Filter Buttons */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <ButtonGroup size="small" sx={{ width: "100%" }}>
          <Button
            variant={status === "All" ? "contained" : "outlined"}
            onClick={() => handleClick("All")}
            sx={{ flexGrow: 1 }}
          >
            All
          </Button>
          <Button
            variant={status === "Open" ? "contained" : "outlined"}
            onClick={() => handleClick("Open")}
            sx={{ flexGrow: 1 }}
          >
            Open
          </Button>
          <Button
            variant={status === "In Progress" ? "contained" : "outlined"}
            onClick={() => handleClick("In Progress")}
            sx={{ flexGrow: 1 }}
          >
            Active
          </Button>
          <Button
            variant={status === "Completed" ? "contained" : "outlined"}
            onClick={() => handleClick("Completed")}
            sx={{ flexGrow: 1 }}
          >
            Complete
          </Button>
        </ButtonGroup>
      </Box>

      {/* Search Bar */}
      <TextField
        key={inputKey}
        fullWidth
        placeholder="Search work orders..."
        onChange={handleSearchInput}
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: debouncedSearch && (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClearSearch}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Work Order List */}
      {list.length > 0 && (
        <Stack
          direction="column"
          spacing={2}
          sx={{ p: 2, bgcolor: "rgba(0,0,0,.03)", borderRadius: 2 }}
        >
          {list.map((workOrder) => (
            <WorkOrderTile
              key={workOrder.id}
              workOrder={workOrder}
              onClick={handleWorkOrderClick}
            />
          ))}
        </Stack>
      )}

      {/* Empty State */}
      {list.length === 0 && (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "rgba(0,0,0,.03)",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {debouncedSearch ? (
              <>
                No work orders found matching{" "}
                <strong>"{debouncedSearch}"</strong> in{" "}
                <strong>{status === "All" ? "any status" : status}</strong>.
              </>
            ) : (
              <>
                No work orders found for{" "}
                <strong>{status === "All" ? "any status" : status}</strong>.
              </>
            )}
          </Typography>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create work order"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
        onClick={handleCreateWorkOrder}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default MobileWorkOrders;
