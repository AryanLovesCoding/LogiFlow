import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import RestockModal from '../components/RestockModal';
import InventoryFormModal from '../components/InventoryFormModal';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouseMap, setWarehouseMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restockTarget, setRestockTarget] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    api.get('/warehouses', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.warehouses.forEach((w) => { map[w._id] = w.name; });
      setWarehouseMap(map);
    });
    api.get('/products', { params: { limit: 100 } }).then((res) => {
      const map = {};
      res.data.products.forEach((p) => { map[p._id] = p.name; });
      setProductMap(map);
    });
  }, []);

  const fetchInventory = useCallback(() => {
    const params = { page };
    if (lowStockOnly) params.lowStockAlert = 'true';
    api.get('/inventory', { params })
      .then((res) => {
        setInventory(res.data.inventory);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, lowStockOnly]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const badgeClass = (inv) => {
    if (inv.quantity < inv.reorderThreshold) return 'bg-red-100 text-red-700';
    if (inv.quantity === inv.reorderThreshold) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Inventory</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            + Add Inventory
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => { setLoading(true); setPage(1); setLowStockOnly(e.target.checked); }}
            />
            Low-stock only
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Product</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Threshold</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>}
            {!loading && inventory.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-400">No inventory records</td></tr>
            )}
            {inventory.map((inv) => (
              <tr key={inv._id} className="border-t">
                <td className="p-3">{warehouseMap[inv.warehouseId] || inv.warehouseId}</td>
                <td className="p-3">{productMap[inv.productId] || inv.productId}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${badgeClass(inv)}`}>{inv.quantity}</span>
                </td>
                <td className="p-3">{inv.reorderThreshold}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setRestockTarget(inv)} className="text-blue-600 hover:underline">Restock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {restockTarget && (
        <RestockModal inventory={restockTarget} onClose={() => setRestockTarget(null)} onSaved={fetchInventory} />
      )}

      {addModalOpen && (
        <InventoryFormModal onClose={() => setAddModalOpen(false)} onSaved={fetchInventory} />
      )}
    </div>
  );
}
export default Inventory;