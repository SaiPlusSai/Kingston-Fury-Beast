import React, { useMemo, useState } from 'react';
import { Inbox, Search, Send, MessageSquare, User } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAsyncData } from '../../hooks/useAsyncData';
import { closeSupportMessage, getSupportInbox, replySupportMessage } from '../../services/supportApi';
import { getApiErrorMessage } from '../../services/api';
import toast from 'react-hot-toast';

const statusLabel = {
  open: { label: 'Abierto', variant: 'warning' },
  answered: { label: 'Respondido', variant: 'success' },
  closed: { label: 'Cerrado', variant: 'muted' },
};

const AdminInbox = () => {
  const { data, loading, refetch } = useAsyncData(() => getSupportInbox(), []);
  const messages = Array.isArray(data) ? data : [];
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((item) => {
      if (!term) return true;
      return [item.subject, item.message, item.reporterName, item.reporterEmail, item.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [messages, search]);

  const selected = filtered.find((item) => item.supportMessageId === selectedId) || filtered[0] || null;

  const handleReply = async () => {
    if (!selected || !response.trim()) return;
    setSaving(true);
    try {
      await replySupportMessage(selected.supportMessageId, response.trim());
      setResponse('');
      await refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await closeSupportMessage(selected.supportMessageId);
      await refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-text-primary font-display flex items-center gap-2">
          <Inbox className="h-6 w-6 text-primary" /> Bandeja de soporte
        </h2>
        <p className="text-text-secondary text-sm mt-1">Revisa mensajes de usuarios y responde desde un único lugar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Mensajes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <Input placeholder="Buscar..." leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="flex-1 overflow-auto space-y-2">
              {loading ? (
                <p className="text-sm text-text-muted">Cargando bandeja...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-text-muted">No hay mensajes.</p>
              ) : filtered.map((item) => {
                const badge = statusLabel[item.status] || statusLabel.open;
                return (
                  <button
                    key={item.supportMessageId}
                    onClick={() => setSelectedId(item.supportMessageId)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${selected?.supportMessageId === item.supportMessageId ? 'border-primary bg-primary/5' : 'border-border-light hover:bg-hover'}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-text-primary truncate">{item.subject}</p>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="text-xs text-text-muted truncate">{item.reporterName || 'Ciudadano'}</p>
                    <p className="text-[11px] text-text-muted mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" /> Detalle del mensaje
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm">Selecciona un mensaje para ver el detalle.</div>
            ) : (
              <>
                <div className="p-4 rounded-2xl border border-border-light bg-muted/40 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{selected.subject}</p>
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-1"><User className="h-3.5 w-3.5" /> {selected.reporterName || 'Ciudadano'} · {selected.reporterEmail || 'sin correo'}</p>
                    </div>
                    <Badge variant={(statusLabel[selected.status] || statusLabel.open).variant}>{(statusLabel[selected.status] || statusLabel.open).label}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{selected.message}</p>
                </div>

                <div className="space-y-3 flex-1">
                  <label className="block text-sm font-medium text-text-primary">Respuesta del administrador</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                    className="w-full rounded-2xl border border-border-light bg-secondary-bg/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Escribe una respuesta clara para el ciudadano..."
                  />
                  {selected.response && (
                    <div className="p-4 rounded-2xl bg-success/10 border border-success/20 text-sm text-success">
                      <p className="font-semibold mb-1">Respuesta enviada</p>
                      <p className="whitespace-pre-wrap">{selected.response}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-border-light">
                  <Button variant="ghost" onClick={handleClose} isLoading={saving}>Cerrar hilo</Button>
                  <Button onClick={handleReply} isLoading={saving} rightIcon={<Send className="h-4 w-4" />}>Responder</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminInbox;
