/*eslint no-unused-vars: */
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Session from './components/Session';
import Settings from './components/Settings';
import SpotifyConnect from './components/SpotifyConnect';
import { AuthProvider } from './firebase/index';
import { PrivateRoute } from './hooks/private';

function App() {
  return (
    <div className="bg-darkGreen font-text">
      <AuthProvider>
        <Router>
          <Routes>
            <Route exact path="/" element={<Navigate replace to="/home" />} />
            <Route
              path="/spotify"
              element={<PrivateRoute component={SpotifyConnect} />}
            />
            <Route
              path="/settings"
              element={<PrivateRoute component={Settings} />}
            />
            <Route path="/login" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/sessions/:sessionId" element={<Session />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
