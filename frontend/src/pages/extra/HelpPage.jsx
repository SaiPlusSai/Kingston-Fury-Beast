import React, { useState, useRef } from 'react';
import { HelpCircle, MessageCircle, FileText, Phone, ChevronDown, ChevronRight, Search, CheckCircle, ShieldAlert, Flame, Stethoscope } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createSupportMessage } from '../../services/supportApi';
import { getApiErrorMessage } from '../../services/api';
import toast from 'react-hot-toast';

const faqsData = [
  { id: '1', q: '¿Cómo reporto un incidente?', a: 'Ve a "Nuevo Reporte", selecciona la categoría del incidente, completa la descripción y activa tu GPS para compartir la ubicación exacta. El reporte se publicará en el Radar Ciudadano para ser verificado por la comunidad.' },
  { id: '2', q: '¿Qué significa que un reporte esté "Verificado"?', a: 'Un reporte es "Verificado" cuando alcanza al menos 3 votos positivos de otros ciudadanos de confianza en la plataforma. Una vez verificado, las autoridades correspondientes son despachadas inmediatamente.' },
  { id: '3', q: '¿Cómo funcionan los puntos de confianza?', a: 'Cada vez que creas un reporte que resulta ser verídico o cuando apoyas un reporte válido, ganas puntos de confianza. Los usuarios con alta confianza tienen mayor peso en las validaciones, mientras que los reportes falsos restan puntos.' },
  { id: '4', q: '¿Cuánto tarda la respuesta de las autoridades?', a: 'El tiempo promedio de respuesta es de 14 minutos. Los incidentes que han sido verificados por la comunidad reciben prioridad absoluta en el tablero administrativo.' },
  { id: '5', q: '¿Puedo subir fotos al reportar?', a: 'Sí, puedes subir hasta 5 imágenes en formatos PNG, JPG o WEBP. Las evidencias fotográficas aceleran significativamente la validación comunitaria.' },
  { id: '6', q: '¿La aplicación funciona sin internet?', a: 'Actualmente la plataforma requiere conexión a internet para sincronizar en tiempo real el mapa y los reportes, sin embargo, estamos trabajando en un modo offline.' },
  { id: '7', q: '¿Puedo reportar de forma anónima?', a: 'Actualmente, por motivos de seguridad y para evitar reportes falsos masivos, tu cuenta está vinculada a tus reportes. Sin embargo, tu nombre no es visible para todos los ciudadanos por defecto, solo tu "Confianza" y reputación.' },
  { id: '8', q: '¿Qué hago si me equivoqué de ubicación en un reporte?', a: 'Por ahora, las ubicaciones de los incidentes son inmutables una vez enviados. Si cometiste un error grave, te sugerimos ir a "Mis Reportes", cancelar el reporte erróneo y crear uno nuevo en la ubicación correcta.' },
  { id: '9', q: '¿Qué son las Alertas de Zonas Cercanas?', a: 'Es una función en tu Configuración que, si la activas, te enviará notificaciones inmediatas si se reporta y verifica un incidente a menos de 5 km de tu ubicación GPS actual.' },
  { id: '10', q: '¿Por qué desapareció mi reporte del mapa?', a: 'Si un reporte es marcado como falso o resuelto por un administrador, se oculta del mapa público (Radar Ciudadano) para no causar pánico o desinformación. Aún podrás verlo en tu historial personal.' },
  { id: '11', q: '¿Cómo recupero mi contraseña?', a: 'En la pantalla de Inicio de Sesión, presiona "Olvidé mi contraseña". Te enviaremos un correo con un enlace seguro para restablecerla. Asegúrate de revisar tu bandeja de Spam.' }
];

