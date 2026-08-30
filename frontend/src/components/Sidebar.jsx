import { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Sidebar() {
  const { user } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm transition-colors border-l-2 ${
      isActive
        ? 'bg-gray-800 border-blue-500 text-white font-medium'
        : 'border-transparent text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const sectionLabel = 'text-sm font-semibold uppercase tracking-wider text-gray-400 px-3 mt-6 mb-2';

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <Link to="/dashboard" className="text-xl font-bold mb-8 block hover:text-gray-300 px-5 pt-6">LogiFlow</Link>

          <nav className="flex flex-col px-2 pb-6 flex-1 overflow-y-auto">
            <NavLink
      to="/dashboard"
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors border-l-2 ${
          isActive
            ? 'bg-gray-800 border-blue-500 text-white'
            : 'border-transparent text-gray-300 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      Dashboard
    </NavLink>

        {(['Administrator', 'Warehouse Manager'].includes(user.role) || user.role === 'Warehouse Executive') && (
          <>
            <p className={sectionLabel}>Operations</p>
            {['Administrator', 'Warehouse Manager'].includes(user.role) && (
              <>
                <NavLink to="/warehouses" className={linkClass}>Warehouses</NavLink>
                <NavLink to="/products" className={linkClass}>Products</NavLink>
              </>
            )}
            <NavLink to="/inventory" className={linkClass}>Inventory</NavLink>
          </>
        )}

        {['Administrator', 'Logistics Coordinator'].includes(user.role) && (
            <>
              <p className={sectionLabel}>Sales & Logistics</p>
              <NavLink to="/customers" className={linkClass}>Customers</NavLink>
              <NavLink to="/orders" className={linkClass}>Orders</NavLink>
              <NavLink to="/shipments" className={linkClass}>Shipments</NavLink>
              <NavLink to="/tickets" className={linkClass}>Tickets</NavLink>
            </>
          )}

          {user.role === 'Customer Support Executive' && (
            <>
              <p className={sectionLabel}>Support</p>
              <NavLink to="/tickets" className={linkClass}>Tickets</NavLink>
            </>
          )}

        {['Administrator', 'Warehouse Manager'].includes(user.role) && (
          <>
            <p className={sectionLabel}>Fleet</p>
            <NavLink to="/vehicles" className={linkClass}>Vehicles</NavLink>
            <NavLink to="/drivers" className={linkClass}>Drivers</NavLink>
            <NavLink to="/dispatches" className={linkClass}>Dispatches</NavLink>

            <p className={sectionLabel}>Insights</p>
            <NavLink to="/reports" className={linkClass}>Reports</NavLink>
          </>
        )}

        {user.role === 'Administrator' && (
          <>
            <p className={sectionLabel}>Admin</p>
            <NavLink to="/activity-logs" className={linkClass}>Activity Logs</NavLink>
          </>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-400">
        {user.role}
      </div>
    </div>
  );
}
export default Sidebar;