import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";

// MUI Icons
import StickyNote2 from "@mui/icons-material/StickyNote2";
import Person from "@mui/icons-material/Person";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import AttachFile from "@mui/icons-material/AttachFile";
import OpenInNew from "@mui/icons-material/OpenInNew";
import Flag from "@mui/icons-material/Flag";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Auth Hook
import { useAuth } from "../../../../auth/hooks/AuthContext";

// Local Components
import CardComponent from "./CardComponent";

const priorityColors = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Notes Component
function NotesSection() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [priority, setPriority] = useState("Low");

  const [notes, setNotes] = useState([]);

  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);
  const priorityMenuOpen = Boolean(priorityAnchorEl);

  useEffect(() => {
    setNotes(workorder?.clientNotes || []);
  }, [workorder.clientNotes]);

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const noteObj = {
        body: newNote,
        user: user?.name || "Client",
        date: new Date().getTime(),
        company: "client",
        priority: priority,
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
    } catch (error) {
      console.error("Error submitting note:", error);
      alert("Failed to submit note. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CardComponent
      title={
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Notes & Communication
        </Typography>
      }
      icon={<StickyNote2 color="secondary" />}
      collapsible={true}
      sx={{ minHeight: 500 }}
    >
      <Menu
        open={priorityMenuOpen}
        anchorEl={priorityAnchorEl}
        onClose={() => setPriorityAnchorEl(null)}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {Object.keys(priorityColors).map((key) => (
          <MenuItem
            key={key}
            onClick={() => setPriority(key)}
            selected={priority === key}
          >
            <Flag
              sx={{
                mr: 1,
                fontSize: 16,
                color: `${priorityColors[key]}.main`,
              }}
            />
            {key}
          </MenuItem>
        ))}
      </Menu>
      {/* New Note Form */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          bgcolor: "grey.50",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.secondary"
          sx={{ mb: 1.5 }}
        >
          Add a Note
        </Typography>
        <TextField
          multiline
          rows={3}
          fullWidth
          placeholder="Ask a question or share an update..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          size="small"
          sx={{
            bgcolor: "white",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5 }}>
          <Chip
            label={priority}
            color={priorityColors[priority]}
            size="small"
            icon={<Flag fontSize="small" />}
            variant="outlined"
            onClick={(e) => setPriorityAnchorEl(e.currentTarget)}
            sx={{
              cursor: "pointer",
              fontWeight: 500,
              "& .MuiChip-icon": {
                ml: 0.5,
              },
            }}
          />
          <Button
            variant="contained"
            size="medium"
            onClick={handleSubmitNote}
            disabled={!newNote.trim() || submitting}
            sx={{ minWidth: 120, fontWeight: 600 }}
          >
            {submitting ? "Sending..." : "Send Note"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Notes List */}
      <Box sx={{ maxHeight: "500px", overflowY: "auto", pr: 1 }}>
        {notes.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No notes yet. Use the form above to start the conversation with our
            team.
          </Alert>
        ) : (
          <Stack direction="column" spacing={2.5}>
            {notes.map((note, index) => {
              const isCurrentUser = note.user === user?.name;

              return (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    bgcolor: isCurrentUser ? "primary.50" : "background.paper",
                    borderRadius: 3,
                    border: 1,
                    borderColor: isCurrentUser ? "primary.200" : "divider",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: 2,
                      borderColor: isCurrentUser ? "primary.300" : "grey.300",
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: isCurrentUser ? "primary.100" : "grey.50",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    {/* User Info */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: isCurrentUser ? "primary.main" : "grey.400",
                          width: 36,
                          height: 36,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(note.user)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, mb: 0.25 }}
                        >
                          {note.user}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CalendarMonth
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(note.date).format("MMM D, YYYY · h:mm A")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Priority Chip */}
                    <Chip
                      color={priorityColors[note.priority || "Low"]}
                      size="small"
                      label={note.priority || "Low"}
                      icon={<Flag fontSize="small" />}
                      sx={{
                        fontWeight: 600,
                        height: 28,
                      }}
                    />
                  </Box>

                  {/* Body */}
                  <Box sx={{ p: 2.5, pt: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {note.body}
                    </Typography>

                    {/* Attachment */}
                    {note.attachment && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Button
                          href={note.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          size="small"
                          startIcon={<AttachFile />}
                          endIcon={<OpenInNew fontSize="small" />}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            color: "primary.main",
                            borderColor: "primary.200",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: "primary.50",
                            },
                          }}
                        >
                          View Attachment
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </CardComponent>
  );
}
export default NotesSection;
