release: python manage.py migrate
web: gunicorn finance_management.wsgi --bind 0.0.0.0:$PORT --workers 4
