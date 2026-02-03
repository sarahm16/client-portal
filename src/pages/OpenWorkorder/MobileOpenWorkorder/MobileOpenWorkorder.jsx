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
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Avatar from "@mui/material/Avatar";

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
import Delete from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Warning from "@mui/icons-material/Warning";

// Context
import { WorkorderContext } from "../OpenWorkorder";

// Auth Hook
import { useAuth } from "../../../auth/hooks/AuthContext";

// Utilities
import formatCurrency from "../../../utilities/formatCurrency";

// API
import { getItemFromAzure } from "../../../api/azureApi";
import { useNavigate } from "react-router-dom";

// Local Components
import MobileImageUploader from "./components/MobileImageUploader";

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getFileName = (url) => {
  try {
    const path = new URL(url).pathname;
    const raw = path.split("/").pop();
    const withoutTimestamp = raw.replace(/^\d+_/, "");
    return decodeURIComponent(withoutTimestamp) || "attachment";
  } catch {
    return "attachment";
  }
};

const nteStatusColors = {
  Pending: "warning",
  Approved: "success",
  Denied: "error",
};

// ============================================
// SUB-COMPONENTS
// ============================================

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
          fontSize: "0.65rem",
        }}
      >
        Attachments
      </Typography>
      <Stack spacing={0.75} sx={{ mt: 0.75 }}>
        {urls.map((url, i) => (
          <Box
            key={i}
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              textDecoration: "none",
              transition: "all 0.15s ease",
              "&:active": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              },
            }}
          >
            <AttachFileIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography
              variant="caption"
              sx={{
                flex: 1,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "text.primary",
              }}
            >
              {getFileName(url)}
            </Typography>
            <OpenInNewIcon sx={{ fontSize: 14, color: "action.active" }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      {...other}
      sx={{ height: "100%", overflow: "auto" }}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </Box>
  );
}

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

