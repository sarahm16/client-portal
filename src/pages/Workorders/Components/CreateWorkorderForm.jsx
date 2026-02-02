import { useContext, useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";

// Context
import { WorkordersContext } from "../WorkOrders";
import { useAuth } from "../../../auth/hooks/AuthContext";

// MUI Components
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// MUI Icons
import Construction from "@mui/icons-material/Construction";
import Delete from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Date Library
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// API
import { queryItemsFromAzure, saveItemToAzure } from "../../../api/azureApi";
import { saveImagesToBlobStorage } from "../../../api/storageApi";

// Constants
import { priorityDueDates, trades } from "../../../constants";
import convertHeic from "../../../utilities/convertHeic";

// Local Components
import CreateSiteFormInline from "./CreateSiteFormInline";

const validSiteStatuses = ["Active", "Sourcing", "Unassigned"];
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 700,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 2,
};

function CreateWorkorderForm() {
  // User Info
  const { user } = useAuth();
  const client = user?.client;

  console.log("client", client);

  // Context
  const workordersContext = useContext(WorkordersContext);
  const { open, setOpen, handleSaveWorkorder } = workordersContext;

  // State
  const [sites, setSites] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otherService, setOtherService] = useState("");

  const [showSiteForm, setShowSiteForm] = useState(false);

  const [formValues, setFormValues] = useState({
    client: client,
    site: null,
    service: "",
    otherService: "",
    priority: "P-3", // Default to medium priority
    status: "New",
    createdBy: user,
    createdDate: new Date().getTime(),
    notes: [],
    attachments: [],
    description: "",
    images: [],
    dueDate: dayjs().add(7, "day"), // Default to 7 days from now
    currency: "USD",
    activity: [],
    clientSubmitted: true,
    clientPrice: 0,
    software: "Custom Portal",
    requiresProposal: false,
    intake: true,
    portalWorkorderId: "",
  });

  useEffect(() => {
    const fetchSites = async () => {
      const query = `SELECT * FROM c WHERE c.client = "${
        client.name
      }" AND (${validSiteStatuses
        .map((status) => `c.status = "${status}"`)
        .join(" OR ")})`;
      const response = await queryItemsFromAzure("sites", query);
      console.log("Fetched sites for work order creation:", response);
      setSites(response);
    };

    if (open && client) {
      fetchSites();
    }
  }, [open, client]);

  const handleImageUpload = (files) => {
    setImages(Object.values(files));
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form
    setFormValues({
      client: client,
      site: null,
      service: "",
      otherService: "",
      priority: "P-3",
      status: "New",
      createdBy: user,
      createdDate: new Date().getTime(),
      notes: [],
      attachments: [],
      description: "",
      images: [],
      dueDate: dayjs().add(7, "day"),
      currency: "USD",
      activity: [],
      clientSubmitted: true,
      clientPrice: 0,
      software: "Custom Portal",
      requiresProposal: false,
      intake: true,
      portalWorkorderId: "",
    });
    setImages([]);
  };

  const handleSiteCreation = async (site) => {
    const savedSite = await saveItemToAzure(site, "sites");
    if (savedSite) {
      setSites((prevSites) => [savedSite, ...prevSites]);
      setFormValues((prev) => ({
        ...prev,
        site: savedSite,
      }));
    }
    setShowSiteForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientPrice = Number(formValues.clientPrice);
      const workorderType = clientPrice > 6000 ? "Project" : "On Demand";

      const convertedImages = await Promise.all(
        images.map((image) => convertHeic(image)),
      );
      const imageArray = await saveImagesToBlobStorage(convertedImages);

      const objToCreate = {
        ...formValues,
        service:
          formValues.service === "Other"
            ? formValues.otherService
            : formValues.service,
        id: `NFC-${Math.floor(Math.random() * 100000)}`,
        site: {
          name: formValues.site.store,
          id: formValues.site.id,
          state: formValues.site.state || "",
        },
        activity: [
          {
            date: new Date().getTime(),
            user: user.name || "Unknown User",
            action: "Created work order",
          },
        ],
        images: imageArray,
        createdBy: user?.name,
        createdByEmail: user?.email,
        dateCreated: new Date().getTime(),
        status: formValues.requiresProposal ? "Requires proposal" : "New",
        workorderType: workorderType,
      };

      // Save work order and update parent state
      await handleSaveWorkorder(objToCreate);

      // Reset and close
      handleClose();
    } catch (err) {
      console.error("Error creating workorder:", err);
      alert(`Error creating workorder: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = (e) => {
    const dueDateOffset = priorityDueDates[e.target.value] || 7;
    console.log("Due date offset for priority", e.target.value, dueDateOffset);
    const newDueDate = dayjs().add(dueDateOffset, "day");
    setFormValues((prev) => ({
      ...prev,
      priority: e.target.value,
      dueDate: newDueDate,
    }));
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Backdrop sx={{ zIndex: 10000000 }} open={loading}>
          <CircularProgress sx={{ color: "white" }} />
        </Backdrop>

        {!showSiteForm && (
          <Stack
            component="form"
            onSubmit={handleSubmit}
            direction="column"
            spacing={3}
          >
            {/* Header */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                <Construction color="primary" /> Submit Work Order
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submit a new work order request for your location
              </Typography>
            </Box>

            <Divider />

            {/* Form Fields */}
            <Grid container spacing={3}>
              {/* Site Selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  Select Location *
                </Typography>
                <Autocomplete
                  options={sites}
                  getOptionLabel={(option) =>
                    `${option.store}${option.state ? ` - ${option.state}` : ""}`
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Choose your location"
                      required
                    />
                  )}
                  value={formValues.site}
                  onChange={(e, newValue) => {
                    setFormValues((prev) => ({
                      ...prev,
                      site: newValue,
                    }));
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value?.id
                  }
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2">
                    Can't find the location?
                  </Typography>
                  <Button size="small" onClick={() => setShowSiteForm(true)}>
                    Create Location Here
                  </Button>
                </Box>
              </Grid>
              {/* Priority Selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  Priority Level *
                </Typography>
                <Select
                  value={formValues.priority}
                  onChange={handlePriorityChange}
                  size="small"
                  fullWidth
                  required
                >
                  <MenuItem value="P-1">P-1 - Emergency (24 hours)</MenuItem>
                  <MenuItem value="P-2">P-2 - Urgent (2-3 days)</MenuItem>
                  <MenuItem value="P-3">P-3 - Standard (1 week)</MenuItem>
                  <MenuItem value="P-4">P-4 - Low Priority (2+ weeks)</MenuItem>
                </Select>
              </Grid>
              {/* Service Selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  Type of Service *
                </Typography>
                <Autocomplete
                  options={trades.map((trade) => trade.name)}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select or type service"
                      required
                    />
                  )}
                  value={formValues.service}
                  onChange={(e, newValue) => {
                    setFormValues((prev) => ({
                      ...prev,
                      service: newValue || "",
                    }));
                  }}
                  onInputChange={(e, newValue) => {
                    setFormValues((prev) => ({
                      ...prev,
                      service: newValue || "",
                    }));
                  }}
                />
                {formValues.service === "Other" && (
                  <TextField
                    sx={{ mt: 1 }}
                    size="small"
                    fullWidth
                    label="Please specify the service"
                    value={formValues.otherService}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        otherService: e.target.value,
                      }))
                    }
                    required={formValues.service === "Other"}
                  />
                )}
              </Grid>
              {/* Budget/Client Price */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  Initial Budget (Not To Exceed) *
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    type="number"
                    value={formValues.clientPrice}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        clientPrice: Number(e.target.value),
                      }))
                    }
                    size="small"
                    fullWidth
                    required
                    placeholder="0.00"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <Select
                    value={formValues.currency}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                    size="small"
                    sx={{ width: 100 }}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="CAD">CAD</MenuItem>
                  </Select>
                </Box>
              </Grid>
              {/* Requested Completion Date */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  Requested Completion Date *
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={formValues.dueDate}
                    onChange={(newValue) => {
                      setFormValues((prev) => ({
                        ...prev,
                        dueDate: newValue,
                      }));
                    }}
                    format="MM/DD/YYYY"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        required: true,
                      },
                    }}
                    minDate={dayjs()}
                  />
                </LocalizationProvider>
                <Alert
                  severity="info"
                  icon={<InfoOutlined fontSize="small" />}
                  sx={{ mt: 1, py: 0 }}
                >
                  <Typography variant="caption">
                    This is a requested date and may be adjusted based on
                    availability
                  </Typography>
                </Alert>
              </Grid>
              {/* External Work Order ID */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  External Work Order ID (Optional)
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={formValues.portalWorkorderId}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      portalWorkorderId: e.target.value,
                    }))
                  }
                  placeholder="Enter external work order ID"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  If this work order is tracked in another system, enter the ID
                  here
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel component="legend">
                  Will this work order require a proposal?
                </FormLabel>
                <FormGroup>
                  <FormControlLabel
                    sx={{ my: 1 }}
                    control={
                      <Checkbox
                        checked={formValues.requiresProposal}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            requiresProposal: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Yes, this work order will require a proposal before proceeding."
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!formValues.requiresProposal}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            requiresProposal: !e.target.checked,
                          }))
                        }
                      />
                    }
                    label="No, this work order does not require a proposal."
                  />
                </FormGroup>
              </Grid>
              {/* Description */}
              <Grid size={12}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  Description (Scope of Work) *
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={formValues.description}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Please provide detailed information about the work needed..."
                  required
                  size="small"
                />
              </Grid>
              {/* Image Upload */}
              <Grid size={12}>
                <Typography variant="caption" fontWeight={600} gutterBottom>
                  Attach Images (Optional)
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <FileUploader
                    multiple={true}
                    handleChange={handleImageUpload}
                    name="file"
                    types={["JPG", "PNG", "JPEG", "GIF", "HEIC"]}
                    children={
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                        }}
                      >
                        <ImageIcon color="primary" sx={{ fontSize: 40 }} />
                        <Typography variant="body2" color="text.secondary">
                          Drop images here or click to browse
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supports: JPG, PNG, JPEG, GIF
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Show uploaded images */}
                {images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {images.length} image(s) selected:
                    </Typography>
                    {images.map((image, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                          p: 1,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <ImageIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {image.name}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setImages(images.filter((_, i) => i !== index))
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button size="medium" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                size="medium"
                variant="contained"
                disabled={
                  loading ||
                  !formValues.site ||
                  !formValues.service ||
                  !formValues.description ||
                  !formValues.dueDate ||
                  !formValues.clientPrice
                }
                sx={{
                  minWidth: 140,
                  fontWeight: 600,
                }}
              >
                {loading ? "Submitting..." : "Submit Work Order"}
              </Button>
            </Box>
          </Stack>
        )}

        {showSiteForm && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <IconButton onClick={() => setShowSiteForm(false)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Create New Location
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              After creating the location, you'll return to your work order form
            </Alert>

            <CreateSiteFormInline
              onSave={handleSiteCreation}
              onCancel={() => setShowSiteForm(false)}
              client={client}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default CreateWorkorderForm;
