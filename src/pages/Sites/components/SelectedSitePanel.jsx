import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { azureClient } from "../../../api/azureClient";

// MUI Components
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import KitchenIcon from "@mui/icons-material/Kitchen";
import AirIcon from "@mui/icons-material/Air";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";

// ─── Constants ───────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 480;

const hvacFields = [
  { key: "barcode", label: "Barcode" },
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "serialNumber", label: "Serial #" },
  { key: "tonnage", label: "Tonnage" },
  { key: "age", label: "Age" },
  { key: "condition", label: "Condition" },
];

const iceMachineFields = [{ key: "barcode", label: "Barcode" }];

const exhaustFanFields = [{ key: "barcode", label: "Barcode" }];

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * A single row showing a field label + value for a piece of equipment.
 */
function FieldRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.4,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 90 }}
      >
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

/**
 * Card representing one piece of equipment.
 */
function EquipmentCard({ unit, fields, index }) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1.5,
        bgcolor: "background.paper",
        "&:not(:last-child)": { mb: 1 },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          mb: 0.5,
          display: "block",
        }}
      >
        Unit {index + 1}
      </Typography>
      {fields.map(({ key, label }) => (
        <FieldRow key={key} label={label} value={unit[key]} />
      ))}
    </Box>
  );
}

/**
 * A work-order link badge. Shows a clickable chip or a muted "None" indicator.
 */
function WorkOrderLink({ label, workorder }) {
  if (!workorder) {
    return (
      <Chip
        icon={<AssignmentIcon />}
        label={`${label}: No WO`}
        size="small"
        variant="outlined"
        sx={{
          color: "text.disabled",
          borderColor: "divider",
          fontSize: "0.7rem",
        }}
      />
    );
  }

  return (
    <Chip
      icon={<OpenInNewIcon sx={{ fontSize: "0.85rem !important" }} />}
      label={label}
      size="small"
      component={Link}
      to={`/workorders/${workorder.id}`}
      clickable
      sx={{
        fontWeight: 600,
        fontSize: "0.7rem",
        bgcolor: "primary.50",
        color: "primary.main",
        border: "1px solid",
        borderColor: "primary.200",
        "&:hover": { bgcolor: "primary.100" },
        textDecoration: "none",
      }}
    />
  );
}

/**
 * A collapsible section for one service type (HVAC, Ice Machine, Exhaust Fan).
 */
