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
import { generateEmailRecipients } from "../../../../utilities/generateEmailRecipients";
import { sendEmailFromHTML } from "../../../../api/microsoftApi";

const priorityColors = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

const priorityBadgeDetails = {
  Low: { background: "#d1fae5", text: "#065f46", icon: "🟢" },
  Medium: { background: "#fef3c7", text: "#92400e", icon: "🟡" },
  High: { background: "#fee2e2", text: "#991b1b", icon: "🔴" },
};

const generateEmailBody = (id, client, store, newNote, priority) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Note Added to Work Order</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0891b2; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">New Note Added</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <!-- Priority Badge - colors vary based on priority -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: ${priorityBadgeDetails[priority].background}; border-radius: 6px; padding: 12px 16px;">
                    <span style="color: ${priorityBadgeDetails[priority].text}; font-size: 14px; font-weight: 600;">${priorityBadgeDetails[priority].icon} ${priority} Priority</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                A new note has been added to the following work order.
              </p>
              
              <!-- Work Order Reference -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Work Order #</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 600;">${id}</p>
                        </td>
                        <td width="50%" style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Client</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 500;">${client}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Store</span>
                          <p style="margin: 4px 0 0 0; color: #111827; font-size: 15px; font-weight: 500;">${store}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Note Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdfa; border-radius: 8px; border-left: 4px solid #0891b2;">
                <tr>
                  <td style="padding: 20px;">
                    <span style="color: #0e7490; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Note</span>
                    <p style="margin: 12px 0 0 0; color: #134e4a; font-size: 15px; line-height: 1.6;">${newNote}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
                This is an automated notification from the Work Order Management System.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

<!--
Template Variables:
- {{id}}: Work order number
- {{client}}: Client name
- {{store}}: Store name/location
- {{newNote}}: Content of the note
- {{priority}}: Priority level (e.g., "High", "Medium", "Low")

Priority Badge Colors:
- High: background #fee2e2, text #991b1b, icon 🔴
- Medium: background #fef3c7, text #92400e, icon 🟡
- Low: background #d1fae5, text #065f46, icon 🟢
-->`;
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

      const emailBody = generateEmailBody(
        workorder.id,
        workorder?.client?.name,
        workorder?.site?.name,
        newNote,
        priority,
      );
      const emailRecipients = generateEmailRecipients([
        "sarah.carter@evergreenbrands.com",
      ]);
      await sendEmailFromHTML(
        `New Note Added to Work Order - ` + workorder.id,
        emailBody,
        emailRecipients,
      );
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