function MobileLazyImage({ src, alt, onClick, onDelete }) {
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
            "&:active": { opacity: 1 },
          }}
        >
          <ZoomIn sx={{ color: "white", fontSize: 32 }} />
          {onDelete && (
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                color: "error.main",
                "&:active": { bgcolor: "white" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(src);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
}

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
        style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain" }}
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

function DeleteConfirmationModal({ open, onClose, onConfirm, imageUrl }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm(imageUrl);
    setIsDeleting(false);
  };

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, m: 2 } }}
    >
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              bgcolor: "error.50",
              p: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Warning color="error" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Delete Image?
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Are you sure you want to delete this image? This action cannot be
          undone.
        </Typography>
        {imageUrl && (
          <Box
            sx={{
              borderRadius: 1.5,
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
            }}
          >
            <img
              src={imageUrl}
              alt="Image to delete"
              style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          variant="outlined"
          fullWidth
          sx={{ borderRadius: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isDeleting}
          variant="contained"
          color="error"
          fullWidth
          sx={{ borderRadius: 1.5 }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

function DetailsTabContent() {
  const { workorder } = useContext(WorkorderContext);
  const [site, setSite] = useState(null);

  useState(() => {
    const fetchSite = async () => {
      if (workorder?.site?.id) {
        try {
          const siteData = await getItemFromAzure("sites", workorder.site.id);
          setSite(siteData);
        } catch (error) {
          console.error("Error fetching site:", error);
        }
      }
    };
    fetchSite();
  }, [workorder?.site?.id]);

  return (
    <Box>
      <MobileCard
        title="Work Order Details"
        icon={<Description color="primary" fontSize="small" />}
      >
        <Stack spacing={0}>
          <InfoRow
            label="Status"
            value={
              <Chip
                label={workorder?.status}
                size="small"
                color={
                  workorder?.status === "Completed"
                    ? "success"
                    : workorder?.status === "In Progress"
                      ? "warning"
                      : "default"
                }
                sx={{ fontWeight: 600 }}
              />
            }
          />
          <Divider />
          <InfoRow
            label="Type"
            value={workorder?.workorderType || "N/A"}
            icon={<BuildCircle fontSize="small" />}
          />
          <Divider />
          <InfoRow
            label="Created"
            value={
              workorder?.createdDate
                ? dayjs(workorder.createdDate).format("MMM D, YYYY")
                : "N/A"
            }
            icon={<CalendarMonth fontSize="small" />}
          />
          {workorder?.dueDate && (
            <>
              <Divider />
              <InfoRow
                label="Due Date"
                value={dayjs(workorder.dueDate).format("MMM D, YYYY")}
                icon={<Schedule fontSize="small" />}
              />
            </>
          )}
          {workorder?.completedDate && (
            <>
              <Divider />
              <InfoRow
                label="Completed"
                value={dayjs(workorder.completedDate).format("MMM D, YYYY")}
                icon={<CheckCircle fontSize="small" />}
              />
            </>
          )}
        </Stack>
        {workorder?.description && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
            >
              SCOPE OF WORK
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                p: 1.5,
                bgcolor: "grey.50",
                borderRadius: 1.5,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {workorder.description}
            </Typography>
          </>
        )}
      </MobileCard>

      <MobileCard
        title="Site Information"
        icon={<LocationOn color="secondary" fontSize="small" />}
      >
        <Stack spacing={0}>
          <InfoRow
            label="Store"
            value={site?.store || workorder?.site?.store || "N/A"}
          />
          <Divider />
          <InfoRow label="Address" value={site?.address || "N/A"} />
          {site?.city && (
            <>
              <Divider />
              <InfoRow
                label="City"
                value={`${site.city}, ${site.state} ${site.zip || ""}`}
              />
            </>
          )}
        </Stack>
        {site &&
          (site.contact?.name ||
            site.contact?.phone ||
            site.contact?.email) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                SITE CONTACT
              </Typography>
              <Box sx={{ mt: 1 }}>
                {site.contact?.name && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2">{site.contact.name}</Typography>
                  </Box>
                )}
                {site.contact?.phone && (
                  <Box
                    component="a"
                    href={`tel:${site.contact.phone}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      textDecoration: "none",
                      color: "primary.main",
                    }}
                  >
                    <Phone fontSize="small" />
                    <Typography variant="body2">
                      {site.contact.phone}
                    </Typography>
                  </Box>
                )}
                {site.contact?.email && (
                  <Box
                    component="a"
                    href={`mailto:${site.contact.email}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      textDecoration: "none",
                      color: "primary.main",
                    }}
                  >
                    <Email fontSize="small" />
                    <Typography variant="body2">
                      {site.contact.email}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
      </MobileCard>

      <PricingCard />
    </Box>
  );
}

function PricingCard() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const nteRequests = workorder?.nteRequests || [];
  const activity = workorder?.activity || [];
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
      await handleUpdateWorkorder({
        clientPrice: Number(selectedRequest.clientAmount),
        vendorPrice: Number(selectedRequest?.amount),
        nteRequests: updatedRequests,
        activity: [
          {
            date: new Date().getTime(),
            user: "Client",
            action: `Client approved NTE increase to ${formatCurrency(Number(selectedRequest.clientAmount))}`,
          },
          ...activity,
        ],
      });
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
            action: `Client denied NTE increase request for ${formatCurrency(Number(selectedRequest.clientAmount))}`,
          },
          ...activity,
        ],
      });
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
      <Dialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                bgcolor: "success.50",
                p: 1,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <CheckCircleIcon color="success" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Approve NTE Increase
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }}>
            You are about to approve an increase to the Not To Exceed (NTE)
            amount for this work order.
          </Alert>
          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1.5, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Current NTE Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatCurrency(workorder?.clientPrice)}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              New NTE Amount
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "success.main" }}
            >
              {formatCurrency(selectedRequest?.clientAmount)}
            </Typography>
          </Box>
          {selectedRequest?.customReason && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "warning.50",
                borderRadius: 1.5,
                border: 1,
                borderColor: "warning.200",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "warning.dark" }}
              >
                Reason for Increase
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.5, color: "warning.dark" }}
              >
                {selectedRequest.customReason}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setApproveOpen(false)}
            variant="outlined"
            fullWidth
            disabled={isProcessing}
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            fullWidth
            disabled={isProcessing}
            sx={{ borderRadius: 1.5 }}
          >
            {isProcessing ? "Processing..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={denyOpen}
        onClose={() => setDenyOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                bgcolor: "error.50",
                p: 1,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <CancelIcon color="error" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Deny NTE Increase
            </Typography>
          </Box>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
            Please provide a reason for denying this NTE increase request.
          </Alert>
          <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 1.5, mb: 2 }}>
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
            rows={3}
            placeholder="Please explain why you are denying this request..."
            value={clientDenyReason}
            onChange={(e) => setClientDenyReason(e.target.value)}
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setDenyOpen(false);
              setClientDenyReason("");
            }}
            variant="outlined"
            fullWidth
            disabled={isProcessing}
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeny}
            variant="contained"
            color="error"
            fullWidth
            disabled={isProcessing || !clientDenyReason.trim()}
            sx={{ borderRadius: 1.5 }}
          >
            {isProcessing ? "Processing..." : "Deny"}
          </Button>
        </DialogActions>
      </Dialog>

      <MobileCard
        title="Pricing & NTE"
        icon={<AttachMoney color="warning" fontSize="small" />}
      >
        {pendingClientRequests.length > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 2, borderRadius: 1.5 }}
            icon={<InfoOutlinedIcon />}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Action Required: NTE Increase Request
            </Typography>
            <Typography variant="caption">
              The vendor has requested an increase. Please review and respond.
            </Typography>
          </Alert>
        )}

        {pendingClientRequests.map((request) => (
          <Box
            key={request.date}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: "warning.50",
              border: 2,
              borderColor: "warning.main",
              borderRadius: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "warning.dark" }}
                >
                  NTE Increase Request
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "warning.dark" }}
                >
                  {formatCurrency(request.clientAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current: {formatCurrency(workorder?.clientPrice)} | +
                  {formatCurrency(
                    request.clientAmount - workorder?.clientPrice,
                  )}
                </Typography>
              </Box>
              <Chip
                label="Pending"
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Divider sx={{ my: 1.5 }} />
            {request.customReason && (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "warning.dark" }}
                >
                  Reason
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, color: "warning.dark" }}
                >
                  {request.customReason}
                </Typography>
              </Box>
            )}
            <AttachmentList urls={request.attachments} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.5, mb: 1.5 }}
            >
              Submitted{" "}
              {new Date(request.sentToClientDate).toLocaleDateString()} by{" "}
              {request.sentToClientBy}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                onClick={() => {
                  setSelectedRequest(request);
                  setApproveOpen(true);
                }}
                sx={{ borderRadius: 1.5 }}
              >
                Approve
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  setSelectedRequest(request);
                  setDenyOpen(true);
                }}
                sx={{ borderRadius: 1.5 }}
              >
                Deny
              </Button>
            </Stack>
          </Box>
        ))}

        <Box
          sx={{
            p: 2,
            bgcolor: "primary.50",
            borderRadius: 1.5,
            border: 2,
            borderColor: "primary.200",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "primary.dark" }}
          >
            Not To Exceed (NTE)
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "primary.dark", mt: 0.5 }}
          >
            {workorder?.clientPrice
              ? formatCurrency(workorder.clientPrice)
              : "Not specified"}
          </Typography>
        </Box>

        {nteRequests.filter((req) => req.clientResponse).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
            >
              NTE REQUEST HISTORY
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {nteRequests
                .filter((req) => req.clientResponse)
                .map((request) => (
                  <Box
                    key={request.date}
                    sx={{
                      p: 1.5,
                      bgcolor:
                        request.clientResponse === "Approved"
                          ? "success.50"
                          : "error.50",
                      border: 1,
                      borderColor:
                        request.clientResponse === "Approved"
                          ? "success.main"
                          : "error.main",
                      borderRadius: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(request.clientAmount)}
                      </Typography>
                      <Chip
                        label={request.clientResponse}
                        color={nteStatusColors[request.clientResponse]}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(
                        request.clientApprovedDate || request.clientDeniedDate,
                      ).toLocaleDateString()}
                    </Typography>
                    <AttachmentList urls={request.attachments} />
                  </Box>
                ))}
            </Stack>
          </>
        )}
      </MobileCard>
    </>
  );
}

