import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import DispatchFormModal from '../components/DispatchFormModal';

function Dispatches() {
  const [dispatches, setDispatches] = useState([]);
  const [shipmentMap, setShipmentMap] = useState({});
  const [vehicleMap, setVehicleMap] = useState({});
  const [driverMap, setDriverMap] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get('/shipments', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.shipments.forEach((s) => { map[s._id] = s.trackingId; });
      setShipmentMap(map);
    });
    api.get('/vehicles', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.vehicles.forEach((v) => { map[v._id] = v.licensePlate; });
      setVehicleMap(map);
    });
    api.get('/drivers', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.drivers.forEach((d) => { map[d._id] = d.name; });
      setDriverMap(map);
    });
  }, []);

  const fetchDispatches = useCallback(() => {
    api.get('/dispatches', { params: { page } })
      .then((res) => {
        setDispatches(res.data.dispatches);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchDispatches(); }, [fetchDispatches]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Dispatches</h1>
        <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Assign Dispatch
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Shipment</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Scheduled Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>}
            {!loading && dispatches.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-gray-400">No dispatches found</td></tr>
            )}
            {dispatches.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3">
                  <Link to={`/dispatches/${d._id}`} className="text-blue-600 hover:underline">
                    {shipmentMap[d.shipmentId] || d.shipmentId}
                  </Link>
                </td>
                <td className="p-3">{vehicleMap[d.vehicleId] || d.vehicleId}</td>
                <td className="p-3">{driverMap[d.driverId] || d.driverId}</td>
                <td className="p-3">{new Date(d.scheduledDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {modalOpen && (
        <DispatchFormModal onClose={() => setModalOpen(false)} onSaved={fetchDispatches} />
      )}
    </div>
  );
}
export default Dispatches;