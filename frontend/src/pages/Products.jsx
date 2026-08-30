import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ProductFormModal from '../components/ProductFormModal';

function Products() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchProducts = useCallback(() => {
    api.get('/products', { params: { name: search || undefined, category: category || undefined, page } })
      .then((res) => {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Products</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Product
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setLoading(true); setPage(1); setSearch(e.target.value); }}
          className="border p-2 rounded w-64"
        />
        <input
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => { setLoading(true); setPage(1); setCategory(e.target.value); }}
          className="border p-2 rounded"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>}
            {!loading && products.length === 0 && (
              <tr><td colSpan="6" className="p-4 text-center text-gray-400">No products found</td></tr>
            )}
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.unit}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(p); setModalOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {modalOpen && (
        <ProductFormModal product={editing} onClose={() => setModalOpen(false)} onSaved={fetchProducts} />
      )}
    </div>
  );
}
export default Products;