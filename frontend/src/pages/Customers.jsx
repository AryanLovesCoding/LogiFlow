import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import CustomerFormModal from '../components/CustomerFormModal';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchCustomers = useCallback(() => {
    api.get('/customers', { params: { companyName: search || undefined, status: status || undefined, page } })
      .then((res) => {
        setCustomers(res.data.customers);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Customers</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Customer
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search by company name..."
          value={search}
          onChange={(e) => { setLoading(true); setPage(1); setSearch(e.target.value); }}
          className="border p-2 rounded w-64"
        />
        <select
          value={status}
          onChange={(e) => { setLoading(true); setPage(1); setStatus(e.target.value); }}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>}
            {!loading && customers.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-400">No customers found</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-3">
                  <Link to={`/customers/${c._id}`} className="text-blue-600 hover:underline">{c.companyName}</Link>
                </td>
                <td className="p-3">{c.contactPersonName}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${c.accountStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {c.accountStatus}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(c); setModalOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {modalOpen && (
        <CustomerFormModal customer={editing} onClose={() => setModalOpen(false)} onSaved={fetchCustomers} />
      )}
    </div>
  );
}
export default Customers;