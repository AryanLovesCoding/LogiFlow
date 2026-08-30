import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import DriverFormModal from '../components/DriverFormModal';
import { useToast } from '../hooks/useToast';

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [available, setAvailable] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [vehicleMap, setVehicleMap] = useState({});
  const { addToast } = useToast();

  const fetchDrivers = useCallback(() => {
    api.get('/drivers', { params: { available: available || undefined, page } })
      .then((res) => {
        setDrivers(res.data.drivers);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [available, page]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  useEffect(() => {
    api.get('/vehicles', { params: { limit: 100 } }).then((res) => {
        const map = {};
        res.data.vehicles.forEach((v) => { map[v._id] = v.licensePlate; });
        setVehicleMap(map);
    });
    }, []);

  const toggleAvailability = async (driver) => {
    try {
      await api.put(`/drivers/${driver._id}/availability`, { available: !driver.available });
      addToast('Availability updated', 'success');
      fetchDrivers();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Drivers</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Driver
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={available} onChange={(e) => { setLoading(true); setPage(1); setAvailable(e.target.value); }} className="border p-2 rounded">
          <option value="">All Drivers</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Licence No.</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Availability</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>}
            {!loading && drivers.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-400">No drivers found</td></tr>
            )}
            {drivers.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3 font-medium">{d.name}</td>
                <td className="p-3">{d.licenceNumber}</td>
                <td className="p-3">{d.phone}</td>
                <td className="p-3">{vehicleMap[d.assignedVehicleId] || '—'}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleAvailability(d)}
                    className={`px-2 py-1 rounded text-xs ${d.available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {d.available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(d); setModalOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {modalOpen && (
        <DriverFormModal driver={editing} onClose={() => setModalOpen(false)} onSaved={fetchDrivers} />
      )}
    </div>
  );
}
export default Drivers;