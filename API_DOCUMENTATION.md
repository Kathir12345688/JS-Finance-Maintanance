# Finance Management Backend API Documentation

This document describes the available backend API endpoints and examples you can use in Postman.

## Base URL

`http://127.0.0.1:8000`

All API routes are mounted under `/api/` unless otherwise noted.

## Authentication

### 1. Login with username/password

`POST /api/auth/login/`

Headers:
- `Content-Type: application/json`

Body:
```json
{
  "username": "owner1",
  "password": "secret123"
}
```

Response:
```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

---

### 2. Login with phone/password

`POST /api/auth/login-phone/`

Body:
```json
{
  "phone": "+919812345678",
  "password": "secret123"
}
```

Response:
```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>",
  "user": {
    "id": 2,
    "name": "Worker One",
    "username": "worker1",
    "email": "worker1@example.com",
    "role": "worker"
  }
}
```

---

### 3. Register / Request OTP

`POST /api/auth/register/`

Body:
```json
{
  "username": "worker1",
  "phone": "+919812345678"
}
```

Response:
```json
{
  "detail": "OTP sent to your phone."
}
```

---

### 4. Verify OTP and set password

`POST /api/auth/verify-otp/`

Body:
```json
{
  "phone": "+919812345678",
  "code": "123456",
  "password": "newpassword123"
}
```

Response:
```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

---

### 5. Refresh access token

`POST /api/auth/refresh/`

Body:
```json
{
  "refresh": "<refresh_token>"
}
```

Response:
```json
{
  "access": "<new_access_token>"
}
```

---

## Authorization header

For all protected endpoints, add:

`Authorization: Bearer <access_token>`

Use Postman environment variables to store `access_token` and `refresh_token`.

---

## Users

### 1. List users

`GET /api/users/`

Response:
```json
[
  {
    "id": 1,
    "name": "Owner Name",
    "username": "owner1",
    "email": "owner@example.com",
    "role": "owner"
  }
]
```

---

### 2. Get user

`GET /api/users/{id}/`

Example:
`GET /api/users/2/`

Response:
```json
{
  "id": 2,
  "name": "Worker One",
  "username": "worker1",
  "email": "worker1@example.com",
  "role": "worker"
}
```

---

### 3. Create user

`POST /api/users/`

Body:
```json
{
  "name": "Worker Two",
  "username": "worker2",
  "email": "worker2@example.com",
  "password": "pass1234",
  "role": "worker"
}
```

Response:
```json
{
  "id": 3,
  "name": "Worker Two",
  "username": "worker2",
  "email": "worker2@example.com",
  "role": "worker"
}
```

---

### 4. Create worker

`POST /api/users/create_worker/`

Body:
```json
{
  "name": "Worker Three",
  "username": "worker3",
  "email": "worker3@example.com",
  "password": "pass1234"
}
```

Response:
```json
{
  "id": 4,
  "name": "Worker Three",
  "username": "worker3",
  "email": "worker3@example.com",
  "role": "worker"
}
```

---

### 5. Profile

`GET /api/users/profile/`

Response:
```json
{
  "id": 2,
  "name": "Worker One",
  "username": "worker1",
  "email": "worker1@example.com",
  "role": "worker"
}
```

---

### 6. Update profile

`PATCH /api/users/update_profile/`

Body:
```json
{
  "name": "Worker One Updated",
  "email": "worker1@newmail.com"
}
```

Response:
```json
{
  "id": 2,
  "name": "Worker One Updated",
  "username": "worker1",
  "email": "worker1@newmail.com",
  "role": "worker"
}
```

---

### 7. Change password

`POST /api/users/change_password/`

Body:
```json
{
  "old_password": "oldsecret",
  "new_password": "newsecret123"
}
```

Response:
```json
{
  "detail": "Password updated successfully."
}
```

---

### 8. List workers

`GET /api/users/workers/`

Response:
```json
[
  {
    "id": 2,
    "name": "Worker One",
    "username": "worker1",
    "email": "worker1@example.com",
    "role": "worker"
  }
]
```

