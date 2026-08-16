import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { dispatch } = useContext(AuthContext);

  const onSubmit = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    localStorage.setItem('token', response.data.token);
    dispatch({
      type: 'LOGIN',
      payload: {
        token: response.data.token,
        user: response.data.user,
      },
    });
    alert('Logged in as ' + response.data.user.role);
  } catch (error) {
    alert('Error: ' + error.response.data.message);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        <label className="block mb-1">Email</label>
        <input
          {...register('email', { required: 'Email is required' })}
          type="email"
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>}

        <label className="block mb-1">Password</label>
        <input
          {...register('password', { required: 'Password is required' })}
          type="password"
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-2">
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;