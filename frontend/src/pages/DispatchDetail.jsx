import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';

function DispatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [dispatch, setDispatch] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [completing, setCompleting] = useState(false);

  const fetchDispatch = useCallback(() => {
    api.get(`/dispatches/${id}`).then((res) => {
      const d = res.data.dispatch;
      setDispatch(d);
      api.get(`/vehicles/${d.vehicleId}`).catch(() => {});
      api.get('/vehicles', { params: { limit: 100 } }).then((r) => {
        setVehicle(r.data.vehicles.find((v) => v._id === d.vehicleId));
      });
      api.get('/drivers', { params: { limit: 100 } }).then((r) => {
        setDriver(r.data.drivers.find((dr) => dr._id === d.driverId));
      });
      api.get(`/shipments/${d.shipmentId}`).then((r) => setShipment(r.data.shipment));
    });
  }, [id]);

  useEffect(() => { fetchDispatch(); }, [fetchDispatch]);

  const completeDispatch = async () => {
    if (!window.confirm('Complete this dispatch? The vehicle and driver will become available again, and the shipment will be marked Delivered.')) return;
    setCompleting(true);
    try {
      await api.put(`/dispatches/${id}/complete`);
      addToast('Dispatch completed', 'success');
      navigate('/dispatches');
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setCompleting(false);
    }
  };

  if (!dispatch) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/dispatches" className="text-blue-600 hover:underline text-sm">&larr; Back to Dispatches</Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Dispatch Detail</h1>

      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">Shipment</p>
          <Link to={`/shipments/${dispatch.shipmentId}`} className="text-blue-600 hover:underline">
            {shipment?.trackingId || dispatch.shipmentId}
          </Link>
        </div>
        <div><p className="text-gray-500 text-sm">Scheduled Date</p><p>{new Date(dispatch.scheduledDate).toLocaleDateString()}</p></div>
        <div><p className="text-gray-500 text-sm">Vehicle</p><p>{vehicle ? `${vehicle.licensePlate} (${vehicle.type})` : '—'}</p></div>
        <div><p className="text-gray-500 text-sm">Driver</p><p>{driver?.name || '—'}</p></div>
        <div className="col-span-2"><p className="text-gray-500 text-sm">Route Notes</p><p>{dispatch.routeNotes || '—'}</p></div>
      </div>

      {['Delivered', 'Failed'].includes(shipment?.status) ? (
      <span className="inline-block bg-gray-200 text-gray-600 px-4 py-2 rounded">
        Dispatch Completed
      </span>
    ) : (
      <button
        disabled={completing}
        onClick={completeDispatch}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Complete Dispatch
      </button>
    )}
        </div>
      );
}
export default DispatchDetail;