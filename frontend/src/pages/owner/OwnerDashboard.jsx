import { useEffect, useState } from 'react';
import { fetchDashboardSummary, fetchDailyReport, fetchWeeklyReport, fetchMonthlyReport, fetchOutstandingReport } from '../../services/reports';
import { fetchCustomers } from '../../services/customers';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0);

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [outstanding, setOutstanding] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [summaryRes, customersRes, dailyRes, weeklyRes, monthlyRes, outstandingRes] = await Promise.all([
          fetchDashboardSummary(),
          fetchCustomers(),
          fetchDailyReport(),
          fetchWeeklyReport(),
          fetchMonthlyReport(),
          fetchOutstandingReport(),
        ]);

        setSummary(summaryRes.data);
        setCustomers(customersRes.data.results || customersRes.data || []);
        setDaily(dailyRes.data);
        setWeekly(weeklyRes.data);
        setMonthly(monthlyRes.data);
        setOutstanding(outstandingRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((customer) =>
    customer.status?.toString().toLowerCase() === 'active' || customer.is_active === true,
  ).length;
  const closedCustomers = customers.filter((customer) =>
    customer.status?.toString().toLowerCase() === 'closed' || customer.is_active === false,
  ).length;
  const dailyCustomers = customers.filter((customer) => customer.collection_type === 'Daily').length;
  const weeklyCustomers = customers.filter((customer) => customer.collection_type === 'Weekly').length;
  const outstandingCustomers = outstanding?.customers_with_outstanding?.length || 0;

  const cards = [
    { label: 'Total Customers', value: formatNumber(totalCustomers), variant: 'primary' },
    { label: 'Daily Customers', value: formatNumber(summary?.daily_customers || dailyCustomers), variant: 'info' },
    { label: 'Weekly Customers', value: formatNumber(summary?.weekly_customers || weeklyCustomers), variant: 'warning' },
    { label: 'Total Current Balance', value: formatCurrency(summary?.total_current_balance || 0), variant: 'success' },
    { label: 'Total Outstanding Amount', value: formatCurrency(summary?.total_outstanding || 0), variant: 'danger' },
    { label: "Today's Collection", value: formatCurrency(summary?.todays_collection || 0), variant: 'dark' },
    { label: 'Monthly Collection', value: formatCurrency(summary?.monthly_collection || 0), variant: 'dark' },
  ];

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Owner Dashboard</h2>
        <p className="text-muted">Overview of customers, collections, and outstanding balances.</p>
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
        <div className="row g-4">
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
      )}
    </div>
  );
}
