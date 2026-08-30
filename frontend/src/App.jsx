import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Warehouses from './pages/Warehouses';
import WarehouseDetail from './pages/WarehouseDetail';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import CreateOrder from './pages/CreateOrder';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Shipments from './pages/Shipments';
import ShipmentDetail from './pages/ShipmentDetail';
import Dispatches from './pages/Dispatches';
import DispatchDetail from './pages/DispatchDetail';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<RoleProtectedRoute allowedRoles={['Administrator', 'Warehouse Manager']} />}>
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/warehouses/:id" element={<WarehouseDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/dispatches" element={<Dispatches />} />
              <Route path="/dispatches/:id" element={<DispatchDetail />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['Administrator', 'Warehouse Manager', 'Warehouse Executive']} />}>
              <Route path="/inventory" element={<Inventory />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['Administrator', 'Logistics Coordinator']} />}>
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/new" element={<CreateOrder />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/shipments/:id" element={<ShipmentDetail />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['Administrator', 'Logistics Coordinator', 'Customer Support Executive']} />}>
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['Administrator']} />}>
              <Route path="/activity-logs" element={<ActivityLogs />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;