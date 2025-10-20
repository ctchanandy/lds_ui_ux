import React from 'react';
import { Paper, Box, Typography, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CircleIcon from '@mui/icons-material/Circle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getBloomLevel as utilGetBloomLevel, isAssessedFor, linkAssessmentFor, unlinkAssessmentFor } from '../utils/iloUtils';

export default function ILORow({ idx, text, level, klas = [], onEdit, onDelete, idKey, linkTargets = null }) {
  const bloom = level || utilGetBloomLevel(text);
  const key = idKey || `${text}-${idx}`;
  const [assessed, setAssessed] = React.useState(() => isAssessedFor(key));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    setAssessed(isAssessedFor(key));
  }, [key]);

  const openAssessmentDialog = () => { if (linkTargets && linkTargets.length) setDialogOpen(true); };
  const closeAssessmentDialog = () => setDialogOpen(false);

  // use the provided linkTargets (learning tasks) when present; otherwise no link options
  const handleSelectAssessment = (a) => {
    linkAssessmentFor(key, a.id);
    setAssessed(true);
    closeAssessmentDialog();
    try { window.dispatchEvent(new CustomEvent('ilo-assessment-changed', { detail: { key, targetId: a.id } })); } catch (e) { }
  };

  const handleUnlink = () => {
    unlinkAssessmentFor(key);
    setAssessed(false);
    try { window.dispatchEvent(new CustomEvent('ilo-assessment-changed', { detail: { key, targetId: null } })); } catch (e) { }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 0.75, mb: 1 }}>
        {/* Two layouts: compact inline indicators for main ILO list (no linkTargets),
            and reserved clickable slot for CC linking (linkTargets present) */}
        {linkTargets ? (
          <>
            <Box sx={{ width: 28, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title={assessed ? 'Linked to assessment' : 'Not assessed — click to link'}>
                <Box onClick={openAssessmentDialog} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircleIcon sx={{ fontSize: 12 }} color={assessed ? 'success' : 'error'} />
                </Box>
              </Tooltip>
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography noWrap variant="body1">{text}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                <Chip
                  label={bloom}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    height: 28,
                    minWidth: 56,
                    px: 1,
                    mr: 1
                  }}
                />
                {klas.map((k) => (
                  <Chip
                    key={k}
                    label={k}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.neutral.main,
                      color: theme.palette.neutral.contrastText,
                      borderRadius: 2,
                      height: 22,
                      fontSize: '0.75rem',
                      px: 0.5
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        ) : (
          // compact inline layout used by the main Intended Learning Outcomes page
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
              <Chip
                label={bloom}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  height: 28,
                  minWidth: 56,
                  px: 1,
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1, px: 1 }}>
              <Typography noWrap variant="body1" sx={{ fontWeight: 600 }}>{text}</Typography>
              {klas && klas.length > 0 && (
                <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {klas.map((k) => (
                    <Chip key={k} label={k} size="small" sx={{ bgcolor: theme.palette.neutral.main, color: theme.palette.neutral.contrastText, borderRadius: 2, height: 22, fontSize: '0.75rem', px: 0.5 }} />
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
              {/* show a small red alert icon for unassessed rows so it's visible */}
              {!assessed && <Tooltip title="Not assessed"><ErrorOutlineIcon sx={{ color: theme.palette.unassessed.main }} fontSize="small" /></Tooltip>}
              <Tooltip title={assessed ? 'Linked to assessment' : 'Not assessed'}>
                <CircleIcon sx={{ fontSize: 14, color: assessed ? theme.palette.assessed.main : theme.palette.unassessed.main }} />
              </Tooltip>
            </Box>
          </>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
          <Tooltip title="Assistant quick-check">
            <IconButton size="small">
              <SmartToyIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => onEdit && onEdit(idx)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete && onDelete(idx)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeAssessmentDialog} fullWidth maxWidth="xs">
        <DialogTitle>Link an assessment / task</DialogTitle>
        <DialogContent>
          {(!linkTargets || linkTargets.length === 0) ? (
            <Typography variant="body2" color="text.secondary">No link targets available for this ILO.</Typography>
          ) : (
            <List>
              {linkTargets.map((a) => (
                <ListItem key={a.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectAssessment(a)}>
                    <ListItemText primary={a.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          {assessed && <Button onClick={handleUnlink} color="error">Unlink</Button>}
          <Button onClick={closeAssessmentDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
