import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';

function CreateOrder() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const [orderItems, setOrderItems] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockCheck, setStockCheck] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const comboboxRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/customers', { params: { limit: 100 } }).then((res) => setCustomers(res.data.customers));
    api.get('/warehouses', { params: { limit: 100 } }).then((res) => setWarehouses(res.data.warehouses));
    api.get('/products', { params: { limit: 100 } }).then((res) => setProducts(res.data.products));
  }, []);

  useEffect(() => {
      const handleClickOutside = (e) => {
        if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

  const filteredCustomers = customers.filter((c) =>
    c.companyName.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectedCustomer = customers.find((c) => c._id === customerId);
  const selectedWarehouse = warehouses.find((w) => w._id === warehouseId);

  const checkStockAndAdd = async () => {
    if (!selectedProductId || !quantity || !unitPrice) return;
    const qty = Number(quantity);

    try {
      const res = await api.get('/inventory', {
        params: { warehouseId, productId: selectedProductId },
      });
      const record = res.data.inventory[0];

      if (!record || record.quantity < qty) {
        setStockCheck({
          ok: false,
          message: `Only ${record ? record.quantity : 0} in stock at this warehouse`,
        });
        return;
      }

      setOrderItems((prev) => [
        ...prev,
        { productId: selectedProductId, quantity: qty, unitPrice: Number(unitPrice) },
      ]);
      setStockCheck({ ok: true, message: 'Added' });
      setSelectedProductId('');
      setQuantity('');
      setUnitPrice('');
    } catch {
      setStockCheck({ ok: false, message: 'Could not check stock — try again' });
    }
  };

  const removeItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const orderTotal = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        customerId,
        warehouseId,
        orderItems,
      });
      addToast('Order created successfully', 'success');
      navigate(`/orders/${res.data.order._id}`);
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/orders" className="text-blue-600 hover:underline text-sm">&larr; Back to Orders</Link>
      <h1 className="text-xl font-bold mt-2 mb-6">Create Order</h1>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
                {step === 1 && (
                  <div className="flex flex-col gap-4">
                    <h2 className="font-semibold">Step 1: Select Customer & Warehouse</h2>

                    <div className="relative" ref={comboboxRef}>
          <label className="block text-sm mb-1">Customer</label>
          <input
            placeholder="Search company name..."
            value={dropdownOpen ? customerSearch : (selectedCustomer?.companyName || '')}
            onFocus={() => { setDropdownOpen(true); setCustomerSearch(''); }}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full border p-2 rounded"
          />
          {dropdownOpen && (
            <div className="absolute z-10 w-full border rounded max-h-40 overflow-y-auto bg-white shadow-lg mt-1">
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-gray-400 p-2">No customers match</p>
              )}
              {filteredCustomers.map((c) => (
                <div
                  key={c._id}
                  onClick={() => {
                    setCustomerId(c._id);
                    setCustomerSearch(c.companyName);
                    setDropdownOpen(false);
                  }}
                  className={`p-2 text-sm cursor-pointer hover:bg-gray-50 ${
                    customerId === c._id ? 'bg-blue-50 font-medium' : ''
                  }`}
                >
                  {c.companyName}
                </div>
              ))}
            </div>
          )}
        </div>

            <div>
              <label className="block text-sm mb-1">Warehouse</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Select a warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} — {w.city}</option>
                ))}
              </select>
            </div>

            <button
              disabled={!customerId || !warehouseId}
              onClick={() => setStep(2)}
              className="bg-blue-600 text-white px-4 py-2 rounded self-end disabled:opacity-40"
            >
              Next: Add Items
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold">Step 2: Add Items</h2>

            <div className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => { setSelectedProductId(e.target.value); setStockCheck(null); }}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => { setQuantity(e.target.value); setStockCheck(null); }}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <button
              onClick={checkStockAndAdd}
              disabled={!selectedProductId || !quantity || !unitPrice}
              className="bg-gray-800 text-white px-4 py-2 rounded self-start disabled:opacity-40"
            >
              Add Item
            </button>

            {stockCheck && (
              <p className={`text-sm ${stockCheck.ok ? 'text-green-600' : 'text-red-600'}`}>
                {stockCheck.message}
              </p>
            )}

            {orderItems.length > 0 && (
              <table className="w-full text-sm mt-2">
                <thead className="text-left text-gray-500">
                  <tr><th className="pb-2">Product</th><th className="pb-2">Qty</th><th className="pb-2">Price</th><th className="pb-2">Line Total</th><th></th></tr>
                </thead>
                <tbody>
                  {orderItems.map((item, i) => {
                    const product = products.find((p) => p._id === item.productId);
                    return (
                      <tr key={i} className="border-t">
                        <td className="py-2">{product?.name || item.productId}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">₹{item.unitPrice}</td>
                        <td className="py-2">₹{item.quantity * item.unitPrice}</td>
                        <td className="py-2 text-right">
                          <button onClick={() => removeItem(i)} className="text-red-600 hover:underline text-xs">Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {orderItems.length > 0 && (
              <p className="text-right font-semibold">Running Total: ₹{orderTotal}</p>
            )}

            <div className="flex justify-between mt-2">
              <button onClick={() => setStep(1)} className="border px-4 py-2 rounded">Back</button>
              <button
                disabled={orderItems.length === 0}
                onClick={() => setStep(3)}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-40"
              >
                Next: Review
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold">Step 3: Review & Confirm</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{selectedCustomer?.companyName}</p>
              </div>
              <div>
                <p className="text-gray-500">Warehouse</p>
                <p className="font-medium">{selectedWarehouse?.name} — {selectedWarehouse?.city}</p>
              </div>
            </div>

            <table className="w-full text-sm mt-2">
              <thead className="text-left text-gray-500">
                <tr><th className="pb-2">Product</th><th className="pb-2">Qty</th><th className="pb-2">Price</th><th className="pb-2">Line Total</th></tr>
              </thead>
              <tbody>
                {orderItems.map((item, i) => {
                  const product = products.find((p) => p._id === item.productId);
                  return (
                    <tr key={i} className="border-t">
                      <td className="py-2">{product?.name || item.productId}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">₹{item.unitPrice}</td>
                      <td className="py-2">₹{item.quantity * item.unitPrice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p className="text-right font-semibold text-lg border-t pt-3">Total: ₹{orderTotal}</p>

            <div className="flex justify-between mt-2">
              <button onClick={() => setStep(2)} className="border px-4 py-2 rounded" disabled={submitting}>
                Back
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default CreateOrder;