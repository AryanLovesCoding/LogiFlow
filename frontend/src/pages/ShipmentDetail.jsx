import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ShipmentStatusTimeline from '../components/ShipmentStatusTimeline';

const NEXT_STATUS = {
  Created: 'Assigned',
  Assigned: 'In-Transit',
  'In-Transit': 'Out-for-Delivery',
  'Out-for-Delivery': 'Delivered',
};

function ShipmentDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  const [shipment, setShipment] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const fetchShipment = useCallback(() => {
    api.get(`/shipments/${id}`).then((res) => {
      const fetched = res.data.shipment;
      setShipment(fetched);
      api.get(`/warehouses/${fetched.originWarehouseId}`).then((r) => setWarehouse(r.data.warehouse));
    });
  }, [id]);

  useEffect(() => { fetchShipment(); }, [fetchShipment]);

  const canManage = ['Administrator', 'Logistics Coordinator'].includes(user.role);
  const nextStatus = shipment ? NEXT_STATUS[shipment.status] : null;
  const canFail = shipment && !['Delivered', 'Failed'].includes(shipment.status);

  const updateStatus = async (newStatus, confirmMessage) => {
    if (!window.confirm(confirmMessage)) return;
    setUpdating(true);
    try {
      await api.put(`/shipments/${id}/status`, { status: newStatus });
      addToast(`Shipment marked as ${newStatus}`, 'success');
      fetchShipment();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const addTrackingEvent = async (e) => {
    e.preventDefault();
    if (!location || !description) return;
    setUpdating(true);
    try {
      await api.post(`/shipments/${id}/tracking`, { location, description });
      addToast('Tracking event added', 'success');
      setLocation('');
      setDescription('');
      fetchShipment();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  if (!shipment) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/shipments" className="text-blue-600 hover:underline text-sm">&larr; Back to Shipments</Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Shipment {shipment.trackingId}</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-3">
            <div><p className="text-gray-500 text-sm">Order</p><Link to={`/orders/${shipment.orderId}`} className="text-blue-600 hover:underline">View Order</Link></div>
            <div><p className="text-gray-500 text-sm">Origin Warehouse</p><p>{warehouse?.name || '—'}</p></div>
            <div className="col-span-2"><p className="text-gray-500 text-sm">Destination</p><p>{shipment.destinationAddress}</p></div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">Tracking History</h2>
            {shipment.trackingHistory.length === 0 && (
              <p className="text-gray-400 text-sm">No tracking events yet</p>
            )}
            <div className="flex flex-col gap-4">
              {shipment.trackingHistory.map((event, i) => (
                <div key={i} className="border-l-2 border-blue-600 pl-4">
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {canManage && (
              <form onSubmit={addTrackingEvent} className="flex flex-col gap-3 mt-4 pt-4 border-t">
                <input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border p-2 rounded"
                />
                <button disabled={updating} className="bg-gray-800 text-white p-2 rounded disabled:opacity-50">
                  Add Tracking Event
                </button>
              </form>
            )}
          </div>

          {canManage && (
            <div className="flex gap-3">
              {nextStatus && (
                <button
                  disabled={updating}
                  onClick={() => updateStatus(nextStatus, `Mark shipment as ${nextStatus}?`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Mark {nextStatus}
                </button>
              )}
              {canFail && (
                <button
                  disabled={updating}
                  onClick={() => updateStatus('Failed', 'Mark this shipment as failed?')}
                  className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Mark Failed
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Status</h2>
          <ShipmentStatusTimeline status={shipment.status} />
        </div>
      </div>
    </div>
  );
}
export default ShipmentDetail;