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
