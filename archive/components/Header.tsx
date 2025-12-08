/**
 * Header Component
 * Displays app title, navigation, and user menu
 */

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await signOut();
    navigate('/signin');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} role="banner">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="Open navigation menu"
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            display: { sm: 'none' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'common.white',
              outlineOffset: '2px',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box
              component="img"
              src="/ethosai-logo.png"
              alt="EthosAI - Emphasizing Ethical AI Principles"
              onError={(e: any) => {
                console.error('Logo failed to load');
                e.target.style.display = 'none';
              }}
              sx={{
                height: 45,
                display: { xs: 'none', sm: 'block' },
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                opacity: 0.7,
                fontStyle: 'italic',
                fontSize: '0.7rem',
                mt: 0.5,
              }}
            >
              Emphasizing Ethical AI Principles
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          role="navigation"
          aria-label="User menu"
        >
          <Typography
            variant="body2"
            sx={{ display: { xs: 'none', sm: 'block' } }}
            aria-label="Current user"
          >
            {user?.username || 'User'}
          </Typography>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              size="large"
              aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
              onClick={toggleTheme}
              color="inherit"
              sx={{
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'common.white',
                  outlineOffset: '2px',
                },
              }}
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
          <IconButton
            size="large"
            aria-label="Open user account menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl)}
            onClick={handleMenuOpen}
            color="inherit"
            sx={{
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'common.white',
                outlineOffset: '2px',
              },
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'user-menu-button',
              role: 'menu',
            }}
          >
            <MenuItem disabled role="none">
              <Typography variant="body2">{user?.username}</Typography>
            </MenuItem>
            <MenuItem onClick={handleSignOut} role="menuitem">
              <Logout fontSize="small" sx={{ mr: 1 }} aria-hidden="true" />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
