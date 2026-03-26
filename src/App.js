import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import DirectorDashboard from './components/DirectorDashboard';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginForm onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div>
      {user.role === 'especialista' ? (
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold">Bienvenido Especialista</h1>
          <p>Aquí verás las carpetas de todos los colegios.</p>
          <button onClick={() => setUser(null)} className="mt-4 text-blue-500 underline">Cerrar Sesión</button>
        </div>
      ) : (
        <DirectorDashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

export default App;