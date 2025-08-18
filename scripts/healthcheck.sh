#!/bin/sh

# Simple health check script for the backend service
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$response" = "200" ]; then
  exit 0
else
  exit 1
fi
