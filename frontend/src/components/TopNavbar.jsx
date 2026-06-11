export default function TopNavbar({ onToggleSidebar, user }) {
  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-3 py-2 shadow-sm">
      <div className="container-fluid">
        <button type="button" className="btn btn-outline-secondary d-xl-none me-2" onClick={onToggleSidebar}>
          Menu
        </button>
        <div className="navbar-brand mb-0 h5">JS Finance Management</div>
        <div className="d-flex align-items-center ms-auto">
          <div className="text-end">
            <div className="fw-semibold">{user?.name || 'Owner'}</div>
            <div className="text-muted small">Owner Dashboard</div>
          </div>
        </div>
      </div>
    </header>
  );
}
