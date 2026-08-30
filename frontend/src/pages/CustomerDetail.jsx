import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => setCustomer(res.data.customer));
    api.get('/orders', { params: { customerId: id, limit: 1 } }).then((res) => setOrderCount(res.data.totalCount));
  }, [id]);

  if (!customer) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/customers" className="text-blue-600 hover:underline text-sm">&larr; Back to Customers</Link>
      <h1 className="text-xl font-bold mt-2 mb-4">{customer.companyName}</h1>

      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-3">
        <div><p className="text-gray-500 text-sm">Contact Person</p><p>{customer.contactPersonName}</p></div>
        <div><p className="text-gray-500 text-sm">Email</p><p>{customer.email}</p></div>
        <div><p className="text-gray-500 text-sm">Phone</p><p>{customer.phone}</p></div>
        <div><p className="text-gray-500 text-sm">Address</p><p>{customer.address}</p></div>
        <div><p className="text-gray-500 text-sm">Credit Limit</p><p>₹{customer.creditLimit}</p></div>
        <div><p className="text-gray-500 text-sm">Status</p><p>{customer.accountStatus}</p></div>
        <div><p className="text-gray-500 text-sm">Total Orders</p><p>{orderCount}</p></div>
      </div>
    </div>
  );
}
export default CustomerDetail;