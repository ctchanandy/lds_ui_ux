import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const items = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  title: `Feature ${i + 1}`,
  desc: 'Short feature description to preview the layout.'
}));

export default function CardGrid() {
  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {items.map((it) => (
        <Grid item key={it.id} xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {it.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {it.desc}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Learn more</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
