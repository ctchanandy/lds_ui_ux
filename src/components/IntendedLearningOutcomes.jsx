import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
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
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const STORAGE_KEY = 'ilo-data';

const DEFAULT_DATA = {
  'Disciplinary Skills': [
    'Apply scientific investigation process - Gathering observational evidence about the problem(s)',
    'Analyze scientific investigation process - Formulate inquiry questions',
    'Create scientific investigation process - Propose hypothesis',
    'Design scientific investigation process - Design a fair test',
    'Evaluate scientific investigation process - Collect evidence',
    'Understand scientific investigation process - Scientific reasoning'
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

export default function IntendedLearningOutcomes({ courseKeyAreas = [] }) {
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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [bloomFilter, setBloomFilter] = React.useState('All');

  const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  const getBloomLevel = (text) => {
    if (!text) return 'Apply';
    const first = text.trim().split(/\s+/)[0].toLowerCase();
    // naive mapping based on leading verb
    if (first === 'apply') return 'Apply';
    if (first === 'create' || first === 'design' || first === 'construct' || first === 'build') return 'Create';
    if (first === 'analyze' || first === 'compare' || first === 'contrast') return 'Analyze';
    if (first === 'evaluate' || first === 'judge') return 'Evaluate';
    if (first === 'understand' || first === 'explain' || first === 'describe') return 'Understand';
    return 'Apply';
  };

  const bloomColor = (level) => {
    switch (level) {
      case 'Create': return 'warning';
      case 'Analyze': return 'success';
      case 'Evaluate': return 'secondary';
      case 'Understand': return 'info';
      case 'Remember': return 'default';
      case 'Apply':
      default:
        return 'primary';
    }
  };

  // Return filtered items for a category based on search and bloom filter
  const getFilteredItems = (category) => {
    return (data[category] || []).filter((t) => {
      const matchesSearch = !searchTerm || t.toLowerCase().includes(searchTerm.toLowerCase());
      const level = getBloomLevel(t);
      const matchesBloom = bloomFilter === 'All' || bloomFilter === level;
      return matchesSearch && matchesBloom;
    });
  };

  const totalMatches = Object.keys(data).reduce((acc, c) => acc + getFilteredItems(c).length, 0);

  const isFiltered = Boolean((searchTerm && searchTerm.trim().length > 0) || (bloomFilter && bloomFilter !== 'All'));

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

  // Use Course Information key areas if provided, otherwise fall back to a small demo list
  const COURSE_KLAS = (courseKeyAreas && courseKeyAreas.length) ? courseKeyAreas : [];
  const getMockKlasFor = (text) => {
    // If no course KLAs are defined, return empty (don't invent KLAs)
    if (!COURSE_KLAS || COURSE_KLAS.length === 0) return [];
    // pick 1-2 klas based on hash of text for demo variability
    const n = (text || '').length;
    const k1 = COURSE_KLAS[n % COURSE_KLAS.length];
    const k2 = COURSE_KLAS[(n + 1) % COURSE_KLAS.length];
    return n % 3 === 0 ? [k1, k2] : [k1];
  };

  // Demo: show 'no assessment' reminder for some rows (every 3rd) so it's visible
  const demoHasAssessment = (idx) => (idx % 3) !== 0;


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

      {/* search + filter toolbar */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search outcomes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Bloom level</InputLabel>
          <Select label="Bloom level" value={bloomFilter} onChange={(e) => setBloomFilter(e.target.value)}>
            <MenuItem value="All">All levels</MenuItem>
            {BLOOM_LEVELS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">{totalMatches} results</Typography>
          {isFiltered && (
            <Button size="small" variant="outlined" onClick={() => { setSearchTerm(''); setBloomFilter('All'); }} sx={{ ml: 1 }}>Clear filters</Button>
          )}
        </Box>
      </Box>

      {Object.keys(data).map((category) => {
        const items = (data[category] || []).filter((t) => {
          const matchesSearch = !searchTerm || t.toLowerCase().includes(searchTerm.toLowerCase());
          const level = getBloomLevel(t);
          const matchesBloom = bloomFilter === 'All' || bloomFilter === level;
          return matchesSearch && matchesBloom;
        });

        return (
          <Paper key={category} sx={{ p: 0, mb: 2, borderRadius: 1, overflow: 'hidden' }} elevation={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.6 }}>
              <Box sx={{ width: 6, height: 28, bgcolor: 'secondary.main', borderRadius: 1, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{category}</Typography>
              <Box sx={{ flex: 1 }} />
              <Button startIcon={<AddIcon />} size="small" onClick={() => openAdd(category)} color="primary" variant="contained">Create</Button>
            </Box>
            <Divider />

            <Box sx={{ p: 1 }}>
              {(items && items.length > 0) ? (
                <Box>
                  {items.map((text, idx) => {
                    const level = getBloomLevel(text);
                    return (
                      <Paper key={`${category}-${idx}`} variant="outlined" className="ilo-row" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, mb: 1, borderRadius: 1, '&:hover .ilo-actions': { opacity: 1 } }}>
                        <Tooltip title={`${level} — Bloom taxonomy`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 100px' }}>
                            {/* neutral chip (no color) to avoid conflicting with task-type colors */}
                            <Chip label={level} size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 26, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderColor: 'divider', color: 'text.primary' }} />
                          </Box>
                        </Tooltip>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                          {/* subtle red dot indicator before text when unassessed */}
                          {/* reserved slot so presence/absence of the red dot doesn't shift the text */}
                          <Box sx={{ width: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '0 0 auto', ml: 0.25, mr: 0.25 }}>
                            {!demoHasAssessment(idx) ? (
                              <Tooltip title="Not assessed" placement="top">
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                              </Tooltip>
                            ) : (
                              /* invisible placeholder keeps alignment */
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', opacity: 0 }} />
                            )}
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Tooltip title={text} enterDelay={300}>
                              <Typography variant="body2" noWrap sx={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</Typography>
                            </Tooltip>

                            {/* KLA chips row (visual-only) */}
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                              {getMockKlasFor(text).slice(0, 2).map((k) => (
                                <Chip
                                  key={k}
                                  label={k}
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    fontSize: '0.72rem',
                                    color: 'text.secondary',
                                    bgcolor: 'grey.100',
                                    height: 22,
                                    px: 0.5,
                                    borderRadius: 1,
                                    boxShadow: 'none'
                                  }}
                                />
                              ))}
                              {getMockKlasFor(text).length > 2 && (
                                <Chip label={`+${getMockKlasFor(text).length - 2}`} size="small" variant="filled" sx={{ fontSize: '0.72rem', bgcolor: 'grey.100', height: 22 }} />
                              )}
                            </Box>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={0.5} className="ilo-actions" sx={{ flex: '0 0 auto', alignItems: 'center' }}>
                          {/* chatbot quick-check - visible always but muted */}
                          <IconButton size="small" aria-label="check-ilo" sx={{ color: 'success.dark', bgcolor: (theme) => theme.palette.success.light, borderRadius: 1, p: 0.5 }} title="Check with assistant" onClick={() => {
                            window.dispatchEvent(new CustomEvent('chat-prefill', { detail: { text: `Check this ILO: "${text}"` } }));
                            window.dispatchEvent(new CustomEvent('chat-open'));
                          }}>
                            <SmartToyIcon fontSize="small" />
                          </IconButton>

                          <IconButton size="small" onClick={() => openEdit(category, idx)} aria-label="edit" sx={{ padding: 0.5, color: 'text.secondary' }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(category, idx)} aria-label="delete" sx={{ padding: 0.5, color: 'text.secondary' }}><DeleteIcon fontSize="small" /></IconButton>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                isFiltered ? (
                  <Paper variant="outlined" className="ilo-empty-filtered" sx={{ p: 3, textAlign: 'center', borderRadius: 1 }} role="status" aria-live="polite">
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>No outcomes match your filters</Typography>
                    <Typography variant="body2" color="text.secondary">Try clearing filters or search term to see outcomes in this category.</Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Button size="small" variant="contained" onClick={() => { setSearchTerm(''); setBloomFilter('All'); }}>Clear filters</Button>
                      <Button size="small" variant="outlined" onClick={() => { setSearchTerm(''); setBloomFilter('All'); }}>Show all</Button>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {searchTerm && <Chip size="small" label={`Search: "${searchTerm}"`} onDelete={() => setSearchTerm('')} />}
                      {bloomFilter && bloomFilter !== 'All' && <Chip size="small" label={`Bloom: ${bloomFilter}`} onDelete={() => setBloomFilter('All')} />}
                    </Box>
                  </Paper>
                ) : (
                  <Paper variant="outlined" className="ilo-empty" sx={{ borderStyle: 'dashed', p: 4, textAlign: 'center', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">What key concepts, theories, or information will learners acquire?</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button variant="contained" onClick={() => openAdd(category)}>CREATE</Button>
                    </Box>
                  </Paper>
                )
              )}
            </Box>
          </Paper>
        );
      })}

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
