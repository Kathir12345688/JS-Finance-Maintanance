import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPayments, fetchOutstandingCustomers, fetchDailyDueCustomers, fetchWeeklyDueCustomers } from '../../services/payments';
import { fetchCustomers } from '../../services/customers';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0);

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [dailyDue, setDailyDue] = useState([]);
  const [weeklyDue, setWeeklyDue] = useState([]);

  useEffect(() => {
    const loadWorkerData = async () => {
      setLoading(true);
      setError('');

      try {
        const [customersRes, paymentsRes, outstandingRes, dailyDueRes, weeklyDueRes] = await Promise.all([
          fetchCustomers(),
          fetchPayments({ ordering: '-payment_date,-payment_time', page_size: 5 }),
          fetchOutstandingCustomers(),
          fetchDailyDueCustomers(),
          fetchWeeklyDueCustomers(),
        ]);

        const customersData = Array.isArray(customersRes.data) ? customersRes.data : customersRes.data.results || [];
        setCustomers(customersData);
        const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data.results || [];
        setPayments(paymentsData);
        setOutstanding(outstandingRes.data || []);
        setDailyDue(dailyDueRes.data || []);
        setWeeklyDue(weeklyDueRes.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load worker dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadWorkerData();
  }, []);

  const totalAssigned = customers.length;
  const dailyCount = customers.filter((customer) => customer.collection_type === 'Daily').length;
  const weeklyCount = customers.filter((customer) => customer.collection_type === 'Weekly').length;
  const outstandingCount = outstanding.length;
  const todayCollection = payments.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0);

  const cards = [
    { label: 'Total Assigned Customers', value: formatNumber(totalAssigned), variant: 'primary' },
    { label: 'Daily Customers', value: formatNumber(dailyCount), variant: 'info' },
    { label: 'Weekly Customers', value: formatNumber(weeklyCount), variant: 'warning' },
    { label: "Today's Collection", value: formatCurrency(todayCollection), variant: 'success' },
    { label: 'Outstanding Customers', value: formatNumber(outstandingCount), variant: 'danger' },
  ];

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h2 className="mb-1">Worker Dashboard</h2>
            <p className="text-muted mb-0">Your assigned customer and payment summary.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/worker/payments/add')}>
            Quick Add Payment
          </button>
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
      ) : (
        <>
          <div className="row g-4 mb-4">
            {cards.map((card) => (
              <div key={card.label} className="col-12 col-md-6 col-xl-4">
                <div className={`card border-${card.variant} shadow-sm h-100`}>
                  <div className="card-body">
                    <h6 className="text-uppercase text-muted mb-3">{card.label}</h6>
                    <div className="display-6 fw-bold">{card.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title mb-3">Assigned Customers</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Balance</th>
                          <th>Outstanding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.slice(0, 5).map((customer) => (
                          <tr key={customer.id}>
                            <td>{customer.name}</td>
                            <td>{customer.collection_type}</td>
                            <td>{formatCurrency(customer.current_balance)}</td>
                            <td>{formatCurrency(customer.due_amount || customer.outstanding_amount)}</td>
                          </tr>
                        ))}
                        {customers.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-4">
                              No assigned customers yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title mb-3">Recent Payments</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.slice(0, 5).map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.customer?.name || payment.customer_name || 'N/A'}</td>
                            <td>{formatCurrency(payment.amount_paid)}</td>
                            <td>{payment.payment_date}</td>
                            <td>{payment.payment_mode}</td>
                          </tr>
                        ))}
                        {payments.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-4">
                              No recent payments available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
