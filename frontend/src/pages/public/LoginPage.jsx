import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth, getApiErrorMessage } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [showPwd, setShowPwd] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ email: '', password: '' });

  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const loggedUser = await login(form);
      const from = location.state?.from?.pathname;
      if (from && from !== '/login') navigate(from, { replace: true });
      else navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-primary-bg overflow-hidden selection:bg-primary/20 p-4">
      
      {/* ── IMMERSIVE BACKGROUND ── */}
      <div className="noise-overlay" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#4C9F70]/15 rounded-full blur-[120px] mix-blend-multiply aurora-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#D6A663]/15 rounded-full blur-[150px] mix-blend-multiply aurora-orb-2" />
      </div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2.5 group z-50">
        <div className="h-10 w-10 rounded-xl glass-premium flex items-center justify-center transition-all group-hover:scale-105 shadow-md">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-text-primary hidden sm:block">Halo</span>
      </Link>

      {/* ── GLASS CONTAINER ── */}
      <div className="relative z-10 w-full max-w-[1000px] glass-premium rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-4 flex flex-col lg:flex-row shadow-2xl border border-white/60">
        
        {/* Left Side: Text / Branding */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 w-max">
            Portal de Acceso
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary font-display leading-[1.1] tracking-tighter mb-4">
            Bienvenido de nuevo a<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">tu ciudad.</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            Ingresa a tu cuenta para continuar reportando incidentes y validando la seguridad de tu entorno.
          </p>
          
          <div className="flex gap-6 border-t border-black/5 pt-6 mt-auto">
            <div>
              <p className="text-2xl font-bold text-text-primary font-display">15k+</p>
              <p className="text-xs text-text-secondary font-medium">Usuarios activos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary font-display">99%</p>
              <p className="text-xs text-text-secondary font-medium">Precisión de datos</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:w-1/2 bg-white/60 backdrop-blur-md rounded-[2rem] p-8 lg:p-12 shadow-inner border border-white/80">
          <h2 className="text-2xl font-bold text-text-primary font-display mb-8">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-6 bg-danger/10 border border-danger/20 rounded-xl p-4 animate-fade-in">
              <p className="text-sm text-danger font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5 ml-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  name="email" value={form.email} onChange={handleChange} required type="email" placeholder="tu@email.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted font-medium outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-sm font-bold text-text-primary">Contraseña</label>
                <Link to="/forgot-password" className="text-primary hover:text-primary-dark transition-colors text-xs font-bold">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  name="password" value={form.password} onChange={handleChange} required type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-white/50 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted font-medium outline-none shadow-sm"
                />
                <button 
                  type="button" onClick={() => setShowPwd(!showPwd)} 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-primary transition-colors"
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full py-4 text-base rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Ingresar a Halo
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary font-medium">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark font-bold transition-colors">Regístrate gratis</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
