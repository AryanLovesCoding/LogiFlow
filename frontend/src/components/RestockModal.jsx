import { useForm } from 'react-hook-form';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function RestockModal({ inventory, onClose, onSaved }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { addToast } = useToast();

  const onSubmit = async (data) => {
    try {
      await api.put(`/inventory/${inventory._id}/restock`, { restockAmount: Number(data.restockAmount) });
      addToast('Inventory restocked', 'success');
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title="Restock Inventory" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <p className="text-sm text-gray-500">Current quantity: {inventory.quantity}</p>
        <div>
          <label className="block text-sm mb-1">Restock Amount</label>
          <input
            type="number"
            {...register('restockAmount', { required: 'Amount is required', min: { value: 1, message: 'Must be positive' } })}
            className="w-full border p-2 rounded"
          />
          {errors.restockAmount && <p className="text-red-500 text-sm">{errors.restockAmount.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Restock'}
        </button>
      </form>
    </Modal>
  );
}
export default RestockModal;