import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchWorker } from '../../services/users';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

export default function OwnerWorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorker = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchWorker(id);
        setWorker(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load worker details.');
      } finally {
        setLoading(false);
      }
    };
    loadWorker();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <Link to="/owner/workers" className="btn btn-outline-secondary btn-sm mb-3">
          Back to Workers
        </Link>
        <h2 className="mb-1">Worker details</h2>
        <p className="text-muted">Review worker profile information.</p>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row gy-3">
            <div className="col-12 col-md-6">
              <label className="text-muted">Name</label>
              <p className="fw-semibold">{worker?.name || '-'}</p>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted">Username</label>
              <p className="fw-semibold">{worker?.username || '-'}</p>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted">Phone</label>
              <p className="fw-semibold">{worker?.phone || '-'}</p>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted">Email</label>
              <p className="fw-semibold">{worker?.email || '-'}</p>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted">Role</label>
              <p className="fw-semibold">{worker?.role || '-'}</p>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted">Status</label>
              <p className="fw-semibold">{worker?.status || (worker.is_active ? 'Active' : 'Inactive')}</p>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted">Created At</label>
              <p className="fw-semibold">{worker?.date_joined ? formatDate(worker.date_joined) : '-'}</p>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2 flex-column flex-sm-row">
            <button type="button" className="btn btn-primary" onClick={() => navigate(`/owner/workers/${id}/edit`)}>
              Edit Worker
            </button>
            <Link to="/owner/workers" className="btn btn-outline-secondary">
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
