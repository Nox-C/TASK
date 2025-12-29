#!/bin/bash

# TASK Trading Database Setup
# This script sets up PostgreSQL and creates the required database

set -e

echo "Setting up TASK Trading database..."

# Check if PostgreSQL is installed
if ! command -v psql >/dev/null 2>&1; then
    echo "PostgreSQL is not installed. Installing PostgreSQL..."
    
    # Install PostgreSQL based on package manager
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
    elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
    else
        echo "Please install PostgreSQL manually"
        exit 1
    fi
fi

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
elif command -v service >/dev/null 2>&1; then
    sudo service postgresql start
else
    echo "Please start PostgreSQL service manually"
    exit 1
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    sleep 1
done

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql << EOF
-- Create database if not exists
SELECT 'CREATE DATABASE task_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'task_dev')\gexec

-- Create user if not exists
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
      CREATE ROLE postgres LOGIN PASSWORD 'postgres';
   END IF;
END
\$\$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE task_dev TO postgres;
EOF

echo "Database setup complete!"
echo "Database URL: postgresql://postgres:postgres@localhost:5432/task_dev"
