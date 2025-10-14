import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function Header({ onOpenLeftNav, leftAlwaysVisible, setLeftAlwaysVisible, isTabletOrSmaller }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);

  const THREE_DEFAULT = [20, 60, 20];
  const RIGHT_DEFAULT = [50, 50];

  // compute disabled state from localStorage initially
  React.useEffect(() => {
    try {
      const threeRaw = localStorage.getItem('three-col-sizes');
      const rpRaw = localStorage.getItem('right-panel-sizes');
      const three = threeRaw ? JSON.parse(threeRaw) : THREE_DEFAULT;
      const rp = rpRaw ? JSON.parse(rpRaw) : RIGHT_DEFAULT;
      const threeIsDefault = Array.isArray(three) && three.length === 3 && Math.abs(three[0] - THREE_DEFAULT[0]) <= 1 && Math.abs(three[1] - THREE_DEFAULT[1]) <= 1 && Math.abs(three[2] - THREE_DEFAULT[2]) <= 1;
      const rpIsDefault = Array.isArray(rp) && rp.length === 2 && Math.abs(rp[0] - RIGHT_DEFAULT[0]) <= 1 && Math.abs(rp[1] - RIGHT_DEFAULT[1]) <= 1;
      setDisabled(threeIsDefault && rpIsDefault);
    } catch (e) { }
  }, []);

  // listen for changes and update disabled state reactively
  React.useEffect(() => {
    function onChange(e) {
      try {
        // if event provides details, prefer them to avoid racing with localStorage
        const detail = e && e.detail ? e.detail : null;
        let three = null;
        let rp = null;
        let topCollapsed = false;
        let bottomCollapsed = false;
        if (detail && detail.threeCol) {
          three = detail.threeCol;
        } else {
          const threeRaw = localStorage.getItem('three-col-sizes');
          three = threeRaw ? JSON.parse(threeRaw) : THREE_DEFAULT;
        }
        if (detail && detail.rightPanel) {
          rp = detail.rightPanel;
          if (typeof detail.topCollapsed === 'boolean') topCollapsed = detail.topCollapsed;
          if (typeof detail.bottomCollapsed === 'boolean') bottomCollapsed = detail.bottomCollapsed;
        } else {
          const rpRaw = localStorage.getItem('right-panel-sizes');
          rp = rpRaw ? JSON.parse(rpRaw) : RIGHT_DEFAULT;
        }

        const threeIsDefault = Array.isArray(three) && three.length === 3 && Math.abs(three[0] - THREE_DEFAULT[0]) <= 1 && Math.abs(three[1] - THREE_DEFAULT[1]) <= 1 && Math.abs(three[2] - THREE_DEFAULT[2]) <= 1;
        const rpIsDefault = Array.isArray(rp) && rp.length === 2 && Math.abs(rp[0] - RIGHT_DEFAULT[0]) <= 1 && Math.abs(rp[1] - RIGHT_DEFAULT[1]) <= 1 && !topCollapsed && !bottomCollapsed;
        setDisabled(threeIsDefault && rpIsDefault);
      } catch (err) { }
    }
    window.addEventListener('panel-sizes-changed', onChange);
    window.addEventListener('reset-all-panels', onChange);
    return () => {
      window.removeEventListener('panel-sizes-changed', onChange);
      window.removeEventListener('reset-all-panels', onChange);
    };
  }, []);

  const handleOpen = () => setConfirmOpen(true);
  const handleClose = () => setConfirmOpen(false);

  const handleConfirm = () => {
    // dispatch a global event that listeners (App, RightPanel) will respond to
    try {
      window.dispatchEvent(new CustomEvent('reset-all-panels'));
    } catch (e) { }
    setConfirmOpen(false);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* hamburger for small screens - App will pass onOpenLeftNav; visible via sx */}
          {onOpenLeftNav && isTabletOrSmaller && (
            <IconButton color="inherit" aria-label="open navigation" onClick={onOpenLeftNav} sx={{ mr: 1 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </IconButton>
          )}

          {/* small toggle to allow user to show/hide left nav on tablet */}
          {typeof setLeftAlwaysVisible === 'function' && isTabletOrSmaller && (
            <Tooltip title={leftAlwaysVisible ? 'Hide left navigation' : 'Show left navigation'}>
              <IconButton color="inherit" onClick={() => setLeftAlwaysVisible(!leftAlwaysVisible)} sx={{ mr: 1 }}>
                {leftAlwaysVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LDS Mock
          </Typography>
          <Button color="inherit" onClick={handleOpen} disabled={disabled}>Reset all panels</Button>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      <Dialog open={confirmOpen} onClose={handleClose} aria-labelledby="reset-dialog-title">
        <DialogTitle id="reset-dialog-title">Reset all panels</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reset the three-column widths and the right-panel vertical split to their default sizes. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} color="error" autoFocus>Reset</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
