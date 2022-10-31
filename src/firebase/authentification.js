import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './index';

function AuthProvider({ children, ...props }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      const userTmp = JSON.parse(JSON.stringify(user));
      setCurrentUser({ ...currentUser, user: { ...userTmp } });

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signin = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, signup, signin, logout, setCurrentUser }}
      {...props}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

const useAuthState = () => {
  const auth = useContext(AuthContext);

  return {
    ...auth,
    isAuthenticated: !(Object.keys(auth?.currentUser.user).length === 0),
  };
};

const AuthContext = createContext(undefined);

export { AuthProvider, useAuthState, AuthContext };
