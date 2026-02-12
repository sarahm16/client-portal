import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Link,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Alert,
  Modal,
  Stack,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import { azureClient } from "../../api/azureClient";
import { useAuth } from "../../auth/hooks/AuthContext";

import logo from "../../assets/logo.jpg";

// Change Password Modal Component
function ChangePasswordModal({ open, onClose, email, onSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await azureClient.post(
        `/clientChangePassword?databaseId=procurement&containerId=users`,
        {
          email,
          newPassword,
        },
      );

      console.log("Change password response:", response.data);

      if (response.data.message === "Password changed successfully") {
        onSuccess();
      } else {
        setError("Failed to change password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Change password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={!loading ? onClose : undefined}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500 },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 3,
          p: 4,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "warning.light",
              color: "warning.dark",
              mb: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Change Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your password needs to be changed before continuing
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleChangePassword}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Minimum 8 characters"
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? "Changing Password..." : "Change Password"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const { user, setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
    setLoading(true);

    try {
      const loginResponse = await azureClient.post(
        `/clientLogin?databaseId=procurement&containerId=users`,
        {
          email,
          password,
        },
      );

      console.log("Login response data:", loginResponse.data);

      const message = loginResponse.data?.message;

      console.log("Login response message:", message);

      // Handle different response messages
      switch (message) {
        case "Account is deactivated":
          setEmailError("This account has been deactivated.");
          break;

        case "No account with this email found":
          setEmailError("No account with this email found");
          break;

        case "Invalid password":
          setPasswordError("Invalid password");
          break;

        case "Signed In":
          setUser(loginResponse.data.user);

          // Successful login - redirect to work orders
          navigate("/workorders");

          break;

        case "Signed In, but password needs to be changed":
          setUser(loginResponse.data.user);

          // Open change password modal
          setShowChangePasswordModal(true);
          break;

        default:
          setGeneralError("An unexpected error occurred. Please try again.");
          break;
      }
    } catch (error) {
      console.error("Login error:", error);
      setGeneralError(
        "Unable to connect to the server. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
    // Redirect to work orders after successful password change
    navigate("/workorders");
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordModal setShowForgotPassword={setShowForgotPassword} />
    );
  }

  return (
    <>
      <Box
        sx={{
          height: "calc(100vh - 35px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, sm: 5 },
              borderRadius: 3,
              width: "100%",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <img
                src={logo}
                alt="NFC Logo"
                style={{ maxWidth: "80%", marginBottom: "20px" }}
              />

              {/*               <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "white",
                  mb: 2,
                }}
              >
              </Box> */}
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                Work Order Portal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to submit and track work orders
              </Typography>
            </Box>

            {generalError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {generalError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(""); // Clear error on change
                }}
                placeholder="you@company.com"
                required
                sx={{ mb: 3 }}
                error={!!emailError}
                helperText={emailError}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(""); // Clear error on change
                }}
                placeholder="Enter your password"
                required
                sx={{ mb: 2 }}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label="Remember me"
                />
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setShowForgotPassword(true)}
                  sx={{ cursor: "pointer", textDecoration: "none" }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Need access?{" "}
              <Link href="#" underline="hover">
                Contact your administrator
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        email={email}
        onSuccess={handlePasswordChangeSuccess}
      />
    </>
  );
}
