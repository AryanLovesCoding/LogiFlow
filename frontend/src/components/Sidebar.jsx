import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-xl font-bold mb-8">LogiFlow</h1>
      <nav className="flex flex-col gap-2">
        <a href="#" className="p-2 rounded hover:bg-gray-700">Dashboard</a>

        {(user.role === 'Administrator' || user.role === 'Warehouse Manager') && (
          <a href="#" className="p-2 rounded hover:bg-gray-700">Warehouses</a>
        )}

        <a href="#" className="p-2 rounded hover:bg-gray-700">Orders</a>
      </nav>
    </div>
  );
}

export default Sidebar;