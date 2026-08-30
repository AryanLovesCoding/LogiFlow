import { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import Pagination from '../components/Pagination';
import TicketFormModal from '../components/TicketFormModal';

function Tickets() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTickets = useCallback(() => {
    api.get('/tickets', { params: { status: status || undefined, priority: priority || undefined, page } })
      .then((res) => {
        const list = assignedToMe ? res.data.tickets.filter((t) => t.assigneeId === user.id) : res.data.tickets;
        setTickets(list);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, priority, page, assignedToMe, user.id]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const priorityBadge = (p) => {
    const colors = {
      Low: 'bg-gray-200 text-gray-700',
      Medium: 'bg-blue-100 text-blue-700',
      High: 'bg-orange-100 text-orange-700',
      Critical: 'bg-red-100 text-red-700',
    };
    return colors[p] || 'bg-gray-200 text-gray-700';
  };

  const statusBadge = (s) => {
    const colors = {
      Open: 'bg-yellow-100 text-yellow-700',
      'In-Progress': 'bg-blue-100 text-blue-700',
      Resolved: 'bg-green-100 text-green-700',
      Closed: 'bg-gray-200 text-gray-600',
    };
    return colors[s] || 'bg-gray-200 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Support Tickets</h1>
        <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Create Ticket
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={status} onChange={(e) => { setLoading(true); setPage(1); setStatus(e.target.value); }} className="border p-2 rounded">
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select value={priority} onChange={(e) => { setLoading(true); setPage(1); setPriority(e.target.value); }} className="border p-2 rounded">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <label className="flex items-center gap-2 border p-2 rounded cursor-pointer">
          <input type="checkbox" checked={assignedToMe} onChange={(e) => setAssignedToMe(e.target.checked)} />
          Assigned to me
        </label>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>}
            {!loading && tickets.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-gray-400">No tickets found</td></tr>
            )}
            {tickets.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="p-3">
                  <Link to={`/tickets/${t._id}`} className="text-blue-600 hover:underline">{t.title}</Link>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${priorityBadge(t.priority)}`}>{t.priority}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusBadge(t.status)}`}>{t.status}</span>
                </td>
                <td className="p-3">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p); }} />

      {modalOpen && (
        <TicketFormModal onClose={() => setModalOpen(false)} onSaved={fetchTickets} />
      )}
    </div>
  );
}
export default Tickets;