---

## Locations

### 1. List locations

`GET /api/locations/`

Response:
```json
[
  {
    "id": 1,
    "name": "Chennai",
    "state": "Tamil Nadu"
  }
]
```

---

### 2. Get location

`GET /api/locations/{id}/`

Response:
```json
{
  "id": 1,
  "name": "Chennai",
  "state": "Tamil Nadu"
}
```

---

### 3. Create location

`POST /api/locations/`

Body:
```json
{
  "name": "Coimbatore",
  "state": "Tamil Nadu"
}
```

Response:
```json
{
  "id": 2,
  "name": "Coimbatore",
  "state": "Tamil Nadu"
}
```

---

### 4. Update location

`PATCH /api/locations/{id}/`

Body:
```json
{
  "state": "TN"
}
```

Response:
```json
{
  "id": 2,
  "name": "Coimbatore",
  "state": "TN"
}
```

---

### 5. Delete location

`DELETE /api/locations/{id}/`

Response:
```json
{}
```

---

## Customers

### 1. List customers

`GET /api/customers/`

Response sample:
```json
[
  {
    "id": 1,
    "name": "Customer A",
    "phone": "+919812345678",
    "location": {"id": 1, "name": "Chennai", "state": "Tamil Nadu"},
    "location_id": 1,
    "latitude": "13.0827",
    "longitude": "80.2707",
    "photo": null,
    "collection_type": "daily",
    "daily_collection_amount": "100.00",
    "weekly_collection_amount": "700.00",
    "assigned_worker": 2,
    "opening_balance": "1000.00",
    "current_balance": "900.00",
    "outstanding_amount": "0.00",
    "status": "active",
    "is_deleted": false,
    "last_payment_date": "2026-06-07",
    "total_amount_paid": 100.0,
    "expected_collection_amount": 100.0,
    "created_by": 1,
    "created_by_name": "Owner Name",
    "updated_by": 1,
    "updated_by_name": "Owner Name",
    "is_active": true,
    "created_at": "2026-06-07T12:00:00Z",
    "updated_at": "2026-06-08T10:00:00Z"
  }
]
```

---

### 2. Get customer

`GET /api/customers/{id}/`

Response sample:
```json
{
  "id": 1,
  "name": "Customer A",
  "phone": "+919812345678",
  "location": {"id": 1, "name": "Chennai", "state": "Tamil Nadu"},
  "location_id": 1,
  "latitude": "13.0827",
  "longitude": "80.2707",
  "photo": null,
  "collection_type": "daily",
  "daily_collection_amount": "100.00",
  "weekly_collection_amount": "700.00",
  "assigned_worker": 2,
  "opening_balance": "1000.00",
  "current_balance": "900.00",
  "outstanding_amount": "0.00",
  "status": "active",
  "is_deleted": false,
  "last_payment_date": "2026-06-07",
  "total_amount_paid": 100.0,
  "expected_collection_amount": 100.0,
  "created_by": 1,
  "created_by_name": "Owner Name",
  "updated_by": 1,
  "updated_by_name": "Owner Name",
  "is_active": true,
  "created_at": "2026-06-07T12:00:00Z",
  "updated_at": "2026-06-08T10:00:00Z"
}
```

---

### 3. Create customer

`POST /api/customers/`

Body:
```json
{
  "name": "Customer A",
  "phone": "+919812345678",
  "location_id": 1,
  "latitude": "13.0827",
  "longitude": "80.2707",
  "collection_type": "daily",
  "daily_collection_amount": "100.00",
  "assigned_worker": 2,
  "opening_balance": "1000.00"
}
```

