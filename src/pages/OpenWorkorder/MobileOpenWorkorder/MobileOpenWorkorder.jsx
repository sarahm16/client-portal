import { useContext, useState } from "react";
import dayjs from "dayjs";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Fab from "@mui/material/Fab";

// MUI Icons
import LocationOn from "@mui/icons-material/LocationOn";
import Description from "@mui/icons-material/Description";
import Schedule from "@mui/icons-material/Schedule";
import BuildCircle from "@mui/icons-material/BuildCircle";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Person from "@mui/icons-material/Person";
import AttachMoney from "@mui/icons-material/AttachMoney";
import Image from "@mui/icons-material/Image";
import StickyNote2 from "@mui/icons-material/StickyNote2";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Close from "@mui/icons-material/Close";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Phone from "@mui/icons-material/Phone";
import Email from "@mui/icons-material/Email";
import Add from "@mui/icons-material/Add";

// Context
import { WorkorderContext } from "../OpenWorkorder";

// Auth Hook
import { useAuth } from "../../../auth/hooks/AuthContext";

// Utilities
import formatCurrency from "../../../utilities/formatCurrency";

// API
import { getItemFromAzure } from "../../../api/azureApi";
import { useNavigate } from "react-router-dom";

// ============================================
// SUB-COMPONENTS
// ============================================

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`mobile-tabpanel-${index}`}
      aria-labelledby={`mobile-tab-${index}`}
      {...other}
      sx={{ height: "100%", overflow: "auto" }}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </Box>
  );
}

// Mobile Card Component
const MobileCard = ({ children, title, icon, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        mb: 2,
        overflow: "hidden",
      }}
    >
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            bgcolor: "grey.50",
            borderBottom: expanded ? 1 : 0,
            borderColor: "divider",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon && (
              <Box
                sx={{
                  bgcolor: "white",
                  p: 1,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  boxShadow: 1,
                }}
              >
                {icon}
              </Box>
            )}
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      )}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

// Info Row Component
const InfoRow = ({ label, value, icon }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 1,
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
    >
      {icon}
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

// Lazy Loading Image Component for Mobile
function MobileLazyImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Box sx={{ position: "relative", width: "100%", height: 150 }}>
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={150}
          sx={{ borderRadius: 1.5 }}
        />
      )}
      {error && (
        <Box
          sx={{
            width: "100%",
            height: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            borderRadius: 1.5,
          }}
        >
          <Typography variant="caption" color="error">
            Failed to load
          </Typography>
        </Box>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          objectFit: "cover",
          height: 150,
          width: "100%",
          display: loaded ? "block" : "none",
          borderRadius: 6,
        }}
      />
      {loaded && (
        <Box
          onClick={onClick}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s ease",
            borderRadius: 1.5,
            "&:active": {
              opacity: 1,
            },
          }}
        >
          <ZoomIn sx={{ color: "white", fontSize: 32 }} />
        </Box>
      )}
    </Box>
  );
}

// Image Viewer Modal
function ImageViewerModal({ image, onClose }) {
  if (!image) return null;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "rgba(0,0,0,0.95)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          color: "white",
          bgcolor: "rgba(255,255,255,0.1)",
        }}
      >
        <Close />
      </IconButton>
      <img
        src={image}
        alt="Full size"
        style={{
          maxWidth: "100%",
          maxHeight: "85vh",
          objectFit: "contain",
        }}
      />
      <Typography
        variant="caption"
        sx={{ color: "white", mt: 2, opacity: 0.7 }}
      >
        Tap anywhere to close
      </Typography>
    </Box>
  );
}

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

