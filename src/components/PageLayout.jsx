import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Auth
import { usePermissions, useRole } from "../auth/hooks/usePermissions";
import { useAuth } from "../auth/hooks/AuthContext";

// MUI Components
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";

// MUI Icons
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationIcon from "@mui/icons-material/LocationOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import HelpForm from "./HelpForm";

const INITIAL_FORM = { subject: "", category: "", description: "" };

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const open = Boolean(anchorEl);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  const { hasAnyPermission } = usePermissions();
  const canAccessUsers = hasAnyPermission([
    "manage_employees",
    "manage_managers",
  ]);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleMobileMenuOpen = (event) =>
    setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "error";
      case "Manager":
        return "warning";
      default:
        return "primary";
    }
  };

  const getRoleLabel = (role) => role || "User";

  const navButtonSx = (path) => ({
    textTransform: "none",
    fontWeight: 600,
    color: isActive(path) ? "primary.main" : "text.primary",
    bgcolor: isActive(path) ? "primary.50" : "transparent",
    "&:hover": { bgcolor: isActive(path) ? "primary.100" : "action.hover" },
    px: 2,
    borderRadius: 2,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: "white", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            NFC Client Portal
          </Typography>

          {/* Desktop Navigation */}
          <Box
            sx={{ display: { xs: "none", md: "flex" }, gap: 1, ml: 4, flex: 1 }}
          >
            <Button
              startIcon={<WorkIcon />}
              onClick={() => handleNavigation("/workorders")}
              sx={navButtonSx("/workorders")}
            >
              Work Orders
            </Button>
            {canAccessUsers && (
              <Button
                startIcon={<PeopleIcon />}
                onClick={() => handleNavigation("/users")}
                sx={navButtonSx("/users")}
              >
                Users
              </Button>
            )}
            <Button
              startIcon={<LocationIcon />}
              onClick={() => handleNavigation("/sites")}
              sx={navButtonSx("/sites")}
            >
              Sites
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop: Help button + User Info */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
              ml: "auto",
            }}
          >
            {/* ── Help & Support button ── */}
            <HelpForm />

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {user?.name || "User"}
              </Typography>
              <Chip
                label={getRoleLabel(user?.role)}
                size="small"
                color={getRoleColor(user?.role)}
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 500 }}
              />
            </Box>

            <IconButton onClick={handleProfileMenuOpen} size="small">
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, minWidth: 200, borderRadius: 2 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.name || "User"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || "user@example.com"}
          </Typography>
        </Box>
        <Divider />
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error.main">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, minWidth: 200, borderRadius: 2 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.name || "User"}
          </Typography>
          <Chip
            label={getRoleLabel(user?.role)}
            size="small"
            color={getRoleColor(user?.role)}
            sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
          />
        </Box>
        <Divider />
        <MenuItem onClick={() => handleNavigation("/workorders")}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          Work Orders
        </MenuItem>
        {canAccessUsers && (
          <MenuItem onClick={() => handleNavigation("/users")}>
            <ListItemIcon>
              <PeopleIcon fontSize="small" />
            </ListItemIcon>
            Users
          </MenuItem>
        )}
        <MenuItem onClick={() => handleNavigation("/sites")}>
          <ListItemIcon>
            <LocationIcon fontSize="small" />
          </ListItemIcon>
          Sites
        </MenuItem>
        <Divider />
        {/* ── Help & Support in mobile menu ── */}
        {/*         <MenuItem onClick={handleHelpOpen}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography color="primary.main" fontWeight={600}>
            Help & Support
          </Typography>
        </MenuItem> */}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error.main">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "grey.50",
          minHeight: "calc(100vh - 64px)",
          px: "3vw",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
