import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

function WarehouseDetail() {
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    api.get(`/warehouses/${id}`).then((res) => setWarehouse(res.data.warehouse));
    api.get('/inventory', { params: { warehouseId: id, limit: 50 } }).then((res) => setInventory(res.data.inventory));
  }, [id]);

  if (!warehouse) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/warehouses" className="text-blue-600 hover:underline text-sm">&larr; Back to Warehouses</Link>
      <h1 className="text-xl font-bold mt-2 mb-4">{warehouse.name}</h1>

      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-3 mb-6">
        <div><p className="text-gray-500 text-sm">City</p><p>{warehouse.city}</p></div>
        <div><p className="text-gray-500 text-sm">Location</p><p>{warehouse.location || '—'}</p></div>
        <div><p className="text-gray-500 text-sm">Capacity</p><p>{warehouse.totalCapacity}</p></div>
        <div><p className="text-gray-500 text-sm">Status</p><p>{warehouse.status}</p></div>
      </div>

      <h2 className="font-semibold mb-2">Inventory in this Warehouse</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Product ID</th><th className="p-3">Quantity</th><th className="p-3">Threshold</th><th className="p-3">Alert</th></tr>
          </thead>
          <tbody>
            {inventory.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-400">No inventory records</td></tr>}
            {inventory.map((inv) => (
              <tr key={inv._id} className="border-t">
                <td className="p-3">{inv.productId}</td>
                <td className="p-3">{inv.quantity}</td>
                <td className="p-3">{inv.reorderThreshold}</td>
                <td className="p-3">{inv.lowStockAlert ? <span className="text-red-600">Low</span> : <span className="text-green-600">OK</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default WarehouseDetail;