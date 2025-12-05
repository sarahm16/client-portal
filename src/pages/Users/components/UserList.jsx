// pages/UsersPage/components/UserList.jsx
import { useState } from "react";

// hooks
import { useRole } from "../../../auth/hooks/usePermissions";
import { ROLES } from "../../../auth/permissions";

// MUI components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function UserList({ users, canManageAll }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isInternalAdmin } = useRole();

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.INTERNAL_ADMIN:
        return "error";
      case ROLES.EXTERNAL_ADMIN:
        return "warning";
      case ROLES.EMPLOYEE:
        return "primary";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ROLES.INTERNAL_ADMIN:
        return "Internal Admin";
      case ROLES.EXTERNAL_ADMIN:
        return "External Admin";
      case ROLES.EMPLOYEE:
        return "Employee";
      default:
        return role;
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              {canManageAll && <TableCell>Organization</TableCell>}
              <TableCell>Sites</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageAll ? 6 : 5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  {canManageAll && (
                    <TableCell>
                      {user.organizationName || user.organizationId}
                    </TableCell>
                  )}
                  <TableCell>{user.siteIds?.length || 0} site(s)</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, user)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Edit User</MenuItem>
        <MenuItem onClick={handleMenuClose}>Manage Sites</MenuItem>
        {isInternalAdmin && selectedUser?.role !== ROLES.INTERNAL_ADMIN && (
          <MenuItem onClick={handleMenuClose}>Change Role</MenuItem>
        )}
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          Deactivate User
        </MenuItem>
      </Menu>
    </>
  );
}
