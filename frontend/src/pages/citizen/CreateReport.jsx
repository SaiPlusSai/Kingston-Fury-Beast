import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, UploadCloud, Check, ChevronRight, ChevronLeft, AlertCircle, Flame, Waves, ShieldAlert, Car, Construction, AlertTriangle, MoreHorizontal, X, Crosshair } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { createReport } from '../../services/reportsApi';
import { getPresignedUrl, uploadFileToS3 } from '../../services/uploadsApi';
import { getApiErrorMessage } from '../../services/api';
import { PRIORITY_TO_API } from '../../utils/reportFormatters';
import AwsLocationMap from '../../components/common/AwsLocationMap';

const CATEGORIES = [
  { value: 'incendio', label: 'Incendio', icon: Flame, animation: { scale: [1, 1.15, 1], rotate: [-3, 3, -3], color: ['#f97316', '#ef4444', '#f97316'] }, color: 'text-orange-500', bgHover: 'hover:border-orange-500 hover:bg-orange-500/10 hover:shadow-orange-500/20' },
  { value: 'inundacion', label: 'Inundación', icon: Waves, animation: { y: [0, -3, 0], x: [-1, 1, -1] }, color: 'text-blue-500', bgHover: 'hover:border-blue-500 hover:bg-blue-500/10 hover:shadow-blue-500/20' },
  { value: 'delito', label: 'Delito / Robo', icon: ShieldAlert, animation: { opacity: [1, 0.6, 1], scale: [1, 1.05, 1] }, color: 'text-red-500', bgHover: 'hover:border-red-500 hover:bg-red-500/10 hover:shadow-red-500/20' },
  { value: 'accidente', label: 'Accidente de Tránsito', icon: Car, animation: { rotate: [-2, 2, -2], y: [0, -2, 0] }, color: 'text-yellow-500', bgHover: 'hover:border-yellow-500 hover:bg-yellow-500/10 hover:shadow-yellow-500/20' },
  { value: 'bloqueo', label: 'Bloqueo Vial', icon: Construction, animation: { scale: [1, 1.08, 1], opacity: [1, 0.8, 1] }, color: 'text-amber-500', bgHover: 'hover:border-amber-500 hover:bg-amber-500/10 hover:shadow-amber-500/20' },
  { value: 'otros', label: 'Otros', icon: MoreHorizontal, animation: { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }, color: 'text-primary', bgHover: 'hover:border-primary hover:bg-primary/10 hover:shadow-primary/20' },
];

