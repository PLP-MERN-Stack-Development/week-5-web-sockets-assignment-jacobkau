// App.jsx
import { useContext } from 'react';
import { AuthContext } from './context/auth-context';
import { useSocket } from './socket/socket';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';

function App() {
  const auth = useContext(AuthContext);
  const socketData = useSocket(); // <- useSocket directly here

  return (
    <div className="min-h-screen bg-gray-100">
      {auth?.isAuthenticated ? (
        <ChatPage socketData={socketData} />
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App;
