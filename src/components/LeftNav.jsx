import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PublicIcon from '@mui/icons-material/Public';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

import { useTheme } from '@mui/material/styles';

export default function LeftNav({ selected, onSelect, leftAlwaysVisible, setLeftAlwaysVisible, isTabletOrSmaller }) {
  const theme = useTheme();
  // Track open state for the collapsible Curriculum Components only
  const [open, setOpen] = React.useState({ curriculum: true });

  const toggle = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box component="nav" aria-label="left navigation" sx={{ bgcolor: theme.palette.neutral.main, p: 1, borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Navigation
        </Typography>
        {/* Pin toggle: visible on tablet to allow the user to pin the left nav inline */}
        {isTabletOrSmaller && typeof setLeftAlwaysVisible === 'function' && (
          <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <Tooltip title={leftAlwaysVisible ? 'Unpin left navigation' : 'Pin left navigation'}>
              <IconButton size="small" onClick={() => setLeftAlwaysVisible(!leftAlwaysVisible)} sx={{ ml: 1 }} aria-label="pin left nav">
                {leftAlwaysVisible ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            {/** showPinHint prop is passed from App; render a pulsing dot */}
            {typeof showPinHint !== 'undefined' && showPinHint && (
              <Box sx={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.warning.main, boxShadow: 3, animation: 'pulse 1200ms infinite' }} />
            )}
          </Box>
        )}
      </Box>
      <List disablePadding dense>
        {/* Course Information */}
        <ListItem disablePadding>
          <ListItemButton sx={{ py: 1.1 }} selected={selected === 'Course Information'} onClick={() => onSelect && onSelect('Course Information')}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Course Information" sx={{ ml: -1, '& .MuiListItemText-primary': { fontSize: '0.98rem', fontWeight: 500 } }} />
          </ListItemButton>
        </ListItem>

        {/* Learning Design Triangle (always expanded; non-clickable top-level label) */}
        <ListItem sx={{ py: 1.1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <MergeTypeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Learning Design Triangle" sx={{ ml: -1, '& .MuiListItemText-primary': { fontSize: '0.98rem', fontWeight: 500 } }} />
        </ListItem>
        <List component="div" disablePadding>
          <ListItem disablePadding sx={{ pl: 4 }}>
            <ListItemButton sx={{ py: 0.6 }} selected={selected === 'Intended Learning Outcomes'} onClick={() => onSelect && onSelect('Intended Learning Outcomes')}>
              <ListItemText primary="Intended Learning Outcomes" sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ pl: 4 }}>
            <ListItemButton sx={{ py: 0.6 }} selected={selected === 'Disciplinary Practice'} onClick={() => onSelect && onSelect('Disciplinary Practice')}>
              <ListItemText primary="Disciplinary Practice" sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ pl: 4 }}>
            <ListItemButton sx={{ py: 0.6 }} selected={selected === 'Pedagogical Approach'} onClick={() => onSelect && onSelect('Pedagogical Approach')}>
              <ListItemText primary="Pedagogical Approach" sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }} />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Details of Learning Design (label only; Curriculum Components remain collapsible) */}
        <ListItem sx={{ py: 1.1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <MenuBookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Details of Learning Design" sx={{ ml: -1, '& .MuiListItemText-primary': { fontSize: '0.98rem', fontWeight: 500 } }} />
        </ListItem>
        <List component="div" disablePadding>
          {/* Curriculum Components (third level, collapsible) */}
          <ListItem disablePadding sx={{ pl: 4 }}>
            <ListItemButton onClick={() => toggle('curriculum')} aria-expanded={open.curriculum} sx={{ py: 0.9 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ViewModuleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Curriculum Components" sx={{ ml: -1, '& .MuiListItemText-primary': { fontSize: '0.92rem' } }} />
              {open.curriculum ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
          </ListItem>
          <Collapse in={open.curriculum} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {['CC1', 'CC2', 'CC3', 'CC4', 'CC5', 'CC6'].map((cc) => (
                <ListItem key={cc} disablePadding sx={{ pl: 8 }}>
                  <ListItemButton selected={selected === cc} onClick={() => onSelect && onSelect(cc)}>
                    <ListItemText primary={cc} sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Lesson Arrangement */}
          <ListItem disablePadding sx={{ pl: 4 }}>
            <ListItemButton sx={{ py: 0.6 }} selected={selected === 'Lesson Arrangement'} onClick={() => onSelect && onSelect('Lesson Arrangement')}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <EventNoteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Lesson Arrangement" sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }} />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Other top-level items */}
        <ListItem disablePadding>
          <ListItemButton selected={selected === 'Course Overview'} onClick={() => onSelect && onSelect('Course Overview')} sx={{ py: 1.1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PublicIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Course Overview" sx={{ ml: -1, '& .MuiListItemText-primary': { fontSize: '0.98rem', fontWeight: 500 } }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton selected={selected === 'Designer Dashboard'} onClick={() => onSelect && onSelect('Designer Dashboard')} sx={{ py: 1.1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Designer Dashboard" sx={{ ml: -1, '& .MuiListItemText-primary': { fontSize: '0.98rem', fontWeight: 500 } }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton selected={selected === 'LD to iLAP Converter'} onClick={() => onSelect && onSelect('LD to iLAP Converter')} sx={{ py: 1.1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SyncAltIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="LD to iLAP Converter" sx={{ ml: -1, '& .MuiListItemText-primary': { fontSize: '0.98rem', fontWeight: 500 } }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
