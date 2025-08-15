import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Chat from './pages/chat';
import ProtectedRoute from './component/Protecteor';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
