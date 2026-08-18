import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Build a customerId -> companyName lookup, same trick as Inventory
  useEffect(() => {
    api.get('/customers', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.customers.forEach((c) => { map[c._id] = c.companyName; });
      setCustomerMap(map);
    });
  }, []);

  const fetchOrders = useCallback(() => {
    api.get('/orders', { params: { status: status || undefined, page } })
      .then((res) => {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const statusBadge = (s) => {
    const colors = {
      Draft: 'bg-gray-200 text-gray-700',
      Confirmed: 'bg-blue-100 text-blue-700',
      Processing: 'bg-yellow-100 text-yellow-700',
      Dispatched: 'bg-purple-100 text-purple-700',
      Delivered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
    };
    return colors[s] || 'bg-gray-200 text-gray-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Orders</h1>
        <Link to="/orders/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Create Order
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setLoading(true); setPage(1); setStatus(e.target.value); }}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>}
            {!loading && orders.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-400">No orders found</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-3">
                  <Link to={`/orders/${o._id}`} className="text-blue-600 hover:underline">
                    {o._id.slice(-6).toUpperCase()}
                  </Link>
                </td>
                <td className="p-3">{customerMap[o.customerId] || o.customerId}</td>
                <td className="p-3">₹{o.totalAmount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusBadge(o.status)}`}>{o.status}</span>
                </td>
                <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />
    </div>
  );
}
export default Orders;