// Libraries
import { useState } from "react";

// MUI Components
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";

// MUI Icons
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationIcon from "@mui/icons-material/LocationOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

// Hooks / Auth
import { useAuth } from "../auth/hooks/AuthContext";
import { sendEmailFromHTML } from "../api/microsoftApi";
import { generateEmailRecipients } from "../utilities/generateEmailRecipients";

const INITIAL_FORM = { subject: "", category: "", description: "" };

const generateEmailContent = (clientName, email, name, helpForm) => {
  const categoryLabels = {
    bug: "Bug / Something isn't working",
    access: "Access / Permissions issue",
    question: "General question",
    feature: "Feature request",
    other: "Other",
  };

  const emailSubject = `[Support Request] ${categoryLabels[helpForm.category]} — ${helpForm.subject}`;

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1976d2;padding:24px 28px;">
            <p style="margin:0 0 2px;color:#ffffff;font-size:18px;font-weight:700;">New support request</p>
            <p style="margin:0;color:#bbdefb;font-size:13px;">NFC Client Portal</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6;">
              A client has submitted a support request. Details are below.
            </p>

            <!-- Meta fields -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="font-size:13px;color:#6b7280;font-weight:500;padding:8px 0;border-bottom:1px solid #f3f4f6;width:110px;vertical-align:top;">Client</td>
                <td style="font-size:13px;color:#111827;padding:8px 0;border-bottom:1px solid #f3f4f6;">${clientName}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;font-weight:500;padding:8px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">Submitted by</td>
                <td style="font-size:13px;color:#111827;padding:8px 0;border-bottom:1px solid #f3f4f6;">${name}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;font-weight:500;padding:8px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">Email</td>
                <td style="font-size:13px;padding:8px 0;border-bottom:1px solid #f3f4f6;"><a href="mailto:${email}" style="color:#1976d2;text-decoration:none;">${email}</a></td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;font-weight:500;padding:8px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">Category</td>
                <td style="font-size:13px;color:#111827;padding:8px 0;border-bottom:1px solid #f3f4f6;">${categoryLabels[helpForm.category]}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;font-weight:500;padding:8px 0;vertical-align:top;">Subject</td>
                <td style="font-size:13px;color:#111827;padding:8px 0;">${helpForm.subject}</td>
              </tr>
            </table>

            <!-- Description -->
            <div style="background:#f9fafb;border-left:3px solid #1976d2;border-radius:0 4px 4px 0;padding:14px 16px;margin-bottom:20px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Description</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${helpForm.description}</p>
            </div>

            <p style="margin:0;font-size:13px;color:#6b7280;">Reply directly to this email to respond to the client.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 28px;font-size:12px;color:#9ca3af;">
            This notification was automatically generated by the NFC Client Portal.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

  return {
    emailSubject,
    emailHtml,
  };
};

function HelpForm() {
  // Form state
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpForm, setHelpForm] = useState(INITIAL_FORM);
  const [helpSubmitted, setHelpSubmitted] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);

  // Authenticated User
  const { user } = useAuth();

  console.log("Authenticated User in Help Form:", user);

  const { client, email, name } = user || {};
  const clientName = client?.name || "";

  // Help dialog handlers
  const handleHelpOpen = () => {
    setHelpSubmitted(false);
    setHelpForm(INITIAL_FORM);
    setHelpOpen(true);
    /*     handleMobileMenuClose();
     */
  };

  const handleHelpClose = () => {
    setHelpOpen(false);
  };

  const handleHelpFormChange = (e) => {
    setHelpForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleHelpSubmit = async () => {
    setHelpLoading(true);
    const { emailSubject, emailHtml } = generateEmailContent(
      clientName,
      email,
      name,
      helpForm,
    );
    const toRecipients = generateEmailRecipients([
      "sarah.carter@evergreenbrands.com",
    ]);
    const emailResponse = await sendEmailFromHTML(
      emailSubject,
      emailHtml,
      toRecipients,
      [],
    );
    console.log("Help form submitted:", emailResponse);
    // Replace this with your actual API call
    await new Promise((res) => setTimeout(res, 1000));
    setHelpLoading(false);
    setHelpSubmitted(true);
  };

  const isFormValid =
    helpForm.subject.trim() && helpForm.category && helpForm.description.trim();

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<HelpOutlineIcon />}
        onClick={handleHelpOpen}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
          borderColor: "primary.light",
          color: "primary.main",
          "&:hover": { bgcolor: "primary.50" },
        }}
      >
        Help & Support
      </Button>

      {/* ── Help & Support Dialog ── */}
      <Dialog
        open={helpOpen}
        onClose={handleHelpClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HelpOutlineIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Help & Support
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleHelpClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            pt: 3,
            pb: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {helpSubmitted ? (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Your request has been submitted! Our team will get back to you
              shortly.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Describe your issue and we'll get back to you as soon as
                possible.
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={helpForm.category}
                  label="Category"
                  onChange={handleHelpFormChange}
                >
                  <MenuItem value="bug">Bug / Something isn't working</MenuItem>
                  <MenuItem value="access">Access / Permissions issue</MenuItem>
                  <MenuItem value="question">General question</MenuItem>
                  <MenuItem value="feature">Feature request</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Subject"
                name="subject"
                value={helpForm.subject}
                onChange={handleHelpFormChange}
                size="small"
                fullWidth
                placeholder="Brief summary of your request"
              />

              <TextField
                label="Description"
                name="description"
                value={helpForm.description}
                onChange={handleHelpFormChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Please provide as much detail as possible..."
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleHelpClose}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {helpSubmitted ? "Close" : "Cancel"}
          </Button>
          {!helpSubmitted && (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleHelpSubmit}
              disabled={!isFormValid || helpLoading}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
            >
              {helpLoading ? "Submitting…" : "Submit Request"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default HelpForm;
