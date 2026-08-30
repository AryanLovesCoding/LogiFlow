import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function DispatchFormModal({ onClose, onSaved }) {
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { shipmentId: '', vehicleId: '', driverId: '', scheduledDate: '', routeNotes: '' },
  });
  const { addToast } = useToast();

  useEffect(() => {
    api.get('/shipments', { params: { status: 'Created', limit: 100 } }).then((res) => setShipments(res.data.shipments));
    api.get('/vehicles/available').then((res) => setVehicles(res.data.vehicle));
    api.get('/drivers', { params: { available: 'true', limit: 100 } }).then((res) => setDrivers(res.data.drivers));
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/dispatches', data);
      addToast('Dispatch created', 'success');
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title="Assign Dispatch" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Shipment</label>
          <select {...register('shipmentId', { required: 'Select a shipment' })} className="w-full border p-2 rounded">
            <option value="">-- Select pending shipment --</option>
            {shipments.map((s) => (
              <option key={s._id} value={s._id}>{s.trackingId} — {s.destinationAddress}</option>
            ))}
          </select>
          {errors.shipmentId && <p className="text-red-500 text-sm">{errors.shipmentId.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Vehicle</label>
          <select {...register('vehicleId', { required: 'Select a vehicle' })} className="w-full border p-2 rounded">
            <option value="">-- Select available vehicle --</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>{v.licensePlate} ({v.type})</option>
            ))}
          </select>
          {errors.vehicleId && <p className="text-red-500 text-sm">{errors.vehicleId.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Driver</label>
          <select {...register('driverId', { required: 'Select a driver' })} className="w-full border p-2 rounded">
            <option value="">-- Select available driver --</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          {errors.driverId && <p className="text-red-500 text-sm">{errors.driverId.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Scheduled Date</label>
          <input type="date" {...register('scheduledDate', { required: 'Scheduled date is required' })} className="w-full border p-2 rounded" />
          {errors.scheduledDate && <p className="text-red-500 text-sm">{errors.scheduledDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Route Notes</label>
          <textarea {...register('routeNotes')} className="w-full border p-2 rounded" rows={2} />
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
          {isSubmitting ? 'Assigning...' : 'Assign Dispatch'}
        </button>
      </form>
    </Modal>
  );
}
export default DispatchFormModal;