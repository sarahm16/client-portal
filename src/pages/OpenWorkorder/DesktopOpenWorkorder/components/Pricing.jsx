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

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Local components
import CardComponent from "./CardComponent";

// Utility functions
import formatCurrency from "../../../../utilities/formatCurrency";

const nteStatusColors = {
  Pending: "warning",
  Approved: "success",
  Denied: "error",
};

// Pricing & Scope Component
function PricingSection() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const activity = workorder?.activity || [];
  const nteRequests = workorder?.nteRequests || [];

  // Find pending requests that have been sent to client
  const pendingClientRequests = nteRequests.filter(
    (req) => req.status === "Pending" && req.sentToClient,
  );

  const [approveOpen, setApproveOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [denyReason, setDenyReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const updatedRequests = nteRequests.map((r) =>
        r.date === selectedRequest.date
          ? {
              ...r,
              status: "Approved",
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
              status: "Denied",
              clientDeniedDate: new Date().getTime(),
              clientResponse: "Denied",
              clientDenyReason: denyReason,
            }
          : r,
      );

      await updateWorkorder({
        nteRequests: updatedRequests,
        activity: [
          {
            date: new Date().getTime(),
            user: "Client",
            action: `Client denied NTE increase request for ${formatCurrency(
              selectedRequest.clientAmount,
            )}`,
          },
          ...activity,
        ],
      });

      // TODO: Send notification email to operations team

      setDenyOpen(false);
      setSelectedRequest(null);
      setDenyReason("");
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

          {selectedRequest?.reason && (
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
                {selectedRequest.reason}
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
          setDenyReason("");
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
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setDenyOpen(false);
              setSelectedRequest(null);
              setDenyReason("");
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
            disabled={isProcessing || !denyReason.trim()}
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
                  {request.reason}
                </Typography>
              </Box>

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
        {nteRequests.filter((req) => req.status !== "Pending").length > 0 && (
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
                  .filter((req) => req.status !== "Pending")
                  .map((request) => (
                    <Box
                      key={request.date}
                      sx={{
                        p: 2,
                        bgcolor:
                          request.status === "Approved" ? "#f1f8f4" : "#ffebee",
                        border: "1px solid",
                        borderColor:
                          request.status === "Approved" ? "#4caf50" : "#f44336",
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
                          label={request.status}
                          color={nteStatusColors[request.status]}
                          size="small"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(
                          request.clientApprovedDate ||
                            request.clientDeniedDate,
                        ).toLocaleDateString()}
                      </Typography>
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
