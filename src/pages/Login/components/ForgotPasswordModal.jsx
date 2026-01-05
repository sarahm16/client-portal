import { useState } from "react";

// Functions
import { sendEmailViaMicrosoft } from "../../../api/microsoftApi";
import genPass from "../../../utilities/genPass";
import { azureClient } from "../../../api/azureClient";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { CircularProgress } from "@mui/material";

function ForgotPasswordModal({ setShowForgotPassword }) {
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    console.log("Handling forgot password for:", forgotEmail);
    e.preventDefault();
    setLoading(true);
    const newPassword = genPass();
    // Password reset logic would go here
    const resetResponse = await azureClient.post(
      `/clientResetPassword?databaseId=procurement&containerId=users`,
      {
        newPassword,
        email: forgotEmail,
      }
    );
    console.log("Password reset response:", resetResponse);

    // Send reset email
    const emailParams = {
      to: forgotEmail,
      subject: "Password Reset Request",
      body: `Your password has been reset. Your new temporary password is: ${newPassword}\n\nPlease log in and change your password immediately.`,
    };

    const emailData = {
      message: {
        subject: emailParams.subject,
        body: {
          contentType: "Text",
          content: emailParams.body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: emailParams.to,
            },
          },
        ],
      },
      saveToSentItems: "true",
    };

    try {
      await sendEmailViaMicrosoft(emailData);
      console.log("Reset email sent successfully");
    } catch (error) {
      console.error("Error sending reset email:", error);
    }

    setTimeout(() => {
      setResetSent(false);
      setForgotEmail("");
      setLoading(false);
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
              disabled={loading}
              endIcon={loading ? <CircularProgress size={15} /> : null}
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