Response sample:
```json
{
  "id": 1,
  "name": "Customer A",
  "phone": "+919812345678",
  "location": {"id": 1, "name": "Chennai", "state": "Tamil Nadu"},
  "location_id": 1,
  "latitude": "13.0827",
  "longitude": "80.2707",
  "photo": null,
  "collection_type": "daily",
  "daily_collection_amount": "100.00",
  "weekly_collection_amount": "700.00",
  "assigned_worker": 2,
  "opening_balance": "1000.00",
  "current_balance": "1000.00",
  "outstanding_amount": "0.00",
  "status": "active",
  "is_deleted": false,
  "last_payment_date": null,
  "total_amount_paid": 0,
  "expected_collection_amount": 100.0,
  "created_by": 1,
  "created_by_name": "Owner Name",
  "updated_by": 1,
  "updated_by_name": "Owner Name",
  "is_active": true,
  "created_at": "2026-06-08T10:00:00Z",
  "updated_at": "2026-06-08T10:00:00Z"
}
```

---

### 4. Update customer

`PATCH /api/customers/{id}/`

Body:
```json
{
  "daily_collection_amount": "150.00"
}
```

Response sample:
```json
{
  "id": 1,
  "name": "Customer A",
  "daily_collection_amount": "150.00",
  "weekly_collection_amount": "1050.00",
  ...
}
```

---

### 5. Delete customer

`DELETE /api/customers/{id}/`

Response:
```json
{}
```

---

## Payments

### 1. List payments

`GET /api/payments/`

Response sample:
```json
[
  {
    "id": 1,
    "customer": 1,
    "worker": 2,
    "amount_paid": "100.00",
    "payment_mode": "cash",
    "payment_date": "2026-06-08",
    "payment_time": "10:30:00",
    "remarks": "Collected today",
    "receipt_number": "RCPT-2026-000001",
    "created_at": "2026-06-08T10:30:00Z",
    "edit_history": []
  }
]
```

---

### 2. Get payment

`GET /api/payments/{id}/`

Response sample:
```json
{
  "id": 1,
  "customer": 1,
  "worker": 2,
  "amount_paid": "100.00",
  "payment_mode": "cash",
  "payment_date": "2026-06-08",
  "payment_time": "10:30:00",
  "remarks": "Collected today",
  "receipt_number": "RCPT-2026-000001",
  "created_at": "2026-06-08T10:30:00Z",
  "edit_history": []
}
```

---

### 3. Create payment

`POST /api/payments/`

Body:
```json
{
  "customer": 1,
  "amount_paid": "100.00",
  "payment_mode": "cash",
  "payment_date": "2026-06-08",
  "payment_time": "10:30:00",
  "remarks": "Collection"
}
```

Response sample:
```json
{
  "id": 2,
  "customer": 1,
  "worker": 2,
  "amount_paid": "100.00",
  "payment_mode": "cash",
  "payment_date": "2026-06-08",
  "payment_time": "10:30:00",
  "remarks": "Collection",
  "receipt_number": "RCPT-2026-000002",
  "created_at": "2026-06-08T11:00:00Z",
  "edit_history": []
}
```

---

### 4. Update payment

`PATCH /api/payments/{id}/`

Body:
```json
{
  "amount_paid": "120.00",
  "remarks": "Adjusted amount"
}
```

Response sample:
```json
{
  "id": 2,
  "customer": 1,
  "worker": 2,
  "amount_paid": "120.00",
  "payment_mode": "cash",
  "payment_date": "2026-06-08",
  "payment_time": "10:30:00",
  "remarks": "Adjusted amount",
  "receipt_number": "RCPT-2026-000002",
  "created_at": "2026-06-08T11:00:00Z",
  "edit_history": [
    {
      "id": 1,
      "previous_amount": "100.00",
      "new_amount": "120.00",
      "edited_by": 2,
      "edited_by_name": "Worker One",
      "edited_at": "2026-06-08T11:10:00Z",
      "note": ""
    }
  ]
}
```

---

### 5. Delete payment

`DELETE /api/payments/{id}/`

Response:
```json
{}
```

---

### 6. Payment history

`GET /api/payments/history/`

Response sample:
```json
[
  {
    "id": 1,
    "customer": 1,
    "worker": 2,
    "amount_paid": "100.00",
    "payment_mode": "cash",
    "payment_date": "2026-06-08",
    "payment_time": "10:30:00",
    "remarks": "Collected today",
    "receipt_number": "RCPT-2026-000001",
    "created_at": "2026-06-08T10:30:00Z",
    "edit_history": []
  }
]
```

