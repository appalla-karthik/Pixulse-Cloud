release: cd ak && python manage.py migrate --noinput && python manage.py collectstatic --noinput
web: gunicorn -w 2 -b 0.0.0.0:$PORT ak.wsgi:application --chdir=ak
