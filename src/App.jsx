import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Split from 'react-split';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Header from './components/Header';
import LeftNav from './components/LeftNav';
import MainContent from './components/MainContent';
import RightPanel from './components/RightPanel';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light'
  }
});

const STORAGE_KEY = 'three-col-sizes';

export default function App() {
  // read persisted sizes or default [20,60,20]
  const initial = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [20, 60, 20];
  }, []);

  const [minSizesPx, setMinSizesPx] = React.useState([100, 300, 100]);

  // compute pixel min sizes from container width so we can enforce percentage minima
  React.useEffect(() => {
    function computeMin() {
      const container = document.getElementById('three-col-container');
      if (!container) return;
      const total = container.getBoundingClientRect().width;
      const minLeft = Math.floor((10 / 100) * total);
      const minMiddle = Math.floor((40 / 100) * total);
      const minRight = Math.floor((10 / 100) * total);
      setMinSizesPx([minLeft, minMiddle, minRight]);
    }
    computeMin();
    window.addEventListener('resize', computeMin);
    return () => window.removeEventListener('resize', computeMin);
  }, []);

  // compute gutter position for the right gutter (between middle and right panes)
  // compute sizes in pixels for initial render (react-split accepts percentages as strings too)
  const sizesForSplit = React.useMemo(() => {
    const [l, m, r] = initial;
    return [Number(l), Number(m), Number(r)];
  }, [initial]);

  // controlled sizes state so we can programmatically collapse/expand the right pane
  const [sizes, setSizes] = React.useState(sizesForSplit);
  const lastSizesKey = `${STORAGE_KEY}-last`;

  const theme = useTheme();
  // treat <= 1180px as tablet/smaller (wider breakpoint for iPad Air etc.)
  const isTabletOrSmaller = useMediaQuery('(max-width:1180px)');
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const [leftAlwaysVisible, setLeftAlwaysVisible] = React.useState(false);
  const [pinHintVisible, setPinHintVisible] = React.useState(false);
  const prevThreeRef = React.useRef(sizesForSplit);
  const [twoPaneSizes, setTwoPaneSizes] = React.useState(() => {
    const [l, m, r] = sizesForSplit;
    const total = m + r || 1;
    return [Math.round((m / total) * 100), Math.round((r / total) * 100)];
  });

  const persistThreeCol = (next) => {
    try {
      setSizes(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // if we're showing only middle/right (tablet with nav hidden), keep twoPaneSizes in sync
      try {
        if (isTabletOrSmaller && !leftAlwaysVisible) {
          const m = Number(next[1] || 0);
          const r = Number(next[2] || 0);
          const total = m + r || 1;
          const mPct = Math.round((m / total) * 100);
          const rPct = 100 - mPct;
          setTwoPaneSizes([mPct, rPct]);
        }
      } catch (e) { }
      try { window.dispatchEvent(new CustomEvent('panel-sizes-changed', { detail: { threeCol: next } })); } catch (e) { }
    } catch (e) { }
  };

  // collapsed when right pane is effectively zero
  const collapsed = React.useMemo(() => sizes && sizes[2] <= 1, [sizes]);

  const toggleCollapse = () => {
    try {
      if (!collapsed) {
        // save current sizes then collapse right pane
        localStorage.setItem(lastSizesKey, JSON.stringify(sizes));
        if (isTabletOrSmaller && !leftAlwaysVisible) {
          // two-pane mode (left hidden) -> set middle to 100% and right to 0%
          const next = [0, 100, 0];
          setTwoPaneSizes([100, 0]);
          persistThreeCol(next);
          // recompute gutter so the expand pill moves immediately
          requestAnimationFrame(() => computeGutterFromSizes([100, 0]));
        } else {
          const left = Math.max(10, Math.round(sizes[0]));
          const middle = 100 - left; // give remaining to middle
          const next = [left, middle, 0];
          persistThreeCol(next);
          requestAnimationFrame(() => computeGutterFromSizes(next));
        }
      } else {
        // restore from lastSizesKey or default
        const raw = localStorage.getItem(lastSizesKey);
        let restored = null;
        if (raw) restored = JSON.parse(raw);
        if (!restored) restored = [20, 60, 20];
        if (isTabletOrSmaller && !leftAlwaysVisible) {
          // map restored to twoPaneSizes (middle/right)
          const m = Number(restored[1] || 50);
          const r = Number(restored[2] || 50);
          const total = m + r || 1;
          const mPct = Math.round((m / total) * 100);
          const rPct = 100 - mPct;
          setTwoPaneSizes([mPct, rPct]);
          requestAnimationFrame(() => computeGutterFromSizes([mPct, rPct]));
        }
        persistThreeCol(restored);
        requestAnimationFrame(() => computeGutterFromSizes(restored));
      }
    } catch (e) { }
  };

  // when viewport changes, map 3-pane sizes <-> 2-pane sizes and preserve previous three-pane sizes
  React.useEffect(() => {
    if (isTabletOrSmaller) {
      // store previous three-col sizes so we can restore when returning to wide
      prevThreeRef.current = sizes;
      const [l, m, r] = sizes;
      const total = m + r || 1;
      const mPct = Math.round((m / total) * 100);
      const rPct = 100 - mPct;
      setTwoPaneSizes([mPct, rPct]);
      // If the left nav should be hidden on tablet, persist a three-col
      // representation with the left pane at 0 so the Split renders it as
      // collapsed and the Drawer can be used for navigation.
      try {
        if (!leftAlwaysVisible) {
          persistThreeCol([0, mPct, rPct]);
        }
      } catch (e) { }
      // show the pin hint the first time the user goes to tablet size
      try {
        const seen = localStorage.getItem('leftNavPinHintSeen');
        if (!seen) {
          setPinHintVisible(true);
          localStorage.setItem('leftNavPinHintSeen', '1');
          setTimeout(() => setPinHintVisible(false), 6000);
        }
      } catch (e) { }
    } else {
      // restore previous three-col sizes if we have them
      if (prevThreeRef.current) {
        persistThreeCol(prevThreeRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabletOrSmaller]);

  // When the user toggles the left nav pin (leftAlwaysVisible) while on tablet sizes,
  // convert sizes between two-pane and three-pane so the left pane doesn't remain at 0%.
  React.useEffect(() => {
    if (!isTabletOrSmaller) return;
    try {
      if (leftAlwaysVisible) {
        // user wants the left nav visible inline. If current sizes have left ~= 0,
        // build a sensible three-pane layout using a default left width and twoPaneSizes.
        if (sizes && sizes.length === 3 && Number(sizes[0]) <= 1) {
          const left = 20; // reasonable default
          const [mPct, rPct] = twoPaneSizes;
          const total = 100 - left;
          let middle = Math.max(40, Math.round((Number(mPct) / 100) * total));
          let right = 100 - left - middle;
          // ensure minima
          if (middle < 40) { middle = 40; right = 100 - left - middle; }
          if (right < 10) { right = 10; middle = 100 - left - right; }
          persistThreeCol([left, middle, right]);
        }
      } else {
        // left nav is being hidden -> ensure three-col is represented as two-pane sizes
        // by persisting [0, middle, right] derived from current twoPaneSizes
        const [mPct, rPct] = twoPaneSizes;
        persistThreeCol([0, Number(mPct), Number(rPct)]);
      }
    } catch (e) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftAlwaysVisible, isTabletOrSmaller]);

  const [gutterX, setGutterX] = React.useState(null);
  const rafRef = React.useRef(null);

  const computeGutterFromSizes = (sizesArr) => {
    const container = document.getElementById('three-col-container');
    if (!container) return;

    // Try to find the actual gutter element rendered by react-split inside our container.
    // Retry over a few animation frames in case the DOM hasn't been laid out yet.
    let attempts = 0;
    const tryFind = () => {
      attempts += 1;
      try {
        const gutters = container.querySelectorAll('.gutter');
        let gutterEl = null;
        if (gutters && gutters.length) {
          if (sizesArr && sizesArr.length === 3 && gutters.length > 1) gutterEl = gutters[1];
          else gutterEl = gutters[0];
        }
        if (gutterEl) {
          const gres = gutterEl.getBoundingClientRect();
          setGutterX(Math.round(gres.left + gres.width / 2));
          return;
        }
      } catch (e) { /* ignore */ }

      if (attempts < 5) {
        requestAnimationFrame(tryFind);
        return;
      }

      // Fallback to percentage-based calculation if gutter element not found after retries
      try {
        const rect = container.getBoundingClientRect();
        const total = rect.width;
        let gutterPos = Math.round(total / 2);
        if (sizesArr && sizesArr.length === 3) {
          const leftPx = (sizesArr[0] / 100) * total;
          const middlePx = (sizesArr[1] / 100) * total;
          gutterPos = Math.round(leftPx + middlePx);
        } else if (sizesArr && sizesArr.length === 2) {
          const middlePx = (sizesArr[0] / 100) * total;
          gutterPos = Math.round(middlePx);
        }
        setGutterX(gutterPos + rect.left);
      } catch (e) { /* ignore */ }
    };

    tryFind();
  };

  React.useEffect(() => {
    // choose the appropriate sizes array depending on whether the left nav is hidden
    const sizesForGutter = (isTabletOrSmaller && !leftAlwaysVisible) ? twoPaneSizes : sizes;
    // initial compute and on resize
    computeGutterFromSizes(sizesForGutter);
    function onResize() {
      computeGutterFromSizes(sizesForGutter);
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sizes, twoPaneSizes, isTabletOrSmaller, leftAlwaysVisible]);

  const handleDrag = (s) => {
    const nums = s.map(Number);
    // If we're in two-pane mode (left nav hidden on tablet) the split gives 2 numbers
    if (isTabletOrSmaller && !leftAlwaysVisible && nums.length === 2) {
      // keep a normalized three-element sizes array so other logic (collapse, gutter) works
      const three = [0, nums[0], nums[1]];
      setTwoPaneSizes(nums);
      setSizes(three);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => computeGutterFromSizes(three));
      return;
    }

    // update sizes immediately
    setSizes(nums);
    // schedule gutter position update on next animation frame for smooth follow
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => computeGutterFromSizes(nums));
  };

  const onDragEnd = (sizes) => {
    // react-split passes sizes as percentages (numbers that sum roughly to 100)
    if (!sizes || !sizes.length) return;
    const [leftPercent, middlePercent, rightPercent] = sizes.map((s) => Number(s));
    // enforce minima
    const minLeft = 10;
    const minMiddle = 40;
    const minRight = 10;
    let left = Math.max(minLeft, leftPercent);
    let right = Math.max(minRight, rightPercent);
    let middle = 100 - left - right;
    if (middle < minMiddle) {
      // if middle too small, adjust right to satisfy
      middle = minMiddle;
      // distribute remaining space between left and right proportionally
      const remaining = 100 - middle;
      const leftRatio = leftPercent / (leftPercent + rightPercent || 1);
      left = Math.max(minLeft, Math.round(remaining * leftRatio));
      right = Math.max(minRight, Math.round(remaining - left));
    }
    try {
      const next = [left, middle, right];
      persistThreeCol(next);
    } catch (e) { }
  };

  // Listen for a global reset event dispatched by the Header
  React.useEffect(() => {
    function onResetAll() {
      try {
        const defaults = [20, 60, 20];
        if (isTabletOrSmaller && !leftAlwaysVisible) {
          // left is hidden: give the left's default width to the middle so the
          // two-pane layout becomes [middle = left+middle, right = right]
          const left = Number(defaults[0] || 0);
          const middle = Number(defaults[1] || 0) + left;
          const right = Number(defaults[2] || 0);
          const next = [0, middle, right];
          persistThreeCol(next);
          // also sync twoPaneSizes so the two-pane split updates immediately
          const total = middle + right || 1;
          const mPct = Math.round((middle / total) * 100);
          const rPct = 100 - mPct;
          setTwoPaneSizes([mPct, rPct]);
          requestAnimationFrame(() => computeGutterFromSizes([mPct, rPct]));
        } else {
          persistThreeCol(defaults);
          requestAnimationFrame(() => computeGutterFromSizes(defaults));
        }
        // also clear any saved last-sizes for the three-col layout
        try { localStorage.removeItem(lastSizesKey); } catch (e) { }
      } catch (e) { }
    }
    window.addEventListener('reset-all-panels', onResetAll);
    return () => window.removeEventListener('reset-all-panels', onResetAll);
  }, [isTabletOrSmaller, leftAlwaysVisible]);

  // allow children to request an immediate gutter recompute (e.g., after RightPanel collapse)
  React.useEffect(() => {
    function onRecompute() {
      const sizesForGutter = (isTabletOrSmaller && !leftAlwaysVisible) ? twoPaneSizes : sizes;
      computeGutterFromSizes(sizesForGutter);
    }
    window.addEventListener('gutter-recompute', onRecompute);
    return () => window.removeEventListener('gutter-recompute', onRecompute);
  }, [sizes, twoPaneSizes, isTabletOrSmaller, leftAlwaysVisible]);

  // selection state for the left navigation -> main content
  const [selectedSection, setSelectedSection] = React.useState('Course Information');

  // Inline collapse control rendered inside the middle pane to reliably sit at the
  // middle/right boundary regardless of global layout changes.
  const CollapseControl = ({ collapsedFlag }) => (
    <Box sx={{ position: 'absolute', top: 12, right: collapsedFlag ? -80 : -20, zIndex: 1400, pointerEvents: 'auto' }}>
      <Tooltip title={collapsedFlag ? 'Expand right panel' : 'Collapse right panel'}>
        {collapsedFlag ? (
          <Box
            onClick={toggleCollapse}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 0.75,
              minWidth: 56,
              borderRadius: 2,
              boxShadow: 3,
              cursor: 'pointer',
              // ensure the pill can receive clicks even if it overflows
              pointerEvents: 'auto'
            }}
            aria-label="expand right"
          >
            <ChevronLeftIcon sx={{ fontSize: 22 }} />
            <Box component="span" sx={{ ml: 0.75, fontSize: '0.95rem', fontWeight: 600 }}>Expand</Box>
          </Box>
        ) : (
          <IconButton size="medium" onClick={toggleCollapse} color="primary" aria-label="collapse right" sx={{ zIndex: 1400, p: 1 }}>
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Tooltip>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header
        onOpenLeftNav={() => setLeftDrawerOpen(true)}
        leftAlwaysVisible={leftAlwaysVisible}
        setLeftAlwaysVisible={setLeftAlwaysVisible}
        isTabletOrSmaller={isTabletOrSmaller}
      />

      <Box id="three-col-container" sx={{ height: 'calc(100vh - 64px)' }}>
        {/* Drawer for small screens (only used when leftAlwaysVisible is false) */}
        <Drawer anchor="left" open={leftDrawerOpen && !leftAlwaysVisible} onClose={() => setLeftDrawerOpen(false)} ModalProps={{ keepMounted: true }}>
          <Box sx={{ width: 300, p: 0 }} role="presentation">
            <LeftNav selected={selectedSection} onSelect={(s) => { setSelectedSection(s); setLeftDrawerOpen(false); }} leftAlwaysVisible={leftAlwaysVisible} setLeftAlwaysVisible={setLeftAlwaysVisible} isTabletOrSmaller={isTabletOrSmaller} showPinHint={pinHintVisible} />
          </Box>
        </Drawer>

        {/* Always render a three-pane Split. In two-pane/tablet mode the left pane
            will be sized to 0 so the Drawer handles navigation; this ensures the
            middle/right gutter DOM is always present and prevents it from
            disappearing when switching responsive modes. */}
        <Split
          sizes={sizes}
          // compute min sizes for the Split. When on tablet and the left nav
          // should be hidden, allow the left pane to be 0 so it can collapse.
          minSize={(isTabletOrSmaller && !leftAlwaysVisible) ? [0, minSizesPx[1], minSizesPx[2]] : (collapsed ? [minSizesPx[0], minSizesPx[1], 0] : minSizesPx)}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={6}
          direction="horizontal"
          cursor="col-resize"
          onDragEnd={onDragEnd}
          onDrag={handleDrag}
          style={{ display: 'flex', height: '100%' }}
        >
          <Box sx={{ overflow: 'auto' }}>
            <LeftNav selected={selectedSection} onSelect={setSelectedSection} leftAlwaysVisible={leftAlwaysVisible} setLeftAlwaysVisible={setLeftAlwaysVisible} isTabletOrSmaller={isTabletOrSmaller} showPinHint={pinHintVisible} />
          </Box>

          <Box sx={{ position: 'relative', overflow: 'visible' }}>
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <MainContent selectedSection={selectedSection} />
            </Box>
            <CollapseControl collapsedFlag={collapsed} />
          </Box>

          <Box sx={{ overflow: 'auto' }}>
            <RightPanel />
          </Box>
        </Split>
        {/* collapse control is rendered inside the middle pane for reliability */}

        {/* For two-pane collapsed mode on tablet (left hidden), render a fixed
            expand pill so the user can always restore the right panel even if
            the middle pane is scrolled or the control would otherwise be out
            of view. */}
        {isTabletOrSmaller && !leftAlwaysVisible && collapsed && (
          <Box sx={{ position: 'fixed', top: 76, right: 18, zIndex: 1600 }}>
            <Tooltip title="Expand right panel">
              <Box
                onClick={toggleCollapse}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  px: 2,
                  py: 0.75,
                  minWidth: 56,
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: 'pointer'
                }}
                aria-label="expand right"
              >
                <ChevronLeftIcon sx={{ fontSize: 20 }} />
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