function PhotosTabContent() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const { user } = useAuth();
  const initialImages = workorder?.images || [];
  const afterImages = workorder?.afterImages || [];
  const activity = workorder?.activity || [];
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageToRemove, setImageToRemove] = useState(null);
  const [showAllInitial, setShowAllInitial] = useState(false);
  const [showAllAfter, setShowAllAfter] = useState(false);

  const INITIAL_DISPLAY_COUNT = 4;
  const displayInitialImages = showAllInitial
    ? initialImages
    : initialImages.slice(0, INITIAL_DISPLAY_COUNT);
  const displayAfterImages = showAllAfter
    ? afterImages
    : afterImages.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreInitial = initialImages.length > INITIAL_DISPLAY_COUNT;
  const hasMoreAfter = afterImages.length > INITIAL_DISPLAY_COUNT;

  const handleRemoveImage = async (imageUrl) => {
    try {
      const isInitial = initialImages.includes(imageUrl);
      const updates = {
        [isInitial ? "images" : "afterImages"]: (isInitial
          ? initialImages
          : afterImages
        ).filter((img) => img !== imageUrl),
        activity: [
          {
            date: new Date().getTime(),
            user: user?.name || "Client",
            action: `Removed ${isInitial ? "an initial" : "a completion"} photo`,
          },
          ...activity,
        ],
      };
      await handleUpdateWorkorder(updates);
      setImageToRemove(null);
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  return (
    <Box sx={{ pb: 2 }}>
      <MobileCard
        title="Initial Photos"
        icon={<Image color="secondary" fontSize="small" />}
        defaultExpanded={true}
      >
        {initialImages.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1.5, mb: 2 }}>
            No initial photos uploaded yet.
          </Alert>
        ) : (
          <>
            <ImageList cols={2} gap={8}>
              {displayInitialImages.map((image, index) => (
                <ImageListItem
                  key={index}
                  sx={{ borderRadius: 1.5, overflow: "hidden" }}
                >
                  <MobileLazyImage
                    src={image}
                    alt={`Initial photo ${index + 1}`}
                    onClick={() => setSelectedImage(image)}
                    onDelete={setImageToRemove}
                  />
                </ImageListItem>
              ))}
            </ImageList>
            {hasMoreInitial && (
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => setShowAllInitial(!showAllInitial)}
                sx={{ mt: 1.5, borderRadius: 1.5 }}
              >
                {showAllInitial
                  ? "Show Less"
                  : `Show ${initialImages.length - INITIAL_DISPLAY_COUNT} More`}
              </Button>
            )}
          </>
        )}
        <MobileImageUploader />
      </MobileCard>

      {afterImages.length > 0 && (
        <MobileCard
          title="Completion Photos"
          icon={<Image color="success" fontSize="small" />}
          defaultExpanded={true}
        >
          <ImageList cols={2} gap={8}>
            {displayAfterImages.map((image, index) => (
              <ImageListItem
                key={index}
                sx={{ borderRadius: 1.5, overflow: "hidden" }}
              >
                <MobileLazyImage
                  src={image}
                  alt={`Completion photo ${index + 1}`}
                  onClick={() => setSelectedImage(image)}
                />
              </ImageListItem>
            ))}
          </ImageList>
          {hasMoreAfter && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => setShowAllAfter(!showAllAfter)}
              sx={{ mt: 1.5, borderRadius: 1.5 }}
            >
              {showAllAfter
                ? "Show Less"
                : `Show ${afterImages.length - INITIAL_DISPLAY_COUNT} More`}
            </Button>
          )}
        </MobileCard>
      )}

      <ImageViewerModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
      <DeleteConfirmationModal
        open={!!imageToRemove}
        onClose={() => setImageToRemove(null)}
        onConfirm={handleRemoveImage}
        imageUrl={imageToRemove}
      />
    </Box>
  );
}

