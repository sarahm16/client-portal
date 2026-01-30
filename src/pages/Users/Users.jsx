import { useEffect, useState } from "react";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

// Custom Components
import CreateUserModal from "./components/CreateUserModal";
import DeactiveUserModal from "./components/DeactivateUserModal";

// Constants
import { PERMISSIONS } from "../../auth/permissions";

// Custom Hooks
import { usePermissions, useRole } from "../../auth/hooks/usePermissions";
import { useAuth } from "../../auth/hooks/AuthContext";
import { azureClient } from "../../api/azureClient";
import { saveItemToAzure } from "../../api/azureApi";
import { RestartAlt } from "@mui/icons-material";

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
const getRoleConfig = (role) => {
  switch (role) {
    case "Internal Admin":
      return {
        label: "Internal Admin",
        color: "error",
        icon: <AdminPanelSettingsIcon fontSize="small" />,
      };
    case "External Admin":
      return {
        label: "External Admin",
        color: "warning",
        icon: <SupervisorAccountIcon fontSize="small" />,
      };
    case "Employee":
      return { label: "Employee", color: "primary", icon: null };
    default:
      return { label: role, color: "default", icon: null };
  }
};
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const showEditModal = Boolean(selectedUser);

  const [userToBlock, setUserToBlock] = useState(null);

  const { user } = useAuth();
  const client = user?.client;
  const { isInternalAdmin, isExternalAdmin } = useRole();
  const { hasPermission } = usePermissions();

  console.log("Is Internal Admin:", isInternalAdmin);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await azureClient.get(
        "/getAll?databaseId=procurement&containerId=users",
      );

      console.log("Fetched users:", response.data);

      if (isInternalAdmin()) {
        setUsers(response.data);
        return;
      }

      setUsers(response.data.filter((user) => user.client?.id === client?.id));
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (newUser) => {
    const savedUser = await saveItemToAzure(newUser, "users");
    setUsers((prevUsers) => [...prevUsers, savedUser]);
  };

  const handleSaveEdits = async (editedUser) => {
    // Need to trim all strings, and lower case the email
    editedUser = {
      ...editedUser,
      name: editedUser.name.trim(),
      email: editedUser.email.trim().toLowerCase(),
      phone: editedUser.phone ? editedUser.phone.trim() : "",
    };

    const savedUser = await saveItemToAzure(editedUser, "users");
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === savedUser.id ? savedUser : user)),
    );
  };

  const refreshUsers = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
  };

  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => {
        const status = params.value;
        const color = status === "Active" ? "success" : "error";
        return (
          <Stack direction="column" height="100%" justifyContent={"center"}>
            <Chip
              label={status}
              color={color}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Stack>
        );
      },
    },
    {
      field: "name",
      headerName: "User",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          direction="row"
          sx={{ height: "100%" }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {getInitials(params.value)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.value}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "client",
      headerName: "Organization",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2">{params.row?.client?.name}</Typography>
        </Box>
      ),
      valueGetter: (value, row) => row.client?.name,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.8,
      minWidth: 160,
      renderCell: (params) => {
        const config = getRoleConfig(params.value);
        return (
          <Stack direction="column" height="100%" justifyContent={"center"}>
            <Chip
              icon={config.icon}
              label={config.label}
              color={config.color}
              size="small"
              sx={{ fontWeight: 500, width: "fit-content" }}
            />
          </Stack>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 0.7,
      minWidth: 140,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(params.row);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color={params.row?.status === "Active" ? "error" : "success"}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Block user:", params.row.id);
              setUserToBlock(params.row);
            }}
          >
            {params.row?.status === "Active" ? (
              <BlockIcon fontSize="small" />
            ) : (
              <RestartAlt fontSize="small" />
            )}
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {userToBlock && (
        <DeactiveUserModal
          userToBlock={userToBlock}
          onClose={() => setUserToBlock(null)}
          refreshUsers={refreshUsers}
        />
      )}
      {showCreateModal && (
        <CreateUserModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          users={users}
        />
      )}

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            {isInternalAdmin() ? "All Users" : "My Team"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user accounts and permissions
          </Typography>
        </Box>
        {hasPermission(PERMISSIONS.CREATE_EMPLOYEE) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => setShowCreateModal(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              boxShadow: 2,
            }}
          >
            Add User
          </Button>
        )}
      </Box>

      {/* Info Alerts */}
      {isInternalAdmin() && (
        <Alert
          severity="info"
          icon={<AdminPanelSettingsIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          You are viewing all users across all organizations
        </Alert>
      )}

      {isExternalAdmin() && (
        <Alert
          severity="info"
          icon={<SupervisorAccountIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          You are viewing users in your organization only
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* DataGrid */}
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          loading={loading}
          sx={{
            border: 0,
            "& .MuiDataGrid-cell": {
              borderColor: "divider",
              py: 2,
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "grey.50",
              borderColor: "divider",
              fontWeight: 600,
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "action.hover",
            },
            "& .MuiDataGrid-footerContainer": {
              borderColor: "divider",
            },
          }}
          slots={{
            toolbar: () => null,
          }}
        />
      </Paper>

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            zIndex: 1300,
          }}
        >
          <Typography variant="h6" mb={2}>
            Create User Modal
          </Typography>
          <Button onClick={() => setShowCreateModal(false)}>Close</Button>
        </Box>
      )}
    </Container>
  );
}

export default Users;
