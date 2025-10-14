import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const STORAGE_KEY = 'ilo-data';

const DEFAULT_DATA = {
  'Disciplinary Skills': [
    'Apply scientific investigation process - Gathering observational evidence about the problem(s)',
    'Apply scientific investigation process - Formulate inquiry questions',
    'Apply scientific investigation process - Propose hypothesis',
    'Apply scientific investigation process - Design a fair test',
    'Apply scientific investigation process - Collect evidence',
    'Apply scientific investigation process - Scientific reasoning'
  ],
  'Generic Skills': [
    'Apply self-directed learning strategies (Goal setting) in the learning process',
    'Apply self-directed learning strategies (Self-planning) in the learning process',
    'Apply self-directed learning strategies (Self-monitoring) in the learning process',
    'Apply self-directed learning strategies (Self-evaluation) in the learning process',
    'Apply self-directed learning strategies (Revision) in the learning process'
  ],
  'Disciplinary Knowledge': [],
  'Values & Attitudes': []
};

export default function IntendedLearningOutcomes() {
  const [data, setData] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return DEFAULT_DATA;
  });

  const nextId = React.useRef(1);
  React.useEffect(() => { // ensure each item would have an id if needed later
    // nothing for now
  }, []);

  const persist = (next) => {
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { }
    // notify layout listeners if desired
    try { window.dispatchEvent(new CustomEvent('panel-sizes-changed', { detail: { intendedLearningOutcomes: true } })); } catch (e) { }
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState('add');
  const [activeCategory, setActiveCategory] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [textValue, setTextValue] = React.useState('');
  const [deleteConfirm, setDeleteConfirm] = React.useState({ open: false, category: null, index: null });

  const openAdd = (category) => {
    setActiveCategory(category);
    setDialogMode('add');
    setTextValue('');
    setEditIndex(null);
    setDialogOpen(true);
  };

  const openEdit = (category, index) => {
    setActiveCategory(category);
    setDialogMode('edit');
    setEditIndex(index);
    setTextValue(data[category][index] || '');
    setDialogOpen(true);
  };

  const handleSave = () => {
    const cat = activeCategory;
    if (!cat) return setDialogOpen(false);
    const next = { ...data };
    if (dialogMode === 'add') {
      next[cat] = [...(next[cat] || []), textValue];
    } else if (dialogMode === 'edit' && typeof editIndex === 'number') {
      const copy = [...(next[cat] || [])];
      copy[editIndex] = textValue;
      next[cat] = copy;
    }
    persist(next);
    setDialogOpen(false);
  };

  const confirmDelete = (category, index) => setDeleteConfirm({ open: true, category, index });
  const handleDelete = () => {
    const { category, index } = deleteConfirm;
    if (!category) return setDeleteConfirm({ open: false, category: null, index: null });
    const next = { ...data };
    next[category] = (next[category] || []).filter((_, i) => i !== index);
    persist(next);
    setDeleteConfirm({ open: false, category: null, index: null });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Intended Learning Outcomes</Typography>

      {Object.keys(data).map((category) => (
        <Paper key={category} sx={{ p: 0, mb: 2 }} elevation={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText', px: 2, py: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{category}</Typography>
            <Box sx={{ flex: 1 }} />
            <Button startIcon={<AddIcon />} size="small" onClick={() => openAdd(category)} color="primary" variant="contained">Create</Button>
          </Box>
          <Divider />

          <Box sx={{ p: 1 }}>
            {(data[category] && data[category].length > 0) ? (
              <Table>
                <TableBody>
                  {data[category].map((text, idx) => (
                    <TableRow key={`${category}-${idx}`} sx={{ alignItems: 'center' }}>
                      <TableCell sx={{ width: 120 }}>
                        <Button variant="contained" color="primary" size="small">Apply</Button>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{text}</Typography>
                      </TableCell>
                      <TableCell sx={{ width: 120 }} align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => openEdit(category, idx)} aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(category, idx)} aria-label="delete"><DeleteIcon fontSize="small" /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">What key concepts, theories, or information will learners acquire?</Typography>
                <Box sx={{ mt: 1 }}>
                  <Button variant="contained" onClick={() => openAdd(category)}>CREATE</Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? 'Add outcome' : 'Edit outcome'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Outcome text" value={textValue} onChange={(e) => setTextValue(e.target.value)} fullWidth multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, category: null, index: null })}>
        <DialogTitle>Delete outcome?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this intended learning outcome? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, category: null, index: null })}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
