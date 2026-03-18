import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { MOCK_USERS } from '../data/users';

const LoginForm = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.id === userId && u.password === password);

    if (user) {
      onLoginSuccess(user); // Pasamos los datos del usuario logueado
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        {/* Logo simulado */}
        <div className="bg-gray-200 w-20 h-12 mx-auto mb-6 flex items-center justify-center rounded">
           <span className="text-xs text-gray-500 font-bold uppercase text-center">Logo UGEL</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Sistema de Gestión Financiera Educativa
        </h1>
        <p className="text-gray-500 mb-8">Bienvenido. Por favor, inicie sesión.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuario */}
          <div className="text-left">
            <label className="text-sm font-semibold text-gray-700 block mb-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 size={20}" />
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors"
                placeholder="Correo institucional o DNI"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="text-left relative">
            <label className="text-sm font-semibold text-gray-700 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 size={20}" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-12 outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95"
          >
            Iniciar Sesión
          </button>
        </form>

        <button type="button" className="text-blue-600 text-sm block mt-6 hover:underline w-full text-center">
        ¿Olvidó su contraseña?
        </button>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-400 text-[10px] uppercase tracking-wider">
            Acceso exclusivo para personal autorizado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;