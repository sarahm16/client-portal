import { useContext } from "react";

// Local Components
import SiteDetailsSection from "./components/SiteDetails";
import WorkorderDetailsSection from "./components/Details";
import PricingSection from "./components/Pricing";
import AfterImagesSection from "./components/AfterImages";
import NotesSection from "./components/Notes";
import InitialImagesSection from "./components/BeforeImages";
import HvacEquipment from "./components/HvacEquipment";
import ExhaustFanEquipment from "./components/ExhaustFanEquipment";
import HvacPmEquipment from "./components/HvacPmEquipment";
import IceMachineEquipment from "./components/IceMachineEquipment";

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

  const isHvacAssessment =
    workorder?.workorderType === "Warranty" &&
    workorder?.service === "Assessment";

  const isExhaustFanWorkorder =
    workorder?.workorderType === "Warranty" &&
    workorder?.service === "Exhaust Fan PM";

  const isHvacPm =
    workorder?.workorderType === "Warranty" && workorder?.service === "HVAC PM";

  const isIceMachineWorkorder =
    workorder?.workorderType === "Warranty" &&
    workorder?.service === "Ice Machines";

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
            {!isHvacAssessment &&
              !isExhaustFanWorkorder &&
              !isHvacPm &&
              !isIceMachineWorkorder && <InitialImagesSection />}
          </Stack>
        </Grid>

        {/* Middle Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack direction="column" spacing={3}>
            <PricingSection />
            {/* Move Notes here in HVAC work orders to make room for HVAC equipment details in the right column */}
            {(isHvacAssessment ||
              isExhaustFanWorkorder ||
              isHvacPm ||
              isIceMachineWorkorder) && <NotesSection />}
            {!isHvacAssessment &&
              !isExhaustFanWorkorder &&
              !isHvacPm &&
              !isIceMachineWorkorder && <AfterImagesSection />}
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {!isHvacAssessment &&
            !isExhaustFanWorkorder &&
            !isHvacPm &&
            !isIceMachineWorkorder && <NotesSection />}
          {isHvacAssessment && <HvacEquipment />}
          {isExhaustFanWorkorder && <ExhaustFanEquipment />}
          {isHvacPm && <HvacPmEquipment />}
          {isIceMachineWorkorder && <IceMachineEquipment />}
        </Grid>
      </Grid>
    </Container>
  );
}

export default DesktopOpenWorkorder;
