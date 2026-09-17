import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Camera, Eye, EyeOff, Check, AlertCircle, Edit2, ShieldCheck, Star, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { listReports } from '../../services/reportsApi';
import { updateProfile, updatePassword } from '../../services/authApi';
import { getPresignedUrl, uploadFileToS3 } from '../../services/uploadsApi';
import { getApiErrorMessage } from '../../services/api';
import { useAsyncData } from '../../hooks/useAsyncData';
import toast from 'react-hot-toast';

// Medidor de fortaleza de contraseña (desde main)
const calculatePasswordStrength = (password) => {
  let score = 0;
  if (!password) return score;
  if (password.length > 7) score += 1;
  if (password.length > 11) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
};

const getStrengthDetails = (score) => {
  switch (score) {
    case 0: return { label: 'Muy débil', color: 'text-danger', fill: 'bg-danger', width: '20%' };
    case 1: return { label: 'Débil', color: 'text-danger', fill: 'bg-danger', width: '40%' };
    case 2: return { label: 'Aceptable', color: 'text-warning', fill: 'bg-warning', width: '60%' };
    case 3: return { label: 'Buena', color: 'text-success', fill: 'bg-success', width: '80%' };
    case 4: return { label: 'Excelente', color: 'text-primary', fill: 'bg-primary', width: '100%' };
    default: return { label: '', color: '', fill: 'bg-transparent', width: '0%' };
  }
};

