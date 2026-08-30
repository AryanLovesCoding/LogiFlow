import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const defaults = { name: '', sku: '', category: '', unit: '', description: '', status: 'Active' };
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: product || defaults,
  });
  const { addToast } = useToast();

  useEffect(() => { reset(product || defaults); }, [product, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await api.put(`/products/${product._id}`, data);
        addToast('Product updated', 'success');
      } else {
        await api.post('/products', data);
        addToast('Product created', 'success');
      }
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full border p-2 rounded" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">SKU</label>
          <input {...register('sku', { required: 'SKU is required' })} className="w-full border p-2 rounded" disabled={isEdit} />
          {errors.sku && <p className="text-red-500 text-sm">{errors.sku.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <input {...register('category', { required: 'Category is required' })} className="w-full border p-2 rounded" />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Unit</label>
          <input {...register('unit', { required: 'Unit is required' })} className="w-full border p-2 rounded" placeholder="e.g. pcs, kg, box" />
          {errors.unit && <p className="text-red-500 text-sm">{errors.unit.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea {...register('description')} className="w-full border p-2 rounded" />
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
export default ProductFormModal;