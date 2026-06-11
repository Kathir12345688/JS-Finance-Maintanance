import { useEffect, useState } from 'react';
import { fetchMonthlyReport } from '../../services/reports';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

export default function OwnerMonthlyReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState({});
  const [filters, setFilters] = useState({ from_date: '', to_date: '', worker: '', collection_type: '' });

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchMonthlyReport(filters);
        setReport(response.data || {});
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load monthly report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [filters]);

  const topWorker = report.top_performing_worker || {};

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Monthly Report</h2>
        <p className="text-muted">Monthly collection overview including mode-specific and outstanding summaries.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <label className="form-label">From</label>
          <input type="date" className="form-control" name="from_date" value={filters.from_date} onChange={(e) => setFilters((prev) => ({ ...prev, from_date: e.target.value }))} />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">To</label>
          <input type="date" className="form-control" name="to_date" value={filters.to_date} onChange={(e) => setFilters((prev) => ({ ...prev, to_date: e.target.value }))} />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Worker</label>
          <input type="text" className="form-control" name="worker" value={filters.worker} onChange={(e) => setFilters((prev) => ({ ...prev, worker: e.target.value }))} placeholder="Worker name or ID" />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Collection Type</label>
          <select className="form-select" name="collection_type" value={filters.collection_type} onChange={(e) => setFilters((prev) => ({ ...prev, collection_type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {[
              { title: 'Monthly Collection', value: report.monthly_collection },
              { title: 'Cash Summary', value: report.cash_summary },
              { title: 'GPay Summary', value: report.gpay_summary },
              { title: 'PhonePe Summary', value: report.phonepe_summary },
              { title: 'Outstanding Balance', value: report.outstanding_balance },
            ].map((item) => (
              <div className="col-12 col-md-4 col-xl-2" key={item.title}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-2">{item.title}</p>
                    <h5>{formatCurrency(item.value)}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-light">Top Performing Worker</div>
            <div className="card-body">
              {topWorker.worker_id ? (
                <div>
                  <h5 className="mb-2">{topWorker.worker_name || 'Worker'}</h5>
                  <p className="mb-1">Collected {formatCurrency(topWorker.amount_collected)}</p>
                </div>
              ) : (
                <p className="text-muted mb-0">No worker performance data available for the selected range.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