---

### 7. Outstanding customers

`GET /api/payments/outstanding_customers/`

Response sample:
```json
[
  {
    "id": 1,
    "name": "Customer A",
    "outstanding_amount": "200.00",
    "collection_type": "weekly",
    "current_balance": "800.00"
  }
]
```

---

### 8. Daily due customers

`GET /api/payments/daily_due_customers/`

Response sample:
```json
[
  {
    "id": 1,
    "name": "Customer A",
    "outstanding_amount": "200.00"
  }
]
```

---

### 9. Weekly due customers

`GET /api/payments/weekly_due_customers/`

Response sample:
```json
[
  {
    "id": 2,
    "name": "Customer B",
    "outstanding_amount": "350.00"
  }
]
```

---

## Reports

All report endpoints require owner role.

### 1. Daily report

`GET /api/reports/daily/`

Optional query params:
- `start_date=YYYY-MM-DD`
- `end_date=YYYY-MM-DD`
- `worker_id=<id>`
- `collection_type=daily|weekly`

Response sample:
```json
{
  "start_date": "2026-06-08",
  "end_date": "2026-06-08",
  "total_collection": 1500.0,
  "cash_collection": 500.0,
  "gpay_collection": 700.0,
  "phonepe_collection": 300.0,
  "worker_collections": [
    {"worker_id": 2, "worker_name": "Worker One", "amount_collected": 900.0}
  ],
  "customer_collections": [
    {"customer_id": 1, "customer_name": "Customer A", "amount_collected": 500.0}
  ]
}
```

---

### 2. Weekly report

`GET /api/reports/weekly/`

Response sample:
```json
{
  "start_date": "2026-06-02",
  "end_date": "2026-06-08",
  "weekly_total_collection": 10500.0,
  "worker_performance": [
    {"worker_id": 2, "worker_name": "Worker One", "amount_collected": 6500.0}
  ],
  "daily_customer_collections": [
    {"payment_date": "2026-06-07", "customer_id": 1, "customer_name": "Customer A", "amount_collected": 500.0}
  ],
  "weekly_customer_collections": [
    {"customer_id": 2, "customer_name": "Customer B", "amount_collected": 1200.0}
  ],
  "outstanding_collections": [
    {"customer_id": 3, "customer_name": "Customer C", "outstanding_amount": 300.0, "collection_type": "weekly", "current_balance": 700.0}
  ]
}
```

---

### 3. Monthly report

`GET /api/reports/monthly/`

Response sample:
```json
{
  "start_date": "2026-05-10",
  "end_date": "2026-06-08",
  "monthly_total_collection": 42000.0,
  "cash_summary": 15000.0,
  "gpay_summary": 17000.0,
  "phonepe_summary": 10000.0,
  "outstanding_balance_summary": 5200.0,
  "top_performing_worker": {
    "worker_id": 2,
    "worker_name": "Worker One",
    "amount_collected": 22000.0
  }
}
```

---

### 4. Outstanding report

`GET /api/reports/outstanding/`

Response sample:
```json
{
  "customers_with_outstanding": [
    {"customer_id": 3, "customer_name": "Customer C", "outstanding_amount": 300.0, "collection_type": "weekly", "current_balance": 700.0}
  ],
  "daily_customers_due": [
    {"id": 1, "name": "Customer A", "outstanding_amount": 200.0}
  ],
  "weekly_customers_due": [
    {"id": 2, "name": "Customer B", "outstanding_amount": 350.0}
  ],
  "total_outstanding_amount": 5200.0
}
```

---

### 5. Worker report

`GET /api/reports/workers/`

Optional query params:
- `start_date=YYYY-MM-DD`
- `end_date=YYYY-MM-DD`
- `worker_id=<id>`

