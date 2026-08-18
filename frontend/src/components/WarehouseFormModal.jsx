import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function WarehouseFormModal({ warehouse, onClose, onSaved }) {
  const isEdit = Boolean(warehouse);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: warehouse || { name: '', location: '', city: '', totalCapacity: '', status: 'Active' },
  });
  const { addToast } = useToast();

  useEffect(() => {
    reset(warehouse || { name: '', location: '', city: '', totalCapacity: '', status: 'Active' });
  }, [warehouse, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, totalCapacity: Number(data.totalCapacity) };
      if (isEdit) {
        await api.put(`/warehouses/${warehouse._id}`, payload);
        addToast('Warehouse updated', 'success');
      } else {
        await api.post('/warehouses', payload);
        addToast('Warehouse created', 'success');
      }
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Warehouse' : 'Add Warehouse'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full border p-2 rounded" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Location</label>
          <input {...register('location')} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">City</label>
          <input {...register('city', { required: 'City is required' })} className="w-full border p-2 rounded" />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Total Capacity</label>
          <input
            type="number"
            {...register('totalCapacity', { required: 'Capacity is required', min: { value: 1, message: 'Must be positive' } })}
            className="w-full border p-2 rounded"
          />
          {errors.totalCapacity && <p className="text-red-500 text-sm">{errors.totalCapacity.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select {...register('status')} className="w-full border p-2 rounded">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}
export default WarehouseFormModal;