// Details Tab Content
function DetailsTabContent() {
  const { workorder } = useContext(WorkorderContext);
  const [site, setSite] = useState(null);

  useState(() => {
    const fetchSite = async () => {
      if (workorder?.site?.id) {
        try {
          const response = await getItemFromAzure("sites", workorder.site.id);
          setSite(response);
        } catch (error) {
          console.error("Error fetching site:", error);
        }
      }
    };
    fetchSite();
  }, [workorder?.site?.id]);

  const getStatusConfig = (status) => {
    const configs = {
      New: { color: "info", icon: <Schedule fontSize="small" /> },
      "In Progress": {
        color: "warning",
        icon: <BuildCircle fontSize="small" />,
      },
      Completed: { color: "success", icon: <CheckCircle fontSize="small" /> },
      Cancelled: { color: "error", icon: null },
    };
    return configs[status] || { color: "default", icon: null };
  };

  const statusConfig = getStatusConfig(workorder?.status);

  return (
    <Box>
      {/* Status & Priority Card */}
      <MobileCard
        title="Status"
        icon={<Description color="primary" fontSize="small" />}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip
            icon={statusConfig.icon}
            label={workorder?.status || "Unknown"}
            color={statusConfig.color}
            size="medium"
            sx={{ fontWeight: 600 }}
          />
          {workorder?.priority && (
            <Chip
              label={`Priority: ${workorder.priority}`}
              color="warning"
              variant="outlined"
              size="medium"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <InfoRow
          label="Service Type"
          value={workorder?.service || "Not specified"}
          icon={<BuildCircle fontSize="small" />}
        />
        <InfoRow
          label="Due Date"
          value={
            workorder?.dueDate
              ? dayjs(workorder.dueDate).format("MMM D, YYYY")
              : "Not set"
          }
          icon={<CalendarMonth fontSize="small" />}
        />
        <InfoRow
          label="Created"
          value={
            workorder?.createdDate
              ? dayjs(workorder.createdDate).format("MMM D, YYYY")
              : "Unknown"
          }
          icon={<Person fontSize="small" />}
        />
      </MobileCard>

      {/* Site Information Card */}
      <MobileCard
        title="Site Info"
        icon={<LocationOn color="success" fontSize="small" />}
      >
        <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 1.5, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Location
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {workorder?.site?.name || workorder?.site?.store}
          </Typography>
        </Box>

        {site && (
          <>
            <InfoRow
              label="Address"
              value={`${site.address}, ${site.city}, ${site.state} ${site.zipcode}`}
            />
            <InfoRow
              label="Contact"
              value={site?.contact?.name || "N/A"}
              icon={<Person fontSize="small" />}
            />
            {site?.contact?.phone && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Phone />}
                  href={`tel:${site.contact.phone}`}
                  sx={{ flex: 1, textTransform: "none" }}
                >
                  Call
                </Button>
                {site?.contact?.email && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Email />}
                    href={`mailto:${site.contact.email}`}
                    sx={{ flex: 1, textTransform: "none" }}
                  >
                    Email
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </MobileCard>

      {/* Pricing Card */}
      <MobileCard
        title="Pricing & Scope"
        icon={<AttachMoney color="warning" fontSize="small" />}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: "primary.50",
            borderRadius: 1.5,
            border: 2,
            borderColor: "primary.200",
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" fontWeight={600} color="primary.dark">
            Not To Exceed (NTE)
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.dark">
            {workorder?.clientPrice
              ? `${formatCurrency(workorder.clientPrice)} ${
                  workorder?.currency || "USD"
                }`
              : "Not specified"}
          </Typography>
        </Box>

        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Scope of Work
        </Typography>
        <Box
          sx={{
            p: 1.5,
            bgcolor: "grey.50",
            borderRadius: 1.5,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {workorder?.description || "No description provided"}
          </Typography>
        </Box>
      </MobileCard>
    </Box>
  );
}

// Photos Tab Content
function PhotosTabContent() {
  const { workorder } = useContext(WorkorderContext);
  const [selectedImage, setSelectedImage] = useState(null);

  const initialImages = workorder?.images || [];
  const afterImages = workorder?.vendorUpdates?.afterImages || [];

  return (
    <Box>
      {/* Initial Photos */}
      <MobileCard
        title={`Before Photos (${initialImages.length})`}
        icon={<Image color="secondary" fontSize="small" />}
        defaultExpanded={initialImages.length > 0}
      >
        {initialImages.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1.5 }}>
            No initial photos uploaded
          </Alert>
        ) : (
          <ImageList cols={2} gap={8}>
            {initialImages.map((image, index) => (
              <ImageListItem key={index}>
                <MobileLazyImage
                  src={image?.split("?sp=")[0]}
                  alt={`Initial photo ${index + 1}`}
                  onClick={() => setSelectedImage(image)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </MobileCard>

      {/* After Photos */}
      <MobileCard
        title={`After Photos (${afterImages.length})`}
        icon={<Image color="info" fontSize="small" />}
        defaultExpanded={afterImages.length > 0}
      >
        {afterImages.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1.5 }}>
            No completion photos available yet
          </Alert>
        ) : (
          <ImageList cols={2} gap={8}>
            {afterImages.map((image, index) => (
              <ImageListItem key={index}>
                <MobileLazyImage
                  src={image}
                  alt={`Completion photo ${index + 1}`}
                  onClick={() => setSelectedImage(image)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </MobileCard>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </Box>
  );
}

// Notes Tab Content
function NotesTabContent() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const notes = workorder?.clientNotes || [];

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const noteObj = {
        body: newNote,
        user: user?.name || "Client",
        date: new Date().getTime(),
      };

      const updates = {
        clientNotes: [noteObj, ...notes],
        activity: [
          {
            date: new Date().getTime(),
            action: "Added client note",
            user: user?.name || "Client",
          },
          ...(workorder.activity || []),
        ],
      };

      await handleUpdateWorkorder(updates);
      setNewNote("");
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting note:", error);
      alert("Failed to submit note. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Notes List */}
      {notes.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
          No notes yet. Tap the + button to start a conversation.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {notes.map((note, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                border: 1,
                borderColor:
                  note.user === user?.name ? "primary.300" : "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: note.user === user?.name ? "primary.50" : "grey.50",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={700}>
                    {note.user}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(note.date).format("MMM D, h:mm A")}
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {note.body}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={() => setShowForm(true)}
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Add />
      </Fab>

      {/* Note Form Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={showForm}
        onClose={() => setShowForm(false)}
        onOpen={() => setShowForm(true)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 3,
            maxHeight: "70vh",
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: "grey.300",
            borderRadius: 2,
            mx: "auto",
            mb: 2,
          }}
        />
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Add a Note
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="Ask a question or share an update..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowForm(false)}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmitNote}
            disabled={!newNote.trim() || submitting}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {submitting ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </SwipeableDrawer>
    </Box>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function MobileOpenWorkorder() {
  const { workorder } = useContext(WorkorderContext);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  if (!workorder) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Work order not found.</Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      New: "info",
      "In Progress": "warning",
      Completed: "success",
      Cancelled: "error",
    };
    return colors[status] || "default";
  };

  const handleGoBack = () => {
    navigate("/workorders");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "grey.50",
      }}
    >
      {/* Sticky Header */}
      <Paper
        elevation={2}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderRadius: 0,
          bgcolor: "white",
        }}
      >
        {/* Top Bar */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <IconButton onClick={handleGoBack} size="small" edge="start">
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }} noWrap>
              {workorder.client?.name}
            </Typography>
            <Chip
              label={workorder?.status}
              color={getStatusColor(workorder?.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<LocationOn fontSize="small" />}
              label={workorder.site?.store || workorder.site?.name}
              size="small"
              variant="outlined"
            />
            <Chip
              label={workorder.id}
              size="small"
              variant="outlined"
              sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
            />
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderTop: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab
            icon={<Description fontSize="small" />}
            label="Details"
            iconPosition="start"
          />
          <Tab
            icon={<Image fontSize="small" />}
            label="Photos"
            iconPosition="start"
          />
          <Tab
            icon={<StickyNote2 fontSize="small" />}
            label="Notes"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <TabPanel value={activeTab} index={0}>
          <DetailsTabContent />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <PhotosTabContent />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <NotesTabContent />
        </TabPanel>
      </Box>
    </Box>
  );
}

export default MobileOpenWorkorder;
