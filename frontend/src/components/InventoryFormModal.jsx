import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';

function InventoryFormModal({ onClose, onSaved }) {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { warehouseId: '', productId: '', quantity: '', reorderThreshold: '', unit: '' },
  });
  const { addToast } = useToast();

  useEffect(() => {
    api.get('/warehouses', { params: { limit: 100 } }).then((res) => setWarehouses(res.data.warehouses));
    api.get('/products', { params: { limit: 100 } }).then((res) => setProducts(res.data.products));
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/inventory', {
        ...data,
        quantity: Number(data.quantity),
        reorderThreshold: Number(data.reorderThreshold),
      });
      addToast('Inventory record created', 'success');
      onSaved();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title="Add Inventory" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm mb-1">Warehouse</label>
          <select {...register('warehouseId', { required: 'Select a warehouse' })} className="w-full border p-2 rounded">
            <option value="">-- Select warehouse --</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
          {errors.warehouseId && <p className="text-red-500 text-sm">{errors.warehouseId.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Product</label>
          <select {...register('productId', { required: 'Select a product' })} className="w-full border p-2 rounded">
            <option value="">-- Select product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
            ))}
          </select>
          {errors.productId && <p className="text-red-500 text-sm">{errors.productId.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Quantity</label>
          <input
            type="number"
            {...register('quantity', { required: 'Quantity is required', min: { value: 0, message: 'Cannot be negative' } })}
            className="w-full border p-2 rounded"
          />
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Reorder Threshold</label>
          <input
            type="number"
            {...register('reorderThreshold', { required: 'Reorder threshold is required', min: { value: 0, message: 'Cannot be negative' } })}
            className="w-full border p-2 rounded"
          />
          {errors.reorderThreshold && <p className="text-red-500 text-sm">{errors.reorderThreshold.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Unit</label>
          <input {...register('unit', { required: 'Unit is required' })} placeholder="e.g. pcs, kg, box" className="w-full border p-2 rounded" />
          {errors.unit && <p className="text-red-500 text-sm">{errors.unit.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </form>
    </Modal>
  );
}
export default InventoryFormModal;