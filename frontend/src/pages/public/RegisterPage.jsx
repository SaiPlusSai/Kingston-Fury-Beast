import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, Phone, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth, getApiErrorMessage } from '../../context/AuthContext';

const GlassInput = ({ icon: Icon, rightIcon, ...props }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-text-muted" />
      </div>
    )}
    <input 
      {...props}
      className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${rightIcon ? 'pr-11' : 'pr-4'} py-3.5 bg-white/50 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted font-medium outline-none shadow-sm`}
    />
    {rightIcon && (
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        {rightIcon}
      </div>
    )}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPwd, setShowPwd] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const user = await register({
        name: form.name, email: form.email, password: form.password, phone: form.phone || undefined,
      });
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Reporta incidentes desde tu teléfono',
    'Recibe alertas de emergencias cercanas',
    'Monitorea el estado de tus reportes',
    'Contribuye a una ciudad más segura',
  ];

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-primary-bg overflow-hidden selection:bg-primary/20 p-4 py-12">
      
      {/* ── IMMERSIVE BACKGROUND ── */}
      <div className="noise-overlay" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#2F5D50]/10 rounded-full blur-[120px] mix-blend-multiply aurora-orb-1" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#D6A663]/15 rounded-full blur-[150px] mix-blend-multiply aurora-orb-2" />
      </div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2.5 group z-50">
        <div className="h-10 w-10 rounded-xl glass-premium flex items-center justify-center transition-all group-hover:scale-105 shadow-md">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-text-primary hidden sm:block">Halo</span>
      </Link>

      {/* ── GLASS CONTAINER ── */}
      <div className="relative z-10 w-full max-w-[1100px] glass-premium rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-4 flex flex-col lg:flex-row shadow-2xl border border-white/60">
        
        {/* Left Side: Branding & Benefits */}
        <div className="lg:w-5/12 p-8 lg:p-12 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 w-max">
            Registro Seguro
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary font-display leading-[1.1] tracking-tighter mb-4">
            Únete a la red<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">de seguridad ciudadana.</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed mb-10">
            Más de 15,000 ciudadanos activos ayudando a construir comunidades más seguras e interconectadas.
          </p>

          <ul className="space-y-5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <div className="h-8 w-8 rounded-full bg-white/60 shadow-sm border border-border-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors">
                  <Check className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="text-text-primary font-medium text-sm group-hover:text-primary-dark transition-colors">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:w-7/12 bg-white/60 backdrop-blur-md rounded-[2rem] p-8 lg:p-12 shadow-inner border border-white/80">
          <h2 className="text-2xl font-bold text-text-primary font-display mb-8">Crear una cuenta</h2>
          
          {error && (
            <div className="mb-6 bg-danger/10 border border-danger/20 rounded-xl p-4 animate-fade-in">
              <p className="text-sm text-danger font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5 ml-1">Nombre Completo</label>
                <GlassInput name="name" value={form.name} onChange={handleChange} required placeholder="Juan Pérez" icon={User} />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5 ml-1">Teléfono (Opcional)</label>
                <GlassInput name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="+591 12345678" icon={Phone} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5 ml-1">Correo Electrónico</label>
              <GlassInput name="email" value={form.email} onChange={handleChange} required type="email" placeholder="tu@email.com" icon={Mail} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5 ml-1">Contraseña</label>
                <GlassInput 
                  name="password" value={form.password} onChange={handleChange} required 
                  type={showPwd ? 'text' : 'password'} placeholder="Mín. 8 caracteres" icon={Lock}
                  rightIcon={
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-text-muted hover:text-primary transition-colors">
                      {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5 ml-1">Confirmar</label>
                <GlassInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required type="password" placeholder="Repetir contraseña" icon={Lock} />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group pt-2">
              <input type="checkbox" required className="rounded border-border bg-white checked:bg-primary checked:border-primary focus:ring-primary/25 mt-1 flex-shrink-0" />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                Acepto los <a href="#" className="text-primary hover:text-primary-dark font-bold">Términos de Servicio</a> y la <a href="#" className="text-primary hover:text-primary-dark font-bold">Política de Privacidad</a>.
              </span>
            </label>

            <div className="pt-4">
              <Button type="submit" className="w-full py-4 text-base rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Crear Cuenta Gratis
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-bold transition-colors">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
