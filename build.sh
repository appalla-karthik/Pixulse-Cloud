#!/bin/bash
set -e

echo "Python version:"
python3 --version

echo "Installing dependencies with explicit wheel preference..."
pip install --upgrade pip
pip install --only-binary :all: -r requirements.txt 2>&1 || pip install -r requirements.txt

echo "Running Django collectstatic..."
cd ak
python manage.py collectstatic --noinput

echo "Build completed successfully!"
