import { useEffect, useRef, useState } from 'react';
import axios from '../../utils/axios';
import { Bell, CalendarCheck, FileText, CreditCard, Star, Info } from 'lucide-react';
import './notificationBell.css';

const typeIcon = {
  appointment: CalendarCheck,
  prescription: FileText,
  billing: CreditCard,
  rating: Star,
  system: Info,
};

const formatTime = dateStr => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

const NotificationBell = () => {
  const userId = localStorage.getItem('userId');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const boxRef = useRef(null);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [listRes, unreadRes] = await Promise.all([
        axios.get(`/notifications/user/${userId}?limit=8`),
        axios.get(`/notifications/unread/${userId}`),
      ]);
      setItems(listRes.data.items || []);
      setUnread(unreadRes.data.unread || 0);
    } catch (e) {
      console.error('Notification fetch error:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const markRead = async id => {
    try {
      await axios.patch(`/notifications/read/${id}`);
      setItems(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch('/notifications/read-all', { userId });
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="notification-bell-wrap" ref={boxRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h4>Notifications</h4>
            {unread > 0 && (
              <button className="mark-all-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {items.length > 0 ? (
              items.map(n => {
                const Icon = typeIcon[n.type] || Info;
                return (
                  <button
                    key={n._id}
                    className={`notification-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markRead(n._id)}
                  >
                    <span className="notification-item-icon">
                      <Icon size={15} />
                    </span>
                    <span className="notification-item-body">
                      <strong>{n.title}</strong>
                      <span>{n.message}</span>
                      <small>{formatTime(n.createdAt)}</small>
                    </span>
                    {!n.read && <span className="notification-dot" />}
                  </button>
                );
              })
            ) : (
              <div className="notification-empty">No notifications yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
