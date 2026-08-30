import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function CustomerFormModal({ customer, onClose, onSaved }) {
  const isEdit = Boolean(customer);
  const defaults = { companyName: '', contactPersonName: '', email: '', phone: '', address: '', creditLimit: '', accountStatus: 'Active' };
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: customer || defaults,
  });
  const { addToast } = useToast();

  useEffect(() => { reset(customer || defaults); }, [customer, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, creditLimit: Number(data.creditLimit) };
      if (isEdit) {
        await api.put(`/customers/${customer._id}`, payload);
        addToast('Customer updated', 'success');
      } else {
        await api.post('/customers', payload);
        addToast('Customer created', 'success');
      }
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Customer' : 'Add Customer'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Company Name</label>
          <input {...register('companyName', { required: 'Required' })} className="w-full border p-2 rounded" />
          {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Contact Person</label>
          <input {...register('contactPersonName', { required: 'Required' })} className="w-full border p-2 rounded" />
          {errors.contactPersonName && <p className="text-red-500 text-sm">{errors.contactPersonName.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" {...register('email', { required: 'Required' })} className="w-full border p-2 rounded" disabled={isEdit} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input {...register('phone', { required: 'Required' })} className="w-full border p-2 rounded" />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Address</label>
          <input {...register('address', { required: 'Required' })} className="w-full border p-2 rounded" />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Credit Limit</label>
          <input type="number" {...register('creditLimit', { required: 'Required', min: 0 })} className="w-full border p-2 rounded" />
          {errors.creditLimit && <p className="text-red-500 text-sm">{errors.creditLimit.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Account Status</label>
          <select {...register('accountStatus')} className="w-full border p-2 rounded">
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
export default CustomerFormModal;