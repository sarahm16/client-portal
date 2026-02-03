import { useState, useContext } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Cancel from "@mui/icons-material/Cancel";
import { WorkorderContext } from "../../OpenWorkorder";
import { useAuth } from "../../../../auth/hooks/AuthContext";
import { generateEmailRecipients } from "../../../../utilities/generateEmailRecipients";
import { sendEmailFromHTML } from "../../../../api/microsoftApi";

const generateEmailBody = (
  id,
  client,
  store,
  workorderType,
  cancellationReason,
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Work Order Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #dc2626; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Work Order Cancelled</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <!-- Status Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #fee2e2; border-radius: 6px; padding: 12px 16px;">
                    <span style="color: #991b1b; font-size: 14px; font-weight: 600;">✗ Cancelled</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                The client has cancelled the following work order.
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
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Cancellation</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; line-height: 1.5;">${cancellationReason}</p>
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
- {{cancellationReason}}: Reason provided for cancellation
-->`;
};

function CancelWorkorder() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);

  const { user } = useAuth();

  const handleOpen = () => {
    setOpen(true);
    setReason("");
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    setReason("");
    setError("");
  };

  const handleCancel = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    // Update workorder status to Cancelled with reason
    handleUpdateWorkorder({
      status: "Cancelled",
      cancelDetails: {
        date: new Date().getTime(),
        reason: reason,
      },
      activity: [
        {
          date: new Date().getTime(),
          user: user?.name,
          action: `Work order cancelled. Reason: ${reason}`,
        },
        ...workorder.activity,
      ],
    });

    const emailBody = generateEmailBody(
      workorder.id,
      workorder.client?.name,
      workorder.site?.name,
      workorder.workorderType,
      reason,
    );

    const recipients = generateEmailRecipients([
      "sarah.carter@evergreenbrands.com",
    ]);

    sendEmailFromHTML(
      `Work Order Cancelled - ` + workorder.id,
      emailBody,
      recipients,
    );

    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Cancel />}
        onClick={handleOpen}
        size="small"
      >
        Cancel Work Order
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Work Order</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Cancellation"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            error={!!error}
            helperText={
              error || "Please explain why this work order is being cancelled"
            }
            placeholder="e.g., Customer request, duplicate order, no longer needed..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Keep Active
          </Button>
          <Button onClick={handleCancel} variant="contained" color="error">
            Cancel Work Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CancelWorkorder;
