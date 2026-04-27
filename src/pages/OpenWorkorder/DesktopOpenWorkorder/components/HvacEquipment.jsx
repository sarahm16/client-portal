import React, { useContext, useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import { azureClient } from "../../../../api/azureClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// local imports
import { WorkorderContext } from "../../OpenWorkorder";

// mui imports
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Modal,
  ImageList,
  ImageListItem,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  AcUnit,
  QrCodeScanner,
  Numbers,
  TrendingUp,
  CalendarToday,
  ExpandMore,
  Image as ImageIcon,
  ArrowForwardIos,
  ArrowBackIos,
  Assignment,
  HowToReg,
  ExitToApp,
  Download,
} from "@mui/icons-material";

function HvacEquipment() {
  const workorderContext = useContext(WorkorderContext);
  const { workorder } = workorderContext;

  const siteId = useMemo(() => workorder?.site?.id, [workorder]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [initialSlide, setInitialSlide] = useState(0);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const response = await azureClient.post(
          `/noSqlQuery?containerId=equipment&databaseId=procurement`,
          {
            query: `SELECT * FROM c WHERE c.siteId = '${siteId}' AND c.service = 'Assessment'`,
          },
        );
        setEquipment(response.data);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchEquipment();
    }
  }, [siteId]);

  const calculateCompletion = (eq) => {
    if (!eq) return 0;

    const requiredFields = [
      "make",
      "model",
      "serialNumber",
      "tonnage",
      "condition",
      "filterSize",
      "beltInfo",
    ];

    const requiredImages = 5;
    const completedImages = eq.images?.filter((img) => img?.url).length || 0;

    const completedFields = requiredFields.filter((field) => {
      const value = eq[field];
      return value && value.toString().trim() !== "";
    }).length;

    const totalRequired = requiredFields.length + requiredImages;
    const totalCompleted = completedFields + completedImages;

    return Math.round((totalCompleted / totalRequired) * 100);
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "Good":
        return "success";
      case "Fair":
        return "warning";
      case "Poor":
        return "error";
      default:
        return "default";
    }
  };

  const equipmentStats = useMemo(() => {
    const total = equipment.length;
    const completed = equipment.filter(
      (eq) => calculateCompletion(eq) === 100,
    ).length;
    const incomplete = equipment.filter((eq) => calculateCompletion(eq) < 100);

    return {
      total,
      completed,
      incomplete: incomplete,
      incompleteCount: incomplete.length,
      allComplete: completed === total && total > 0,
    };
  }, [equipment]);

  const openImageModal = (images, startIndex = 0) => {
    setSelectedImages(images.filter((img) => img?.url));
    setInitialSlide(startIndex);
    setModalOpen(true);
  };

  const downloadAllEquipmentImages = async () => {
    let imageIndex = 1;
    for (const eq of equipment) {
      const images = eq.images?.filter((img) => img?.url) || [];
      for (const image of images) {
        try {
          const response = await fetch(
            image.url?.split("?sv=")[0]?.split("?sp=")?.[0],
          ); // Remove SAS token for fetching
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

          const blob = await response.blob();
          const link = document.createElement("a");
          const type = blob.type.split("/")[1] || "jpeg";
          link.href = URL.createObjectURL(blob);
          link.download = `${eq.barcode}_${image.description.replace(
            /\s+/g,
            "_",
          )}.${type}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        } catch (err) {
          console.error("Error downloading image:", err);
        }
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Image Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
          }}
        >
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            initialSlide={initialSlide}
            adaptiveHeight={true}
            nextArrow={<ArrowForwardIos sx={{ color: "darkcyan" }} />}
            prevArrow={<ArrowBackIos sx={{ color: "darkcyan" }} />}
          >
            {selectedImages.map((image, index) => (
              <div key={index}>
                <Typography
                  variant="caption"
                  display="block"
                  textAlign="center"
                  sx={{ mb: 1 }}
                >
                  {image.description}
                </Typography>
                <img
                  src={image.url}
                  alt={image.description}
                  style={{
                    maxHeight: "500px",
                    maxWidth: "100%",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </div>
            ))}
          </Slider>
        </Box>
      </Modal>

      <Stack direction="row" spacing={2}>
        {/* Left Column - Equipment Details */}
        <Stack direction="column" spacing={2} sx={{ flex: 1 }}>
          {/* Check In/Out Status */}
          <Card
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "4px",
              p: 1,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <ExitToApp color="success" fontSize="small" />
                    Check Out
                  </Typography>
                  <Typography variant="body2">
                    {workorder?.vendorUpdates?.checkOut
                      ? `Checked out at ${new Date(
                          workorder.vendorUpdates.checkOut?.date,
                        ).toLocaleString()}`
                      : "Not checked out yet"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Assessment Summary */}
          <Card
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "4px",
              p: 1,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Assignment color="primary" fontSize="small" />
                  Equipment Assessment Summary
                </Typography>
                {equipmentStats.total > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={downloadAllEquipmentImages}
                  >
                    Download All Photos
                  </Button>
                )}
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper
                    elevation={1}
                    sx={{ p: 2, textAlign: "center", bgcolor: "primary.light" }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="white">
                      {equipmentStats.total}
                    </Typography>
                    <Typography variant="caption" color="white">
                      Total Units
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    elevation={1}
                    sx={{ p: 2, textAlign: "center", bgcolor: "success.light" }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="white">
                      {equipmentStats.completed}
                    </Typography>
                    <Typography variant="caption" color="white">
                      Complete
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    elevation={1}
                    sx={{ p: 2, textAlign: "center", bgcolor: "error.light" }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="white">
                      {equipmentStats.incompleteCount}
                    </Typography>
                    <Typography variant="caption" color="white">
                      Incomplete
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {equipmentStats.total > 0 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Overall Completion
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(
                        (equipmentStats.completed / equipmentStats.total) * 100,
                      )}
                      %
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (equipmentStats.completed / equipmentStats.total) * 100
                    }
                    sx={{ height: 10, borderRadius: 1 }}
                    color={equipmentStats.allComplete ? "success" : "warning"}
                  />
                </Box>
              )}

              {equipmentStats.total === 0 && (
                <Alert severity="info">
                  No equipment has been assessed yet.
                </Alert>
              )}

              {!equipmentStats.allComplete && equipmentStats.total > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {equipmentStats.incompleteCount} unit
                  {equipmentStats.incompleteCount !== 1 ? "s" : ""} still
                  incomplete
                </Alert>
              )}

              {equipmentStats.allComplete && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  All equipment assessments complete!
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Equipment List */}
          {equipment.length > 0 && (
            <Card
              sx={{
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: "4px",
                p: 1,
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <AcUnit color="primary" fontSize="small" />
                  Equipment Details ({equipment.length} units)
                </Typography>

                <Stack spacing={1}>
                  {equipment.map((eq, index) => {
                    const completion = calculateCompletion(eq);
                    const isComplete = completion === 100;
                    const images = eq.images?.filter((img) => img?.url) || [];

                    return (
                      <Accordion key={eq.id || index}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              width: "100%",
                            }}
                          >
                            {isComplete ? (
                              <CheckCircle color="success" />
                            ) : (
                              <Error color="error" />
                            )}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {eq.make && eq.model
                                  ? `${eq.make} ${eq.model}`
                                  : "Unit Information Incomplete"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {eq.barcode}
                              </Typography>
                            </Box>
                            <Chip
                              label={isComplete ? "Complete" : `${completion}%`}
                              color={isComplete ? "success" : "warning"}
                              size="small"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            {/* Equipment Details Grid */}
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Numbers fontSize="small" color="action" />
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      Serial Number
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {eq.serialNumber || "Not provided"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>

                              <Grid item xs={6}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <TrendingUp fontSize="small" color="action" />
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      Tonnage
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {eq.tonnage
                                        ? `${eq.tonnage} Tons`
                                        : "Not provided"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>

                              <Grid item xs={6}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <CalendarToday
                                    fontSize="small"
                                    color="action"
                                  />
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      Age
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {eq.age
                                        ? `${eq.age} Years`
                                        : "Not provided"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>

                              <Grid item xs={6}>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Condition
                                  </Typography>
                                  {eq.condition ? (
                                    <Chip
                                      label={eq.condition}
                                      color={getConditionColor(eq.condition)}
                                      size="small"
                                      sx={{ mt: 0.5 }}
                                    />
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Not provided
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>

                            <Divider />

                            {/* Maintenance Details */}
                            <Box>
                              <Typography
                                variant="caption"
                                fontWeight="bold"
                                color="text.secondary"
                                display="block"
                              >
                                Maintenance Information
                              </Typography>
                              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                <Grid item xs={6}>
                                  <Typography variant="body2">
                                    <strong>Number of Filters:</strong>{" "}
                                    {eq.numberOfFilters || "Not provided"}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Filter Size:</strong>{" "}
                                    {eq.filterSize || "Not provided"}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2">
                                    <strong>Belt Info:</strong>{" "}
                                    {eq.beltInfo || "Not provided"}
                                  </Typography>
                                </Grid>
                                {eq.startupTest && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>Startup Test:</strong>{" "}
                                      {eq.startupTest}
                                    </Typography>
                                  </Grid>
                                )}
                                {(eq.tempIn || eq.tempOut) && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>Temperatures:</strong> In:{" "}
                                      {eq.tempIn || "N/A"}°F, Out:{" "}
                                      {eq.tempOut || "N/A"}°F
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>

                            {/* Additional Notes */}
                            {eq.notes && (
                              <>
                                <Divider />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Additional Notes
                                  </Typography>
                                  <Paper
                                    elevation={0}
                                    sx={{ p: 1.5, bgcolor: "grey.50", mt: 1 }}
                                  >
                                    <Typography variant="body2">
                                      {eq.notes}
                                    </Typography>
                                  </Paper>
                                </Box>
                              </>
                            )}

                            {/* Images */}
                            <Divider />
                            <Box>
                              <Typography
                                variant="caption"
                                fontWeight="bold"
                                color="text.secondary"
                                display="block"
                                sx={{ mb: 1 }}
                              >
                                Photos ({images.length} / 5)
                              </Typography>
                              {images.length > 0 ? (
                                <ImageList cols={5} gap={8}>
                                  {images.map((image, imgIndex) => (
                                    <ImageListItem
                                      key={imgIndex}
                                      onClick={() =>
                                        openImageModal(eq.images, imgIndex)
                                      }
                                      sx={{ cursor: "pointer" }}
                                    >
                                      <img
                                        src={image.url}
                                        alt={image.description}
                                        loading="lazy"
                                        style={{
                                          height: 80,
                                          width: "100%",
                                          objectFit: "cover",
                                          borderRadius: 4,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        textAlign="center"
                                        sx={{ mt: 0.5 }}
                                      >
                                        {image.description}
                                      </Typography>
                                    </ImageListItem>
                                  ))}
                                </ImageList>
                              ) : (
                                <Alert severity="warning" icon={<ImageIcon />}>
                                  No photos uploaded
                                </Alert>
                              )}
                            </Box>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Stack>
    </>
  );
}

export default HvacEquipment;
