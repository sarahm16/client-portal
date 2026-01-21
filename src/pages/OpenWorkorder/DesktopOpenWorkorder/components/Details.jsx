import { useContext, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Description from "@mui/icons-material/Description";
import Schedule from "@mui/icons-material/Schedule";
import BuildCircle from "@mui/icons-material/BuildCircle";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Person from "@mui/icons-material/Person";
import Info from "@mui/icons-material/Info";
import Edit from "@mui/icons-material/Edit";
import dayjs from "dayjs";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Local components
import CardComponent from "./CardComponent";
import StackComp from "./StackComponent";
import Reopen from "./Reopen";
import CancelWorkorder from "./Cancel";

// Priority configuration with due dates in days
const priorityDueDates = {
  "P-1": 1,
  "P-2": 3,
  "P-3": 7,
  "P-4": 14,
};

// Work Order Details Component
function WorkorderDetailsSection() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const [isEditingPriority, setIsEditingPriority] = useState(false);

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

  const handlePriorityChange = (event) => {
    const newPriority = event.target.value;
    const daysToAdd = priorityDueDates[newPriority];
    const createdDate = workorder?.createdDate
      ? dayjs(workorder.createdDate)
      : dayjs();
    const newDueDate = createdDate.add(daysToAdd, "day");

    handleUpdateWorkorder({
      priority: newPriority,
      dueDate: newDueDate.toISOString(),
    });

    setIsEditingPriority(false);
  };

  const statusConfig = getStatusConfig(workorder?.status);
  const isEditable =
    workorder?.status !== "Completed" && workorder?.status !== "Cancelled";

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
          <Box sx={{ mt: 1, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              icon={statusConfig.icon}
              label={workorder?.status || "Unknown"}
              color={statusConfig.color}
              size="medium"
              sx={{ fontWeight: 600, px: 1 }}
            />

            {workorder?.status === "Completed" && <Reopen />}
            {workorder?.status !== "Completed" &&
              workorder?.status !== "Cancelled" && <CancelWorkorder />}
          </Box>
        </Box>

        {/* Show Cancellation Reason */}
        {workorder?.status === "Cancelled" &&
          workorder?.cancelDetails?.reason && (
            <Alert severity="error" icon={<Info />}>
              <Typography variant="caption" fontWeight={600} display="block">
                Cancellation Reason
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {workorder.cancelDetails?.reason}
              </Typography>
              {workorder?.cancelDetails?.date && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Cancelled on{" "}
                  {dayjs(workorder.cancelDetails.date).format("MMM D, YYYY")}
                </Typography>
              )}
            </Alert>
          )}

        {/* Show Reopen Reason */}
        {workorder?.status === "Reopened" && workorder?.reopenDetails && (
          <Alert severity="info" icon={<Info />}>
            <Typography variant="caption" fontWeight={600} display="block">
              Reopened Reason
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {workorder.reopenDetails?.reason}
            </Typography>
            {workorder?.reopenDetails?.date && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Reopened on{" "}
                {dayjs(workorder.reopenDetails.date).format("MMM D, YYYY")}
              </Typography>
            )}
          </Alert>
        )}

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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                color="warning.dark"
              >
                Priority Level
              </Typography>
              {isEditable && !isEditingPriority && (
                <IconButton
                  size="small"
                  onClick={() => setIsEditingPriority(true)}
                  sx={{ color: "warning.dark" }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
            </Box>

            {isEditingPriority ? (
              <Select
                value={workorder.priority}
                onChange={handlePriorityChange}
                size="small"
                fullWidth
                autoFocus
                onBlur={() => setIsEditingPriority(false)}
                sx={{
                  bgcolor: "background.paper",
                  fontWeight: 700,
                  "& .MuiSelect-select": {
                    py: 1,
                  },
                }}
              >
                {Object.entries(priorityDueDates).map(([priority, days]) => (
                  <MenuItem key={priority} value={priority}>
                    {priority} ({days} {days === 1 ? "day" : "days"})
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Typography variant="h6" fontWeight={700} color="warning.dark">
                {workorder.priority}
              </Typography>
            )}
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
