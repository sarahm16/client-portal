import React, { useState, useContext } from "react";

// Local imports
import { WorkorderContext } from "../../OpenWorkorder";
import { useAuth } from "../../../../auth/hooks/AuthContext";
import ImageUploader from "./ImageUploader";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// MUI Icons
import Image from "@mui/icons-material/Image";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Delete from "@mui/icons-material/Delete";
import Warning from "@mui/icons-material/Warning";

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
function LazyImage({ src, alt, onClick, setImageToRemove }) {
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
            gap: 1,
            opacity: 0,
            transition: "opacity 0.3s ease",
            cursor: "pointer",
            borderRadius: 2,
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <Box
            onClick={onClick}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <ZoomIn sx={{ color: "white", fontSize: 48 }} />
          </Box>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              color: "error.main",
              "&:hover": {
                bgcolor: "white",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setImageToRemove(src);
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

// Delete Confirmation Modal
function DeleteConfirmationModal({ open, onClose, onConfirm, imageUrl }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm(imageUrl);
    setIsDeleting(false);
  };

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: "error.50",
              p: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Warning color="error" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Delete Image?
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this image? This action cannot be
          undone.
        </DialogContentText>

        {imageUrl && (
          <Box
            sx={{
              mt: 2,
              borderRadius: 2,
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
            }}
          >
            <img
              src={imageUrl}
              alt="Image to delete"
              style={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isDeleting}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          {isDeleting ? "Deleting..." : "Delete Image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InitialImagesSection() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const initialImages = workorder?.images || [];
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [imageToRemove, setImageToRemove] = useState(null);

  // Show first 6 images by default, expand to show all
  const INITIAL_DISPLAY_COUNT = 2;
  const displayImages = showAll
    ? initialImages
    : initialImages.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreImages = initialImages.length > INITIAL_DISPLAY_COUNT;

  // User
  const { user } = useAuth();

  const handleRemoveImage = async (imageUrl) => {
    try {
      const updates = {
        images: initialImages.filter((img) => img !== imageUrl),
        activity: [
          {
            date: new Date().getTime(),
            user: user?.name || "Unknown User",
            action: `Removed an initial photo`,
          },
          ...workorder.activity,
        ],
      };

      const updateResponse = await handleUpdateWorkorder(updates);
      console.log("Image removed successfully:", updateResponse);
      setImageToRemove(null);
    } catch (error) {
      console.error("Error removing image:", error);
      // Optionally show an error message to the user
      alert(`Failed to delete image: ${error.message}`);
    }
  };

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
        <ImageUploader />
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

        <ImageUploader />

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
                setImageToRemove={setImageToRemove}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={!!imageToRemove}
        onClose={() => setImageToRemove(null)}
        onConfirm={handleRemoveImage}
        imageUrl={imageToRemove}
      />

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
