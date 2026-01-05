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
} from "@mui/material";

// Local imports
import { saveItemToAzure } from "../../../api/azureApi";
import { useAuth } from "../../../auth/hooks/AuthContext";

// Helper function to extract address components
const extractFromAddress = (components, type) => {
  const component = components.find((component) =>
    component.types.includes(type)
  );
  return component ? component.short_name : "";
};

export const getExtractedAddress = (address_components) => {
  const street = extractFromAddress(address_components, "street_number");
  const route = extractFromAddress(address_components, "route");
  const city = extractFromAddress(address_components, "locality");
  const state = extractFromAddress(
    address_components,
    "administrative_area_level_1"
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
        "Please select an address from the dropdown to get location coordinates"
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
        demo: true, // Remove in production
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Site</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <TextField
            label="Company"
            value={site.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            fullWidth
            required
            placeholder="Enter company name"
          />

          <TextField
            label="Store Name"
            value={site.store}
            onChange={(e) => handleInputChange("store", e.target.value)}
            fullWidth
            required
            placeholder="Enter store name or number"
          />

          <Box>
            <Autocomplete
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              onPlaceSelected={handlePlaceSelected}
              options={{
                types: ["address"],
                componentRestrictions: { country: "us" },
              }}
              defaultValue={site.address}
              style={{
                width: "96.5%",
                padding: "16.5px 14px",
                fontSize: "1rem",
                border: "1px solid rgba(0, 0, 0, 0.23)",
                borderRadius: "4px",
                fontFamily: "inherit",
              }}
              placeholder="Start typing address..."
            />
            <Box sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.5 }}>
              Select an address from the dropdown to auto-fill fields
            </Box>
          </Box>

          <TextField
            label="Address"
            value={site.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            fullWidth
            required
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="City"
              value={site.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="State"
              value={site.state}
              onChange={(e) =>
                handleInputChange("state", e.target.value.toUpperCase())
              }
              fullWidth
              required
              inputProps={{
                maxLength: 2,
                style: { textTransform: "uppercase" },
              }}
            />

            <TextField
              label="Zipcode"
              value={site.zipcode}
              onChange={(e) => handleInputChange("zipcode", e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: 10 }}
            />
          </Box>

          {site.lat && site.lng && (
            <Alert severity="success">
              Location coordinates captured: {site.lat.toFixed(6)},{" "}
              {site.lng.toFixed(6)}
            </Alert>
          )}

          <TextField
            label="Client"
            value={user.client?.name || ""}
            fullWidth
            disabled
            helperText="Auto-populated from your account"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Creating..." : "Create Site"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateSiteForm;
