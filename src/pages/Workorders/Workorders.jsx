import { useEffect, useState, createContext } from "react";

// Local hooks
import { useAuth } from "../../auth/hooks/AuthContext";
import { getItemsFromAzure, saveItemToAzure } from "../../api/azureApi";
import { useRole } from "../../auth/hooks/usePermissions";

// Local components
import DesktopWorkorders from "./DesktopWorkorders/DesktopWorkorders";
import MobileWorkorders from "./MobileWorkorders/MobileWorkorders";
import CreateWorkorderForm from "./Components/CreateWorkorderForm";

// Local constants
import {
  mappedStatuses,
  workorderStatuses,
  clientStatusArray,
} from "../../constants";

// MUI
import { useMediaQuery, useTheme } from "@mui/material";

// Context
export const WorkordersContext = createContext({
  workorders: [],
  setWorkorders: () => {},
  handleFilterChange: () => {},
  open: false,
  setOpen: () => {},
  filters: { statuses: [] },
  handleSaveWorkorder: () => {},
});

function Workorders() {
  // Screen size
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // User info
  const { user } = useAuth();
  const client = user?.client;
  const { isInternalAdmin } = useRole();
  const userIsInternalAdmin = isInternalAdmin();

  // Add this helper to get the appropriate status keys based on role
  const getInitialStatusFilters = (role) => {
    return role === "External Admin"
      ? Object.keys(workorderStatuses)
      : Object.keys(clientStatusArray);
  };

  // State
  const [workorders, setWorkorders] = useState([]);
  const [unfilteredWorkorders, setUnfilteredWorkorders] = useState([]);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    statuses: getInitialStatusFilters(user?.role || "External Admin"),
  });

  useEffect(() => {
    const fetchWorkorders = async () => {
      const response = await getItemsFromAzure("workorders");
      const roleFilteredArray = userIsInternalAdmin
        ? response.filter((wo) => wo.intake)
        : response.filter(
            (wo) =>
              wo.client?.id === client?.id && !wo.financeStatus && wo.intake
          );

      const roleMappedStatusArray = roleFilteredArray.map((wo) => ({
        ...wo,
        status:
          user?.role === "External Admin"
            ? wo.status
            : mappedStatuses[wo.status] || wo.status,
      }));

      setWorkorders(roleMappedStatusArray);
      setUnfilteredWorkorders(roleMappedStatusArray);
    };

    fetchWorkorders();
  }, [client, user, userIsInternalAdmin]);

  const matchesStatus = (workorder) =>
    filters.statuses.includes(workorder?.status);

  const handleFilterChange = ({ key, value }) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const filtered = unfilteredWorkorders.filter((workorder) =>
      matchesStatus(workorder)
    );
    setWorkorders(filtered);
  }, [filters]);

  const handleSaveWorkorder = async (newWorkorder) => {
    const createResponse = await saveItemToAzure(newWorkorder, "workorders");
    if (createResponse) {
      setWorkorders((prev) => [...prev, createResponse]);
      setUnfilteredWorkorders((prev) => [...prev, createResponse]);
      setOpen(false);
    } else {
      console.error("Failed to save workorder");
    }
  };

  return (
    <WorkordersContext.Provider
      value={{
        workorders,
        setWorkorders,
        handleFilterChange,
        open,
        setOpen,
        filters,
        handleSaveWorkorder,
      }}
    >
      <CreateWorkorderForm />
      {isMobile ? <MobileWorkorders /> : <DesktopWorkorders />}
    </WorkordersContext.Provider>
  );
}

export default Workorders;
