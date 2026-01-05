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
      body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background-color: #6366f1; border-radius: 12px 12px 0 0;">
                            <div style="width: 60px; height: 60px; margin: 0 auto 20px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%;">
                                <table role="presentation" style="width: 100%; height: 100%;">
                                    <tr>
                                        <td style="text-align: center; vertical-align: middle;">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Password Reset</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Your password has been successfully reset. Below is your temporary password:
                            </p>
                            
                            <!-- Password Box -->
                            <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; padding: 20px 24px; border-radius: 8px; margin: 0 0 32px;">
                                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
                                <p style="margin: 0; color: #111827; font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                                    ${newPassword}
                                </p>
                            </div>
                            
                            <!-- Warning Box -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 0 0 32px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong style="display: block; margin-bottom: 4px;">⚠️ Important Security Notice</strong>
                                    Please log in and change your password immediately. Do not share this temporary password with anyone.
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin: 0 0 24px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <table role="presentation" style="display: inline-block;">
                                            <tr>
                                                <td style="background-color: #6366f1; border-radius: 8px; padding: 14px 40px;">
                                                    <a href="https://clients.nfcfm.com" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                                                        Log In to Change Password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you didn't request this password reset, please contact our support team immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px;">
                                This is an automated message, please do not reply.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                                © 2025 Your Company. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
    };

    const emailData = {
      message: {
        subject: emailParams.subject,
        body: {
          contentType: "HTML",
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