Response sample:
```json
{
  "start_date": "2026-05-10",
  "end_date": "2026-06-08",
  "workers": [
    {
      "worker_id": 2,
      "worker_name": "Worker One",
      "customers_assigned": 15,
      "amount_collected": 22000.0,
      "outstanding_collection": 1200.0,
      "collection_performance": "85.7%"
    }
  ]
}
```

---

### 6. Dashboard summary

`GET /api/reports/dashboard/`

Response sample:
```json
{
  "total_collection": 42000.0,
  "total_outstanding": 5200.0,
  "active_customers": 75,
  "active_workers": 8,
  "recent_payments": [
    {
      "payment_id": 12,
      "customer_id": 1,
      "customer_name": "Customer A",
      "worker_id": 2,
      "worker_name": "Worker One",
      "amount_paid": 100.0,
      "payment_date": "2026-06-08",
      "payment_time": "10:30:00",
      "receipt_number": "RCPT-2026-000012"
    }
  ],
  "recent_customers": [
    {
      "customer_id": 1,
      "customer_name": "Customer A",
      "outstanding_amount": 200.0,
      "current_balance": 800.0,
      "collection_type": "daily"
    }
  ]
}
```

---

### 7. Notifications report

`GET /api/reports/notifications/`

Response sample:
```json
{
  "outstanding_customers": [
    {"customer_id": 3, "customer_name": "Customer C", "outstanding_amount": 300.0, "collection_type": "weekly"}
  ],
  "daily_overdue_customers": [
    {"customer_id": 1, "customer_name": "Customer A", "days_overdue": 2, "outstanding_amount": 200.0}
  ],
  "weekly_overdue_customers": [
    {"customer_id": 2, "customer_name": "Customer B", "days_overdue": 8, "outstanding_amount": 350.0}
  ]
}
```

---

### 8. Export report

`GET /api/reports/export/{report_type}/?format=csv|json`

Supported report types:
- `daily`
- `weekly`
- `monthly`
- `outstanding`
- `dashboard`
- `workers`

Example URL:
`GET /api/reports/export/daily/?format=json`

Response:
- JSON same as the underlying report endpoint
- CSV download when `format=csv`

---

## Postman tips

1. Create an environment with variables:
   - `base_url = http://127.0.0.1:8000`
   - `access_token`
   - `refresh_token`

2. Use `{{base_url}}/api/auth/login/` to request tokens.
3. Set request headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{access_token}}`

4. Use `POST /api/auth/refresh/` to refresh tokens.
5. Use `GET /api/reports/...` only with an owner account.

---

## Quick endpoint reference

- `POST /api/auth/login/`
- `POST /api/auth/login-phone/`
- `POST /api/auth/register/`
- `POST /api/auth/verify-otp/`
- `POST /api/auth/refresh/`
- `GET /api/users/`
- `GET /api/users/{id}/`
- `POST /api/users/`
- `POST /api/users/create_worker/`
- `GET /api/users/profile/`
- `PATCH /api/users/update_profile/`
- `POST /api/users/change_password/`
- `GET /api/users/workers/`
- `GET /api/locations/`
- `GET /api/locations/{id}/`
- `POST /api/locations/`
- `PATCH /api/locations/{id}/`
- `DELETE /api/locations/{id}/`
- `GET /api/customers/`
- `GET /api/customers/{id}/`
- `POST /api/customers/`
- `PATCH /api/customers/{id}/`
- `DELETE /api/customers/{id}/`
- `GET /api/payments/`
- `GET /api/payments/{id}/`
- `POST /api/payments/`
- `PATCH /api/payments/{id}/`
- `DELETE /api/payments/{id}/`
- `GET /api/payments/history/`
- `GET /api/payments/outstanding_customers/`
- `GET /api/payments/daily_due_customers/`
- `GET /api/payments/weekly_due_customers/`
- `GET /api/reports/daily/`
- `GET /api/reports/weekly/`
- `GET /api/reports/monthly/`
- `GET /api/reports/outstanding/`
- `GET /api/reports/workers/`
- `GET /api/reports/dashboard/`
- `GET /api/reports/notifications/`
- `GET /api/reports/export/{report_type}/?format=csv|json`
