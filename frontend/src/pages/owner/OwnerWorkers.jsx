import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { fetchWorkers, deleteWorker } from '../../services/users';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

export default function OwnerWorkers() {
  const { showToast } = useToast();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadWorkers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchWorkers({ role: 'worker' });
        setWorkers(Array.isArray(response.data) ? response.data : response.data.results || []);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load workers.');
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this worker? This cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteWorker(id);
      showToast('Worker deleted successfully.', 'success');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast(err.response?.data?.detail || err.message || 'Unable to delete worker.', 'danger');
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Workers</h2>
          <p className="text-muted">Add, edit, and review worker profiles.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-secondary" onClick={() => setRefreshKey((prev) => prev + 1)}>
            Refresh
          </button>
          <Link to="/owner/workers/add" className="btn btn-primary">
            Add Worker
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : workers.length === 0 ? (
        <div className="alert alert-info">No workers found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Date Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td className="fw-semibold">{worker.name || '-'}</td>
                  <td>{worker.username || '-'}</td>
                  <td>{worker.phone || '-'}</td>
                  <td>{worker.role || '-'}</td>
                  <td>{worker.date_joined ? formatDate(worker.date_joined) : '-'}</td>
                  <td>
                    <span className={`badge ${worker.is_active ? 'bg-success' : 'bg-danger'}`}>
                      {worker.status || (worker.is_active ? 'Active' : 'Inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <Link to={`/owner/workers/${worker.id}`} className="btn btn-outline-info">
                        View
                      </Link>
                      <Link to={`/owner/workers/${worker.id}/edit`} className="btn btn-outline-primary">
                        Edit
                      </Link>
                      <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(worker.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
