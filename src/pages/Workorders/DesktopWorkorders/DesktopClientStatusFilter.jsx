import { useContext } from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { mappedClientStatuses } from "../../../constants";
import { WorkordersContext } from "../WorkOrders";

function DesktopClientStatusFilter() {
  const workordersContext = useContext(WorkordersContext);
  const { filters, handleFilterChange } = workordersContext;

  return (
    <>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Typography variant="subtitle1" sx={{ alignSelf: "center" }}>
          Status:
        </Typography>
        <Chip
          size="small"
          label="All"
          onClick={() =>
            handleFilterChange({
              key: "statuses",
              value: Object.keys(mappedClientStatuses), // Changed from workorderStatuses
            })
          }
        />
        <Chip
          size="small"
          label="None"
          onClick={() => handleFilterChange({ key: "statuses", value: [] })}
        />

        <Divider orientation="vertical" flexItem />

        {Object.keys(mappedClientStatuses).map((status) => (
          <Chip
            size="small"
            variant={
              filters.statuses.includes(status) ? "contained" : "outlined"
            }
            key={status}
            onClick={() =>
              handleFilterChange({
                key: "statuses",
                value: filters.statuses.includes(status)
                  ? filters.statuses.filter((s) => s !== status)
                  : [...filters.statuses, status],
              })
            }
            color={mappedClientStatuses[status].color}
            sx={{
              bgcolor: filters.statuses.includes(status)
                ? mappedClientStatuses[status].color
                : "white",
            }}
            label={status}
          />
        ))}
      </Box>
    </>
  );
}

export default DesktopClientStatusFilter;
