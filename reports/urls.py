from django.urls import path

from .views import (
    DailyReportView,
    WeeklyReportView,
    MonthlyReportView,
    OutstandingReportView,
    WorkerReportView,
    DashboardSummaryView,
    NotificationsReportView,
    ExportReportView,
)

urlpatterns = [
    path('daily/', DailyReportView.as_view(), name='reports-daily'),
    path('weekly/', WeeklyReportView.as_view(), name='reports-weekly'),
    path('monthly/', MonthlyReportView.as_view(), name='reports-monthly'),
    path('outstanding/', OutstandingReportView.as_view(), name='reports-outstanding'),
    path('workers/', WorkerReportView.as_view(), name='reports-workers'),
    path('worker-performance/', WorkerReportView.as_view(), name='reports-worker-performance'),
    path('dashboard/', DashboardSummaryView.as_view(), name='reports-dashboard'),
    path('notifications/', NotificationsReportView.as_view(), name='reports-notifications'),
    path('export/<str:report_type>/', ExportReportView.as_view(), name='reports-export'),
]
