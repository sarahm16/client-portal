import React, { useMemo, useState } from "react";

// hooks
import { usePermissions, useRole } from "../../../auth/hooks/usePermissions";
import { useAuth } from "../../../auth/hooks/AuthContext";
import genPass from "../../../utilities/genPass";
import { sendEmailViaMicrosoft } from "../../../api/microsoftApi";

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
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const clientsWithPortal = [
  {
    id: "026cdd2f-3874-436e-ab0f-ddf3aa67da26",
    name: "GPM Investments. ",
  },
  {
    name: "Test JW",
    id: "22ad3841-22ae-44f2-9639-2b49961fbe71",
  },
];

const checkIfUserExists = (email, users) => {
  return users.some((user) => user.email.toLowerCase() === email.toLowerCase());
};

// Email to send to new user
const buildWelcomeEmail = (newUser, password) => {
  // Send welcome email to vendor with account creation instructions
  const html = `
        <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New ${newUser.role} Account Created</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="20" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px;">
            <tr>
              <td align="center" style="padding-bottom: 0;">
                <h2 style="color: #333;">Welcome to NFC</h2>
              </td>
            </tr>
            <tr>
              <td>
                <p style="color: #555;">
                  Hello <strong>${newUser.name}</strong>,
                </p>
                <p style="color: #555;">
                  A new ${newUser.role} account has been created for you. We're excited to have you on board!
                </p>
                <p style="color: #555;">
                  To get started, please log in to your account using the credentials below:
                </p>

                <table cellpadding="10" cellspacing="0" border="0" style="background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 6px;">
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>${newUser.email}</td>
                  </tr>
                  <tr>
                    <td><strong>Temporary Password:</strong></td>
                    <td><code>${password}</code></td>
                  </tr>
                </table>

                <p style="color: #555; margin-top: 20px;">
                  Please click the button below to log in and view your assigned work order. You'll be prompted to set a new password after your first login.
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="https://clients.nfcfm.com" style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block;">
                    Log In to Your Account
                  </a>
                </p>

                <p style="color: #555;">
                  If you have any questions or need help accessing your account, feel free to reach out to our support team at <a href="mailto:support@[yourcompany].com">support@[yourcompany].com</a>.
                </p>

                <p style="color: #555;">Best regards,<br />The NFC Team</p>
              </td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            This message was sent by NFC.
          </p>
        </td>
      </tr>
    </table>
    </body>
    </html>
    `;

  return {
    message: {
      subject: "Welcome to National Facility Contractors - New Account Created",
      body: {
        contentType: "HTML",
        content: html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: newUser.email,
          },
        },
      ],
      bccRecipients: [
        {
          emailAddress: {
            address: "sarah.carter@evergreenbrands.com",
          },
        },
      ],
    },
  };
};

const CreateUserModal = ({ users, open, onClose, onSubmit, clients = [] }) => {
  const { user } = useAuth();
  const { isInternalAdmin } = useRole();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    client: null,
    status: "Active",
    password: "",
    passwordChanged: false,
    rawPassword: "",
  });
  const [loading, setLoading] = useState(false);
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
    } else if (checkIfUserExists(formData.email, users)) {
      newErrors.email = "Email already exists";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.client && !isInternalAdmin()) {
      newErrors.client = "Client is required";
    }

    console.log("Validation errors:", newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    // Trim whitespace for text fields
    if (typeof value === "string" && field !== "phone" && field !== "name") {
      value = value.trim();
    }
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTouched({
      name: true,
      email: true,
      phone: true,
      role: true,
      client: !isInternalAdmin(),
    });

    // If user is external admin, assign their client automatically
    if (!isInternalAdmin()) {
      formData.client = user.client;
      formData.role = "Employee";
    }

    if (validateForm()) {
      // Prepare data for submission
      formData.dateCreated = new Date().toLocaleDateString();
      formData.createdBy = user.name;

      const password = genPass();
      formData.password = password;
      formData.rawPassword = password;
      // Save user to database
      onSubmit(formData);

      // Notify new user via email
      const emailContent = buildWelcomeEmail(formData, formData.password);
      await sendEmailViaMicrosoft(emailContent);

      // Reset form
      handleReset();
      onClose();
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      client: null,
      status: "Active",
      password: "",
      passwordChanged: false,
      rawPassword: "",
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
      {loading && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
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
                getOptionLabel={(option) => option.name}
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
