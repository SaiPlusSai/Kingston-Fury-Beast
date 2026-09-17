import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { resetPassword } from '../../services/authApi';
import { getApiErrorMessage } from '../../services/api';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const emailFromUrl = params.get('email') || '';
  const tokenFromUrl = params.get('token') || '';
  const [form, setForm] = React.useState({ email: emailFromUrl, token: tokenFromUrl, newPassword: '' });
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await resetPassword(form);
      setMessage(result?.message || 'Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-primary-bg p-4">
      <div className="w-full max-w-md glass-premium rounded-[2rem] p-8 border border-white/60 shadow-2xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver al login
        </Link>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">Restablecer contraseña</h1>
            <p className="text-xs text-text-muted">Ingresa tu correo, el código que recibiste y la nueva contraseña.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-text-primary">Correo electrónico</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-white/50 outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="tu@email.com"
          />

          <label className="block text-sm font-semibold text-text-primary">Código de verificación</label>
          <input
            value={form.token}
            onChange={(e) => setForm((prev) => ({ ...prev, token: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-white/50 outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Código recibido por correo (ej. 123456)"
          />

          <label className="block text-sm font-semibold text-text-primary">Nueva contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
              minLength={8}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-white/50 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Nueva contraseña"
            />
          </div>

          {error && <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl p-3">{error}</div>}
          {message && <div className="text-sm text-success bg-success/10 border border-success/20 rounded-xl p-3">{message}</div>}

          <Button type="submit" className="w-full" isLoading={loading}>Actualizar contraseña</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
