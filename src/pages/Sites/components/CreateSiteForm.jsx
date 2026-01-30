import React, { useState } from "react";
import Autocomplete from "react-google-autocomplete";

// MUI imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  IconButton,
  Stack,
  Divider,
  Paper,
} from "@mui/material";

// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StoreIcon from "@mui/icons-material/Store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";

// Local imports
import { useAuth } from "../../../auth/hooks/AuthContext";

// Helper function to extract address components
const extractFromAddress = (components, type) => {
  const component = components.find((component) =>
    component.types.includes(type),
  );
  return component ? component.short_name : "";
};

export const getExtractedAddress = (address_components) => {
  const street = extractFromAddress(address_components, "street_number");
  const route = extractFromAddress(address_components, "route");
  const city = extractFromAddress(address_components, "locality");
  const state = extractFromAddress(
    address_components,
    "administrative_area_level_1",
  );
  const zipcode = extractFromAddress(address_components, "postal_code");

  return {
    address: street && route ? `${street} ${route}` : "",
    city,
    state,
    zipcode,
  };
};

function CreateSiteForm({ open, onClose, onSave }) {
  const { user } = useAuth();

  const [site, setSite] = useState({
    company: "",
    store: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    lat: null,
    lng: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceSelected = (place) => {
    if (!place.address_components || !place.geometry) {
      setError("Invalid address selected. Please try again.");
      return;
    }

    const extractedAddress = getExtractedAddress(place.address_components);
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setSite((prev) => ({
      ...prev,
      ...extractedAddress,
      lat,
      lng,
    }));

    setError("");
  };

  const handleInputChange = (field, value) => {
    setSite((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!site.store.trim()) {
      setError("Store name is required");
      return false;
    }
    if (!site.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!site.city.trim()) {
      setError("City is required");
      return false;
    }
    if (!site.state.trim()) {
      setError("State is required");
      return false;
    }
    if (!site.zipcode.trim()) {
      setError("Zipcode is required");
      return false;
    }
    if (!site.lat || !site.lng) {
      setError(
        "Please select an address from the dropdown to get location coordinates",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const siteToSave = {
        company: site.company,
        demo: true,
        address: site.address,
        city: site.city,
        state: site.state,
        zipcode: site.zipcode,
        store: site.store,
        lat: site.lat,
        lng: site.lng,
        client: user.client?.name?.trim(),
        serviceLines: [],
        subcontractors: [],
        status: "Active",
        activity: [
          {
            date: new Date().getTime(),
            user: user.name || "Unknown User",
            action: "Created site in Client Portal",
          },
        ],
        software: "Custom Portal",
      };

      await onSave(siteToSave);
      handleClose();
    } catch (err) {
      console.error("Error saving site:", err);
      setError("An error occurred while saving the site.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSite({
      company: "",
      store: "",
      address: "",
      city: "",
      state: "",
      zipcode: "",
      lat: null,
      lng: null,
    });
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Custom Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: 3,
          position: "relative",
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "white",
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocationOnIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Create New Location
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Add a new site location to your account
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Store Information Section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <StoreIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Store Information
              </Typography>
            </Box>

            <Stack spacing={2.5}>
              <TextField
                label="Store Name"
                value={site.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                fullWidth
                required
                placeholder="e.g., Starbucks, Walmart, Target"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "grey.50",
                  },
                }}
              />

              <TextField
                label="Site Number / Name"
                value={site.store}
                onChange={(e) => handleInputChange("store", e.target.value)}
                fullWidth
                required
                placeholder="e.g., Store #12345 or Downtown Location"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "grey.50",
                  },
                }}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Address Section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LocationOnIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Location Address
              </Typography>
            </Box>

            <Stack spacing={2.5}>
              {/* Google Autocomplete */}
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "primary.50",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <LocationOnIcon color="primary" fontSize="small" />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.dark" }}
                    >
                      Search for Address
                    </Typography>
                  </Box>
                  <Autocomplete
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    onPlaceSelected={handlePlaceSelected}
                    options={{
                      types: ["address"],
                      componentRestrictions: { country: "us" },
                    }}
                    defaultValue={site.address}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      fontSize: "1rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontFamily: "inherit",
                      backgroundColor: "white",
                      outline: "none",
                    }}
                    placeholder="Start typing address..."
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    💡 Select from dropdown to auto-fill all address fields
                  </Typography>
                </Paper>
              </Box>

              {/* Manual Address Fields */}
              <TextField
                label="Street Address"
                value={site.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "grey.50",
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="City"
                  value={site.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{
                    flex: 2,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "grey.50",
                    },
                  }}
                />

                <TextField
                  label="State"
                  value={site.state}
                  onChange={(e) =>
                    handleInputChange("state", e.target.value.toUpperCase())
                  }
                  fullWidth
                  required
                  placeholder="CA"
                  inputProps={{
                    maxLength: 2,
                    style: { textTransform: "uppercase" },
                  }}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "grey.50",
                    },
                  }}
                />

                <TextField
                  label="Zipcode"
                  value={site.zipcode}
                  onChange={(e) => handleInputChange("zipcode", e.target.value)}
                  fullWidth
                  required
                  placeholder="12345"
                  inputProps={{ maxLength: 10 }}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "grey.50",
                    },
                  }}
                />
              </Box>

              {/* Coordinates Confirmation */}
              {site.lat && site.lng && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "success.50",
                    border: "2px solid",
                    borderColor: "success.main",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon color="success" />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "success.dark" }}
                      >
                        Location Verified
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Coordinates: {site.lat.toFixed(6)},{" "}
                        {site.lng.toFixed(6)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Client Information */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <BusinessIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Account Information
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "grey.100",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                Client Account
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {user.client?.name || "Unknown Client"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                This location will be added to your account
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          pb: 3,
          pt: 2,
          bgcolor: "grey.50",
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          size="large"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          size="large"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            boxShadow: 2,
          }}
        >
          {loading ? "Creating Location..." : "Create Location"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateSiteForm;