function NotesTabContent() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const { user } = useAuth();
  const notes = workorder?.clientNotes || [];
  const [newNote, setNewNote] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    setSubmitting(true);
    try {
      const noteObj = {
        body: newNote,
        user: user?.name || "Client",
        date: new Date().getTime(),
      };
      await handleUpdateWorkorder({
        clientNotes: [noteObj, ...notes],
        activity: [
          {
            date: new Date().getTime(),
            action: "Added client note",
            user: user?.name || "Client",
          },
          ...(workorder.activity || []),
        ],
      });
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
      {notes.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 1.5, mb: 2 }}>
          No notes yet. Tap the + button to start a conversation.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {notes.map((note, index) => {
            const isCurrentUser = note.user === user?.name;
            return (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: isCurrentUser ? "primary.300" : "divider",
                  borderRadius: 1.5,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: isCurrentUser ? "primary.50" : "grey.50",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: isCurrentUser ? "primary.main" : "grey.400",
                        width: 28,
                        height: 28,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(note.user)}
                    </Avatar>
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
                    sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}
                  >
                    {note.body}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Fab
        color="primary"
        onClick={() => setShowForm(true)}
        sx={{ position: "fixed", bottom: 80, right: 16, zIndex: 1000 }}
      >
        <Add />
      </Fab>

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
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowForm(false)}
            sx={{ borderRadius: 1.5, py: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmitNote}
            disabled={!newNote.trim() || submitting}
            sx={{ borderRadius: 1.5, py: 1.5 }}
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
