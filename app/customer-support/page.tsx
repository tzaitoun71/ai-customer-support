'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItemText, Typography, ListItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../context/UserContext';

const ChatPage = () => {
  const { user } = useUser(); // Use the authenticated user from context
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ user: string; bot: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!message || !user) return; // Ensure the user is authenticated and message is provided

    const userMessage = { user: message, bot: '' };
    setChatHistory([...chatHistory, userMessage]); // Update chat history in state
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message, userId: user.uid }), // Include userId in the request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessageContent = data.response;
      const botMessage = { user: message, bot: botMessageContent };

      setChatHistory((prevChat) => [...prevChat, botMessage]); // Update chat history in state
      setIsTyping(false);

      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    if (isTyping) {
      typingInterval = setInterval(() => {
        setTypingIndicator((prev) => (prev === '...' ? '' : prev + '.'));
      }, 500);
    }

    return () => clearInterval(typingInterval);
  }, [isTyping]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '700px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '15px', 
        display: 'flex',
        flexDirection: 'column',
        padding: 3,
        flexGrow: 0,
        height: 'calc(100% - 190px)',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        TMU Support Assistant
      </Typography>
      <Box
        ref={chatContainerRef}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: 2,
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
          minHeight: 'auto',
        }}
      >
        <List sx={{ flexGrow: 1 }}>
          {chatHistory.map((chatItem, index) => (
            <ListItem key={index} sx={{ display: 'flex', justifyContent: chatItem.bot ? 'flex-start' : 'flex-end' }}>
              <Box
                component="div"
                sx={{
                  backgroundColor: chatItem.bot ? '#fcf07e' : '#007bff', 
                  color: chatItem.bot ? '#333' : '#fff',
                  borderRadius: '15px',
                  padding: '10px 20px',
                  maxWidth: '60%',
                  textAlign: 'left',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                {chatItem.bot ? (
                  <ReactMarkdown>{chatItem.bot}</ReactMarkdown>
                ) : (
                  <ListItemText primary={chatItem.user} />
                )}
              </Box>
            </ListItem>
          ))}
          {isTyping && (
            <ListItem sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                component="div"
                sx={{
                  backgroundColor: '#fcf07e',
                  borderRadius: '15px',
                  padding: '10px 20px',
                  maxWidth: '60%',
                  textAlign: 'left',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  height: '40px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center', 
                }}
              >
                <ListItemText primary={typingIndicator || '...'} />
              </Box>
            </ListItem>
          )}
        </List>
      </Box>
      <Box sx={{ display: 'flex', marginTop: 2, padding: '0 8px', alignItems: 'center', width: '100%' }}>
        <TextField
          label="Type your message"
          variant="outlined"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          sx={{ 
            marginRight: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
          }}
        />
        <Button 
          variant="contained" 
          sx={{
            marginRight: '16px',
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#0056a3',
            },
            padding: '10px 16px', 
            minWidth: '75px', 
          }}
          onClick={handleSendMessage} 
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatPage;
