import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";

// Azure functions
import { getItemFromAzure, updateItemInAzure } from "../../api/azureApi";

// Local components
import DesktopOpenWorkorder from "./DesktopOpenWorkorder/DesktopOpenWorkorder";
import MobileOpenworkorder from "./MobileOpenWorkorder/MobileOpenWorkorder";
import { useIdle } from "react-use";

// Context
export const WorkorderContext = createContext({
  workorder: {},
  handleUpdateWorkorder: () => {},
});

function OpenWorkorder() {
  // Screen Size
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isIdle = useIdle(60000);

  // Get work order ID from URL params
  const params = useParams();
  console.log("OpenWorkorder params:", params);
  const { id } = params;

  console.log("OpenWorkorder ID from params:", id);

  // state
  const [workorder, setWorkorder] = useState(null);

  const fetchWorkorder = async () => {
    const response = await getItemFromAzure("workorders", id);
    setWorkorder(response);
  };

  useEffect(() => {
    fetchWorkorder();
  }, [id]);

  useEffect(() => {
    console.log("OpenWorkorder idle check", isIdle);
    if (isIdle) {
      fetchWorkorder();
    }
  }, [isIdle]);

  const handleUpdateWorkorder = async (updates) => {
    const updateResponse = await updateItemInAzure(updates, "workorders", id);
    console.log("work order updateResponse", updateResponse);
    setWorkorder((prev) => ({ ...prev, ...updates }));
  };

  return (
    <WorkorderContext.Provider value={{ workorder, handleUpdateWorkorder }}>
      {isMobile ? <MobileOpenworkorder /> : <DesktopOpenWorkorder />}
    </WorkorderContext.Provider>
  );
}

export default OpenWorkorder;
