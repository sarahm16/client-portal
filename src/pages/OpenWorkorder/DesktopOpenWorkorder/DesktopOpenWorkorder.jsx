import { useContext } from "react";

// Local Components
import SiteDetailsSection from "./components/SiteDetails";
import WorkorderDetailsSection from "./components/Details";
import PricingSection from "./components/Pricing";
import AfterImagesSection from "./components/AfterImages";
import NotesSection from "./components/Notes";
import InitialImagesSection from "./components/BeforeImages";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";

// MUI Icons
import LocationOn from "@mui/icons-material/LocationOn";

// Context
import { WorkorderContext } from "../OpenWorkorder";

function DesktopOpenWorkorder() {
  const { workorder } = useContext(WorkorderContext);

  console.log("Workorder in DesktopOpenWorkorder:", workorder);

  if (!workorder) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Work order not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
        >
          {workorder.client?.name}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<LocationOn fontSize="small" />}
            label={workorder.site?.store || workorder.site?.name}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={workorder.id}
            variant="outlined"
            sx={{ fontFamily: "monospace", fontWeight: 600 }}
          />
        </Stack>
      </Box>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack direction="column" spacing={3}>
            <WorkorderDetailsSection />
            <SiteDetailsSection />
            <InitialImagesSection />
          </Stack>
        </Grid>

        {/* Middle Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack direction="column" spacing={3}>
            <PricingSection />
            <AfterImagesSection />
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <NotesSection />
        </Grid>
      </Grid>
    </Container>
  );
}

export default DesktopOpenWorkorder;
