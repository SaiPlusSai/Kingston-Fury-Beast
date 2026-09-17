import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, Activity, Zap, Target, Lock, CheckCircle,
  Users, Building, Plus, Flame, Car, ShieldAlert, Radio, Construction,
  Github, Linkedin
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import Button from '../../components/ui/Button';
import { ButtonColorful } from '../../components/ui/button-colorful';
import { InteractiveSelector } from '../../components/ui/interactive-selector';

// Visual assets
import heroDashboard from '../../images/hero_dashboard.png';
import mobileMockup from '../../images/mobile_mockup.png';
import shield3d from '../../images/shield_3d.png';
import pitbulBinarioLogo from '../../images/pitbul_binario_logo.png';

/* ═══════════════════════════════════════════════════════════════════════════
   PARALLAX FLOATING NOTIFICATION CARD
   Each card lives at a fixed position in the hero and drifts with scroll
   depth to create a layered parallax feel.
   ═══════════════════════════════════════════════════════════════════════════ */
const FloatingBubble = ({
  title,
  reporter,
  icon: Icon,
  delay,
  x,
  y,
  type = 'primary',
  duration = 8,
  depth = 1,
  scrollY,
}) => {
  const palette = {
    danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  }[type];

  const yParallax = useTransform(scrollY, [0, 1000], [0, depth * 100]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -60 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
      className={`absolute hidden lg:block ${x} ${y} z-0 pointer-events-none`}
      style={{ y: yParallax }}
    >
      <motion.div
        animate={{ y: [0, -15, 10, -5, 0], x: [0, 10, -10, 5, 0] }}
        transition={{ repeat: Infinity, duration, ease: 'easeInOut', delay }}
        className={`glass-frosted p-4 pr-6 rounded-3xl border ${palette.border} flex items-center gap-4 bg-white/5 backdrop-blur-[30px] shadow-2xl relative overflow-hidden`}
      >
        <div className={`w-12 h-12 rounded-full ${palette.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${palette.text}`} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-text-primary text-sm lg:text-base leading-tight">
            {title}
          </span>
          <span className="text-xs text-text-muted font-medium mt-0.5">
            Reportado por {reporter}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INTERACTIVE TILT CARD
   Tracks cursor position inside the card and applies subtle 3-D rotation
   via useMotionValue + useTransform.
   ═══════════════════════════════════════════════════════════════════════════ */
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [3, -3]);
  const rotateY = useTransform(x, [-100, 100], [-3, 3]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STAGGER ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 2000], [0, -150]);

  /* -- Spotlight mouse-tracking orb -- */
  const mouseX = useMotionValue(
    typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  );
  const mouseY = useMotionValue(
    typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  );
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const heroYOffset = useTransform(scrollY, [0, 1000], [0, 150]);

  const handleMouseMove = (e) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary-bg overflow-hidden font-sans relative selection:bg-primary/20">
      {/* Global noise texture */}
      <div className="noise-overlay" />

      {/* ================================================================
          1. HERO  --  Glassmorphism + Parallax + Mesh Gradient
          ================================================================ */}
      <section
        className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center px-4 min-h-[90vh] overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Mesh gradient overlay */}
        <div className="mesh-gradient-hero absolute inset-0 opacity-30 pointer-events-none z-0" />

        {/* Spotlight mouse-following orb */}
        <motion.div
          className="absolute w-[400px] h-[400px] md:w-[800px] md:h-[800px] rounded-full blur-[120px] pointer-events-none z-0 opacity-60 mix-blend-multiply"
          style={{
            left: springX,
            top: springY,
            translateX: '-50%',
            translateY: '-50%',
            background:
              'radial-gradient(circle, rgba(76,159,112,0.15) 0%, rgba(76,159,112,0) 70%)',
            y: heroYOffset,
          }}
        />

        {/* Aurora background orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4C9F70]/5 rounded-full blur-[100px] pointer-events-none z-0 aurora-orb-1 mix-blend-multiply" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-[#D6A663]/5 rounded-full blur-[120px] pointer-events-none z-0 aurora-orb-2 mix-blend-multiply" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-[#2F5D50]/5 rounded-full blur-[110px] pointer-events-none z-0 aurora-orb-1 mix-blend-multiply" />

        {/* --- 5 Floating parallax notification cards --- */}
        <FloatingBubble
          title="Incendio en Av. Ormachea"
          reporter="Junta Vecinal Obrajes"
          icon={AlertTriangle}
          delay={0.2}
          x="left-[2%]"
          y="top-[15%]"
          type="danger"
          duration={12}
          depth={-1.5}
          scrollY={scrollY}
        />
        <FloatingBubble
          title="Bloqueo en Plaza Murillo"
          reporter="Sergio Arias"
          icon={Target}
          delay={0.5}
          x="right-[3%]"
          y="top-[25%]"
          type="warning"
          duration={14}
          depth={-0.8}
          scrollY={scrollY}
        />
        <FloatingBubble
          title="Accidente Av. del Poeta"
          reporter="Christian Coronel"
          icon={Activity}
          delay={0.8}
          x="left-[8%]"
          y="bottom-[18%]"
          type="danger"
          duration={10}
          depth={-2.0}
          scrollY={scrollY}
        />
        <FloatingBubble
          title="Robo en San Francisco"
          reporter="Alan Flores"
          icon={ShieldAlert}
          delay={1.1}
          x="right-[5%]"
          y="bottom-[22%]"
          type="primary"
          duration={15}
          depth={-1.2}
          scrollY={scrollY}
        />
        <FloatingBubble
          title="Emergencia Medica"
          reporter="Jean Marco"
          icon={Plus}
          delay={1.4}
          x="right-[28%]"
          y="top-[8%]"
          type="success"
          duration={11}
          depth={-2.5}
          scrollY={scrollY}
        />

        {/* --- Center content --- */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold font-display text-text-primary tracking-tighter leading-[1.05] mb-8">
              La ciudad,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F5D50] via-[#4C9F70] to-[#D6A663]">
                protegida por todos.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium tracking-tight">
              La plataforma definitiva que transforma a los ciudadanos en una
              red de inteligencia colectiva para emergencias en tiempo real.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
              <Link to="/register">
                <ButtonColorful label="Unete a la Red" />
              </Link>
              <Link to="/admin">
                <Button
                  variant="ghost"
                  className="text-primary font-bold hover:bg-primary/5 rounded-full px-6 py-3 border border-border-light shadow-sm bg-white/50 backdrop-blur-sm"
                >
                  Portal de Autoridades →
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex justify-center items-center gap-8 text-sm text-text-muted font-medium tracking-wide">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Sin burocracia
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Privacidad
                total
              </span>
              <span className="flex items-center gap-2 shimmer px-3 py-1 rounded-full bg-success/10 border border-success/20">
                <span className="w-2 h-2 bg-success rounded-full pulse-ring" />
                <span className="text-success font-bold">1,247 activos ahora</span>
              </span>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ================================================================
          1.5 APP PREVIEW  --  Dual Mockup with floating elements
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 shimmer">
              La App
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-text-primary mb-6 tracking-tighter leading-[1.05]">
              Reporta desde
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C9F70] to-[#D6A663]">
                cualquier lugar.
              </span>
            </h2>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-lg">
              Con la app de Halo, enviar un reporte toma menos de 30 segundos. Foto, ubicacion GPS y tipo de incidente. La red hace el resto.
            </p>

            <div className="space-y-4">
              {[
                { icon: Zap, label: 'Reporte en menos de 30 segundos' },
                { icon: Target, label: 'Geolocalizacion GPS automatica' },
                { icon: Shield, label: 'Protección garantizada' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.15, duration: 0.5 }}
                  className="flex items-center gap-4 glass-premium rounded-xl p-4 hover:shadow-lg transition-shadow group cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:rotate-6 transition-all duration-300">
                    <item.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold text-text-primary">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Phone mockup + Shield 3D */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 bg-[#4C9F70]/10 rounded-full blur-[100px] scale-75 pointer-events-none" />

            {/* Phone mockup */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <img
                src={mobileMockup}
                alt="Halo Mobile App"
                className="w-full max-w-[340px] mx-auto drop-shadow-2xl rounded-3xl"
              />
            </motion.div>

            {/* Shield 3D floating behind */}
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              className="absolute -right-8 -top-8 w-48 h-48 lg:w-64 lg:h-64 opacity-60 z-0"
            >
              <img
                src={shield3d}
                alt=""
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          2. THE BOTTLENECK  --  Glass Bento Grid
          ================================================================ */}
      {/* ================================================================
   2. THE BOTTLENECK  --  Glass Bento Grid
   ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: TiltCard with problem statement */}
          <TiltCard className="lg:col-span-5 glass-premium rounded-[2.5rem] p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden hover:shadow-2xl transition-shadow duration-500 cursor-default h-full">
            <div className="relative z-10 flex flex-col h-full">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
                  El Problema
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold font-display text-text-primary mb-6 leading-[1.1] tracking-tight">
                  Conoces la burocracia.
                  <br />
                  Vamos a romperla.
                </h2>
                <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                  Las llamadas al 911 se pierden, los reportes se duplican y las
                  autoridades llegan tarde. Halo unifica la información ciudadana
                  filtrando el ruido mediante validación comunitaria.
                </p>
              </div>
              <div className="mt-auto">
                <Link to="/admin">
                  <Button
                    variant="secondary"
                    className="w-max glass-premium text-primary border border-white/80 shadow-lg hover:shadow-xl hover:bg-white transition-all rounded-xl font-bold hover:scale-105 transform"
                  >
                    Explorar el Portal de Autoridades
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#4C9F70]/10 rounded-full blur-[80px]" />
          </TiltCard>

          {/* Right: 2x2 Stats grid - sin parallax que afecte la altura */}
          <motion.div
            // Eliminamos el parallaxY1 para que no se desplace verticalmente y rompa la alineación
            // style={{ y: parallaxY1 }}  ← COMENTADO
            className="lg:col-span-7 glass-premium rounded-[2.5rem] p-10 lg:p-12 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12 h-full"
          >
            {[
              { value: '15k+', label: 'Ciudadanos activos validando información en tiempo real.' },
              { value: '4.2m', label: 'Tiempo de respuesta promedio mejorado gracias al GPS.' },
              { value: '99%', label: 'Precisión de reportes mediante el sistema de Trust Score.' },
              { value: '24/7', label: 'Monitoreo ininterrumpido sin cajas negras ni desinformación.' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`flex flex-col justify-center group cursor-pointer ${idx < 2 ? 'border-b border-border-light/50 pb-8' : 'pt-8 sm:pt-0'
                  } ${idx % 2 === 0 ? 'sm:border-r border-border-light/50 sm:pr-8' : ''}`}
              >
                <h3 className="text-6xl lg:text-7xl font-bold font-display text-text-primary mb-3 tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500 text-transparent bg-clip-text bg-gradient-to-br from-text-primary to-text-muted">
                  {stat.value}
                </h3>
                <p className="text-text-secondary font-medium leading-relaxed">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          4. HOW HALO TRANSFORMS  --  Staggered Glass Cards
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Split header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-text-primary leading-[1.05] tracking-tighter">
            Como Halo transforma
            <br />
            la seguridad
          </h2>
          <p className="text-text-secondary max-w-md text-lg leading-relaxed">
            Un flujo de trabajo optimizado para garantizar que la informacion
            fluya sin friccion desde el ciudadano hasta los cuerpos de
            emergencia.
          </p>
        </div>

        <div className="relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: AlertTriangle,
                title: 'Reporte Inmediato',
                desc: 'Envia alertas con foto y ubicacion exacta en segundos.',
              },
              {
                icon: Users,
                title: 'Validacion Vecinal',
                desc: 'La comunidad confirma el incidente para evitar falsas alarmas.',
              },
              {
                icon: Zap,
                title: 'Despliegue Rapido',
                desc: 'Las autoridades reciben datos filtrados para actuar al instante.',
              },
              {
                icon: Lock,
                title: 'Resolucion Transparente',
                desc: 'Haz seguimiento del caso hasta su cierre definitivo.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="relative group">
                {/* Desktop horizontal connector */}
                {idx < 3 && (
                  <div className="absolute top-16 left-[calc(100%-1rem)] w-[calc(100%-6rem)] h-1 hidden lg:block z-0 pointer-events-none">
                    <svg className="w-full h-full overflow-visible">
                      <line
                        x1="0"
                        y1="0"
                        x2="100%"
                        y2="0"
                        stroke="rgba(76,159,112,0.15)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <motion.line
                        x1="0"
                        y1="0"
                        x2="100%"
                        y2="0"
                        stroke="#4C9F70"
                        strokeWidth="2"
                        strokeDasharray="30 150"
                        animate={{ strokeDashoffset: [0, -180] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                      />
                    </svg>
                  </div>
                )}

                {/* Mobile vertical connector */}
                {idx < 3 && (
                  <div className="absolute left-16 top-[calc(100%-1.5rem)] w-1 h-12 lg:hidden z-0 pointer-events-none">
                    <svg className="w-full h-full overflow-visible">
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="100%"
                        stroke="rgba(76,159,112,0.15)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <motion.line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="100%"
                        stroke="#4C9F70"
                        strokeWidth="2"
                        strokeDasharray="20 80"
                        animate={{ strokeDashoffset: [0, -100] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      />
                    </svg>
                  </div>
                )}

                {/* Card element */}
                <motion.div
                  variants={staggerItem}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="glass-premium rounded-3xl p-8 hover:shadow-[0_20px_40px_rgba(76,159,112,0.1)] transition-all flex flex-col h-full cursor-default relative z-10 border border-white/40"
                >
                  {/* Step counter badge */}
                  <span className="absolute top-6 right-6 text-sm font-bold font-display text-primary/30 group-hover:text-primary transition-colors">
                    0{idx + 1}
                  </span>

                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-border-light flex items-center justify-center mb-8 group-hover:bg-primary group-hover:rotate-12 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3 font-display tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed flex-grow">
                    {feature.desc}
                  </p>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          5. TEAM SECTION
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-text-primary mb-6 tracking-tighter leading-[1.05]">
              Construido por ciudadanos,
              <br />
              para ciudadanos.
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Nacimos de la frustracion de reportar y no ser escuchados. Nos
              unimos para crear la red de seguridad comunitaria mas moderna y
              transparente.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              name: 'Alan Flores',
              role: 'Fullstack Developer',
              initials: 'AF',
            },
            {
              name: 'Christian Coronel',
              role: 'Backend / DevOps',
              initials: 'CC',
            },
            {
              name: 'Jean Marco',
              role: 'Frontend Architect',
              initials: 'JM',
            },
            {
              name: 'Sergio Arias',
              role: 'UI/UX Designer',
              initials: 'SA',
            },
          ].map((dev, idx) => (
            <motion.div
              key={idx}
              variants={staggerItem}
              whileHover={{ y: -15 }}
              className="glass-premium rounded-[2rem] p-8 hover:shadow-2xl transition-all text-center group cursor-pointer"
            >
              <div className="w-28 h-28 mx-auto rounded-full bg-white shadow-sm border border-white/50 flex items-center justify-center mb-6 group-hover:bg-primary/5 group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                <span className="text-3xl font-bold text-primary font-display">
                  {dev.initials}
                </span>
              </div>
              <h3 className="text-xl font-bold text-text-primary font-display tracking-tight">
                {dev.name}
              </h3>
              <p className="text-sm text-text-secondary mb-6 font-medium">
                {dev.role}
              </p>

              <div className="flex justify-center gap-3">
                <motion.a
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white shadow-sm border border-border-light/50 flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                >
                  <Github className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white shadow-sm border border-border-light/50 flex items-center justify-center text-text-muted hover:text-[#0077b5] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Logo / Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-20 flex flex-col items-center justify-center text-center relative z-10"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#D6A663] mb-3">
            Un proyecto firmado por
          </span>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="w-full max-w-[460px] md:max-w-[540px] transition-transform duration-300 hover:scale-105"
          >
            <img
              src={pitbulBinarioLogo}
              alt="Pitbull Binario Logo"
              className="w-full h-auto object-contain mx-auto mix-blend-multiply"
            />
          </motion.div>

          <p className="mt-6 text-text-secondary font-medium italic text-base md:text-lg max-w-md tracking-tight leading-relaxed">
            "Código implacable, impacto real. Protegiendo comunidades un bit a la vez."
          </p>
        </motion.div>
      </section>

      {/* ================================================================
          6. DARK CTA  --  Animated Gradient Background
          ================================================================ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-animated-gradient rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl cursor-pointer"
        >
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none" />

          {/* Left content */}
          <div className="relative z-10 w-full md:w-1/2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white mb-6 leading-[1.05] tracking-tighter">
              Acelera el tiempo de respuesta. Protege tu entorno.
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              Unete a la plataforma que esta redefiniendo como las ciudades
              manejan las emergencias en tiempo real.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-[#2F5D50] hover:bg-white/90 text-lg px-10 py-6 h-auto rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1"
              >
                Comenzar ahora
              </Button>
            </Link>
          </div>

          {/* Right: Floating mock notification */}
          <div className="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [2, 0, 2] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-sm w-full transition-transform duration-300"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center relative">
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-white shadow-sm" />
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-base">
                    Central de Policia
                  </h4>
                  <p className="text-xs text-text-secondary font-medium">
                    Escribiendo...
                  </p>
                </div>
              </div>
              <p className="text-text-primary font-medium text-lg leading-relaxed">
                "Perfecto, la unidad ha sido despachada al lugar del incidente
                reportado. ETA: 3 mins."
              </p>
              {/* Typing animation dots */}
              <div className="mt-6 flex gap-2">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                  className="h-2 w-12 bg-border-light rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  className="h-2 w-8 bg-primary/30 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ================================================================
          7. INTEGRATIONS / CONNECTIONS WALL
          ================================================================ */}
      <section className="py-24 relative overflow-hidden text-center z-10">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary mb-12 tracking-tight">
          Halo conecta a la ciudad con:
        </h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {[
            { name: 'Policia Nacional', icon: Shield },
            { name: 'Bomberos', icon: Flame },
            { name: 'Ambulancias', icon: Activity },
            { name: 'Juntas Vecinales', icon: Users },
            { name: 'Transito', icon: Car },
            { name: 'Alcaldias', icon: Building },
            { name: 'Defensa Civil', icon: ShieldAlert },
            { name: 'Centros Medicos', icon: Plus },
            { name: 'Radio Patrullas', icon: Radio },
            { name: 'Obras Publicas', icon: Construction },
          ].map((entity, idx) => (
            <motion.div
              key={idx}
              variants={staggerItem}
              whileHover={{
                y: -8,
                scale: 1.05,
                borderColor: '#4C9F70',
                backgroundColor: 'rgba(255,255,255,0.9)',
              }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="glass-premium rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-3 group cursor-pointer"
            >
              <entity.icon className="w-8 h-8 text-text-muted group-hover:text-primary group-hover:rotate-12 transition-all duration-300" />
              <span className="text-xs font-bold text-text-secondary group-hover:text-primary transition-colors">
                {entity.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
