#!/bin/sh

# Wait for database to be ready (optional, handled by depends_on healthcheck in compose)
# python manage.py wait_for_db

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
exec gunicorn --bind 0.0.0.0:8000 config.wsgi:application
