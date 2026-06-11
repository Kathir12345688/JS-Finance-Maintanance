# Finance Management Backend

A Django REST Framework backend for a finance collection management system with JWT authentication, role-based access control, PostgreSQL support, and CORS configuration.

## Project structure

- `manage.py` - Django CLI entrypoint
- `finance_management/` - core Django project package
- `users/` - custom user model, JWT auth, role support
- `customers/` - customer records and collection plans
- `payments/` - payment recording and balance updates
- `reports/` - owner reporting endpoints

## Requirements

- Python 3.11+ or compatible Python 3.x
- PostgreSQL

## Setup

1. Create and activate a Python virtual environment:

```powershell
cd "c:\Users\acer\OneDrive\Desktop\JS finance project\finance_management"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

3. Configure PostgreSQL connection.

Set the following environment variables, or update `finance_management/finance_management/settings.py` directly:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `DJANGO_SECRET_KEY`

Example in PowerShell:

```powershell
$env:POSTGRES_DB = 'finance_db'
$env:POSTGRES_USER = 'finance_user'
$env:POSTGRES_PASSWORD = 'your_secret_password'
$env:POSTGRES_HOST = 'localhost'
$env:POSTGRES_PORT = '5432'
$env:DJANGO_SECRET_KEY = 'replace_this_with_a_secure_key'
```

4. Apply migrations:

```powershell
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser for the owner role:

```powershell
python manage.py createsuperuser
```

6. Run the development server:

```powershell
python manage.py runserver
```

## API endpoints

- `POST /api/auth/login/` - obtain JWT tokens
- `POST /api/auth/refresh/` - refresh access token
- `GET /api/users/` - owner-only user management
- `GET /api/customers/` - worker/owner customer management
- `GET /api/payments/` - payment history
- `GET /api/reports/` - owner reporting

## Notes

- Authentication is JWT-based.
- Role-based access control is enforced by `users` role values: `owner` and `worker`.
- CORS is configured to allow all origins for development.
