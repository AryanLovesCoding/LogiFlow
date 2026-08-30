import { useForm } from 'react-hook-form';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function TicketFormModal({ onClose, onSaved }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { title: '', description: '', priority: 'Medium', linkedOrderId: '' },
  });
  const { addToast } = useToast();

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, linkedOrderId: data.linkedOrderId || undefined };
      await api.post('/tickets', payload);
      addToast('Ticket created', 'success');
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title="Create Ticket" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input {...register('title', { required: 'Title is required' })} className="w-full border p-2 rounded" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea {...register('description', { required: 'Description is required' })} rows={3} className="w-full border p-2 rounded" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Priority</label>
          <select {...register('priority')} className="w-full border p-2 rounded">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Linked Order ID (optional)</label>
          <input {...register('linkedOrderId')} placeholder="Paste order ID if relevant" className="w-full border p-2 rounded" />
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </Modal>
  );
}
export default TicketFormModal;