'use client';

import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import Navbar from '../components/Navbar'; 
import ChatPage from '../customer-support/page'; 

const LandingPage = () => {
  // State to control whether the chat is visible
  const [showChat, setShowChat] = useState(false);

  // Function to handle when the user clicks "Chat with Us"
  const handleShowChat = () => {
    setShowChat(true);
  };

  return (
    <div>
      {/* Navbar Component */}
      <Navbar onChatClick={handleShowChat} />

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        {!showChat ? (
          // Show the landing page content if chat is not active
          <Box
            sx={{
              textAlign: 'center',
              padding: 4,
              boxShadow: 3,
              borderRadius: 2,
              backgroundColor: '#fff',
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
          // Show the chat interface if the user clicked "Chat with Us"
          <ChatPage />
        )}
      </Container>
    </div>
  );
};

export default LandingPage;
