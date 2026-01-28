import { useContext, useState } from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { mappedClientStatuses } from "../../../constants";
import { WorkordersContext } from "../WorkOrders";

function DesktopClientStatusFilter() {
  const workordersContext = useContext(WorkordersContext);
  const { filters, handleFilterChange } = workordersContext;

  const [showAll, setShowAll] = useState(false);

  const handleStatusToggle = (status) => {
    handleFilterChange({
      key: "statuses",
      value: filters.statuses.includes(status)
        ? filters.statuses.filter((s) => s !== status)
        : [...filters.statuses, status],
    });
  };

  const handleSelectAll = () => {
    handleFilterChange({
      key: "statuses",
      value: Object.keys(mappedClientStatuses),
    });
  };

  const handleClearAll = () => {
    handleFilterChange({
      key: "statuses",
      value: [],
    });
  };

  // Primary statuses shown by default
  const primaryStatuses = [
    "New",
    "Accepted",
    "Scheduled",
    "In Progress",
    "Completed",
  ];

  // Secondary statuses shown when expanded
  const secondaryStatuses = Object.keys(mappedClientStatuses).filter(
    (status) => !primaryStatuses.includes(status),
  );

  return (
    <Box>
      {/* First Row */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          mb: showAll ? 1.5 : 0,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Status:
        </Typography>

        <Chip
          size="small"
          label="All"
          onClick={handleSelectAll}
          variant={
            filters.statuses.length === Object.keys(mappedClientStatuses).length
              ? "filled"
              : "outlined"
          }
          color={
            filters.statuses.length === Object.keys(mappedClientStatuses).length
              ? "primary"
              : "default"
          }
        />

        <Chip
          size="small"
          label="None"
          onClick={handleClearAll}
          variant={filters.statuses.length === 0 ? "filled" : "outlined"}
          color={filters.statuses.length === 0 ? "default" : "default"}
        />

        {/* Primary Statuses */}
        {primaryStatuses.map((status) => (
          <Chip
            size="small"
            key={status}
            label={status}
            onClick={() => handleStatusToggle(status)}
            variant={filters.statuses.includes(status) ? "filled" : "outlined"}
            color={mappedClientStatuses[status].color}
          />
        ))}

        {/* Show More/Less Button */}
        <Button
          size="small"
          onClick={() => setShowAll(!showAll)}
          endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ ml: 1, textTransform: "none" }}
        >
          {showAll ? "Less" : "More"}
        </Button>
      </Box>

      {/* Second Row - Collapsible */}
      <Collapse in={showAll}>
        <Box sx={{ display: "flex", gap: 1, pl: 8.5 }}>
          {secondaryStatuses.map((status) => (
            <Chip
              size="small"
              key={status}
              label={status}
              onClick={() => handleStatusToggle(status)}
              variant={
                filters.statuses.includes(status) ? "filled" : "outlined"
              }
              color={mappedClientStatuses[status].color}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export default DesktopClientStatusFilter;