const STEPS = [
  { id: 1, title: 'Categoría' },
  { id: 2, title: 'Ubicación' },
  { id: 3, title: 'Detalles' }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

const CreateReport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form state
  const [selectedCat, setSelectedCat] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [gpsActive, setGpsActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: '',
    location: '',
    latitude: -17.7833,
    longitude: -63.1821,
  });

  // Limpieza de URLs de objeto
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setGpsActive(true);
      },
      () => setError('No se pudo obtener tu ubicación. Activa el GPS e intenta de nuevo.'),
      { enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    if (step === 2 && !gpsActive) {
      useMyLocation();
    }
  }, [step]);

  const addFiles = (list) => {
    const incoming = Array.from(list || []).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
    );

    if (incoming.length === 0) return;

    // Limite 5 fotos máximo
    const newFiles = [...files, ...incoming].slice(0, 5);
    setFiles(newFiles);

    // Crear URLs para thumbnails
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newUrls);
  };

  const removeImage = (indexToRemove) => {
    const newFiles = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(newFiles);

    // Cleanup de la URL removida para no tener fugas de memoria
    URL.revokeObjectURL(imagePreviewUrls[indexToRemove]);
    setImagePreviewUrls(newFiles.map(f => URL.createObjectURL(f)));
  };

  const uploadImages = async () => {
    const uploaded = [];

    for (const file of files) {
      const presigned = await getPresignedUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });
      const publicUrl = await uploadFileToS3(file, presigned);
      uploaded.push({ url: publicUrl, key: presigned.key });
    }

    return {
      imageUrl: uploaded[0]?.url || null,
      imageKeys: uploaded.map((item) => item.key).filter(Boolean),
    };
  };

  const nextStep = () => {
    setError('');

    // Validación Paso 1
    if (step === 1) {
      if (!selectedCat) {
        setError('Por favor selecciona el tipo de emergencia.');
        return;
      }
      if (selectedCat === 'otros' && (!customCategory || customCategory.trim().length < 3)) {
        setError('Por favor especifica de qué trata la emergencia.');
        return;
      }
    }

    // Validación Paso 2
    if (step === 2) {
      if (!form.location || form.location.trim().length < 5) {
        setError('Por favor escribe una ubicación o referencia válida (mínimo 5 caracteres).');
        return;
      }
    }

    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!form.title || form.title.trim().length < 5) {
      setError('El título debe tener al menos 5 caracteres');
      return;
    }
    if (!form.description || form.description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }
    if (!form.priority) {
      setError('Selecciona el nivel de urgencia de este reporte');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const media = files.length ? await uploadImages() : { imageUrl: null, imageKeys: [] };

      const finalCategory = selectedCat === 'otros' ? 'otros' : selectedCat;
      const finalDescription = selectedCat === 'otros'
        ? `[Otros: ${customCategory.trim()}] ${form.description.trim()}`
        : form.description.trim();

      await createReport({
        title: form.title.trim(),
        category: finalCategory,
        description: finalDescription,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        location: form.location?.trim() || undefined,
        priority: form.priority ? PRIORITY_TO_API[form.priority] : undefined,
        imageUrl: media.imageUrl || undefined,
        imageKeys: media.imageKeys.length ? media.imageKeys : undefined,
      });

      setShowSuccess(true);
      setTimeout(() => navigate('/reports'), 3500);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-20"
      >
        <div className="surface-card rounded-[2rem] p-12 text-center border border-success/20 shadow-2xl shadow-success/10 relative overflow-hidden bg-card-bg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <Check className="h-12 w-12 text-success" />
          </motion.div>
          <h2 className="text-3xl font-bold text-text-primary font-display mb-3">¡Reporte Enviado!</h2>
          <p className="text-text-secondary text-sm">Tu reporte ha sido registrado con éxito y las autoridades correspondientes han sido notificadas inmediatamente.</p>

          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-success/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center shadow-inner">
            <AlertCircle className="h-6 w-6 text-danger" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-display tracking-tight">Nueva Emergencia</h2>
            <p className="text-sm text-text-muted">Aporta información valiosa y salva vidas</p>
          </div>
        </div>

        {/* Minimalist Progress Pill */}
        <div className="flex bg-secondary-bg/60 border border-border/60 rounded-full p-1.5 shadow-inner backdrop-blur-sm">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${step === s.id
                ? 'bg-primary text-white shadow-md scale-105'
                : step > s.id
                  ? 'text-primary'
                  : 'text-text-muted opacity-60'
                }`}
            >
              {step > s.id ? <Check className="h-4 w-4" /> : <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[10px] ${step === s.id ? 'bg-white/20' : 'bg-black/10'}`}>{s.id}</span>}
              <span className={step === s.id ? 'block' : 'hidden sm:block'}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium shadow-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </motion.div>
      )}

      {/* No usamos 'absolute' aquí para que el div crezca con su contenido */}
      <div className="relative overflow-visible">
        <AnimatePresence mode="wait" custom={direction}>

          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="border-border-light bg-secondary-bg/20 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl">
                <CardHeader className="border-b border-border-light/50 bg-secondary-bg/40">
                  <CardTitle className="text-center text-xl">¿Qué está sucediendo?</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {CATEGORIES.map((cat) => {
                      const IconComponent = cat.icon;
                      const isSelected = selectedCat === cat.value;
                      return (
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          key={cat.value}
                          onClick={() => setSelectedCat(cat.value)}
                          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${isSelected
                            ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(47,93,80,0.15)] ring-1 ring-primary'
                            : `bg-secondary-bg/60 border-border ${cat.bgHover}`
                            }`}
                        >
                          <motion.div
                            animate={isSelected ? cat.animation : { scale: 1, rotate: 0, y: 0, opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className={isSelected ? cat.color : 'text-text-secondary'}
                          >
                            <IconComponent className="h-10 w-10 drop-shadow-md" strokeWidth={1.5} />
                          </motion.div>
                          <span className={`font-bold text-sm tracking-wide ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                            {cat.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedCat === 'otros' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <Input
                          name="customCategory"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Especifica el tipo de emergencia..."
                          label="¿Qué tipo de emergencia es?"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="h-[600px] flex flex-col border-border-light bg-secondary-bg/20 backdrop-blur-md rounded-[2rem] shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border-light/50 bg-secondary-bg/40">
                  <div className="flex justify-between items-center">
                    <CardTitle>¿Dónde es la emergencia?</CardTitle>
                    <Badge variant={gpsActive ? 'success' : 'muted'} className="shadow-sm" dot>{gpsActive ? 'GPS activo' : 'Buscando...'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 pt-4">
                  <Input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    placeholder="Escribe una referencia (ej. Frente al parque autonómico)"
                  />
                  <div className="flex-1 rounded-[1.5rem] overflow-hidden relative border border-border-light shadow-inner">
                    <AwsLocationMap
                      className="absolute inset-0"
                      center={[form.longitude, form.latitude]}
                      zoom={17}
                      markers={[{
                        latitude: Number(form.latitude),
                        longitude: Number(form.longitude),
                        color: '#dc2626',
                      }]}
                      centerOnUserLocation={true}
                      onMapClick={(loc) => setForm((prev) => ({ ...prev, latitude: loc.latitude, longitude: loc.longitude }))}
                    />
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                      <span className="bg-black/70 text-white font-medium text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg pointer-events-none">
                        Toca el mapa para afinar el pin
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 z-20">
                      <Button type="button" variant="primary" size="sm" onClick={useMyLocation} className="shadow-xl shadow-primary/20 backdrop-blur-sm bg-primary/90 hover:bg-primary rounded-full px-4">
                        <Crosshair className="h-4 w-4 mr-2" /> Centrar GPS
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: DETAILS & UPLOAD */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="space-y-6">
                <Card className="border-border-light bg-secondary-bg/20 backdrop-blur-md rounded-[2rem] shadow-xl">
                  <CardHeader className="border-b border-border-light/50 bg-secondary-bg/40">
                    <CardTitle>Detalles Finales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <Input name="title" value={form.title} onChange={handleChange} label="Título corto" placeholder="Ej. Accidente fuerte en la avenida" required />

                    <div>
                      <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide text-[11px]">Descripción de la situación</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="block w-full rounded-xl text-text-primary text-sm bg-secondary-bg/60 border border-border-light placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 py-3 px-4 resize-none transition-shadow hover:bg-secondary-bg"
                        rows={4}
                        placeholder="Describe qué pasó, si hay heridos, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide text-[11px]">Nivel de Urgencia</label>
                      <div className="relative">
                        <select
                          name="priority"
                          value={form.priority}
                          onChange={handleChange}
                          className="block w-full rounded-xl text-text-primary text-sm bg-secondary-bg/60 border border-border-light focus:outline-none focus:ring-2 focus:ring-primary/50 py-3.5 px-4 appearance-none cursor-pointer transition-shadow hover:bg-secondary-bg"
                        >
                          <option value="">Selecciona urgencia...</option>
                          <option value="critica">🔴 Crítica — Riesgo inminente de vida</option>
                          <option value="alta">🟠 Alta — Requiere atención rápida</option>
                          <option value="media">🟡 Media — Importante pero estable</option>
                          <option value="baja">🟢 Baja — Solo informativo</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <ChevronRight className="h-4 w-4 text-text-muted rotate-90" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border-light bg-secondary-bg/20 backdrop-blur-md rounded-[2rem] shadow-xl">
                  <CardContent className="pt-6">
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                      className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center cursor-pointer transition-all duration-300 ${dragging ? 'border-primary bg-primary/10 scale-[1.02] shadow-inner' : 'border-border hover:border-primary/50 hover:bg-secondary-bg/50'
                        }`}
                    >
                      <UploadCloud className={`mx-auto h-8 w-8 mb-2 ${dragging ? 'text-primary' : 'text-text-muted'}`} />
                      <p className="text-sm font-medium text-text-primary">Evidencia Fotográfica (Opcional)</p>
                      <p className="text-xs text-text-muted mt-1">Arrastra fotos aquí o haz clic</p>

                    </div>

                    {/* Image Thumbnails Grid */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <AnimatePresence>
                          {imagePreviewUrls.map((url, idx) => (
                            <motion.div
                              key={url}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="relative rounded-xl overflow-hidden aspect-video bg-black/5 border border-border shadow-sm group"
                            >
                              <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-danger hover:scale-110 transition-all shadow-md"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 flex justify-between items-center pt-6 border-t border-border-light px-2">
        {step > 1 ? (
          <Button type="button" variant="secondary" onClick={prevStep} leftIcon={<ChevronLeft className="h-4 w-4" />} className="rounded-full px-6 shadow-sm">
            Atrás
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')} className="rounded-full px-6">
            Cancelar
          </Button>
        )}

        {step < 3 ? (
          <Button type="button" variant="primary" onClick={nextStep} rightIcon={<ChevronRight className="h-4 w-4" />} className="rounded-full px-8 shadow-lg shadow-primary/20">
            Siguiente
          </Button>
        ) : (
          <Button type="button" variant="danger" size="md" isLoading={isSubmitting} onClick={handleSubmit} rightIcon={<Check className="h-5 w-5" />} className="rounded-full px-8 shadow-lg shadow-danger/20 text-base py-3">
            Enviar Reporte
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateReport;
