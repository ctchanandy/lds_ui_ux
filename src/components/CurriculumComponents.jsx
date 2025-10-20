import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Tooltip from '@mui/material/Tooltip';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RoomIcon from '@mui/icons-material/Room';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ILORow from './ILORow';
import { useTheme } from '@mui/material/styles';
import { ILO_STORAGE_KEY, getBloomLevel, readAssessments, writeAssessments } from '../utils/iloUtils';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LinkIcon from '@mui/icons-material/Link';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';

const CC_SECTIONS = [
  { id: 'CC1', title: 'Through brainstorming to identify problems for goal-setting' },
  { id: 'CC2', title: 'Through discussing essential design elements to ideate solutions for self-planning' },
  { id: 'CC3', title: 'Through collecting feedback to design solutions for self-planning' },
  { id: 'CC4', title: 'Through creating artifacts and material tests to construct prototype for self-monitoring' },
  { id: 'CC5', title: 'Through competition based on the rubric to test performance of the product for self-evaluation' },
  { id: 'CC6', title: 'Through analysing feedback to optimise the product for revision' }
];

// sensible default ILO texts per curriculum component inferred from the provided screenshot
const DEFAULT_CC_ILOS = {
  CC1: [
    'Identify and describe the user problem through observation and discussion',
    'Analyze user needs and priorities to frame a clear design brief'
  ],
  CC2: [
    'Generate multiple solution ideas and evaluate feasibility for self-planning',
    'Select and plan an initial prototype approach based on design criteria'
  ],
  CC3: [
    'Define assessment criteria and evidence required to evaluate solutions',
    'Collect and organise evidence to demonstrate learning outcomes'
  ],
  CC4: [
    'Identify and evaluate resources and materials suitable for prototyping',
    'Use digital and physical resources to create artefacts effectively'
  ],
  CC5: [
    'Adapt learning tasks to meet diverse learner needs and abilities',
    'Provide scaffolds and extension activities for differentiated participation'
  ],
  CC6: [
    'Reflect on feedback to improve designs and learning processes',
    'Iterate on solutions using formative evidence and peer critique'
  ]
};

const DEFAULT_CC_DPPA = {
  CC1: { dp: 'Identify problem', pa: 'Goal-setting' },
  CC2: { dp: 'Ideate solutions', pa: 'Collaborative inquiry' },
  CC3: { dp: 'Define assessment criteria', pa: 'Formative feedback' },
  CC4: { dp: 'Select materials and tools', pa: 'Guided practice' },
  CC5: { dp: 'Differentiate tasks', pa: 'Scaffolding & support' },
  CC6: { dp: 'Reflect and improve', pa: 'Peer critique' }
};

