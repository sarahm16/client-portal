import { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

// Reusable Collapsible Card Component
const CardComponent = ({
  children,
  title,
  icon,
  defaultExpanded = true,
  collapsible = false,
  ...props
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // If not collapsible or no title, render simple card
  if (!collapsible || !title) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
          height: "fit-content",
          ...props.sx,
        }}
      >
        {children}
      </Paper>
    );
  }

  // Render collapsible card with header
  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        height: "fit-content",
        overflow: "hidden",
        ...props.sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: expanded ? 1 : 0,
          borderColor: "divider",
          cursor: "pointer",
          "&:hover": {
            bgcolor: "action.hover",
          },
          transition: "background-color 0.2s",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                bgcolor: icon.props?.bgcolor || "primary.50",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              {icon}
            </Box>
          )}
          {title}
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ p: 3 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

export default CardComponent;
