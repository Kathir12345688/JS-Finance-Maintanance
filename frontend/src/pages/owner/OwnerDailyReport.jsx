import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';
import { fetchDailyReport } from '../../services/reports';
import { normalizeListResponse } from '../../utils/apiHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

export default function OwnerDailyReport() {
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
        const response = await fetchDailyReport(filters);
        setReport(response.data || {});
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load daily report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'collection_type' ? value.toLowerCase() : value;
    setFilters((prev) => ({ ...prev, [name]: normalizedValue }));
  };

  const workerRows = report.worker_collections || [];
  const customerRows = report.customer_collections || [];

  const workerChart = {
    labels: workerRows.map((item) => item.worker_name || item.worker || 'Worker'),
    datasets: [
      {
        label: 'Collection (₹)',
        data: workerRows.map((item) => item.amount_collected || 0),
        backgroundColor: '#0d6efd',
      },
    ],
  };

  const customerChart = {
    labels: customerRows.map((item) => item.customer_name || item.customer || 'Customer'),
    datasets: [
      {
        label: 'Collection (₹)',
        data: customerRows.map((item) => item.amount_collected || 0),
        backgroundColor: '#198754',
      },
    ],
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Daily Report</h2>
        <p className="text-muted">Today’s collection summary by mode, worker, and customer.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <label className="form-label">From</label>
          <input type="date" className="form-control" name="from_date" value={filters.from_date} onChange={handleFilterChange} />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">To</label>
          <input type="date" className="form-control" name="to_date" value={filters.to_date} onChange={handleFilterChange} />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Worker</label>
          <select name="worker" className="form-select" value={filters.worker} onChange={handleFilterChange}>
            <option value="">All Workers</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>{worker.name || worker.username}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Collection Type</label>
          <select name="collection_type" className="form-select" value={filters.collection_type} onChange={handleFilterChange}>
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
              { title: 'Total Collection', value: report.total_collection },
              { title: 'Cash Collection', value: report.cash_collection },
              { title: 'GPay Collection', value: report.gpay_collection },
              { title: 'PhonePe Collection', value: report.phonepe_collection },
            ].map((item) => (
              <div className="col-12 col-md-3" key={item.title}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-2">{item.title}</p>
                    <h4>{formatCurrency(item.value)}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-light">Worker-wise Collection</div>
                <div className="card-body">
                  <Bar data={workerChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-light">Customer-wise Collection</div>
                <div className="card-body">
                  <Line data={customerChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Worker</th>
                  <th>Collection (₹)</th>
                  <th>Customer</th>
                  <th>Collection (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Math.max(workerRows.length, customerRows.length) === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">No data available for selected filters.</td></tr>
                ) : Array.from({ length: Math.max(workerRows.length, customerRows.length) }).map((_, index) => (
                  <tr key={index}>
                    <td>{workerRows[index]?.worker_name || workerRows[index]?.name || '-'}</td>
                    <td>{formatCurrency(workerRows[index]?.amount_collected || workerRows[index]?.total_collection)}</td>
                    <td>{customerRows[index]?.customer_name || customerRows[index]?.name || '-'}</td>
                    <td>{formatCurrency(customerRows[index]?.amount_collected || customerRows[index]?.total_collection)}</td>
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
