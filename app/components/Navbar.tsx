'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { styled } from '@mui/material/styles';
import { useUser } from '../context/UserContext'; // Make sure this path is correct

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
  alignItems: 'center',  // Ensure the items are centered
  padding: '0 20px', // Add some padding to the sides for centering
}));

const Navbar: React.FC<NavbarProps> = ({ onChatClick }) => {
  const router = useRouter();
  const { user, signOut } = useUser(); // Use the signOut function from the context

  const handleSignOut = async () => {
    await signOut(); // Sign the user out
    router.push('/login'); // Redirect to the login page
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '18px' }}>
            <Button>Info for</Button>
            <Button>Apply</Button>
            <Button>Visit</Button>
            <Button>Give</Button>
            <Button>my.torontomu</Button>
            {user && (  // Show the sign-out button only if the user is logged in
              <Button onClick={handleSignOut}>Sign Out</Button>
            )}
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
