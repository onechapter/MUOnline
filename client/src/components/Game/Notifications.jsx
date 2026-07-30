import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../store/gameSlice';

export default function Notifications() {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.game.notifications);

  useEffect(() => {
    if (!notifications.length) return;
    const timer = setTimeout(() => {
      dispatch(removeNotification(notifications[0].id));
    }, notifications[0].duration || 4000);
    return () => clearTimeout(timer);
  }, [notifications, dispatch]);

  const handleClick = (id) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type || 'success'}`}
          onClick={() => handleClick(notification.id)}
          style={{ cursor: 'pointer' }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}