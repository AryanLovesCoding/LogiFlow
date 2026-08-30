import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';

function CreateUser() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '', role: 'Warehouse Manager' },
  });
  const { addToast } = useToast();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      addToast('User created successfully', 'success');
      reset();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-4">Create New User</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input {...register('name', { required: 'Name is required' })} className="w-full border p-2 rounded" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full border p-2 rounded"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
              className="w-full border p-2 rounded"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select {...register('role', { required: true })} className="w-full border p-2 rounded">
              <option value="Administrator">Administrator</option>
              <option value="Warehouse Manager">Warehouse Manager</option>
              <option value="Warehouse Executive">Warehouse Executive</option>
              <option value="Logistics Coordinator">Logistics Coordinator</option>
              <option value="Customer Support Executive">Customer Support Executive</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}
export default CreateUser;