const ProfilePage = () => {
  const fileInputRef = useRef(null);
  const { user, updateCurrentUser } = useAuth();
  const { data } = useAsyncData(() => listReports({ limit: 100 }), []);
  const all = Array.isArray(data) ? data : data?.items || data?.data || [];
  const resolved = all.filter((r) => r.status === 'resolved').length;
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'US';

  // Estados desde chriscc (edición inline, avatar, password)
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatarKey: user?.avatarKey || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Visibilidad de contraseñas (desde main)
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfPwd, setShowConfPwd] = useState(false);

  const pwdStrength = calculatePasswordStrength(pwdData.newPassword);
  const strengthDetails = getStrengthDetails(pwdStrength);

  // Subida de avatar (desde chriscc)
  const handleAvatarPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const presigned = await getPresignedUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        purpose: 'profile',
      });
      const avatarUrl = await uploadFileToS3(file, presigned);
      const nextProfile = {
        name: formData.name || user?.name || '',
        phone: formData.phone || user?.phone || '',
        avatarKey: presigned.key,
        avatarUrl,
      };
      const updated = await updateProfile(nextProfile);
      updateCurrentUser(updated);
      setFormData((prev) => ({ ...prev, avatarKey: presigned.key, avatarUrl }));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Guardar cambios de perfil (inline, desde chriscc)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile(formData);
      updateCurrentUser(updated);
      toast.success('Perfil actualizado con éxito');
      setIsEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña (desde main pero integrado)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return toast.error('Las contraseñas nuevas no coinciden');
    }
    setPwdLoading(true);
    try {
      await updatePassword({ currentPassword: pwdData.currentPassword, newPassword: pwdData.newPassword });
      toast.success('Contraseña actualizada con éxito');
      setShowPasswordForm(false);
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setPwdLoading(false);
    }
  };

  const avatarSrc = formData.avatarUrl || user?.avatarUrl || '';

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-0 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna izquierda: avatar, estadísticas y logros (chriscc + estilos main) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2rem] overflow-hidden shadow-xl border-border-light bg-secondary-bg/20 backdrop-blur-md">
            <div className="h-24 bg-gradient-to-r from-primary via-primary-light to-accent"></div>
            <CardContent className="px-6 pb-6 text-center -mt-12">
              <div className="relative inline-block mb-4">
                <div className="h-28 w-28 rounded-[2rem] bg-card-bg border-4 border-card-bg flex items-center justify-center mx-auto shadow-lg relative overflow-hidden">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Foto de perfil" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl font-bold text-primary font-display relative z-10">{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary rounded-full border-4 border-card-bg flex items-center justify-center hover:bg-primary-dark hover:scale-105 transition-all shadow-md group"
                >
                  <Camera className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarPick}
                />
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-[2rem] flex items-center justify-center">
                    <UploadCloud className="h-6 w-6 text-white animate-pulse" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-text-primary font-display mb-1">{user?.name || 'Usuario'}</h3>
              <p className="text-sm text-text-secondary font-medium mb-4">{user?.role === 'admin' ? 'Administrador' : 'Ciudadano'}</p>
              {user?.role !== 'admin' && (
                <>
                  <div className="flex justify-center mb-6">
                    <Badge variant={user?.trustScore >= 80 ? 'success' : user?.trustScore < 20 ? 'danger' : 'accent'} className="shadow-sm py-1.5 px-3">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                      {user?.trustScore >= 80 ? 'Ciudadano Ejemplar' : user?.trustScore < 20 ? 'En Observación' : 'Ciudadano Activo'}
                    </Badge>
                  </div>
                  <div className="space-y-4 pt-5 border-t border-border-light/50 text-left">
                    {[
                      { label: 'Reportes Totales', value: String(all.length) },
                      { label: 'Resueltos', value: String(resolved) },
                      { label: 'Precisión GPS', value: '100%' },
                      { label: 'Confianza', value: `${user?.trustScore || 50} pts` },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary font-medium">{item.label}</span>
                        <span className="font-bold text-text-primary bg-secondary-bg px-2.5 py-1 rounded-lg">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {user?.role !== 'admin' && (
            <Card className="rounded-[2rem] shadow-xl border-border-light bg-secondary-bg/20 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" /> Logros Destacados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {[
                  { icon: '🏅', label: 'Primer Reporte', desc: 'Dando los primeros pasos' },
                  { icon: '⚡', label: 'Reporte Rápido', desc: 'Enviado en menos de 2 min' },
                  { icon: '🎯', label: 'Precisión Perfecta', desc: '+95% de exactitud GPS' },
                ].map((ach, i) => (
                  <div key={i} className="flex items-center gap-4 p-3.5 rounded-2xl bg-secondary-bg/50 border border-border-light hover:border-border hover:shadow-md transition-all duration-300">
                    <div className="h-12 w-12 rounded-xl bg-white/50 flex items-center justify-center text-2xl shadow-sm border border-white/20">
                      {ach.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{ach.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha: información personal (edición inline) + seguridad */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-[2rem] shadow-xl border-border-light bg-secondary-bg/20 backdrop-blur-md">
            <CardHeader className="flex flex-row justify-between items-center border-b border-border-light/50 pb-5">
              <CardTitle>Información Personal</CardTitle>
              {!isEditing && (
                <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} className="rounded-full shadow-lg shadow-primary/20 px-4">
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Nombre Completo"
                    value={isEditing ? formData.name : (user?.name || '')}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    readOnly={!isEditing}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Teléfono"
                    value={isEditing ? formData.phone : (user?.phone || '—')}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    readOnly={!isEditing}
                    leftIcon={<Phone className="h-4 w-4" />}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Correo Electrónico"
                      type="email"
                      defaultValue={user?.email || ''}
                      readOnly
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 flex justify-end gap-3 border-t border-border-light/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          phone: user?.phone || '',
                          avatarKey: user?.avatarKey || '',
                          avatarUrl: user?.avatarUrl || '',
                        });
                      }}
                      className="rounded-full"
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" type="submit" isLoading={loading} className="rounded-full shadow-lg shadow-primary/20">
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] shadow-xl border-border-light bg-secondary-bg/20 backdrop-blur-md">
            <CardHeader className="border-b border-border-light/50 pb-5">
              <CardTitle>Seguridad de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <AnimatePresence mode="wait">
                {!showPasswordForm ? (
                  <motion.div
                    key="pwd-summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-secondary-bg/40 border border-border-light hover:border-border transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-text-primary">Contraseña</p>
                        <p className="text-xs mt-0.5 text-text-muted">Protege el acceso a tu cuenta usando una contraseña segura</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)} className="rounded-full w-full sm:w-auto">
                      Cambiar Contraseña
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="pwd-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handlePasswordSubmit}
                    className="space-y-5 p-6 rounded-[1.5rem] bg-secondary-bg/40 border border-border-light shadow-inner overflow-hidden"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-text-primary mb-1">Actualizar Contraseña</h4>
                      <p className="text-xs text-text-muted mb-4">Ingresa tu contraseña actual y la nueva que deseas usar.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Contraseña actual con toggle */}
                      <div className="relative">
                        <Input
                          label="Contraseña Actual"
                          type={showCurrentPwd ? "text" : "password"}
                          required
                          value={pwdData.currentPassword}
                          onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                          className="absolute right-4 top-9 text-text-muted hover:text-text-primary transition-colors"
                        >
                          {showCurrentPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Nueva contraseña con medidor de fortaleza */}
                      <div className="relative">
                        <Input
                          label="Nueva Contraseña"
                          type={showNewPwd ? "text" : "password"}
                          required
                          value={pwdData.newPassword}
                          onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-4 top-9 text-text-muted hover:text-text-primary transition-colors"
                        >
                          {showNewPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        {pwdData.newPassword.length > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Fortaleza</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${strengthDetails.color}`}>
                                {strengthDetails.label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-border-light rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${strengthDetails.fill}`}
                                initial={{ width: 0 }}
                                animate={{ width: strengthDetails.width }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirmar contraseña con toggle */}
                      <div className="relative">
                        <Input
                          label="Confirmar Nueva Contraseña"
                          type={showConfPwd ? "text" : "password"}
                          required
                          value={pwdData.confirmPassword}
                          onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfPwd(!showConfPwd)}
                          className="absolute right-4 top-9 text-text-muted hover:text-text-primary transition-colors"
                        >
                          {showConfPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-light/50">
                      <Button variant="ghost" size="sm" type="button" onClick={() => setShowPasswordForm(false)} className="rounded-full">
                        Cancelar
                      </Button>
                      <Button size="sm" type="submit" isLoading={pwdLoading} className="rounded-full shadow-lg shadow-primary/20">
                        Guardar Contraseña
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Sesiones Activas */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-secondary-bg/40 border border-border-light">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-text-primary">Sesiones Activas</p>
                    <p className="text-xs mt-0.5 text-text-muted">Gestiona los dispositivos conectados a tu cuenta</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="xs" 
                    className="rounded-full" 
                    onClick={() => {
                      if(window.confirm('¿Estás seguro de cerrar todas las otras sesiones?')) {
                         toast.success('Sesiones cerradas correctamente. Los demás dispositivos han sido desconectados.');
                      }
                    }}
                  >
                    Cerrar otras sesiones
                  </Button>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card-bg rounded-xl border border-border-light">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">Este dispositivo (Actual)</p>
                    <p className="text-xs text-text-muted truncate">{navigator.userAgent.split(' ')[0]} en {navigator.platform}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;