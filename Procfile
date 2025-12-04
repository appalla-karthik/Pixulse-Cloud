release: python -m django migrate --noinput --settings=ak.settings
web: gunicorn -w 2 -b 0.0.0.0:$PORT ak.wsgi:application --chdir=ak
