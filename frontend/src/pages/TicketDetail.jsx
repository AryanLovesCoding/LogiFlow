import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const NEXT_STATUS = {
  Open: 'In-Progress',
  'In-Progress': 'Resolved',
  Resolved: 'Closed',
};

function TicketDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTicket = useCallback(() => {
    api.get('/tickets').then((res) => {
      const found = res.data.tickets.find((t) => t._id === id);
      setTicket(found);
    });
  }, [id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  useEffect(() => {
    if (user.role === 'Administrator') {
      api.get('/auth/users').then((res) => setUsers(res.data.users));
    }
  }, [user.role]);

  const nextStatus = ticket ? NEXT_STATUS[ticket.status] : null;

  const advanceStatus = async () => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${id}/status`, { status: nextStatus });
      addToast(`Ticket marked ${nextStatus}`, 'success');
      fetchTicket();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const assignTicket = async (assigneeId) => {
    if (!assigneeId) return;
    setUpdating(true);
    try {
      await api.put(`/tickets/${id}/assign`, { assigneeId });
      addToast('Ticket assigned', 'success');
      fetchTicket();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setUpdating(true);
    try {
      await api.post(`/tickets/${id}/comment`, { content: comment });
      setComment('');
      fetchTicket();
    } catch (error) {
      addToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/tickets" className="text-blue-600 hover:underline text-sm">&larr; Back to Tickets</Link>
      <h1 className="text-xl font-bold mt-2 mb-4">{ticket.title}</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm mb-1">Description</p>
            <p>{ticket.description}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">Comments</h2>
            {ticket.comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet</p>}
            <div className="flex flex-col gap-3">
              {ticket.comments.map((c, i) => (
                <div key={i} className="border-l-2 border-gray-300 pl-3">
                  <p className="text-sm">{c.content}</p>
                  <p className="text-xs text-gray-400">{new Date(c.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} className="flex gap-2 mt-4 pt-4 border-t">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment"
                className="flex-1 border p-2 rounded"
              />
              <button disabled={updating} className="bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50">
                Post
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
          <div>
            <p className="text-gray-500 text-sm">Priority</p>
            <p>{ticket.priority}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <p>{ticket.status}</p>
          </div>

          {nextStatus && (
            <button disabled={updating} onClick={advanceStatus} className="bg-blue-600 text-white p-2 rounded disabled:opacity-50">
              Mark {nextStatus}
            </button>
          )}

          {user.role === 'Administrator' && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Assign To</p>
              <select
                defaultValue={ticket.assigneeId || ''}
                onChange={(e) => assignTicket(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Unassigned --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TicketDetail;