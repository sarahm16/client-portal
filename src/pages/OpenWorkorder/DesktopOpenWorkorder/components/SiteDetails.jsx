import { useContext, useEffect, useState } from "react";

// API
import { getItemFromAzure } from "../../../../api/azureApi";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import LocationOn from "@mui/icons-material/LocationOn";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Local components
import CardComponent from "./CardComponent";
import StackComp from "./StackComponent";

// Site Details Component
function SiteDetailsSection() {
  const { workorder } = useContext(WorkorderContext);
  const [site, setSite] = useState(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (workorder?.site?.id) {
        try {
          const response = await getItemFromAzure("sites", workorder.site.id);
          setSite(response);
        } catch (error) {
          console.error("Error fetching site details:", error);
        }
      }
    };
    fetchSite();
  }, [workorder?.site?.id]);

  return (
    <CardComponent
      title={
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Site Information
        </Typography>
      }
      collapsible={true}
      icon={<LocationOn color="success" />}
    >
      {/*       <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            bgcolor: "success.50",
            p: 1.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
        </Box>
      </Box> */}

      <Stack direction="column" spacing={2}>
        <Box
          sx={{
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Location
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
            {workorder?.site?.name || workorder?.site?.store}
          </Typography>
        </Box>

        {site && (
          <>
            <Divider />
            <StackComp
              title="Address"
              value={`${site.address}, ${site.city}, ${site.state} ${site.zipcode}`}
            />

            <StackComp
              title="Contact"
              value={site?.contact?.name || "No Contact Available"}
            />

            {site?.contact?.email && (
              <StackComp title="Email" value={site.contact.email} />
            )}

            {site?.contact?.phone && (
              <StackComp title="Phone" value={site.contact.phone} />
            )}

            {workorder?.createdBy && (
              <StackComp title="Created By" value={workorder?.createdBy} />
            )}

            {workorder?.createdByEmail && (
              <StackComp
                title="Created By Email"
                value={workorder?.createdByEmail}
              />
            )}
          </>
        )}
      </Stack>
    </CardComponent>
  );
}

export default SiteDetailsSection;
