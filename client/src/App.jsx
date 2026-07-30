import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CharacterSelect from './components/CharacterSelect/CharacterSelect';
import CreateCharacter from './components/CharacterCreate/CreateCharacter';
import GameScene from './components/Game/GameScene';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const hasCharacter = useSelector((state) => state.character.characters.length > 0);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && hasCharacter ? (
              <Navigate to="/character-select" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/character-select" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/character-select" /> : <Register />}
        />
        <Route
          path="/character-select"
          element={
            <ProtectedRoute>
              <CharacterSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-character"
          element={
            <ProtectedRoute>
              <CreateCharacter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GameScene />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}