import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import OrderStatusTimeline from '../components/OrderStatusTimeline';

function OrderDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(() => {
    api.get(`/orders/${id}`).then((res) => {
      const fetchedOrder = res.data.order;
      setOrder(fetchedOrder);
      api.get(`/customers/${fetchedOrder.customerId}`).then((r) => setCustomer(r.data.customer));
    });
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Build a productId -> name lookup once, so the items table can show names not IDs
  useEffect(() => {
    api.get('/products', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.products.forEach((p) => { map[p._id] = p.name; });
      setProductMap(map);
    });
  }, []);

  const canConfirm = order?.status === 'Draft' && ['Administrator', 'Logistics Coordinator'].includes(user.role);
  const canCancel = order && !['Delivered', 'Cancelled'].includes(order.status);

  const updateStatus = async (newStatus, confirmMessage) => {
    if (!window.confirm(confirmMessage)) return;
    setUpdating(true);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      addToast(`Order marked as ${newStatus}`, 'success');
      fetchOrder();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  if (!order || !customer) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/orders" className="text-blue-600 hover:underline text-sm">&larr; Back to Orders</Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Order #{order._id.slice(-6).toUpperCase()}</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">Customer</h2>
            <p className="font-medium">{customer.companyName}</p>
            <p className="text-sm text-gray-500">{customer.contactPersonName} · {customer.email}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">Items</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Unit Price</th>
                  <th className="pb-2">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{productMap[item.productId] || item.productId}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">₹{item.unitPrice}</td>
                    <td className="py-2">₹{item.quantity * item.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-semibold mt-3 pt-3 border-t">
              Total: ₹{order.totalAmount}
            </div>
          </div>

          <div className="flex gap-3">
            {canConfirm && (
            <button
                disabled={updating}
                onClick={() => updateStatus('Confirmed', 'Confirm this order?')}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                Confirm Order
            </button>
            )}
            {canCancel && (
              <button
                disabled={updating}
                onClick={() => updateStatus('Cancelled', 'Cancel this order? Any deducted stock will be returned to inventory.')}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Status</h2>
          <OrderStatusTimeline status={order.status} />
        </div>
      </div>
    </div>
  );
}
export default OrderDetail;