import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import KpiCard from '../components/KpiCard';
import AuthContext from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

function Dashboard() {
  const { user } = useContext(AuthContext);

  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [openTickets, setOpenTickets] = useState(null);
  const [ordersByDay, setOrdersByDay] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [warehouseMap, setWarehouseMap] = useState({});
  const [activeDispatches, setActiveDispatches] = useState(null);

  const canSeeLowStock = ['Administrator', 'Warehouse Manager'].includes(user.role);
  const showOrderDispatchKPIs = ['Administrator', 'Logistics Coordinator'].includes(user.role);
  const showTicketKPIs = ['Administrator', 'Customer Support Executive'].includes(user.role);
  const canSeeLogs = user.role === 'Administrator';

  useEffect(() => {
    api.get('/analytics/summary').then((response) => {
        setSummary(response.data);
    });
    api.get('/vehicles/available').then((response) => {
        setVehicles(response.data);
    });
    api.get('/tickets?status=Open').then((response) => {
        setOpenTickets(response.data);
    });
    api.get('/analytics/orders-by-day').then((response) => {
        setOrdersByDay(response.data.ordersByDay);
    });
    api.get('/warehouses', { params: { limit: 100 } }).then((response) => {
      const map = {};
      response.data.warehouses.forEach((w) => { map[w._id] = w.name; });
      setWarehouseMap(map);
    });
    if (showOrderDispatchKPIs) {
      api.get('/dispatches', { params: { limit: 100 } }).then((response) => {
        setActiveDispatches(response.data.dispatches.length);
      });
    }

    if (canSeeLowStock) {
        api.get('/inventory/low-stock').then((response) => {
        setLowStock(response.data);
        });
    }

    if (canSeeLogs) {
        api.get('/logs?limit=5').then((response) => {
        setRecentActivity(response.data.logs);
        });
    }
    }, []);

  if (!summary || !vehicles || !openTickets || !ordersByDay) {
    return <div>Loading...</div>;
    }

  const activeShipments = summary.shipmentsByStatus.reduce((total, item) => {
    if (item.status !== 'Delivered' && item.status !== 'Failed') {
      return total + item.count;
    }
    return total;
  }, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Active Orders" value={summary.totalActiveOrders} />

        {showOrderDispatchKPIs && <KpiCard label="Active Shipments" value={activeShipments} />}
        {showOrderDispatchKPIs && <KpiCard label="Available Vehicles" value={vehicles.vehicle.length} />}
        {showOrderDispatchKPIs && <KpiCard label="Completed Dispatches" value={summary.dispatchesCompletedThisWeek} />}
        {showOrderDispatchKPIs && activeDispatches !== null && <KpiCard label="Total Dispatches" value={activeDispatches} />}
        {canSeeLowStock && <KpiCard label="Low-Stock Items" value={lowStock?.totalCount ?? 0} />}

        {showTicketKPIs && <KpiCard label="Open Tickets" value={openTickets.totalCount} />}
        </div>

      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-4">Shipments by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={summary.shipmentsByStatus}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={100}
            >
              {summary.shipmentsByStatus.map((entry, index) => {
              const statusColors = {
                Delivered: '#10b981',
                Failed: '#ef4444',
                Created: '#94a3b8',
                Assigned: '#3b82f6',
                'In-Transit': '#f59e0b',
                'Out-for-Delivery': '#8b5cf6',
              };
              return <Cell key={index} fill={statusColors[entry.status] || '#94a3b8'} />;
            })}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-4">Top 5 Products by Order Volume</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.topProductsByOrderVolume}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalQuantity">
                {summary.topProductsByOrderVolume.map((entry, index) => (
                <Cell key={index} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-4">Orders Created — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" />
            </LineChart>
        </ResponsiveContainer>
        </div>

        {canSeeLogs && (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <ul className="flex flex-col gap-2">
            {recentActivity.map((log) => (
                <li key={log._id} className="text-sm border-b pb-2">
                <span className="font-medium">{log.action}</span> on <span className="font-medium">{log.entity}</span>
                <span className="text-gray-400 ml-2">{new Date(log.createdAt).toLocaleString()}</span>
                </li>
            ))}
            </ul>
        </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h3 className="font-semibold mb-4">Warehouse Utilisation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={summary.warehouseUtilisation.map((w) => ({ ...w, name: warehouseMap[w.warehouseId] || w.warehouseId }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip />
              <Bar dataKey="usedCapacityPercent" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
}

export default Dashboard;