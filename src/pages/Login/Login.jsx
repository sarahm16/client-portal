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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import ForgotPasswordModal from "./components/ForgotPasswordModal";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Login logic would go here
    console.log("Login attempt:", { email, password });
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordModal setShowForgotPassword={setShowForgotPassword} />
    );
  }

  return (
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
            <Box
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
              <AssignmentIcon sx={{ fontSize: 32 }} />
            </Box>
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

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              sx={{ mb: 2 }}
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
              sx={{ mb: 2, py: 1.5 }}
            >
              Sign In
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Need access?{" "}
            <Link href="#" underline="hover">
              Contact your administrator
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
