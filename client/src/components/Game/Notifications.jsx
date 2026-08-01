import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../store/gameSlice';

const TYPE_COLORS = {
  success: { bg: '#1a3a1a', border: '#4a4', text: '#8f8' },
  error: { bg: '#3a1a1a', border: '#a44', text: '#f88' },
  info: { bg: '#1a2a3a', border: '#48a', text: '#8bf' },
  levelup: { bg: '#3a3a1a', border: '#aa4', text: '#ff8' },
  default: { bg: '#2a2a2a', border: '#666', text: '#ccc' },
};

export default function Notifications() {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.game.notifications);

  useEffect(() => {
    if (!notifications.length) return;
    const last = notifications[notifications.length - 1];
    const timer = setTimeout(() => {
      dispatch(removeNotification(last.id));
    }, last.duration || 4000);
    return () => clearTimeout(timer);
  }, [notifications, dispatch]);

  if (!notifications.length) return null;

  return (
    <div className="notification-container" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      maxWidth: '320px',
    }}>
      {notifications.map((notification) => {
        const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.default;
        return (
          <div
            key={notification.id}
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => dispatch(removeNotification(notification.id))}
          >
            {notification.message}
          </div>
        );
      })}
    </div>
  );
}