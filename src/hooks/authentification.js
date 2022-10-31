import { useContext } from 'react';
import { AuthContext } from '../firebase';

export const useAuth = () => {
  const {
    currentUser: { user },
    logout,
  } = useContext(AuthContext);
  return { user, logout };
};
