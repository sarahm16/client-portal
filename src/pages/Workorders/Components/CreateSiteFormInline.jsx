import React, { useState } from "react";
import Autocomplete from "react-google-autocomplete";

// Helper function to extract address components

// MUI Components
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
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

// CreateSiteFormInline.jsx
function CreateSiteFormInline({ onSave, onCancel, client }) {
  const [formData, setFormData] = useState({
    client: client.name,
    store: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    status: "Active",
  });

  const { user } = useAuth();
  console.log("user in form", user);

  console.log("client in form", client);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const siteToSave = {
      demo: true, // Remove in production
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zipcode,
      store: formData.store,
      lat: formData.lat,
      lng: formData.lng,
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

    onSave(siteToSave);
  };

  const handlePlaceSelected = (place) => {
    if (!place.address_components || !place.geometry) {
      setError("Invalid address selected. Please try again.");
      return;
    }

    const extractedAddress = getExtractedAddress(place.address_components);
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData((prev) => ({
      ...prev,
      ...extractedAddress,
      lat,
      lng,
    }));

    setError("");
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
      {/* Simple site form fields */}
      <TextField
        label="Store Name"
        required
        value={formData.store}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, store: e.target.value }))
        }
      />

      <Box>
        <Autocomplete
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          onPlaceSelected={handlePlaceSelected}
          options={{
            types: ["address"],
            componentRestrictions: { country: "us" },
          }}
          defaultValue={formData.address}
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

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" type="submit">
          Create Location & Continue
        </Button>
      </Box>
    </Stack>
  );
}
export default CreateSiteFormInline;
