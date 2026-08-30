import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';

function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [warehouseMap, setWarehouseMap] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/warehouses', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.warehouses.forEach((w) => { map[w._id] = w.name; });
      setWarehouseMap(map);
    });
  }, []);

  const fetchShipments = useCallback(() => {
    api.get('/shipments', { params: { status: status || undefined, page } })
      .then((res) => {
        setShipments(res.data.shipments);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const statusBadge = (s) => {
    const colors = {
      Created: 'bg-gray-200 text-gray-700',
      Assigned: 'bg-blue-100 text-blue-700',
      'In-Transit': 'bg-yellow-100 text-yellow-700',
      'Out-for-Delivery': 'bg-purple-100 text-purple-700',
      Delivered: 'bg-green-100 text-green-700',
      Failed: 'bg-red-100 text-red-700',
    };
    return colors[s] || 'bg-gray-200 text-gray-700';
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Shipments</h1>

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setLoading(true); setPage(1); setStatus(e.target.value); }}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Created">Created</option>
          <option value="Assigned">Assigned</option>
          <option value="In-Transit">In-Transit</option>
          <option value="Out-for-Delivery">Out-for-Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Tracking ID</th>
              <th className="p-3">Origin Warehouse</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>}
            {!loading && shipments.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-gray-400">No shipments found</td></tr>
            )}
            {shipments.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">
                  <Link to={`/shipments/${s._id}`} className="text-blue-600 hover:underline">{s.trackingId}</Link>
                </td>
                <td className="p-3">{warehouseMap[s.originWarehouseId] || s.originWarehouseId}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusBadge(s.status)}`}>{s.status}</span>
                </td>
                <td className="p-3">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />
    </div>
  );
}
export default Shipments;