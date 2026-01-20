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
import { updateItemInAzure } from "../../../../api/azureApi";

// Auth
import { useAuth } from "../../../../auth/hooks/AuthContext";

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
