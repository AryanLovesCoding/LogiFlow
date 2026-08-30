import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import WarehouseFormModal from '../components/WarehouseFormModal';

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchWarehouses = useCallback(() => {
    api.get('/warehouses', { params: { city: city || undefined, status: status || undefined, page } })
      .then((res) => {
        setWarehouses(res.data.warehouses);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [city, status, page]);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Warehouses</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Warehouse
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search by city..."
          value={city}
          onChange={(e) => { setLoading(true); setPage(1); setCity(e.target.value); }}
          className="border p-2 rounded"
        />
        <select value={status} onChange={(e) => { setLoading(true); setPage(1); setStatus(e.target.value); }} className="border p-2 rounded">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">City</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>}
            {!loading && warehouses.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-400">No warehouses found</td></tr>
            )}
            {warehouses.map((w) => (
              <tr key={w._id} className="border-t">
                <td className="p-3">
                  <Link to={`/warehouses/${w._id}`} className="text-blue-600 hover:underline">{w.name}</Link>
                </td>
                <td className="p-3">{w.city}</td>
                <td className="p-3">{w.totalCapacity}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${w.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {w.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(w); setModalOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {modalOpen && (
        <WarehouseFormModal warehouse={editing} onClose={() => setModalOpen(false)} onSaved={fetchWarehouses} />
      )}
    </div>
  );
}
export default Warehouses;