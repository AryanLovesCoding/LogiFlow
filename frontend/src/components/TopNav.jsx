import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

function TopNav() {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    api.get('/notifications/me').then((response) => {
      setNotifications(response.data.notifications);
    });
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    fetchNotifications();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold"></h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="text-2xl cursor-pointer relative" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </span>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg p-2 z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Notifications</p>
                {notifications.length > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                    Mark All Read
                  </button>
                )}
              </div>
              {notifications.length === 0 && <p className="text-sm text-gray-400">No new notifications</p>}
              {notifications.map((n) => (
                <div key={n._id} className="flex items-start justify-between gap-2 text-sm border-b py-2">
                  <span>{n.content}</span>
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                  >
                    Mark Read
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold cursor-pointer"
          >
            {initial}
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
              <div className="px-4 py-3 border-b">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TopNav;