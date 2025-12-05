import Paper from "@mui/material/Paper";

// Reusable Card Component
const CardComponent = ({ children, ...props }) => (
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

export default CardComponent;
