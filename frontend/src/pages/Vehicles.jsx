import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import VehicleFormModal from '../components/VehicleFormModal';
import { useToast } from '../hooks/useToast';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [driverMap, setDriverMap] = useState({});
  const { addToast } = useToast();

  const fetchVehicles = useCallback(() => {
    api.get('/vehicles', { params: { status: status || undefined, page } })
      .then((res) => {
        setVehicles(res.data.vehicles);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const statusBadge = (s) => {
    const colors = {
      Available: 'bg-green-100 text-green-700',
      'In-Use': 'bg-orange-100 text-orange-700',
      Maintenance: 'bg-gray-200 text-gray-600',
    };
    return colors[s] || 'bg-gray-200 text-gray-600';
  };

  const handleDelete = async (vehicle) => {
    if (!confirm(`Mark ${vehicle.licensePlate} for maintenance?`)) return;
    try {
      await api.delete(`/vehicles/${vehicle._id}`);
      addToast('Vehicle set to Maintenance', 'success');
      fetchVehicles();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    api.get('/drivers', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.drivers.forEach((d) => {
        if (d.assignedVehicleId) map[d.assignedVehicleId] = d.name;
      });
      setDriverMap(map);
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Vehicles</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Vehicle
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={status} onChange={(e) => { setLoading(true); setPage(1); setStatus(e.target.value); }} className="border p-2 rounded">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In-Use">In-Use</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">License Plate</th>
              <th className="p-3">Type</th>
              <th className="p-3">Capacity (Kg)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned Driver</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>}
            {!loading && vehicles.length === 0 && (
              <tr><td colSpan="6" className="p-4 text-center text-gray-400">No vehicles found</td></tr>
            )}
            {vehicles.map((v) => (
              <tr key={v._id} className="border-t">
                <td className="p-3 font-medium">{v.licensePlate}</td>
                <td className="p-3">{v.type}</td>
                <td className="p-3">{v.capacityKg}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusBadge(v.status)}`}>{v.status}</span>
                </td>
                <td className="p-3">{driverMap[v._id] || '—'}</td>
                <td className="p-3 text-right space-x-3">
                  <button onClick={() => { setEditing(v); setModalOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(v)} className="text-red-600 hover:underline">Maintenance</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {modalOpen && (
        <VehicleFormModal vehicle={editing} onClose={() => setModalOpen(false)} onSaved={fetchVehicles} />
      )}
    </div>
  );
}
export default Vehicles;