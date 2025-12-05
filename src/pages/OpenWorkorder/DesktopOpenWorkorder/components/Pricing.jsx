import { useContext } from "react";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AttachMoney from "@mui/icons-material/AttachMoney";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Local components
import CardComponent from "./CardComponent";

// Utility functions
import formatCurrency from "../../../../utilities/formatCurrency";

// Pricing & Scope Component
function PricingSection() {
  const { workorder } = useContext(WorkorderContext);

  return (
    <CardComponent
      title={
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Pricing & Scope
        </Typography>
      }
      icon={<AttachMoney color="warning" />}
      collapsible={true}
    >
      <Box
        sx={{
          p: 3,
          bgcolor: "primary.50",
          borderRadius: 2,
          border: 2,
          borderColor: "primary.200",
          mb: 3,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "primary.dark" }}
        >
          Not To Exceed (NTE)
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "primary.dark", mt: 0.5 }}
        >
          {workorder?.clientPrice
            ? `${formatCurrency(workorder.clientPrice)} ${
                workorder?.currency || "USD"
              }`
            : "Not specified"}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}
        >
          Scope of Work
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
            }}
          >
            {workorder?.description || "No description provided"}
          </Typography>
        </Box>
      </Box>
    </CardComponent>
  );
}

export default PricingSection;
