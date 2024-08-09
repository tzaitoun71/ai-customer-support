'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, InputBase } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';

interface NavbarProps {
  onChatClick?: () => void;
}

const TopAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
  top: '0px', 
  height: '80px',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#0056A3', 
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer,
  top: '80px', 
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.common.white,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
}));

const Navbar: React.FC<NavbarProps> = ({ onChatClick }) => {
  const router = useRouter();

  return (
    <>
      {/* Top Row */}
      <TopAppBar position="fixed">
        <StyledToolbar>
          {/* Logo */}
          <Box sx={{ position: 'relative', top: '10px', right: '-20px' }}>
            <Typography variant="h6" noWrap>
              <Image
                src="https://www.torontomu.ca/etc.clientlibs/ryecms/static/clientlib-site/resources/images/tmu_logo.svg"
                alt="TMU Logo"
                width={250}
                height={60}
              />
            </Typography>
          </Box>
          
          {/* Buttons on the right side */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button>Info for</Button>
            <Button>Apply</Button>
            <Button>Visit</Button>
            <Button>Give</Button>
            <Button>my.torontomu</Button>
          </Box>
        </StyledToolbar>
      </TopAppBar>

      {/* Main Navigation Row */}
      <StyledAppBar position="fixed">
        <StyledToolbar>
          {/* Navigation Links */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around', 
              width: '100%',
              padding: '0 40px',
            }}
          >
            <Button sx={{ color: '#ffffff', fontSize: '18px' }}>About</Button>
            <Button sx={{ color: '#ffffff', fontSize: '18px' }}>Programs</Button>
            <Button sx={{ color: '#ffffff', fontSize: '18px' }}>Admissions</Button>
            <Button sx={{ color: '#ffffff', fontSize: '18px' }}>Campus Life</Button>
            <Button sx={{ color: '#ffffff', fontSize: '18px' }}>Research & Innovation</Button>
            <Button sx={{ color: '#ffffff', fontSize: '18px' }}>Equity & Community Inclusion</Button>
            <Button sx={{ color: '#ffffff', fontSize: '18px' }} onClick={onChatClick}>
              Chat with Us
            </Button>
          </Box>
        </StyledToolbar>
      </StyledAppBar>
    </>
  );
};

export default Navbar;
