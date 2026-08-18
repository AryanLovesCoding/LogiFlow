import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Sidebar() {
  const { user } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`;

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-xl font-bold mb-8">LogiFlow</h1>
      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>

        {['Administrator', 'Warehouse Manager'].includes(user.role) && (
          <>
            <NavLink to="/warehouses" className={linkClass}>Warehouses</NavLink>
            <NavLink to="/products" className={linkClass}>Products</NavLink>
            <NavLink to="/inventory" className={linkClass}>Inventory</NavLink>
          </>
        )}

        {user.role === 'Warehouse Executive' && (
          <NavLink to="/inventory" className={linkClass}>Inventory</NavLink>
        )}

        {['Administrator', 'Logistics Coordinator'].includes(user.role) && (
          <NavLink to="/customers" className={linkClass}>Customers</NavLink>
        )}
      </nav>
    </div>
  );
}
export default Sidebar;