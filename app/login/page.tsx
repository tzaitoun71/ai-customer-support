'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Button, CircularProgress, Box, Card, CardContent, CardActions } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../Firebase';
import { useUser } from '../context/UserContext';
import GoogleIcon from '@mui/icons-material/Google';

const provider = new GoogleAuthProvider();

const LoginPage: React.FC = () => {
  const { user, setUser, signOut } = useUser();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error signing in with Google:', error.message);
      } else {
        console.error('Unknown error signing in with Google:', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/customer-support');
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        overflow: 'hidden', // Prevent scrolling
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400, padding: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom textAlign="center">
              Toronto Metropolitan University
            </Typography>
            <Typography variant="h6" gutterBottom textAlign="center">
              Customer Support
            </Typography>
            <Box textAlign="center" marginTop={2}>
              {user ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    Welcome, {user.displayName}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    You are logged in as {user.email}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" gutterBottom>
                  Please sign in to continue.
                </Typography>
              )}
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            {user ? (
              <Button variant="contained" color="secondary" onClick={signOut}>
                Logout
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleLogin}
                startIcon={<GoogleIcon />} // Add Google icon
                sx={{
                  backgroundColor: '#0056A3', // Use the shade of blue for the button
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#004494',
                  },
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                }}
              >
                Login with Google
              </Button>
            )}
          </CardActions>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
