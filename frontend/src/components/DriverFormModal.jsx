import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function DriverFormModal({ driver, onClose, onSaved }) {
  const isEdit = Boolean(driver);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: driver || { name: '', licenceNumber: '', phone: '', available: true },
  });
  const { addToast } = useToast();

  useEffect(() => {
    reset(driver || { name: '', licenceNumber: '', phone: '', available: true });
  }, [driver, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await api.put(`/drivers/${driver._id}`, data);
        addToast('Driver updated', 'success');
      } else {
        await api.post('/drivers', data);
        addToast('Driver added', 'success');
      }
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Driver' : 'Add Driver'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full border p-2 rounded" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Licence Number</label>
          <input {...register('licenceNumber', { required: 'Licence number is required' })} className="w-full border p-2 rounded" />
          {errors.licenceNumber && <p className="text-red-500 text-sm">{errors.licenceNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input {...register('phone', { required: 'Phone is required' })} className="w-full border p-2 rounded" />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}
export default DriverFormModal;