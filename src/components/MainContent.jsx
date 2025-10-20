import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

const defaultValues = {
  topic: '',
  description: '',
  keyAreas: [],
  gradeLevel: '',
  lessons: '',
  duration: '',
  contributor: '',
  affiliation: ''
};

const KEY_AREA_OPTIONS = [
  'Chinese Language Education',
  'English Language Education',
  'Mathematics Education',
  'Science Education',
  'Technology Education',
  'Personal, Social and Humanities Education',
  'Arts Education',
  'Physical Education'
];

import IntendedLearningOutcomes from './IntendedLearningOutcomes';
import CurriculumComponents from './CurriculumComponents';

export default function MainContent({ selectedSection }) {
  const [values, setValues] = React.useState(defaultValues);

  React.useEffect(() => {
    // reset tiny form when switching away from Course Information optionally
    if (selectedSection !== 'Course Information') return;
    // preserve values for now (no-op) -- could reset if desired
  }, [selectedSection]);

  const handleChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleKeyAreasChange = (event, newValue) => {
    setValues((v) => ({ ...v, keyAreas: newValue }));
  };

  const num = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  };

  if (selectedSection !== 'Course Information') {
    if (selectedSection === 'Intended Learning Outcomes') return <IntendedLearningOutcomes courseKeyAreas={values.keyAreas} />;
    if (['CC1', 'CC2', 'CC3', 'CC4', 'CC5', 'CC6'].includes(selectedSection)) return <CurriculumComponents selectedSection={selectedSection} courseKeyAreas={values.keyAreas} />;
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">{selectedSection}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This is the placeholder page for the <strong>{selectedSection}</strong> section.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: 10 }}>
      <Typography variant="h5" gutterBottom>Course Information</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField required label="Topic" value={values.topic} onChange={handleChange('topic')} fullWidth helperText="Give a short descriptive title for the course." />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Description (optional)" value={values.description} onChange={handleChange('description')} fullWidth multiline rows={3} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              freeSolo
              disableCloseOnSelect
              options={KEY_AREA_OPTIONS}
              value={values.keyAreas}
              onChange={handleKeyAreasChange}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Key Learning Area(s)" placeholder="Type or select areas" helperText="Select or type multiple areas; press Enter to add custom ones." />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Grade Level" value={values.gradeLevel} onChange={handleChange('gradeLevel')} fullWidth placeholder="e.g., 9-10" />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField label="Number of Lessons/Sessions" value={values.lessons} onChange={handleChange('lessons')} fullWidth type="number" inputProps={{ min: 0 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField label="Duration per Lesson/Session (mins)" value={values.duration} onChange={handleChange('duration')} fullWidth type="number" inputProps={{ min: 0 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField label="Total In-Lesson/Session Time (mins)" value={num(values.lessons) * num(values.duration) || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Contributor Name (optional)" value={values.contributor} onChange={handleChange('contributor')} fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Contributor Affiliation (optional)" value={values.affiliation} onChange={handleChange('affiliation')} fullWidth />
          </Grid>

        </Grid>
        {/* sticky action bar scoped to the Paper (middle column) */}
        <Box sx={{ position: 'sticky', bottom: 12, display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, bgcolor: 'background.paper', py: 1 }}>
          <Button variant="outlined" onClick={() => setValues(defaultValues)}>Reset</Button>
          <Button variant="contained" onClick={() => { /* stub: save */ alert('Saved (stub)'); }}>Save</Button>
        </Box>
      </Paper>

    </Box>
  );
}
