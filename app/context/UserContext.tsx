'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../Firebase';
import { useRouter } from 'next/navigation';

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Add setUser to the interface
  signOut: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        router.push('/login'); // Redirect to sign-in page if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signOut = async () => {
    if (user) {
      try {
        // Send request to clear chat history for the user
        await fetch('/api/query', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.uid }),
        });
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }

    await auth.signOut();
    setUser(null);
    window.location.reload(); // Force page reload to clear lingering state
  };

  return (
    <UserContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
