import React, { useContext, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// API

// Auth
import { useAuth } from "../../../../auth/hooks/AuthContext";
import { generateEmailRecipients } from "../../../../utilities/generateEmailRecipients";
import { sendEmailFromHTML } from "../../../../api/microsoftApi";

const generateEmailBody = (id, client, store, workorderType, reopenReason) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Work Order Reopened</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #7c3aed; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Work Order Reopened</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <!-- Status Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #ede9fe; border-radius: 6px; padding: 12px 16px;">
                    <span style="color: #5b21b6; font-size: 14px; font-weight: 600;">↺ Reopened</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                The client has reopened the following work order.
              </p>
              
              <!-- Work Order Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Work Order #</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 600;">${id}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Client</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 500;">${client}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Store</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 500;">${store}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Work Order Type</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 500;">${workorderType}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Reopening</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; line-height: 1.5;">${reopenReason}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
                This is an automated notification from the Work Order Management System.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

<!--
Template Variables:
- {{id}}: Work order number
- {{client}}: Client name
- {{store}}: Store name/location
- {{workorderType}}: Type of work order
- {{reopenReason}}: Reason provided for reopening the work order
-->`;
};

function Reopen() {
  const workorderContext = useContext(WorkorderContext);
  const { workorder, handleUpdateWorkorder } = workorderContext;

  // State
  const [open, setOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User
  const { user } = useAuth();

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setReopenReason("");
  };

  const reopenWorkorder = async () => {
    if (!reopenReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        status: "Reopened",
        reopenDetails: {
          date: new Date().getTime(),
          user: user?.name,
          reason: reopenReason,
        },
        activity: [
          {
            date: new Date().getTime(),
            user: user?.name,
            action: `Work order reopened. Reason: ${reopenReason}`,
          },
          ...workorder.activity,
        ],
      };
      handleUpdateWorkorder(updates);
      const emailBody = generateEmailBody(
        workorder.id,
        workorder?.client?.name,
        workorder?.site?.name,
        workorder?.workorderType,
        reopenReason,
      );
      const recipients = generateEmailRecipients([
        workorder?.projectManager?.email ||
          "netstreit@nationalfacilitycontractors.com",
      ]);

      const bccRecipients = generateEmailRecipients([
        "sarah.carter@evergreenbrands.com",
        "stehou@nationalfacilitycontractors.com",
        "barern@nationalfacilitycontractors.com",
        "alipyl@nationalfacilitycontractors.com",
      ]);

      await sendEmailFromHTML(
        `Work Order Reopened - ` + workorder.id,
        emailBody,
        recipients,
        bccRecipients,
      );

      handleCloseModal();
    } catch (error) {
      console.error("Failed to reopen work order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Reopen Button */}
      <Button
        variant="outlined"
        color="warning"
        size="small"
        onClick={handleOpenModal}
      >
        Reopen Work Order
      </Button>

      {/* Modal Dialog */}
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        {/* Colored Header */}
        <Box
          sx={{
            bgcolor: "#fff3e0",
            borderBottom: "3px solid #ff9800",
            p: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#ff9800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ReplayIcon sx={{ color: "white" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#e65100" }}>
              Reopen Work Order
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This will change the status back to active and notify relevant team
            members.
          </Alert>

          <Box
            sx={{
              p: 2,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              mb: 3,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Work Order
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
              {workorder?.id}
            </Typography>
          </Box>

          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Reason for Reopening"
            placeholder="Describe why this work order needs to be reopened..."
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            disabled={isSubmitting}
            variant="outlined"
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={reopenWorkorder}
            variant="contained"
            color="warning"
            disabled={!reopenReason.trim() || isSubmitting}
            startIcon={<ReplayIcon />}
          >
            {isSubmitting ? "Reopening..." : "Reopen Work Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Reopen;
