import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { forgotPassword } from '../../services/authApi';
import { getApiErrorMessage } from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const cleanEmail = email.trim();
      const result = await forgotPassword(cleanEmail);
      setMessage(result?.message || 'Revisa tu correo para continuar.');
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`), 1500);
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
            <h1 className="font-display text-xl font-bold text-text-primary">Recuperar contraseña</h1>
            <p className="text-xs text-text-muted">Te enviaremos un enlace seguro.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-text-primary">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-white/50 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="tu@email.com"
            />
          </div>

          {error && <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl p-3">{error}</div>}
          {message && <div className="text-sm text-success bg-success/10 border border-success/20 rounded-xl p-3">{message}</div>}

          <Button type="submit" className="w-full" isLoading={loading}>Enviar enlace</Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
