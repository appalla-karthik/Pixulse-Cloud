#!/bin/bash
set -e

echo "Python version:"
python3 --version

echo "Upgrading pip to latest version..."
python3 -m pip install --upgrade pip setuptools wheel

echo "Installing dependencies with pre-built wheels preference..."
python3 -m pip install --prefer-binary -r requirements.txt

echo "Running Django migrations..."
cd ak
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Copying assets to staticfiles..."
cp -r assets/* staticfiles/ 2>/dev/null || true

echo "Build completed successfully!"
