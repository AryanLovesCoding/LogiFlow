import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/users').then((res) => {
      const map = {};
      res.data.users.forEach((u) => { map[u._id] = u.name; });
      setUserMap(map);
    });
  }, []);

  const fetchLogs = useCallback(() => {
    api.get('/logs', {
      params: {
        entity: entity || undefined,
        userId: userId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
      },
    })
      .then((res) => {
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [entity, userId, startDate, endDate, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const applyFilters = () => { setLoading(true); setPage(1); fetchLogs(); };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Activity Logs</h1>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <select value={entity} onChange={(e) => setEntity(e.target.value)} className="border p-2 rounded">
          <option value="">All Entities</option>
          <option value="Order">Order</option>
          <option value="Shipment">Shipment</option>
          <option value="Inventory">Inventory</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Product">Product</option>
          <option value="Customer">Customer</option>
        </select>
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className="border p-2 rounded">
          <option value="">All Users</option>
          {Object.entries(userMap).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">End Date</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <button onClick={applyFilters} className="bg-blue-600 text-white px-4 py-2 rounded">Apply Filters</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Entity</th>
              <th className="p-3">Action</th>
              <th className="p-3">Performed By</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>}
            {!loading && logs.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-gray-400">No log entries found</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="p-3">{log.entity}</td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">{userMap[log.userId] || log.userId}</td>
                <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />
    </div>
  );
}
export default ActivityLogs;