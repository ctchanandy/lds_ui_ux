import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Split from 'react-split';
import MinimizeIcon from '@mui/icons-material/Minimize';
import HeightIcon from '@mui/icons-material/Height';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import Divider from '@mui/material/Divider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const STORAGE_KEY = 'right-panel-sizes';
const MIN_PERCENT = 10; // minimum 10% for each pane

export default function RightPanel() {
  const containerRef = React.useRef(null);

  const initial = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [50, 50];
  }, []);

  const [sizes, setSizes] = React.useState(initial);
  const [minPx, setMinPx] = React.useState(40);
  const HEADER_PX = 48; // header height hint (not used for button min/max calculation here)
  const [headerPct, setHeaderPct] = React.useState(() => Math.round((HEADER_PX / 300) * 100));
  const LAST_KEY = `${STORAGE_KEY}-last`;
  const [topCollapsed, setTopCollapsed] = React.useState(false);
  const [bottomCollapsed, setBottomCollapsed] = React.useState(false);
  const originalMinRef = React.useRef(null);

  // compute pixel minSize from container height (10%)
  React.useEffect(() => {
    function computeMin() {
      const el = containerRef.current;
      if (!el) return;
      const h = el.getBoundingClientRect().height || 0;
      const min = Math.max(8, Math.floor((MIN_PERCENT / 100) * h));
      setMinPx(min);
      const pct = Math.round((HEADER_PX / h) * 100);
      setHeaderPct(pct);
    }
    computeMin();
    window.addEventListener('resize', computeMin);
    return () => window.removeEventListener('resize', computeMin);
  }, []);

  // persist helper + enforce minima and normalize to sum 100
  const setAndPersist = (nextSizes) => {
    let [a, b] = nextSizes.map((n) => Number(n));
    a = Math.max(MIN_PERCENT, Math.round(a));
    b = Math.max(MIN_PERCENT, Math.round(b));
    // normalize so they sum to 100
    const total = a + b;
    if (total !== 100) {
      a = Math.round((a / total) * 100);
      b = 100 - a;
      // ensure minima after rounding
      if (a < MIN_PERCENT) { a = MIN_PERCENT; b = 100 - a; }
      if (b < MIN_PERCENT) { b = MIN_PERCENT; a = 100 - b; }
    }
    const normalized = [a, b];
    setSizes(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      try { window.dispatchEvent(new CustomEvent('panel-sizes-changed', { detail: { rightPanel: normalized, topCollapsed, bottomCollapsed } })); } catch (e) { }
      // debug logs removed
    } catch (e) { }
  };

  const persistRaw = (arr) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      try { window.dispatchEvent(new CustomEvent('panel-sizes-changed', { detail: { rightPanel: arr, topCollapsed, bottomCollapsed } })); } catch (e) { }
    } catch (e) { }
  };

  // Handlers: minimize/maximize/reset
  const minimizeTop = () => {
    // save last sizes
    try { localStorage.setItem(LAST_KEY, JSON.stringify(sizes)); } catch (e) { }
    // lower minPx if needed so Split allows header-sized pane
    if (originalMinRef.current == null) originalMinRef.current = minPx;
    setMinPx(Math.min(minPx, HEADER_PX));
    setTopCollapsed(true);
    setBottomCollapsed(false);
    const pct = headerPct;
    const next = [pct, 100 - pct];
    setAndPersist(next);
    try { window.dispatchEvent(new CustomEvent('gutter-recompute')); } catch (e) { }
  };

  const maximizeTop = () => {
    try { localStorage.setItem(LAST_KEY, JSON.stringify(sizes)); } catch (e) { }
    if (originalMinRef.current == null) originalMinRef.current = minPx;
    setMinPx(Math.min(minPx, HEADER_PX));
    setTopCollapsed(false);
    setBottomCollapsed(true);
    const pct = headerPct;
    const next = [100 - pct, pct];
    setAndPersist(next);
    try { window.dispatchEvent(new CustomEvent('gutter-recompute')); } catch (e) { }
  };

  const minimizeBottom = () => {
    try { localStorage.setItem(LAST_KEY, JSON.stringify(sizes)); } catch (e) { }
    if (originalMinRef.current == null) originalMinRef.current = minPx;
    setMinPx(Math.min(minPx, HEADER_PX));
    setBottomCollapsed(true);
    setTopCollapsed(false);
    const pct = headerPct;
    const next = [100 - pct, pct];
    setAndPersist(next);
    try { window.dispatchEvent(new CustomEvent('gutter-recompute')); } catch (e) { }
  };

  const maximizeBottom = () => {
    try { localStorage.setItem(LAST_KEY, JSON.stringify(sizes)); } catch (e) { }
    if (originalMinRef.current == null) originalMinRef.current = minPx;
    setMinPx(Math.min(minPx, HEADER_PX));
    setBottomCollapsed(false);
    setTopCollapsed(true);
    const pct = headerPct;
    const next = [pct, 100 - pct];
    setAndPersist(next);
    try { window.dispatchEvent(new CustomEvent('gutter-recompute')); } catch (e) { }
  };

  const restoreFromLast = () => {
    try {
      const raw = localStorage.getItem(LAST_KEY);
      const restored = raw ? JSON.parse(raw) : [50, 50];
      setTopCollapsed(false);
      setBottomCollapsed(false);
      // restore minPx if we changed it
      if (originalMinRef.current != null) {
        setMinPx(originalMinRef.current);
        originalMinRef.current = null;
      }
      setAndPersist(restored);
      try { window.dispatchEvent(new CustomEvent('gutter-recompute')); } catch (e) { }
    } catch (e) { }
  };

  const resetSizes = () => {
    const next = [50, 50];
    setTopCollapsed(false);
    setBottomCollapsed(false);
    if (originalMinRef.current != null) {
      setMinPx(originalMinRef.current);
      originalMinRef.current = null;
    }
    setAndPersist(next);
  };

  const onDragEnd = (newSizes) => {
    if (!newSizes || !newSizes.length) return;
    setAndPersist(newSizes);
  };

  // Chat state for the chatbot pane
  const [messages, setMessages] = React.useState(() => (
    [
      { id: 1, who: 'bot', text: 'Hi — I can help you think through intended learning outcomes. What should learners be able to do after this course?' },
      { id: 2, who: 'user', text: 'They should be able to design a lesson that aligns outcomes to assessments.' },
      { id: 3, who: 'bot', text: 'Great. That suggests outcomes focusing on design skills and assessment alignment. Consider phrasing them as observable behaviors (e.g., "Create an assessment plan that aligns with stated learning outcomes").' }
    ]
  ));

  const nextId = React.useRef(4);

  const appendMessage = (who, text) => {
    const id = nextId.current++;
    setMessages((m) => [...m, { id, who, text }]);
    // scroll to bottom after small delay
    setTimeout(() => {
      const el = document.getElementById('chat-history');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  // simple bot simulator
  const simulateBotReply = (userText) => {
    setTimeout(() => {
      const reply = `That sounds good. You might also break that into 2–3 measurable outcomes, such as: 1) Identify alignment between goals and assessments; 2) Construct assessment tasks that measure stated outcomes.`;
      appendMessage('bot', reply);
    }, 700);
  };

  // --- Pie chart data (precompute before JSX to keep render simple) ---
  const groups = [
    { name: 'Directed Learning', color: '#1976d2', items: ['Receiving & Interpreting Information', 'Practice', 'Test / Assessment'] },
    { name: 'Exploratory Learning', color: '#2e7d32', items: ['Information Exploration', 'Explorations through Conversation', 'Tangible / Immersive Investigation'] },
    { name: 'Productive Learning', color: '#fb8c00', items: ['Construction: Conceptual / Visual Artefacts', 'Construction: Tangible / Manipulable Artefacts', 'Presentation, Performance and Illustration'] },
    { name: 'Reflective Learning', color: '#7b1fa2', items: ['Reflection', 'Revision', 'Self- / Peer- assessment'] }
  ];
  const values = [8, 12, 10, 7, 9, 6, 11, 10, 8, 9, 6, 4];
  const totalRaw = values.reduce((a, b) => a + b, 0);
  const normalized = values.map((v) => (v / totalRaw) * 100);

  // shade helper
  const shade = (base, idx) => {
    const map = {
      '#1976d2': ['#63a4ff', '#1976d2', '#115293'],
      '#2e7d32': ['#66bb6a', '#2e7d32', '#1b5e20'],
      '#fb8c00': ['#ffd180', '#fb8c00', '#c66900'],
      '#7b1fa2': ['#b37dd6', '#7b1fa2', '#4a0072']
    };
    return map[base][idx] || base;
  };

  // flatten items with colors
  const items = [];
  groups.forEach((g, gi) => {
    g.items.forEach((label, i) => items.push({ label, group: g.name, color: shade(g.color, i) }));
  });

  // compute slices
  let angleStart = 0;
  const radius = 80;
  const slices = normalized.map((pct, i) => {
    const angle = (pct / 100) * 360;
    const start = (Math.PI / 180) * angleStart;
    const end = (Math.PI / 180) * (angleStart + angle);
    const x1 = Math.cos(start) * radius;
    const y1 = Math.sin(start) * radius;
    const x2 = Math.cos(end) * radius;
    const y2 = Math.sin(end) * radius;
    const large = angle > 180 ? 1 : 0;
    const path = `M 0 0 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    angleStart += angle;
    return { path, color: items[i].color, label: items[i].label, pct: Math.round(pct) };
  });

  // helpers to determine current status (allow 1% tolerance)
  const tol = 1; // tolerance in percent
  // consider collapsed flags as authoritative 'min' or 'max' states
  const isTopMin = topCollapsed || sizes[0] <= headerPct + tol;
  const isTopMax = bottomCollapsed || sizes[0] >= 100 - headerPct - tol;
  const isBottomMin = bottomCollapsed || sizes[1] <= headerPct + tol;
  const isBottomMax = topCollapsed || sizes[1] >= 100 - headerPct - tol;
  // reset is only disabled when both panes are near 50/50 and no pane is collapsed
  const isReset = !topCollapsed && !bottomCollapsed && Math.abs(sizes[0] - 50) <= tol && Math.abs(sizes[1] - 50) <= tol;

  // listen for global reset-all-panels event from the header
  React.useEffect(() => {
    function onGlobalReset() {
      resetSizes();
      // also clear any saved LAST_KEY for right-panel
      try { localStorage.removeItem(LAST_KEY); } catch (e) { }
    }
    window.addEventListener('reset-all-panels', onGlobalReset);
    return () => window.removeEventListener('reset-all-panels', onGlobalReset);
  }, [/* no deps - resetSizes uses stable refs/state setters */]);

  return (
    <Box ref={containerRef} sx={{ height: '100%', position: 'relative' }}>
      <Split
        sizes={sizes}
        minSize={[minPx, minPx]}
        direction="vertical"
        gutterSize={10}
        gutterAlign="center"
        snapOffset={6}
        cursor="row-resize"
        onDragEnd={onDragEnd}
        style={{ height: '100%' }}
      >
        {/* Top: Information Window */}
        <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden', p: 0 }}>
          <Paper elevation={1} sx={{ p: 0, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: `${HEADER_PX}px`, px: 1 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>Information Window</Typography>
              <Box sx={{ flex: 1 }} />
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Tooltip title="Minimize top (maximize bottom)">
                  <span>
                    <IconButton size="small" onClick={minimizeTop} disabled={isTopMin}>
                      <MinimizeIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Maximize top (minimize bottom)">
                  <span>
                    <IconButton size="small" onClick={maximizeTop} disabled={isTopMax}>
                      <HeightIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Reset to 50/50">
                  <span>
                    <IconButton size="small" onClick={resetSizes} disabled={isReset}>
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            {/* divider under header (show only when content visible) */}
            {!topCollapsed && <Divider />}

            {/* content */}
            <Box sx={{ p: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              {!topCollapsed && (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Task Type Distribution</Typography>
                  </Box>
                  <Box sx={{ width: 200, height: 200, flex: '0 0 200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={items.map((it, idx) => ({ name: it.label, value: values[idx], fill: it.color }))} dataKey="value" innerRadius={40} outerRadius={84} paddingAngle={2}>
                          {items.map((it, idx) => (
                            <Cell key={`c-${idx}`} fill={it.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box sx={{ width: '100%', maxWidth: 360 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                      {items.map((it, idx) => (
                        <Box key={it.label} sx={{ display: 'flex', gap: 1, alignItems: 'center', py: 0.25 }}>
                          <Box sx={{ width: 14, height: 10, bgcolor: it.color, borderRadius: 0.5, flex: '0 0 auto' }} />
                          <Typography variant="caption" sx={{ lineHeight: 1.05, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</Typography>
                          <Box sx={{ flex: 1 }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', flex: '0 0 auto' }}>{Math.round(normalized[idx])}%</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Bottom: Chat / Learning Design Facilitator */}
        <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden', p: 0 }}>
          <Paper elevation={1} sx={{ p: 0, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: `${HEADER_PX}px`, px: 1 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>Learning Design Facilitator</Typography>
              <Box sx={{ flex: 1 }} />
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Tooltip title="Minimize bottom (maximize top)">
                  <span>
                    <IconButton size="small" onClick={minimizeBottom} disabled={isBottomMin}>
                      <MinimizeIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Maximize bottom (minimize top)">
                  <span>
                    <IconButton size="small" onClick={maximizeBottom} disabled={isBottomMax}>
                      <HeightIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Reset to 50/50">
                  <span>
                    <IconButton size="small" onClick={resetSizes} disabled={isReset}>
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            <>
              {!bottomCollapsed && (
                <>
                  <Divider />
                  <Box id="chat-history" sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {messages.map((m) => (
                      <Box key={m.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', justifyContent: m.who === 'bot' ? 'flex-start' : 'flex-end' }}>
                        {m.who === 'bot' && <Avatar sx={{ width: 28, height: 28 }}>LF</Avatar>}
                        <Box sx={{ maxWidth: '76%', bgcolor: m.who === 'bot' ? 'grey.100' : 'primary.main', color: m.who === 'bot' ? 'text.primary' : 'primary.contrastText', px: 1.25, py: 0.6, borderRadius: 1.5, boxShadow: 1 }}>
                          <Typography variant="body2">{m.text}</Typography>
                        </Box>
                        {m.who === 'user' && <Avatar sx={{ width: 28, height: 28 }}>{/* you */}</Avatar>}
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ p: 1 }}>
                    <Box component="form" sx={{ display: 'flex', gap: 1 }} onSubmit={(e) => { e.preventDefault(); const input = document.getElementById('chat-input'); if (!input) return; const text = input.value.trim(); if (!text) return; appendMessage('user', text); input.value = ''; simulateBotReply(text); }}>
                      <TextField id="chat-input" size="small" placeholder="Type a message about learning outcomes..." fullWidth />
                      <Button variant="contained" color="primary" endIcon={<SendIcon />} type="submit">
                        Send
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </>
          </Paper>
        </Box>
      </Split>
    </Box>
  );
}