function SampleRow({ title, tags = [], color = 'primary' }) {
  return (
    <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, mb: 1, borderRadius: 1 }}>
      <Box sx={{ width: 6, height: 36, bgcolor: `${color}.main`, borderRadius: 1 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{title}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          {tags.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
        </Stack>
      </Box>
      <Box>
        <Button size="small" variant="outlined">Edit</Button>
      </Box>
    </Paper>
  );
}

// small helper to provide mock KLAs for demonstration (mirrors ILO component behavior)
const getMockKlasFor = (text, courseKlas = []) => {
  if (!courseKlas || courseKlas.length === 0) {
    const demo = ['Technology Education', 'Science Education', 'Mathematics Education'];
    const n = (text || '').length;
    const k1 = demo[n % demo.length];
    const k2 = demo[(n + 1) % demo.length];
    return n % 3 === 0 ? [k1, k2] : [k1];
  }
  const n = (text || '').length;
  const k1 = courseKlas[n % courseKlas.length];
  const k2 = courseKlas[(n + 1) % courseKlas.length];
  return n % 3 === 0 ? [k1, k2] : [k1];
};

// return the sample tasks for a given CC (used as linkTargets for ILORow)
function getTasksFor(sec) {
  return [
    { id: `task-${sec.id}-0`, title: 'Students observe the scenario of the design problem through stimulus', time: '5 min', location: 'Inside Classroom', group: 'Whole Class', color: 'primary', resources: ['ILAP FORUM'] },
    { id: `task-${sec.id}-1`, title: 'Students discuss the needs of users', time: '15 min', location: 'Inside Classroom', group: 'Group', perGroup: '5 Per Group', color: 'success', resources: ['ILAP FORUM', 'PRACTICE EXERCISE (E.G. WORKSHEET, WORKBOOK)'] },
    { id: `task-${sec.id}-2`, title: 'Students work on identifying the most prominent problem needed to be addressed.', time: '5 min', location: 'Inside Classroom', group: 'Group', perGroup: '5 Per Group', color: 'warning', resources: ['ILAP URL', 'ILAP WIKI', 'ILAP FORUM', 'PRACTICE EXERCISE (E.G. WORKSHEET, WORKBOOK)'] },
    { id: `task-${sec.id}-3`, title: 'Students present their findings on user needs to the whole class', time: '5 min', location: 'Inside Classroom', group: 'Whole Class', color: 'warning', resources: ['ILAP URL', 'ILAP WIKI', 'ILAP WIKI', 'ILAP FORUM'] }
  ];
}



export default function CurriculumComponents({ selectedSection, courseKeyAreas = [] }) {
  const theme = useTheme();
  // build a flattened list of main ILOs from the persisted store so CCs can reference them
  const flatILOs = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(ILO_STORAGE_KEY);
      const store = raw ? JSON.parse(raw) : null;
      if (store) {
        const flat = [];
        Object.keys(store).forEach((cat) => {
          (store[cat] || []).forEach((t, idx) => flat.push({ text: t, category: cat, index: idx }));
        });
        if (flat.length > 0) return flat;
      }
    } catch (e) { }
    // fallback: use DEFAULT_CC_ILOS as a small source
    const fall = [];
    Object.keys(DEFAULT_CC_ILOS).forEach((k) => {
      DEFAULT_CC_ILOS[k].forEach((t, idx) => fall.push({ text: t, category: k, index: idx }));
    });
    return fall;
  }, []);

  // seed some assessed mappings for demo if none exist (mark first ILO of first 3 CCs)
  React.useEffect(() => {
    try {
      const existing = readAssessments();
      if (!existing || Object.keys(existing).length === 0) {
        const seed = {};
        // for first 3 CCs, if there is a matching flat ILO, link to the first task id for that CC
        CC_SECTIONS.slice(0, 3).forEach((sec, i) => {
          const start = (i * 2) % Math.max(1, flatILOs.length);
          const candidate = flatILOs[start];
          if (candidate) {
            // create key consistent with ILORow key calculation in main list: `${text}-${index}`
            const key = `${candidate.text}-${candidate.index}`;
            const taskId = `task-${sec.id}-0`;
            seed[key] = taskId;
          }
        });
        writeAssessments(seed);
        // notify listeners
        try { window.dispatchEvent(new CustomEvent('ilo-assessments-seeded', { detail: { seed } })); } catch (e) { }
      }
    } catch (e) { }
  }, [flatILOs]);
  const [open, setOpen] = React.useState(CC_SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}));
  const expandAll = () => setOpen(CC_SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}));
  const collapseAll = () => setOpen(CC_SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: false }), {}));

  React.useEffect(() => {
    // If a CC is selected from the left nav, scroll to that section within the long page
    if (selectedSection && selectedSection.startsWith && selectedSection.startsWith('CC')) {
      const el = document.getElementById(selectedSection);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSection]);

  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Page header similar to screenshot */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>Engineer (Engineering Design + Self-directed Learning)</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>Curriculum Component Sequence</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
          <Typography variant="body2">Total Learning Time: 450 min</Typography>
          <Typography variant="body2">Designed Total In-Lesson Time: 0 / 0 min</Typography>
          <Box sx={{ flex: 1 }} />
          <Button onClick={expandAll} size="small">EXPAND ALL</Button>
          <Button onClick={collapseAll} size="small">COLLAPSE ALL</Button>
          <Button startIcon={<AddIcon />} size="small">A NEW CURRICULUM COMPONENT</Button>
        </Box>
      </Box>

      {/* Quick links removed — use left navigation instead */}

      {CC_SECTIONS.map((sec, i) => (
        <Box key={sec.id} id={sec.id} sx={{ mb: 3 }}>
          <Paper sx={{ width: '100%', bgcolor: theme.palette.header.main, color: theme.palette.header.contrastText, borderRadius: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 0.6 }}>
              <Box sx={{ bgcolor: 'secondary.main', color: 'common.white', px: 1, py: 0.4, borderRadius: 1, fontWeight: 700 }}>{i + 1}</Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{sec.title}</Typography>
              <Box sx={{ flex: 1 }} />
              <IconButton size="small" sx={{ color: 'inherit' }} onClick={() => toggle(sec.id)}>
                {open[sec.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" sx={{ color: 'inherit' }}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: 'inherit' }}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          </Paper>

          <Divider sx={{ mb: 1 }} />

          {open[sec.id] && (
            <Box>
              {/* ILO block */}
              <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RadioButtonUncheckedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="text.secondary">Intended Learning Outcomes</Typography>
                </Box>

                <Stack spacing={1} sx={{ mt: 1 }}>
                  {/* Wire edit/delete to the main ilo-data store so changes persist across pages */}
                  {(() => {
                    // pick a deterministic slice from the flattened main ILO list so CCs reference existing ILOs
                    const start = (i * 2) % Math.max(1, flatILOs.length);
                    const picks = [flatILOs[start], flatILOs[(start + 1) % Math.max(1, flatILOs.length)]].filter(Boolean);
                    return picks.map((item, j) => (
                      <ILORow
                        key={`cc-ilo-${i}-${j}`}
                        idKey={`${item.text}-${item.index}`}
                        text={item.text}
                        idx={item.index}
                        level={getBloomLevel(item.text)}
                        klas={getMockKlasFor(item.text, courseKeyAreas)}
                        linkTargets={getTasksFor(sec)}
                        onEdit={() => {
                          // simple in-place edit prompt for demo: update ilo-data stored object under a category named by CC id
                          try {
                            const raw = localStorage.getItem(ILO_STORAGE_KEY);
                            const store = raw ? JSON.parse(raw) : {};
                            const cat = sec.title || sec.id;
                            const arr = store[cat] || [];
                            // replace index j or append
                            if (arr[j]) arr[j] = txt + ' (edited)'; else arr.push(txt + ' (edited)');
                            store[cat] = arr;
                            localStorage.setItem(ILO_STORAGE_KEY, JSON.stringify(store));
                            window.dispatchEvent(new CustomEvent('ilo-store-changed', { detail: { store } }));
                            // visual feedback — in a real app we'd open the edit dialog
                          } catch (e) { }
                        }}
                        onDelete={() => {
                          try {
                            const raw = localStorage.getItem(ILO_STORAGE_KEY);
                            const store = raw ? JSON.parse(raw) : {};
                            const cat = sec.title || sec.id;
                            const arr = store[cat] || [];
                            if (arr[j]) arr.splice(j, 1);
                            store[cat] = arr;
                            localStorage.setItem(ILO_STORAGE_KEY, JSON.stringify(store));
                            window.dispatchEvent(new CustomEvent('ilo-store-changed', { detail: { store } }));
                          } catch (e) { }
                        }}
                      />
                    ));
                  })()}
                </Stack>
              </Paper>

              {/* DP / PA row */}
              <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="caption" color="text.secondary">Disciplinary Practice</Typography>
                    <Typography variant="body2">{(DEFAULT_CC_DPPA[sec.id] && DEFAULT_CC_DPPA[sec.id].dp) || 'Identify problem'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Pedagogical Approach</Typography>
                    <Typography variant="body2">{(DEFAULT_CC_DPPA[sec.id] && DEFAULT_CC_DPPA[sec.id].pa) || 'Goal-setting'}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Learning Tasks header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2">Learning Task(s)</Typography>
                <Box sx={{ flex: 1 }} />
                <IconButton aria-label="add-task" size="small" sx={{ bgcolor: 'grey.100', borderRadius: '50%', mr: 1 }}><AddIcon fontSize="small" /></IconButton>
                <Button size="small" variant="outlined" color="success" sx={{ borderRadius: 3, textTransform: 'none' }}>SHOW SUGGESTED TASKS</Button>
              </Box>

              {/* Task rows */}
              <Box>
                {(() => {
                  const tasks = [{
                    id: `task-${sec.id}-0`,
                    title: 'Students observe the scenario of the design problem through stimulus',
                    time: '5 min', location: 'Inside Classroom', group: 'Whole Class', color: 'primary', resources: ['ILAP FORUM']
                  }, {
                    id: `task-${sec.id}-1`,
                    title: 'Students discuss the needs of users',
                    time: '15 min', location: 'Inside Classroom', group: 'Group', perGroup: '5 Per Group', color: 'success', resources: ['ILAP FORUM', 'PRACTICE EXERCISE (E.G. WORKSHEET, WORKBOOK)']
                  }, {
                    id: `task-${sec.id}-2`,
                    title: 'Students work on identifying the most prominent problem needed to be addressed.',
                    time: '5 min', location: 'Inside Classroom', group: 'Group', perGroup: '5 Per Group', color: 'warning', resources: ['ILAP URL', 'ILAP WIKI', 'ILAP FORUM', 'PRACTICE EXERCISE (E.G. WORKSHEET, WORKBOOK)']
                  }, {
                    id: `task-${sec.id}-3`,
                    title: 'Students present their findings on user needs to the whole class',
                    time: '5 min', location: 'Inside Classroom', group: 'Whole Class', color: 'warning', resources: ['ILAP URL', 'ILAP WIKI', 'ILAP WIKI', 'ILAP FORUM']
                  }];

                  return tasks.map((t, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 1, mb: 1 }}>
                      <Box sx={{ width: 6, minHeight: 72, bgcolor: `${t.color}.main`, borderRadius: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.header.main }}>{t.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AccessTimeIcon fontSize="small" /> <Typography variant="caption">{t.time}</Typography></Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><RoomIcon fontSize="small" /> <Typography variant="caption">{t.location}</Typography></Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PeopleIcon fontSize="small" /> <Typography variant="caption">{t.group}</Typography></Box>
                          {t.perGroup && <Typography variant="caption" color="text.secondary">• {t.perGroup}</Typography>}
                        </Box>

                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {t.resources.map((r, i) => {
                            const lower = r.toLowerCase();
                            const icon = lower.includes('url') ? <LinkIcon /> : lower.includes('wiki') ? <InsertDriveFileIcon /> : lower.includes('practice') ? <AttachFileIcon /> : <InsertDriveFileIcon />;
                            return <Chip key={`${r}-${i}`} icon={icon} label={r} size="small" variant="outlined" />;
                          })}
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <IconButton size="small"><FileCopyIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><ArrowUpwardIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><ArrowDownwardIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton>
                      </Stack>
                    </Paper>
                  ))
                })()}
              </Box>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

function GridLikeRows() {
  // simple mock grid of activity cards
  return (
    <Box>
      {[1, 2, 3].map((n) => (
        <Paper key={n} variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 6, height: 36, bgcolor: 'primary.main', borderRadius: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Activity {n} — Group investigation</Typography>
            <Typography variant="caption" color="text.secondary">Duration: 30 mins • Group • In-class</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button size="small">View</Button>
            <Button size="small" variant="outlined">Suggest</Button>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
