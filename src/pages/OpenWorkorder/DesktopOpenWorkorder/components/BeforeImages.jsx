import React, { useState, useContext } from "react";

// Local imports
import { WorkorderContext } from "../../OpenWorkorder";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";

// MUI Icons
import Image from "@mui/icons-material/Image";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

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

// Lazy Loading Image Component
function LazyImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Box sx={{ position: "relative", width: "100%", height: 200 }}>
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ borderRadius: 2 }}
        />
      )}
      {error && (
        <Box
          sx={{
            width: "100%",
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="error">
            Failed to load image
          </Typography>
        </Box>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          objectFit: "cover",
          height: 200,
          width: "100%",
          display: loaded ? "block" : "none",
          borderRadius: 8,
        }}
      />
      {loaded && (
        <Box
          className="zoom-overlay"
          onClick={onClick}
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
            cursor: "pointer",
            borderRadius: 2,
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <ZoomIn sx={{ color: "white", fontSize: 48 }} />
        </Box>
      )}
    </Box>
  );
}

function InitialImagesSection() {
  const { workorder } = useContext(WorkorderContext);
  const initialImages = workorder?.images || [];
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Show first 6 images by default, expand to show all
  const INITIAL_DISPLAY_COUNT = 2;
  const displayImages = showAll
    ? initialImages
    : initialImages.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreImages = initialImages.length > INITIAL_DISPLAY_COUNT;

  if (initialImages.length === 0) {
    return (
      <CardComponent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              bgcolor: "secondary.50",
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image color="secondary" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Initial Photos
          </Typography>
        </Box>

        <Alert severity="info" icon={<Image />} sx={{ borderRadius: 2 }}>
          No initial photos were uploaded with this work order.
        </Alert>
      </CardComponent>
    );
  }

  return (
    <>
      <CardComponent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              bgcolor: "secondary.50",
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image color="secondary" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Initial Photos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {initialImages.length} photo
              {initialImages.length !== 1 ? "s" : ""} uploaded at submission
            </Typography>
          </Box>
        </Box>

        <ImageList cols={2} gap={12}>
          {displayImages.map((image, index) => (
            <ImageListItem
              key={index}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 1,
              }}
            >
              <LazyImage
                src={image}
                alt={`Initial photo ${index + 1}`}
                onClick={() => setSelectedImage(image)}
              />
            </ImageListItem>
          ))}
        </ImageList>

        {/* Show More/Less Button */}
        {hasMoreImages && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={showAll ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowAll(!showAll)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {showAll
                ? "Show Less"
                : `Show ${initialImages.length - INITIAL_DISPLAY_COUNT} More`}
            </Button>
          </Box>
        )}
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
          <Box
            sx={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <img
              src={selectedImage}
              alt="Full size"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
            {/* Close hint */}
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: -40,
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                opacity: 0.7,
              }}
            >
              Click anywhere to close
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}

export default InitialImagesSection;
