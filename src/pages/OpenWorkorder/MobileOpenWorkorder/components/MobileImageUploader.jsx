import React, { useState, useContext } from "react";
import { FileUploader } from "react-drag-drop-files";
import { BlobServiceClient } from "@azure/storage-blob";

// local imports
import { WorkorderContext } from "../../OpenWorkorder";
import convertHeic from "../../../../utilities/convertHeic";
import { useAuth } from "../../../../auth/hooks/AuthContext";

// mui imports
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Error from "@mui/icons-material/Error";
import CloudUpload from "@mui/icons-material/CloudUpload";
import InsertPhoto from "@mui/icons-material/InsertPhoto";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";

const blobSasUrl = import.meta.env.VITE_BLOB_URL;
const blobServiceClient = new BlobServiceClient(blobSasUrl);
const containerName = "sarlacc";
const containerClient = blobServiceClient.getContainerClient(containerName);

function MobileImageUploader() {
  // context
  const workorderContext = useContext(WorkorderContext);
  const { workorder, handleUpdateWorkorder } = workorderContext;
  const images = workorder?.images || [];
  const activity = workorder?.activity || [];

  // state
  const [uploadQueue, setUploadQueue] = useState([]);

  // user
  const { user } = useAuth();

  const handleFileChange = async (files) => {
    console.log("Files selected:", files);
    const fileArray = Object.values(files);

    // Add files to upload queue with pending status
    const newUploads = fileArray.map((file) => ({
      file,
      name: file.name,
      status: "uploading", // uploading, success, error
      progress: 0,
      error: null,
    }));

    setUploadQueue((prev) => [...prev, ...newUploads]);

    // Automatically start uploading each file
    fileArray.forEach((file, index) => {
      uploadFile(file, uploadQueue.length + index);
    });
  };

  const uploadFile = async (file, queueIndex) => {
    try {
      const convertedDocument = await convertHeic(file);
      const blockBlobClient = containerClient.getBlockBlobClient(
        `${new Date().getTime()}_${file.name}`,
      );

      await blockBlobClient.uploadBrowserData(convertedDocument, {
        blobHTTPHeaders: {
          blobContentType: file.type || "application/octet-stream",
          blobContentDisposition: `attachment; filename="${file.name}"`,
        },
      });

      // Update the workorder with the new document
      handleUpdateWorkorder({
        images: [...images, blockBlobClient.url],
        activity: [
          ...activity,
          {
            date: new Date().getTime(),
            user: user?.name || "Unknown User",
            action: "Uploaded a pre work image",
          },
        ],
      });

      // Update queue item to success
      setUploadQueue((prev) =>
        prev.map((item, idx) =>
          idx === queueIndex
            ? { ...item, status: "success", progress: 100 }
            : item,
        ),
      );

      // Remove from queue after 2 seconds
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((_, idx) => idx !== queueIndex));
      }, 2000);
    } catch (error) {
      console.error("Error uploading file:", error);

      // Update queue item to error
      setUploadQueue((prev) =>
        prev.map((item, idx) =>
          idx === queueIndex
            ? { ...item, status: "error", error: error.message }
            : item,
        ),
      );
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Upload Area */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: 2,
          borderStyle: "dashed",
          borderColor: "primary.light",
          borderRadius: 2,
          bgcolor: "primary.50",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              bgcolor: "primary.main",
              p: 1.5,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloudUpload sx={{ fontSize: 32, color: "white" }} />
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Upload Images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tap to select images
            </Typography>
          </Box>

          <FileUploader
            multiple
            handleChange={handleFileChange}
            types={["JPG", "JPEG", "PNG", "GIF", "WEBP", "HEIC"]}
          />
        </Box>
      </Paper>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {uploadQueue.map((item, index) => (
            <Paper
              key={`${item.name}-${index}`}
              elevation={0}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    bgcolor:
                      item.status === "success"
                        ? "success.50"
                        : item.status === "error"
                          ? "error.50"
                          : "grey.100",
                    p: 0.75,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.status === "success" ? (
                    <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                  ) : item.status === "error" ? (
                    <Error sx={{ color: "error.main", fontSize: 20 }} />
                  ) : (
                    <InsertPhoto sx={{ color: "grey.600", fontSize: 20 }} />
                  )}
                </Box>

                {/* File Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                  >
                    {item.name}
                  </Typography>

                  {item.status === "uploading" && (
                    <LinearProgress
                      sx={{ mt: 0.5, borderRadius: 1, height: 3 }}
                      variant="indeterminate"
                    />
                  )}

                  {item.status === "error" && (
                    <Typography
                      variant="caption"
                      color="error.main"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      Upload failed
                    </Typography>
                  )}
                </Box>

                {/* Status Chip */}
                <Chip
                  label={
                    item.status === "success"
                      ? "Done"
                      : item.status === "error"
                        ? "Failed"
                        : "..."
                  }
                  size="small"
                  color={
                    item.status === "success"
                      ? "success"
                      : item.status === "error"
                        ? "error"
                        : "default"
                  }
                  sx={{ fontWeight: 600, fontSize: "0.7rem", height: 20 }}
                />
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default MobileImageUploader;
