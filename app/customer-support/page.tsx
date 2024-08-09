'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  TextField,
  Button,
  List,
  ListItemText,
  Typography,
  Box,
  ListItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { blue, yellow } from '@mui/material/colors';
import ReactMarkdown from 'react-markdown';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Array<{ user: string; bot: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!message) return;

    const userMessage = { user: message, bot: '' };
    setChat([...chat, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message }),
      });

      const data = await response.json();
      const botMessageContent = data.response;
      const botMessage = { user: message, bot: botMessageContent };

      setChat((prevChat) => [...prevChat, botMessage]);
      setIsTyping(false);

      // Scroll to the bottom of the chat container
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error:', error);
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
    // Scroll to the bottom of the chat container when a new message is added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column', // Stack the title and chat box vertically
        padding: 2,
        boxSizing: 'border-box', // Include padding in the width and height calculations
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        TMU Support Assistant
      </Typography>
      <Box
        sx={{
          width: '100%',
          maxWidth: '600px', // Increase the max width for the chat box
          backgroundColor: 'white',
          boxShadow: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          padding: 2,
          marginTop: 2, // Add some space between the title and the chat box
          marginBottom: 2, // Add some space below the chat box
          flexGrow: 0, // Prevent the box from growing too large
        }}
      >
        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: 2,
            backgroundColor: '#fafafa',
            borderRadius: 2,
            boxShadow: 1,
            height: '350px', // Increase the height for the chat container
          }}
        >
          <List sx={{ flexGrow: 1 }}>
            {chat.map((chatItem, index) => (
              <ListItem key={index} sx={{ display: 'flex', justifyContent: chatItem.bot ? 'flex-start' : 'flex-end' }}>
                <Box
                  component="div"
                  sx={{
                    backgroundColor: chatItem.bot ? yellow[100] : blue[100],
                    color: 'black',
                    borderRadius: 2,
                    padding: '10px 15px',
                    maxWidth: '60%',
                    textAlign: 'left',
                    wordBreak: 'break-word',
                    boxShadow: 1,
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
                    backgroundColor: yellow[100],
                    borderRadius: 2,
                    padding: '10px 15px',
                    maxWidth: '60%',
                    textAlign: 'left',
                    wordBreak: 'break-word',
                    boxShadow: 1,
                  }}
                >
                  <ListItemText primary={typingIndicator} />
                </Box>
              </ListItem>
            )}
          </List>
        </Box>
        <Box sx={{ display: 'flex', marginTop: 2, padding: '0 12px', alignItems: 'center', width: '100%' }}>
          <TextField
            label="Type your message"
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            sx={{ marginRight: 1 }} // Adjust the margin to push the "Send" button slightly to the left
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} endIcon={<SendIcon />}>
            Send
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChatPage;
