// Additional Images Component (for HVAC workorders, to upload images in addition to required images)

import { useContext, useState } from "react";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Alert from "@mui/material/Alert";

// MUI Icons
import Image from "@mui/icons-material/Image";
import ZoomIn from "@mui/icons-material/ZoomIn";

// Local Components
import CardComponent from "./CardComponent";

// Additional Images Component
function AdditionalImages() {
  const { workorder } = useContext(WorkorderContext);
  const afterImages = workorder?.vendorUpdates?.afterImages || [];
  const [selectedImage, setSelectedImage] = useState(null);

  if (afterImages.length === 0) {
    return (
      <CardComponent
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Additional Completion Photos
          </Typography>
        }
        icon={<Image color="info" />}
        collapsible={true}
      >
        <Alert severity="info" icon={<Image />} sx={{ borderRadius: 2 }}>
          No additional completion photos available yet
        </Alert>
      </CardComponent>
    );
  }

  return (
    <>
      <CardComponent
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Additional Completion Photos
          </Typography>
        }
        icon={<Image color="info" />}
        collapsible={true}
      >
        <ImageList cols={2} gap={12}>
          {afterImages.map((image, index) => (
            <ImageListItem
              key={index}
              sx={{
                cursor: "pointer",
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                "&:hover .zoom-overlay": {
                  opacity: 1,
                },
                boxShadow: 1,
              }}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image}
                alt={`Completion photo ${index + 1}`}
                loading="lazy"
                style={{
                  objectFit: "cover",
                  height: 200,
                  width: "100%",
                }}
              />
              <Box
                className="zoom-overlay"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <ZoomIn sx={{ color: "white", fontSize: 48 }} />
              </Box>
            </ImageListItem>
          ))}
        </ImageList>
      </CardComponent>

      {/* Image Modal */}
      {selectedImage && (
        <Box
          onClick={() => setSelectedImage(null)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.95)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            p: 4,
          }}
        >
          <img
            src={selectedImage}
            alt="Full size"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </Box>
      )}
    </>
  );
}

export default AdditionalImages;
