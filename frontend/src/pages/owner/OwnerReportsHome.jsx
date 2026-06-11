import { Link } from 'react-router-dom';

export default function OwnerReportsHome() {
  const cards = [
    { title: 'Daily Report', description: 'Today’s collection breakdown and worker/customer trends.', to: '/owner/reports/daily' },
    { title: 'Weekly Report', description: 'Weekly totals, customer groups and outstanding summaries.', to: '/owner/reports/weekly' },
    { title: 'Monthly Report', description: 'Month-level collection and payment mode summaries.', to: '/owner/reports/monthly' },
    { title: 'Outstanding Report', description: 'Customers with current balance and outstanding amounts.', to: '/owner/reports/outstanding' },
    { title: 'Worker Performance', description: 'Worker collection performance and outstanding metrics.', to: '/owner/reports/worker-performance' },
  ];

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Reports</h2>
        <p className="text-muted">Access reporting dashboards for collections, outstanding balances, and worker performance.</p>
      </div>

      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-12 col-md-6 col-xl-4" key={card.to}>
            <Link to={card.to} className="text-decoration-none text-dark">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body">
                  <h5 className="card-title">{card.title}</h5>
                  <p className="card-text text-muted">{card.description}</p>
                  <span className="badge bg-primary">View Report</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
