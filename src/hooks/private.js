import { useAuthState } from '../firebase/index';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
  const state = useAuthState();

  return state.isAuthenticated ? (
    <RouteComponent {...rest} />
  ) : (
    <Navigate to="/login" />
  );
};
