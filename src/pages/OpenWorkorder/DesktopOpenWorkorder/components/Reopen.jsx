import React, { useContext, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";

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
        "sarah.carter@evergreenbrands.com",
      ]);

      await sendEmailFromHTML(
        `Work Order Reopened - ` + workorder.id,
        emailBody,
        recipients,
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
      <Dialog
        open={open}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          Reopen Work Order
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText
            sx={{
              mb: 3,
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "text.primary",
            }}
          >
            Are you sure you want to reopen this work order? This will change
            the status back to active and notify relevant team members.
          </DialogContentText>

          <TextField
            autoFocus
            required
            fullWidth
            multiline
            rows={4}
            label="Reason for Reopening"
            placeholder="Describe why this work order needs to be reopened..."
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            disabled={isSubmitting}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleCloseModal}
            disabled={isSubmitting}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={reopenWorkorder}
            variant="contained"
            color="warning"
            disabled={!reopenReason.trim() || isSubmitting}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {isSubmitting ? "Reopening..." : "Confirm Reopen"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Reopen;
