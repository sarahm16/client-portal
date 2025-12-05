import React, { useMemo, useState } from "react";

// hooks
import { usePermissions, useRole } from "../../../auth/hooks/usePermissions";
import { useAuth } from "../../../auth/hooks/AuthContext";

// MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const clientsWithPortal = [
  {
    id: "026cdd2f-3874-436e-ab0f-ddf3aa67da26",
    name: "GPM Investments. ",
  },
];

const CreateUserModal = ({ open, onClose, onSubmit, clients = [] }) => {
  const { user } = useAuth();
  const { isInternalAdmin } = useRole();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    client: null,
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const roles = ["Employee", "Internal Admin", "External Admin"];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.client) {
      newErrors.client = "Client is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      phone: true,
      role: true,
      client: true,
    });

    // If user is external admin, assign their client automatically
    if (!isInternalAdmin()) {
      formData.client = user.client;
    }

    if (validateForm()) {
      // Prepare data for submission
      formData.dateCreated = new Date().toLocaleDateString();
      formData.createdBy = user.name;

      onSubmit(formData);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      client: null,
      status: "Active",
    });
    setErrors({});
    setTouched({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight={600}>
            Create New User
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {isInternalAdmin() && (
              <TextField
                select
                label="Role"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                onBlur={() => handleBlur("role")}
                error={touched.role && !!errors.role}
                helperText={touched.role && errors.role}
                fullWidth
                required={isInternalAdmin()}
                variant="outlined"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {isInternalAdmin() && formData?.role !== "Internal Admin" && (
              <Autocomplete
                options={clientsWithPortal}
                getOptionLabel={(option) => option.client}
                value={formData.client}
                onChange={(e, newValue) => handleChange("client", newValue)}
                onBlur={() => handleBlur("client")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Client"
                    error={touched.client && !!errors.client}
                    helperText={touched.client && errors.client}
                    required={isInternalAdmin()}
                    variant="outlined"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
              error={touched.phone && !!errors.phone}
              helperText={
                touched.phone ? errors.phone || "Optional" : "Optional"
              }
              fullWidth
              variant="outlined"
              placeholder="+1 (555) 123-4567"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
            Create User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateUserModal;
