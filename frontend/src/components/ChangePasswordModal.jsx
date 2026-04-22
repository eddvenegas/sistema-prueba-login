import React, { useEffect, useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { buildApiUrl } from '../config/api';

const ChangePasswordModal = ({
  isOpen,
  onClose,
  mode = 'optional',
  onPasswordChanged,
}) => {
  const esCambioObligatorio = mode === 'required';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if ((!esCambioObligatorio && !currentPassword) || !newPassword || !confirmPassword) {
      setError('Todos los campos son requeridos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    if (!esCambioObligatorio && currentPassword === newPassword) {
      setError('La nueva contrasena no puede ser igual a la actual.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...(esCambioObligatorio ? { isFirstLoginChange: true } : { currentPassword }),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Error al cambiar la contrasena.');
        return;
      }

      const updatedUser = (() => {
        try {
          const rawUser = localStorage.getItem('user');
          if (!rawUser) return null;

          const parsedUser = JSON.parse(rawUser);
          const nextUser = { ...parsedUser, debeCambiarPassword: false };
          localStorage.setItem('user', JSON.stringify(nextUser));
          return nextUser;
        } catch (storageError) {
          console.error('No se pudo actualizar el usuario en localStorage:', storageError);
          return null;
        }
      })();

      setSuccess(
        esCambioObligatorio
          ? 'Contrasena actualizada. Ya puedes continuar al sistema.'
          : 'Contrasena actualizada correctamente.'
      );

      setTimeout(() => {
        onPasswordChanged?.(updatedUser);
        onClose();
      }, 1200);
    } catch (requestError) {
      console.error('Error:', requestError);
      setError('Error conectando con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Lock size={24} />
            <div>
              <h2 className="text-xl font-bold">
                {esCambioObligatorio ? 'Cambio Obligatorio' : 'Cambiar Contrasena'}
              </h2>
              <p className="text-sm text-blue-100">
                {esCambioObligatorio
                  ? 'Debes actualizar tu clave temporal para ingresar.'
                  : 'Actualiza tu contrasena cuando lo necesites.'}
              </p>
            </div>
          </div>
          {!esCambioObligatorio && (
            <button
              onClick={onClose}
              className="hover:bg-blue-700 p-1 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {!esCambioObligatorio && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contrasena Actual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  placeholder="Ingresa tu contrasena actual"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nueva Contrasena
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Minimo 6 caracteres"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar Nueva Contrasena
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Repite la nueva contrasena"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!esCambioObligatorio && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
