import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function VehicleFormModal({ vehicle, onClose, onSaved }) {
  const isEdit = Boolean(vehicle);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: vehicle || { licensePlate: '', type: '', capacityKg: '', status: 'Available' },
  });
  const { addToast } = useToast();

  useEffect(() => {
    reset(vehicle || { licensePlate: '', type: '', capacityKg: '', status: 'Available' });
  }, [vehicle, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, capacityKg: Number(data.capacityKg) };
      if (isEdit) {
        await api.put(`/vehicles/${vehicle._id}`, payload);
        addToast('Vehicle updated', 'success');
      } else {
        await api.post('/vehicles', payload);
        addToast('Vehicle added', 'success');
      }
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">License Plate</label>
          <input {...register('licensePlate', { required: 'License plate is required' })} className="w-full border p-2 rounded" />
          {errors.licensePlate && <p className="text-red-500 text-sm">{errors.licensePlate.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Type</label>
          <input {...register('type', { required: 'Type is required' })} placeholder="e.g. Truck, Van" className="w-full border p-2 rounded" />
          {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Capacity (Kg)</label>
          <input
            type="number"
            {...register('capacityKg', { required: 'Capacity is required', min: { value: 1, message: 'Must be positive' } })}
            className="w-full border p-2 rounded"
          />
          {errors.capacityKg && <p className="text-red-500 text-sm">{errors.capacityKg.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select {...register('status')} className="w-full border p-2 rounded">
            <option value="Available">Available</option>
            <option value="In-Use">In-Use</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}
export default VehicleFormModal;