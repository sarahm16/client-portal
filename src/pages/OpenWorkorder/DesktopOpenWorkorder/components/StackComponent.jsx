import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// Stack Component for key-value pairs
const StackComp = ({ title, value, icon }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography
      variant="body2"
      sx={{
        fontWeight: 600,
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {icon}
      {title}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        textAlign: "right",
        fontWeight: 600,
        color: "text.secondary",
      }}
    >
      {value}
    </Typography>
  </Stack>
);

export default StackComp;