function ServiceSection({ icon, title, accentColor, children }) {
  return (
    <Box sx={{ mb: 2 }}>
      {/* Section header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          pb: 1,
          borderBottom: "2px solid",
          borderColor: accentColor,
        }}
      >
        <Avatar
          sx={{
            bgcolor: accentColor,
            width: 30,
            height: 30,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>

      {children}
    </Box>
  );
}

/**
 * Skeleton placeholders while data is loading.
 */
function LoadingSkeleton() {
  return (
    <Box sx={{ px: 2.5, pt: 1 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Skeleton
            variant="rounded"
            height={24}
            width="40%"
            sx={{ mb: 1.5 }}
          />
          {[1, 2, 3].map((j) => (
            <Skeleton key={j} variant="rounded" height={80} sx={{ mb: 1 }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

/**
 * Shown when a service has no equipment records.
 */
function EmptyState({ label }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 1.5,
        px: 2,
        bgcolor: "grey.50",
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 16, color: "text.disabled" }} />
      <Typography variant="caption" color="text.secondary">
        No {label} equipment recorded for this site.
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function SelectedSitePanel({ site, onClose }) {
  const siteId = site?.id;

  const [equipment, setEquipment] = useState([]);
  const [siteWorkorders, setSiteWorkorders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch both equipment and work orders whenever the selected site changes
  useEffect(() => {
    if (!siteId) return;

    let cancelled = false;
    setLoading(true);
    setEquipment([]);
    setSiteWorkorders([]);

    const fetchEquipment = azureClient.post(
      `/noSqlQuery?containerId=equipment&databaseId=procurement`,
      { query: `SELECT * FROM c WHERE c.siteId = '${siteId}'` },
    );

    const fetchWorkorders = azureClient.post(
      `/noSqlQuery?containerId=workorders&databaseId=procurement`,
      {
        query: `SELECT * FROM c WHERE c.site.id = '${siteId}' AND c.workorderType = 'Warranty'`,
      },
    );

    Promise.all([fetchEquipment, fetchWorkorders])
      .then(([eqRes, woRes]) => {
        if (!cancelled) {
          setEquipment(eqRes.data);
          setSiteWorkorders(woRes.data);
        }
      })
      .catch((err) => console.error("Error fetching site data:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const hvacUnits = useMemo(
    () =>
      equipment.filter(
        (item) => item.service === "HVAC PM" || item.service === "Assessment",
      ),
    [equipment],
  );

  const iceMachines = useMemo(
    () => equipment.filter((item) => item.service === "Ice Machine"),
    [equipment],
  );

  const exhaustFans = useMemo(
    () => equipment.filter((item) => item.service === "Exhaust Fan PM"),
    [equipment],
  );

  // Work order lookup helpers
  const getWorkorder = (service) =>
    siteWorkorders.find((wo) => wo.service === service) ?? null;

  const hvacPmWo = getWorkorder("HVAC PM");
  const hvacAssessmentWo = getWorkorder("Assessment");
  const iceMachineWo = getWorkorder("Ice Machine");
  const exhaustFanWo = getWorkorder("Exhaust Fan PM");

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Drawer
      anchor="right"
      open={!!site}
      onClose={onClose}
      variant="temporary"
      ModalProps={{ keepMounted: false }}
      PaperProps={{
        sx: {
          width: DRAWER_WIDTH,
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: "primary.dark", mt: 0.25 }}>
            <LocationOnIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {site?.store ?? "—"}
            </Typography>
            {site?.company && (
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {site.company}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{ mt: 0.5, opacity: 0.9, lineHeight: 1.4 }}
            >
              {site?.address}
              <br />
              {site?.city}, {site?.state} {site?.zipcode}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Close panel">
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "primary.contrastText", mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Status bar ── */}
      {site?.status && (
        <Box
          sx={{
            px: 2.5,
            py: 1,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          {site?.id && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                ID: <strong>{site.id}</strong>
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* ── Scrollable body ── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* ── HVAC Section ── */}
            <ServiceSection
              icon={<AcUnitIcon sx={{ fontSize: 16 }} />}
              title="HVAC"
              accentColor="primary.main"
            >
              {/* Work order links */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                <WorkOrderLink
                  label="Assessment WO"
                  workorder={hvacAssessmentWo}
                />
                <WorkOrderLink label="PM WO" workorder={hvacPmWo} />
              </Box>

              {hvacUnits.length === 0 ? (
                <EmptyState label="HVAC" />
              ) : (
                hvacUnits.map((unit, idx) => (
                  <EquipmentCard
                    key={unit.id ?? idx}
                    unit={unit}
                    fields={hvacFields}
                    index={idx}
                  />
                ))
              )}
            </ServiceSection>

            <Divider sx={{ my: 2 }} />

            {/* ── Ice Machines Section ── */}
            <ServiceSection
              icon={<KitchenIcon sx={{ fontSize: 16 }} />}
              title="Ice Machines"
              accentColor="info.main"
            >
              <Box sx={{ mb: 1.5 }}>
                <WorkOrderLink
                  label="Ice Machine WO"
                  workorder={iceMachineWo}
                />
              </Box>

              {iceMachines.length === 0 ? (
                <EmptyState label="ice machine" />
              ) : (
                iceMachines.map((unit, idx) => (
                  <EquipmentCard
                    key={unit.id ?? idx}
                    unit={unit}
                    fields={iceMachineFields}
                    index={idx}
                  />
                ))
              )}
            </ServiceSection>

            <Divider sx={{ my: 2 }} />

            {/* ── Exhaust Fans Section ── */}
            <ServiceSection
              icon={<AirIcon sx={{ fontSize: 16 }} />}
              title="Exhaust Fans"
              accentColor="warning.main"
            >
              <Box sx={{ mb: 1.5 }}>
                <WorkOrderLink
                  label="Exhaust Fan PM WO"
                  workorder={exhaustFanWo}
                />
              </Box>

              {exhaustFans.length === 0 ? (
                <EmptyState label="exhaust fan" />
              ) : (
                exhaustFans.map((unit, idx) => (
                  <EquipmentCard
                    key={unit.id ?? idx}
                    unit={unit}
                    fields={exhaustFanFields}
                    index={idx}
                  />
                ))
              )}
            </ServiceSection>
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default SelectedSitePanel;
