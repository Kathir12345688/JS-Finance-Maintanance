import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { fetchCustomers } from '../../services/customers';
import { downloadCsv } from '../../utils/exportData';
import { normalizeListResponse } from '../../utils/apiHelpers';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
};

const getAvatarColor = (name) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const generateAvatarSvg = (name, size = 40) => {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${color}"/>
    <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="${size / 2}" font-weight="bold" fill="white" font-family="Arial">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function OwnerCustomers() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionTypeFilter, setCollectionTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 10;

  const defaultAvatar = 'https://via.placeholder.com/40?text=AV';

  const handleExport = () => {
    if (!customers.length) {
      showToast('No customers to export.', 'warning');
      return;
    }

    const rows = [
      ['Photo', 'Name', 'Phone', 'Type', 'Opening Balance', 'Current Balance', 'Outstanding Amount', 'Expected Collection', 'Status'],
      ...customers.map((customer) => [
        customer.photo || 'No Photo',
        customer.name,
        customer.phone,
        customer.collection_type,
        customer.opening_balance,
        customer.current_balance,
        customer.outstanding_amount,
        customer.expected_collection_amount,
        customer.is_active ? 'Active' : 'Closed',
      ]),
    ];

    downloadCsv('customers.csv', rows);
    showToast('Customer export ready.', 'success');
  };

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (collectionTypeFilter) params.collection_type = collectionTypeFilter;
        if (statusFilter) params.status = statusFilter;

        const response = await fetchCustomers(params);
        setCustomers(normalizeListResponse(response));
        setCurrentPage(1);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load customers.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, collectionTypeFilter, statusFilter, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Customers</h2>
          <p className="text-muted">Manage all customers and their collections.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-secondary" onClick={handleRefresh}>
            Refresh
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={handleExport}>
            Export Customers
          </button>
          <Link to="/owner/add-customer" className="btn btn-primary">
            Add Customer
          </Link>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={collectionTypeFilter}
                onChange={(e) => setCollectionTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
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
      ) : paginatedCustomers.length === 0 ? (
        <div className="alert alert-info">No customers found.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Opening Balance</th>
                  <th>Current Balance</th>
                  <th>Outstanding</th>
                  <th>Expected Collection</th>
                  <th>Loan Date</th>
                  <th>Last Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <img
                        src={customer.photo || generateAvatarSvg(customer.name, 40)}
                        alt={customer.name}
                        className="rounded-circle"
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-semibold">{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span
                        className={`badge ${
                          customer.collection_type?.toLowerCase() === 'daily' ? 'bg-info' : 'bg-warning'
                        }`}
                      >
                        {customer.collection_type
                          ? customer.collection_type.charAt(0).toUpperCase() + customer.collection_type.slice(1)
                          : '-'}
                      </span>
                    </td>
                    <td>{formatCurrency(customer.opening_balance)}</td>
                    <td>{formatCurrency(customer.current_balance)}</td>
                    <td className="text-danger fw-semibold">
                      {formatCurrency(customer.due_amount || customer.outstanding_amount)}
                    </td>
                    <td>{formatCurrency(customer.expected_collection_amount)}</td>
                    <td>{formatDate(customer.loan_date)}</td>
                    <td>{formatDate(customer.last_payment_date)}</td>
                    <td>
                      <span
                        className={`badge ${
                          customer.is_active ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {customer.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <Link
                          to={`/owner/customers/${customer.id}`}
                          className="btn btn-outline-info"
                          title="View"
                        >
                          View
                        </Link>
                        <Link
                          to={`/owner/edit-customer/${customer.id}`}
                          className="btn btn-outline-primary"
                          title="Edit"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
