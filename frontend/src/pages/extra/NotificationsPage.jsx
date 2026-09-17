import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationsApi';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getApiErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/reportFormatters';

const iconByType = {
  alert: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/8 border-danger/15' },
  update: { icon: Bell, color: 'text-warning', bg: 'bg-warning/8 border-warning/15' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/8 border-primary/15' },
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/8 border-success/15' },
};

const NotificationsPage = () => {
  const { data, loading, error, setData } = useAsyncData(() => listNotifications(), []);
  const [actionError, setActionError] = useState('');
  const [expandedDetail, setExpandedDetail] = useState(null);

  const notifications = data || [];
  const unread = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setData(notifications.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setData(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-display flex items-center gap-2.5">
            Notificaciones
            {unread > 0 && (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white text-xs font-bold">
                {unread}
              </span>
            )}
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {unread} sin leer · {notifications.length} total
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark" onClick={handleMarkAll}>
          Marcar todas como leídas
        </Button>
      </div>

      {(error || actionError) && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2">
          {error || actionError}
        </p>
      )}

      {loading && <p className="text-sm text-text-muted">Cargando notificaciones...</p>}

      <Card className="overflow-hidden">
        <CardContent className="p-0 divide-y divide-border-light">
          {notifications.length === 0 && !loading ? (
            <p className="px-5 py-8 text-sm text-text-muted text-center">No tienes notificaciones.</p>
          ) : (
            notifications.map((notif) => {
              const meta = iconByType[notif.type] || iconByType.info;
              const Icon = meta.icon;
              return (
                <button
                  key={notif.notificationId}
                  type="button"
                  onClick={() => !notif.isRead && handleMarkRead(notif.notificationId)}
                  className={`w-full flex gap-4 px-5 py-4 hover:bg-hover transition-colors text-left ${!notif.isRead ? 'bg-primary/3' : ''}`}
                >
                  <div className={`h-10 w-10 rounded-xl border ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm font-semibold ${!notif.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-text-muted flex-shrink-0">{formatDate(notif.createdAt)}</span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${!notif.isRead ? 'text-text-secondary' : 'text-text-muted'}`}>
                      {notif.message}
                    </p>
                    {notif.metadata?.supportMessageId && notif.metadata?.response && (
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="xs" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDetail(expandedDetail === notif.notificationId ? null : notif.notificationId);
                            if (!notif.isRead) handleMarkRead(notif.notificationId);
                          }}
                        >
                          {expandedDetail === notif.notificationId ? 'Ocultar detalle' : 'Ver detalle'}
                        </Button>
                        {expandedDetail === notif.notificationId && (
                          <div className="mt-3 p-4 bg-secondary-bg/50 border border-border-light rounded-xl text-left shadow-inner">
                            <p className="text-xs font-bold text-text-primary mb-2 uppercase tracking-wider">Respuesta de Soporte Técnico:</p>
                            <p className="text-sm text-text-secondary whitespace-pre-wrap">{notif.metadata.response}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!notif.isRead && <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
                </button>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
