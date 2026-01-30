import { useAuth } from "../../../auth/hooks/AuthContext";

// MUI Components
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";

// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonIcon from "@mui/icons-material/Person";

// API
import { updateItemInAzure } from "../../../api/azureApi";

function DeactivateUserModal({ userToBlock, onClose, refreshUsers }) {
  const { user } = useAuth();
  const userName = user?.name;

  const isDeactivating = userToBlock?.status === "Active";

  const handleDeactivateUser = async () => {
    const updates = {
      activity: [
        {
          date: new Date().getTime(),
          action: `User ${isDeactivating ? "deactivated" : "reactivated"} by ${userName}`,
          user: userName,
        },
        ...(userToBlock.activity || []),
      ],
      status: isDeactivating ? "Deactivated" : "Active",
    };

    try {
      const updateResponse = await updateItemInAzure(
        updates,
        "users",
        userToBlock.id,
      );
      console.log("User status updated successfully:", updateResponse);
      onClose();
      refreshUsers(updateResponse);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <Modal
      open={Boolean(userToBlock)}
      onClose={onClose}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 480,
          bgcolor: "background.paper",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: isDeactivating ? "error.main" : "success.main",
            color: "white",
            p: 3,
            position: "relative",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              {isDeactivating ? (
                <BlockIcon sx={{ fontSize: 32 }} />
              ) : (
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              )}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {isDeactivating ? "Deactivate" : "Reactivate"} User
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isDeactivating
                  ? "This will suspend user access"
                  : "This will restore user access"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Alert
            severity={isDeactivating ? "warning" : "info"}
            sx={{ mb: 3, borderRadius: 2 }}
            icon={isDeactivating ? <PersonOffIcon /> : <PersonIcon />}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {isDeactivating
                ? "You are about to deactivate this user"
                : "You are about to reactivate this user"}
            </Typography>
            <Typography variant="body2">
              {isDeactivating
                ? "They will no longer be able to access the system until reactivated."
                : "They will regain full access to the system."}
            </Typography>
          </Alert>

          {/* User Info */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              User Details
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {userToBlock?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userToBlock?.email}
            </Typography>
            {userToBlock?.role && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Role: {userToBlock.role}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            px: 3,
            pb: 3,
            pt: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            size="large"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={isDeactivating ? "error" : "success"}
            onClick={handleDeactivateUser}
            size="large"
            startIcon={isDeactivating ? <BlockIcon /> : <CheckCircleIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: 2,
            }}
          >
            {isDeactivating ? "Deactivate User" : "Reactivate User"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default DeactivateUserModal;
