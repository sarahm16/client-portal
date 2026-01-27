import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";

// MUI Icons
import StickyNote2 from "@mui/icons-material/StickyNote2";
import Person from "@mui/icons-material/Person";
import CalendarMonth from "@mui/icons-material/CalendarMonth";

// Context
import { WorkorderContext } from "../../OpenWorkorder";

// Auth Hook
import { useAuth } from "../../../../auth/hooks/AuthContext";

// Local Components
import CardComponent from "./CardComponent";

// Notes Component
function NotesSection() {
  const { workorder, handleUpdateWorkorder } = useContext(WorkorderContext);
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [notes, setNotes] = useState([]);

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
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
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
          <Stack direction="column" spacing={2}>
            {notes.map((note, index) => (
              <Box
                key={index}
                sx={{
                  bgcolor: note.user === user?.name ? "primary.50" : "grey.50",
                  borderRadius: 2,
                  border: 1,
                  borderColor:
                    note.user === user?.name ? "primary.200" : "divider",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor:
                      note.user === user?.name ? "primary.100" : "grey.100",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {note.user}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(note.date).format("MMM D, YYYY h:mm A")}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {note.body}
                  </Typography>

                  {note.attachment && (
                    <Box sx={{ mt: 2 }}>
                      <a
                        href={note.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        View Attachment
                      </a>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </CardComponent>
  );
}
export default NotesSection;
