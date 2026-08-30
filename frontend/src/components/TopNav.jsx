import { useState, useEffect } from 'react';
import api from '../api/axios';

function TopNav() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications/me').then((response) => {
      setNotifications(response.data.notifications);
    });
  }, []);

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="text-2xl cursor-pointer" onClick={() => setIsOpen(!isOpen)}>🔔</span>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg p-2 z-10">
              <p className="font-semibold mb-2">Notifications</p>
              {notifications.length === 0 && <p className="text-sm text-gray-400">No new notifications</p>}
              {notifications.map((n) => (
                <div key={n._id} className="text-sm border-b py-2">
                  {n.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </div>
  );
}

export default TopNav;