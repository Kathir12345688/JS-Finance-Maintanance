import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import OwnerLayout from '../components/OwnerLayout';
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import OwnerCustomers from '../pages/owner/OwnerCustomers';
import OwnerDailyCustomers from '../pages/owner/OwnerDailyCustomers';
import OwnerWeeklyCustomers from '../pages/owner/OwnerWeeklyCustomers';
import OwnerAddCustomer from '../pages/owner/OwnerAddCustomer';
import OwnerEditCustomer from '../pages/owner/OwnerEditCustomer';
import OwnerCustomerDetails from '../pages/owner/OwnerCustomerDetails';
import OwnerWorkers from '../pages/owner/OwnerWorkers';
import OwnerAddWorker from '../pages/owner/OwnerAddWorker';
import OwnerWorkerDetails from '../pages/owner/OwnerWorkerDetails';
import OwnerEditWorker from '../pages/owner/OwnerEditWorker';
import OwnerPayments from '../pages/owner/OwnerPayments';
import OwnerAddPayment from '../pages/owner/OwnerAddPayment';
import OwnerPaymentHistory from '../pages/owner/OwnerPaymentHistory';
import OwnerOutstandingCustomers from '../pages/owner/OwnerOutstandingCustomers';
import OwnerDailyDueCustomers from '../pages/owner/OwnerDailyDueCustomers';
import OwnerWeeklyDueCustomers from '../pages/owner/OwnerWeeklyDueCustomers';
import OwnerReportsHome from '../pages/owner/OwnerReportsHome';
import OwnerDailyReport from '../pages/owner/OwnerDailyReport';
import OwnerWeeklyReport from '../pages/owner/OwnerWeeklyReport';
import OwnerMonthlyReport from '../pages/owner/OwnerMonthlyReport';
import OwnerOutstandingReport from '../pages/owner/OwnerOutstandingReport';
import OwnerWorkerPerformanceReport from '../pages/owner/OwnerWorkerPerformanceReport';
import WorkerLayout from '../components/WorkerLayout';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import WorkerCustomers from '../pages/worker/WorkerCustomers';
import AddWorkerCustomer from '../pages/worker/AddWorkerCustomer';
import EditWorkerCustomer from '../pages/worker/EditWorkerCustomer';
import WorkerPayments from '../pages/worker/WorkerPayments';
import WorkerPaymentHistory from '../pages/worker/WorkerPaymentHistory';
import AddWorkerPayment from '../pages/worker/AddWorkerPayment';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute allowedRoles={['owner']} />}>
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="customers" element={<OwnerCustomers />} />
          <Route path="daily-customers" element={<OwnerDailyCustomers />} />
          <Route path="weekly-customers" element={<OwnerWeeklyCustomers />} />
          <Route path="add-customer" element={<OwnerAddCustomer />} />
          <Route path="edit-customer/:id" element={<OwnerEditCustomer />} />
          <Route path="customers/:id" element={<OwnerCustomerDetails />} />
          <Route path="workers" element={<OwnerWorkers />} />
          <Route path="workers/add" element={<OwnerAddWorker />} />
          <Route path="workers/:id" element={<OwnerWorkerDetails />} />
          <Route path="workers/:id/edit" element={<OwnerEditWorker />} />
          <Route path="payments" element={<OwnerPayments />} />
          <Route path="add-payment" element={<OwnerAddPayment />} />
          <Route path="payment-history" element={<OwnerPaymentHistory />} />
          <Route path="outstanding-customers" element={<OwnerOutstandingCustomers />} />
          <Route path="daily-due-customers" element={<OwnerDailyDueCustomers />} />
          <Route path="weekly-due-customers" element={<OwnerWeeklyDueCustomers />} />
          <Route path="reports" element={<OwnerReportsHome />} />
          <Route path="reports/daily" element={<OwnerDailyReport />} />
          <Route path="reports/weekly" element={<OwnerWeeklyReport />} />
          <Route path="reports/monthly" element={<OwnerMonthlyReport />} />
          <Route path="reports/outstanding" element={<OwnerOutstandingReport />} />
          <Route path="reports/worker-performance" element={<OwnerWorkerPerformanceReport />} />
        </Route>
      </Route>

      <Route element={<PrivateRoute allowedRoles={['worker']} />}> 
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="customers" element={<WorkerCustomers />} />
          <Route path="add-customer" element={<AddWorkerCustomer />} />
          <Route path="edit-customer/:id" element={<EditWorkerCustomer />} />
          <Route path="payments" element={<WorkerPayments />} />
          <Route path="payments/add" element={<AddWorkerPayment />} />
          <Route path="history" element={<WorkerPaymentHistory />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
