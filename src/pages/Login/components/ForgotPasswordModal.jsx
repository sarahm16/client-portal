import { useState } from "react";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

function ForgotPasswordModal({ setShowForgotPassword }) {
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Password reset logic would go here
    console.log("Password reset requested for:", forgotEmail);
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setForgotEmail("");
    }, 3000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
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
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email to receive a reset link
            </Typography>
          </Box>

          {resetSent && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium">
                Reset link sent!
              </Typography>
              <Typography variant="body2">
                Check your email for instructions.
              </Typography>
            </Alert>
          )}

          <Box component="form" onSubmit={handleForgotPassword}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@company.com"
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mb: 2, py: 1.5 }}
            >
              Send Reset Link
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setShowForgotPassword(false);
                setResetSent(false);
                setForgotEmail("");
              }}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPasswordModal;
