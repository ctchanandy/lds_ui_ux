import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const defaultValues = {
  topic: '',
  description: '',
  keyAreas: '',
  gradeLevel: '',
  lessons: '',
  duration: '',
  contributor: '',
  affiliation: ''
};

import IntendedLearningOutcomes from './IntendedLearningOutcomes';

export default function MainContent({ selectedSection }) {
  const [values, setValues] = React.useState(defaultValues);

  React.useEffect(() => {
    // reset tiny form when switching away from Course Information optionally
    if (selectedSection !== 'Course Information') return;
    // preserve values for now (no-op) -- could reset if desired
  }, [selectedSection]);

  const handleChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  if (selectedSection !== 'Course Information') {
    if (selectedSection === 'Intended Learning Outcomes') return <IntendedLearningOutcomes />;
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Course Information</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Topic" value={values.topic} onChange={handleChange('topic')} fullWidth />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Description (optional)" value={values.description} onChange={handleChange('description')} fullWidth multiline rows={3} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Key Learning Area(s)" value={values.keyAreas} onChange={handleChange('keyAreas')} fullWidth placeholder="e.g., Mathematics; Science" />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Grade Level" value={values.gradeLevel} onChange={handleChange('gradeLevel')} fullWidth placeholder="e.g., 9-10" />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField label="Number of Lessons/Sessions" value={values.lessons} onChange={handleChange('lessons')} fullWidth type="number" />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField label="Duration per Lesson/Session (mins)" value={values.duration} onChange={handleChange('duration')} fullWidth type="number" />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField label="Contributor Name (optional)" value={values.contributor} onChange={handleChange('contributor')} fullWidth />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Contributor Affiliation (optional)" value={values.affiliation} onChange={handleChange('affiliation')} fullWidth />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => setValues(defaultValues)} variant="outlined">Reset</Button>
              <Button variant="contained" onClick={() => { /* stub: save */ alert('Saved (stub)'); }}>Save</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

    </Box>
  );
}
