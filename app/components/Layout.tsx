import React from 'react';
import Navbar from './Navbar';
import { Container } from '@mui/material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;
