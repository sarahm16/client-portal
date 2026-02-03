import { useContext, useState } from "react";
import axios from "axios";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AttachMoney from "@mui/icons-material/AttachMoney";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Local components
import CardComponent from "./CardComponent";

// Utility functions
import formatCurrency from "../../../../utilities/formatCurrency";
import { generateEmailRecipients } from "../../../../utilities/generateEmailRecipients";
import { sendEmailFromHTML } from "../../../../api/microsoftApi";

const generateEmailBody = (
  decision,
  decisionLower,
  id,
  client,
  store,
  workorderType,
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal {{decision}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header - Use green (#059669) for approved, red (#dc2626) for denied -->
          <tr>
            <td style="background-color: ${decision === "Approved" ? "#059669" : "#dc2626"}; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Proposal ${decision}</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <!-- Status Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: ${decision === "Approved" ? "#d1fae5" : "#fee2e2"}; border-radius: 6px; padding: 12px 16px;">
                    <span style="color: ${decision === "Approved" ? "#059669" : "#dc2626"}; font-size: 14px; font-weight: 600;">${decision === "Approved" ? "✔️" : "❌"} ${decision}</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                The client has <strong>${decisionLower}</strong> the proposal for the following work order.
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
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Work Order Type</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 500;">${workorderType}</p>
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
- {{decision}}: "Approved" or "Denied"
- {{decisionLower}}: "approved" or "denied"
- {{headerColor}}: #059669 (green) for approved, #dc2626 (red) for denied
- {{badgeBackground}}: #d1fae5 for approved, #fee2e2 for denied
- {{badgeText}}: #065f46 for approved, #991b1b for denied
- {{statusIcon}}: ✓ for approved, ✗ for denied
- {{id}}: Work order number
- {{client}}: Client name
- {{store}}: Store name/location
- {{workorderType}}: Type of work order
-->`;
};

const nteStatusColors = {
  Pending: "warning",
  Approved: "success",
  Denied: "error",
};

// Strip timestamp prefix and any query-string (SAS token) from a blob URL
const getFileName = (url) => {
  try {
    const path = new URL(url).pathname; // e.g. /container/1234567890_invoice.pdf
    const raw = path.split("/").pop(); // 1234567890_invoice.pdf
    const withoutTimestamp = raw.replace(/^\d+_/, ""); // invoice.pdf
    return decodeURIComponent(withoutTimestamp) || "attachment";
  } catch {
    return "attachment";
  }
};

// Reusable list of clickable attachment pills
function AttachmentList({ urls }) {
  if (!urls?.length) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Attachments
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {urls.map((url, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.25,
              bgcolor: "background.paper",
              borderRadius: 1.5,
              border: 1,
              borderColor: "divider",
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: 1,
              },
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.50",
                p: 0.6,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <AttachFileIcon sx={{ fontSize: 16, color: "primary.main" }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getFileName(url)}
            </Typography>
            <Button
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              color="primary"
              endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                py: 0.35,
                px: 1,
                borderRadius: 1,
                flexShrink: 0,
              }}
            >
              Open
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// Pricing & Scope Component
function PricingSection() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const activity = workorder?.activity || [];
  const nteRequests = workorder?.nteRequests || [];

  // Find pending requests that have been sent to client
  const pendingClientRequests = nteRequests.filter(
    (req) => !req.clientResponse && req.sentToClient,
  );

  const [approveOpen, setApproveOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [clientDenyReason, setClientDenyReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const updatedRequests = nteRequests.map((r) =>
        r.date === selectedRequest.date
          ? {
              ...r,
              clientApprovedDate: new Date().getTime(),
              clientResponse: "Approved",
            }
          : r,
      );

      const updates = {
        clientPrice: Number(selectedRequest.clientAmount),
        vendorPrice: Number(selectedRequest?.amount),
        nteRequests: updatedRequests,
        activity: [
          {
            date: new Date().getTime(),
            user: "Client",
            action: `Client approved NTE increase to ${formatCurrency(
              Number(selectedRequest.clientAmount),
            )}`,
          },
          ...activity,
        ],
      };

      await handleUpdateWorkorder(updates);

      // TODO: Send notification email to operations team
      const emailBody = generateEmailBody(
        "Approved", // Decision
        "approved", // Decision lowercase
        workorder?.id,
        workorder?.client?.name,
        workorder?.site?.name,
        workorder?.workorderType,
      );

      const emailRecipients = generateEmailRecipients([
        "sarah.carter@evergreenbrands.com",
      ]);

      await sendEmailFromHTML(
        "NTE Increase Approved - " + workorder?.id,
        emailBody,
        emailRecipients,
      );

      setApproveOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving NTE:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    setIsProcessing(true);
    try {
      const updatedRequests = nteRequests.map((r) =>
        r.date === selectedRequest.date
          ? {
              ...r,
              clientDeniedDate: new Date().getTime(),
              clientResponse: "Denied",
              clientDenyReason: clientDenyReason,
            }
          : r,
      );

      await handleUpdateWorkorder({
        nteRequests: updatedRequests,
        activity: [
          {
            date: new Date().getTime(),
            user: "Client",
            action: `Client denied NTE increase request for ${formatCurrency(
              Number(selectedRequest.clientAmount),
            )}`,
          },
          ...activity,
        ],
      });

      // TODO: Send notification email to operations team
      // TODO: Send notification email to operations team
      const emailBody = generateEmailBody(
        "Denied", // Decision
        "denied", // Decision lowercase
        workorder?.id,
        workorder?.client?.name,
        workorder?.site?.name,
        workorder?.workorderType,
      );

      const emailRecipients = generateEmailRecipients([
        "sarah.carter@evergreenbrands.com",
      ]);

      await sendEmailFromHTML(
        "NTE Increase Denied - " + workorder?.id,
        emailBody,
        emailRecipients,
      );

      setDenyOpen(false);
      setSelectedRequest(null);
      setClientDenyReason("");
    } catch (error) {
      console.error("Error denying NTE:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Approve Dialog */}
      <Dialog
        open={approveOpen}
        onClose={() => {
          setApproveOpen(false);
          setSelectedRequest(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            bgcolor: "#e8f5e9",
            borderBottom: "3px solid #4caf50",
            p: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#4caf50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon sx={{ color: "white" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#2e7d32" }}>
              Approve NTE Increase
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            You are about to approve an increase to the Not To Exceed (NTE)
            amount for this work order.
          </Alert>

          <Box
            sx={{
              p: 2.5,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              mb: 2,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current NTE Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatCurrency(workorder?.clientPrice)}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  New NTE Amount
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#2e7d32" }}
                >
                  {formatCurrency(selectedRequest?.clientAmount)}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Increase Amount
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#d32f2f" }}
                >
                  +
                  {formatCurrency(
                    selectedRequest?.clientAmount - workorder?.clientPrice,
                  )}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {selectedRequest?.customReason && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#fff3cd",
                borderRadius: 2,
                border: "1px solid #ffc107",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#856404" }}
              >
                Reason for Increase
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#856404" }}>
                {selectedRequest?.customReason}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setApproveOpen(false);
              setSelectedRequest(null);
            }}
            variant="outlined"
            color="inherit"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={isProcessing}
            startIcon={<CheckCircleIcon />}
          >
            {isProcessing ? "Processing..." : "Approve Increase"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog
        open={denyOpen}
        onClose={() => {
          setDenyOpen(false);
          setSelectedRequest(null);
          setClientDenyReason("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            bgcolor: "#ffebee",
            borderBottom: "3px solid #f44336",
            p: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#f44336",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CancelIcon sx={{ color: "white" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#c62828" }}>
              Deny NTE Increase
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please provide a reason for denying this NTE increase request.
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
              Requested NTE Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
              {formatCurrency(selectedRequest?.clientAmount)}
            </Typography>
          </Box>

          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Reason for Denial"
            placeholder="Please explain why you are denying this request..."
            value={clientDenyReason}
            onChange={(e) => setClientDenyReason(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setDenyOpen(false);
              setSelectedRequest(null);
              setClientDenyReason("");
            }}
            variant="outlined"
            color="inherit"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeny}
            variant="contained"
            color="error"
            disabled={isProcessing || !clientDenyReason.trim()}
            startIcon={<CancelIcon />}
          >
            {isProcessing ? "Processing..." : "Deny Request"}
          </Button>
        </DialogActions>
      </Dialog>

      <CardComponent
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Pricing & Scope
          </Typography>
        }
        icon={<AttachMoney color="warning" />}
        collapsible={true}
      >
        {/* Pending NTE Requests Alert */}
        {pendingClientRequests.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }} icon={<InfoOutlinedIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Action Required: NTE Increase Request
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The vendor has requested an increase to the Not To Exceed amount
              for this work order. Please review and respond.
            </Typography>
          </Alert>
        )}

        {/* NTE Increase Requests */}
        {pendingClientRequests.map((request) => (
          <Box
            key={request.date}
            sx={{
              p: 2.5,
              mb: 3,
              bgcolor: "#fff3cd",
              border: "2px solid #ffc107",
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#856404" }}
                  >
                    NTE Increase Request
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#856404", mt: 0.5 }}
                  >
                    {formatCurrency(request.clientAmount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current: {formatCurrency(workorder?.clientPrice)} |
                    Increase: +
                    {formatCurrency(
                      request.clientAmount - workorder?.clientPrice,
                    )}
                  </Typography>
                </Box>
                <Chip
                  label="Pending Your Response"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#856404" }}
                >
                  Reason for Increase
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: "#856404" }}>
                  {request.customReason}
                </Typography>
              </Box>

              {/* Attachments */}
              <AttachmentList urls={request.attachments} />

              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "rgba(255,255,255,0.7)",
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Submitted on{" "}
                  {new Date(request.sentToClientDate).toLocaleDateString()} by{" "}
                  {request.sentToClientBy}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    setSelectedRequest(request);
                    setApproveOpen(true);
                  }}
                >
                  Approve
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setSelectedRequest(request);
                    setDenyOpen(true);
                  }}
                >
                  Deny
                </Button>
              </Stack>
            </Stack>
          </Box>
        ))}

        {/* Current NTE Display */}
        <Box
          sx={{
            p: 3,
            bgcolor: "primary.50",
            borderRadius: 2,
            border: 2,
            borderColor: "primary.200",
            mb: 3,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "primary.dark" }}
          >
            Not To Exceed (NTE)
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "primary.dark", mt: 0.5 }}
          >
            {workorder?.clientPrice
              ? `${formatCurrency(workorder.clientPrice)} ${
                  workorder?.currency || "USD"
                }`
              : "Not specified"}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Scope of Work */}
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}
          >
            Scope of Work
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
              }}
            >
              {workorder?.description || "No description provided"}
            </Typography>
          </Box>
        </Box>

        {/* NTE History */}
        {nteRequests.filter((req) => req.clientResponse).length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}
              >
                NTE Request History
              </Typography>
              <Stack spacing={1.5}>
                {nteRequests
                  .filter((req) => req.clientResponse)
                  .map((request) => (
                    <Box
                      key={request.date}
                      sx={{
                        p: 2,
                        bgcolor:
                          request.clientResponse === "Approved"
                            ? "#f1f8f4"
                            : "#ffebee",
                        border: "1px solid",
                        borderColor:
                          request.clientResponse === "Approved"
                            ? "#4caf50"
                            : "#f44336",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(request.clientAmount)}
                        </Typography>
                        <Chip
                          label={request.clientResponse}
                          color={nteStatusColors[request.clientResponse]}
                          size="small"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(
                          request.clientApprovedDate ||
                            request.clientDeniedDate,
                        ).toLocaleDateString()}
                      </Typography>
                      <AttachmentList urls={request.attachments} />
                    </Box>
                  ))}
              </Stack>
            </Box>
          </>
        )}
      </CardComponent>
    </>
  );
}

export default PricingSection;
