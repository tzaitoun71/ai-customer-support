'use client';

import React, { useState } from 'react';
import { Typography, Box } from '@mui/material';
import Navbar from '../components/Navbar'; 
import ChatPage from '../customer-support/page'; 

const LandingPage = () => {
  const [showChat, setShowChat] = useState(false);

  const handleShowChat = () => {
    setShowChat(true);
  };

  return (
    <div>
      <Navbar onChatClick={handleShowChat} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        {!showChat ? (
          <Box
            sx={{
              textAlign: 'center',
              padding: 4,
              boxShadow: 3,
              borderRadius: 2,
              backgroundColor: '#fff',
              width: '100%',
              maxWidth: '600px', 
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome to TMU Support
            </Typography>
            <Typography variant="body1" gutterBottom>
              How can we assist you today? Feel free to explore our site or chat with us directly.
            </Typography>
          </Box>
        ) : (
          <ChatPage />
        )}
      </Box>
    </div>
  );
};

export default LandingPage;
