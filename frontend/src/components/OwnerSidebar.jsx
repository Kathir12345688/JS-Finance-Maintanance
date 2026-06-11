import { NavLink } from 'react-router-dom';

export default function OwnerSidebar({ onNavigate, onLogout }) {
  const itemClass = ({ isActive }) =>
    `nav-link text-dark ps-4 ${isActive ? 'fw-bold text-primary' : 'text-secondary'}`;

  const categoryClass = 'nav-link text-dark fw-semibold ps-3 mb-2';

  return (
    <div className="owner-sidebar-menu d-flex flex-column h-100 p-3">
      <div className="mb-4">
        <h5 className="mb-1">Owner Panel</h5>
        <p className="text-muted mb-0">Manage JS finance operations</p>
      </div>

      <nav className="nav nav-pills flex-column gap-1">
        <NavLink to="/owner/dashboard" className={itemClass} onClick={onNavigate}>
          📊 Dashboard
        </NavLink>

        <div className={categoryClass}>
          👥 Customers
        </div>
        <NavLink to="/owner/customers" className={itemClass} onClick={onNavigate}>
          All Customers
        </NavLink>
        <NavLink to="/owner/daily-customers" className={itemClass} onClick={onNavigate}>
          Daily Customers
        </NavLink>
        <NavLink to="/owner/weekly-customers" className={itemClass} onClick={onNavigate}>
          Weekly Customers
        </NavLink>

        <div className={categoryClass}>
          💰 Payments
        </div>
        <NavLink to="/owner/payments" className={itemClass} onClick={onNavigate}>
          All Payments
        </NavLink>
        <NavLink to="/owner/add-payment" className={itemClass} onClick={onNavigate}>
          Record Payment
        </NavLink>
        <NavLink to="/owner/payment-history" className={itemClass} onClick={onNavigate}>
          Payment History
        </NavLink>
        <NavLink to="/owner/outstanding-customers" className={itemClass} onClick={onNavigate}>
          Outstanding
        </NavLink>
        <NavLink to="/owner/daily-due-customers" className={itemClass} onClick={onNavigate}>
          Daily Due
        </NavLink>
        <NavLink to="/owner/weekly-due-customers" className={itemClass} onClick={onNavigate}>
          Weekly Due
        </NavLink>

        <div className={categoryClass}>
          👷 Workers
        </div>
        <NavLink to="/owner/workers" className={itemClass} onClick={onNavigate}>
          Workers
        </NavLink>

        <div className={categoryClass}>
          📈 Reports
        </div>
        <NavLink to="/owner/reports" className={itemClass} onClick={onNavigate}>
          Reports Home
        </NavLink>
        <NavLink to="/owner/reports/daily" className={itemClass} onClick={onNavigate}>
          Daily Report
        </NavLink>
        <NavLink to="/owner/reports/weekly" className={itemClass} onClick={onNavigate}>
          Weekly Report
        </NavLink>
        <NavLink to="/owner/reports/monthly" className={itemClass} onClick={onNavigate}>
          Monthly Report
        </NavLink>
        <NavLink to="/owner/reports/outstanding" className={itemClass} onClick={onNavigate}>
          Outstanding Report
        </NavLink>
        <NavLink to="/owner/reports/worker-performance" className={itemClass} onClick={onNavigate}>
          Worker Performance
        </NavLink>
      </nav>

      <div className="mt-auto pt-4">
        <button type="button" className="btn btn-danger w-100" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
