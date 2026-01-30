import { useAuth } from "../../../auth/hooks/AuthContext";

// MUI Components
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { updateItemInAzure } from "../../../api/azureApi";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

function DeactiveUserModal({ userToBlock, onClose, refreshUsers }) {
  const { user } = useAuth();
  const userName = user?.name;

  const handleDeactivateUser = async () => {
    const updates = {
      activity: [
        {
          date: new Date().getTime(),
          action: `User deactivated by ${userName}`,
          user: userName,
        },
        ...(userToBlock.activity || []),
      ],
      status: "Deactivated",
    };

    try {
      const updateResposne = await updateItemInAzure(
        updates,
        "users",
        userToBlock.id,
      );
      console.log("User deactivated successfully:", updateResposne);
      onClose();
      refreshUsers(updateResposne);
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  return (
    <>
      <Modal open={Boolean(userToBlock)} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Deactivate User
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to deactivate {userToBlock?.name}?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeactivateUser}
            >
              Deactivate
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default DeactiveUserModal;
