import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';
import { fetchWorkerPerformanceReport } from '../../services/reports';
import { normalizeListResponse } from '../../utils/apiHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

export default function OwnerWorkerPerformanceReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState({});
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ from_date: '', to_date: '', worker: '', collection_type: '' });

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const response = await api.get('/users/', { params: { role: 'worker' } });
        setWorkers(normalizeListResponse(response));
      } catch (err) {
        console.error('Unable to load workers');
      }
    };
    loadWorkers();
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchWorkerPerformanceReport(filters);
        setReport(response.data || {});
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load worker performance report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [filters]);

  const records = report.workers || [];
  const totalAssigned = records.reduce((sum, item) => sum + (item.customers_assigned || 0), 0);
  const totalCollected = records.reduce((sum, item) => sum + (item.amount_collected || 0), 0);
  const totalOutstanding = records.reduce((sum, item) => sum + (item.outstanding_collection || 0), 0);
  const chartData = {
    labels: records.map((item) => item.worker_name || item.name || 'Worker'),
    datasets: [
      {
        label: 'Total Collection',
        data: records.map((item) => item.amount_collected || 0),
        backgroundColor: '#0d6efd',
      },
      {
        label: 'Outstanding',
        data: records.map((item) => item.outstanding_collection || 0),
        backgroundColor: '#dc3545',
      },
    ],
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Worker Performance Report</h2>
        <p className="text-muted">Review worker collection performance and outstanding amounts.</p>
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
          <select className="form-select" name="worker" value={filters.worker} onChange={(e) => setFilters((prev) => ({ ...prev, worker: e.target.value }))}>
            <option value="">All Workers</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>{worker.name || worker.username}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Collection Type</label>
          <select className="form-select" name="collection_type" value={filters.collection_type} onChange={(e) => setFilters((prev) => ({ ...prev, collection_type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
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
              { title: 'Total Workers', value: records.length, renderCurrency: false },
              { title: 'Assigned Customers', value: totalAssigned, renderCurrency: false },
              { title: 'Total Collection', value: totalCollected, renderCurrency: true },
              { title: 'Outstanding Collection', value: totalOutstanding, renderCurrency: true },
            ].map((item) => (
              <div className="col-12 col-md-6 col-xl-3" key={item.title}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-2">{item.title}</p>
                    <h5>{item.renderCurrency ? formatCurrency(item.value) : item.value}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">Worker Collection Performance</div>
            <div className="card-body">
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Worker</th>
                  <th>Assigned Customers</th>
                  <th>Total Collection</th>
                  <th>Outstanding</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No performance records available.</td></tr>
                ) : records.map((worker) => (
                  <tr key={worker.worker_id || worker.id || worker.worker_name || worker.name}>
                    <td>{worker.worker_name || worker.name || '-'}</td>
                    <td>{worker.assigned_customers || worker.customers_assigned || 0}</td>
                    <td>{formatCurrency(worker.total_collection || worker.collection_total)}</td>
                    <td>{formatCurrency(worker.outstanding_collection || worker.outstanding || 0)}</td>
                    <td>{worker.performance_percentage ? `${worker.performance_percentage}%` : worker.performance_index ? `${worker.performance_index}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
