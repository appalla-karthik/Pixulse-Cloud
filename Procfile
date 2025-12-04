release: cd ak && python manage.py migrate --noinput
web: cd ak && gunicorn -w 4 -b 0.0.0.0:$PORT ak.wsgi:application
