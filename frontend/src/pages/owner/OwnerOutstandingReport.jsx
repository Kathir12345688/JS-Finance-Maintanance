import { useEffect, useState } from 'react';
import { fetchOutstandingReport } from '../../services/reports';
import { Link } from 'react-router-dom';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

export default function OwnerOutstandingReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchOutstandingReport();
        setCustomers(response.data?.customers_with_outstanding || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load outstanding report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Outstanding Report</h2>
        <p className="text-muted">View all customers with current balance and outstanding amounts.</p>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : paginatedCustomers.length === 0 ? (
        <div className="alert alert-success">No outstanding customers found.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Customer Name</th>
                  <th>Current Balance</th>
                  <th>Outstanding</th>
                  <th>Collection Type</th>
                  <th>Assigned Worker</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.customer_id || customer.id}>
                    <td className="fw-semibold">{customer.customer_name || customer.name}</td>
                    <td>{formatCurrency(customer.current_balance)}</td>
                    <td className="text-danger fw-semibold">{formatCurrency(customer.outstanding_amount)}</td>
                    <td>{customer.collection_type || '-'}</td>
                    <td>{customer.assigned_worker_name || 'Unassigned'}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <Link to={`/owner/customers/${customer.customer_id || customer.id}`} className="btn btn-outline-info">View</Link>
                        <Link to={`/owner/add-payment?customer=${customer.customer_id || customer.id}`} className="btn btn-outline-success">Collect</Link>
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
                  <button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}><button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button></li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
