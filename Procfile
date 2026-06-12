release: python manage.py migrate && python manage.py collectstatic --noinput
web: gunicorn finance_management.wsgi --bind 0.0.0.0:$PORT --workers 4