const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const supportRef = useRef(null);

  const filteredFaqs = faqsData.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);

    createSupportMessage({ subject: subject.trim(), message: message.trim() })
      .then(() => {
        toast.success('Mensaje enviado. El equipo de soporte técnico revisará tu consulta. Te contactaremos en breve.');
        setSubject('');
        setMessage('');
        setIsSubmitting(false);
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err));
        setIsSubmitting(false);
      });
  };

  const scrollToSupport = () => {
    supportRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-display">Centro de Ayuda</h2>
          <p className="text-text-secondary text-sm mt-1">Encuentra respuestas o contacta con nuestro equipo.</p>
        </div>

        <Input
          placeholder="Busca tu pregunta aquí..."
          leftIcon={<Search className="h-4 w-4" />}
          className="py-3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: FileText, label: 'Documentación', desc: 'Guías y tutoriales', color: 'text-primary', bg: 'bg-primary/8 border-primary/15', action: () => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { icon: Phone, label: 'Líneas de Emergencia', desc: 'Bomberos, Policía, Amb.', color: 'text-danger', bg: 'bg-danger/8 border-danger/15', action: () => setShowEmergencyModal(true) },
            { icon: MessageCircle, label: 'Soporte Técnico', desc: 'Respuesta en 24h', color: 'text-accent-dark', bg: 'bg-accent/8 border-accent/15', action: scrollToSupport },
          ].map((item, i) => (
            <Card key={i} hover className={`border cursor-pointer transition-all ${item.bg.split(' ')[1]}`} onClick={item.action}>
              <CardContent className="p-5 text-center">
                <div className={`h-12 w-12 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3 border`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-text-primary text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card id="faq-section" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 text-primary" />
              Preguntas Frecuentes
              {searchQuery && <span className="text-xs font-normal text-text-muted ml-auto">{filteredFaqs.length} resultados</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                No encontramos preguntas que coincidan con tu búsqueda.
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div key={faq.id} className="border-b last:border-b-0 border-border-light">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-hover transition-colors"
                  >
                    <span className="text-sm font-semibold text-text-primary">{faq.q}</span>
                    {openFaq === faq.id
                      ? <ChevronDown className="h-4 w-4 text-primary flex-shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-text-muted flex-shrink-0" />
                    }
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-5 pb-5 animate-fade-in">
                      <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div ref={supportRef} className="scroll-mt-24">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <MessageCircle className="h-5 w-5 text-accent-dark" />
                Contactar a Soporte Técnico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSupportSubmit}>
                <Input
                  label="Asunto"
                  placeholder="Ej: No puedo subir imágenes al reporte"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Mensaje</label>
                  <textarea
                    className="block w-full rounded-xl text-text-primary text-sm bg-transparent border border-border placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 hover:border-border-strong transition-all py-2.5 px-4 resize-none shadow-sm"
                    rows={4}
                    placeholder="Describe tu problema con el mayor detalle posible..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => { setSubject(''); setMessage('') }}>Limpiar</Button>
                  <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={!isSubmitting ? <CheckCircle className="h-4 w-4" /> : null}>
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setShowEmergencyModal(false)}></div>
          <Card className="w-full max-w-sm relative z-10 animate-slide-in-left">
            <CardHeader className="bg-danger/10 border-b border-danger/20 rounded-t-xl pb-4">
              <CardTitle className="flex items-center gap-2 text-danger">
                <Phone className="h-5 w-5" />
                Líneas de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <p className="text-sm text-text-secondary leading-relaxed">
                Si te encuentras en una situación de peligro inminente, toca cualquier número para llamar de inmediato:
              </p>

              <div className="space-y-3">
                <a href="tel:110" className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">Policía</p>
                      <p className="text-xs text-text-muted">Radio Patrullas</p>
                    </div>
                  </div>
                  <span className="text-xl font-display font-bold text-[#3b82f6]">110</span>
                </a>

                <a href="tel:119" className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-danger hover:bg-danger/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-danger/10 text-danger rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">Bomberos</p>
                      <p className="text-xs text-text-muted">Incendios y rescate</p>
                    </div>
                  </div>
                  <span className="text-xl font-display font-bold text-danger">119</span>
                </a>

                <a href="tel:165" className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-success hover:bg-success/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-success/10 text-success rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">Ambulancias</p>
                      <p className="text-xs text-text-muted">Emergencias médicas</p>
                    </div>
                  </div>
                  <span className="text-xl font-display font-bold text-success">165</span>
                </a>
              </div>

              <Button className="w-full mt-2" variant="outline" onClick={() => setShowEmergencyModal(false)}>
                Entendido, cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default HelpPage;
