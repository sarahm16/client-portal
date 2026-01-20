import { useContext } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Description from "@mui/icons-material/Description";
import Schedule from "@mui/icons-material/Schedule";
import BuildCircle from "@mui/icons-material/BuildCircle";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Person from "@mui/icons-material/Person";
import dayjs from "dayjs";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Local components
import CardComponent from "./CardComponent";
import StackComp from "./StackComponent";
import Reopen from "./Reopen";

// Work Order Details Component
function WorkorderDetailsSection() {
  const { workorder } = useContext(WorkorderContext);

  const getStatusConfig = (status) => {
    const configs = {
      New: { color: "info", icon: <Schedule fontSize="small" /> },
      "In Progress": {
        color: "warning",
        icon: <BuildCircle fontSize="small" />,
      },
      Completed: { color: "success", icon: <CheckCircle fontSize="small" /> },
      Cancelled: { color: "error", icon: null },
    };
    return configs[status] || { color: "default", icon: null };
  };

  const statusConfig = getStatusConfig(workorder?.status);

  return (
    <CardComponent
      title={
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Work Order Details
        </Typography>
      }
      icon={<Description color="primary" />}
      collapsible={true}
    >
      <Stack direction="column" spacing={2.5}>
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}
          >
            Status
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
            <Chip
              icon={statusConfig.icon}
              label={workorder?.status || "Unknown"}
              color={statusConfig.color}
              size="medium"
              sx={{ fontWeight: 600, px: 1 }}
            />

            {workorder?.status === "Completed" && <Reopen />}
          </Box>
        </Box>

        {workorder?.priority && (
          <Box
            sx={{
              p: 2,
              bgcolor: "warning.50",
              borderRadius: 2,
              border: 1,
              borderColor: "warning.200",
            }}
          >
            <Typography variant="caption" fontWeight={600} color="warning.dark">
              Priority Level
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.dark">
              {workorder.priority}
            </Typography>
          </Box>
        )}

        <Divider />

        <StackComp
          title="Service Type"
          value={workorder?.service || "Not specified"}
          icon={<BuildCircle fontSize="small" color="action" />}
        />

        <StackComp
          title="Target Completion"
          value={
            workorder?.dueDate
              ? dayjs(workorder.dueDate).format("MMM D, YYYY")
              : "Not specified"
          }
          icon={<CalendarMonth fontSize="small" color="action" />}
        />

        <StackComp
          title="Created"
          value={
            workorder?.createdDate
              ? dayjs(workorder.createdDate).format("MMM D, YYYY")
              : "Unknown"
          }
          icon={<Person fontSize="small" color="action" />}
        />
      </Stack>
    </CardComponent>
  );
}

export default WorkorderDetailsSection;
