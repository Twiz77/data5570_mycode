#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the setup script
python3 setup_mock_connections.py

echo "Setup complete!" 