import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import DirectorDashboard from './components/DirectorDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (!user) {
    return <LoginForm onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div>
      {user.rol === 'especialista' ? (
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold">Bienvenido Especialista</h1>
          <p>Aqui veras las carpetas de todos los colegios.</p>
          <button onClick={handleLogout} className="mt-4 text-blue-500 underline">
            Cerrar Sesion
          </button>
        </div>
      ) : (
        <DirectorDashboard
          user={user}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}

export default App;
