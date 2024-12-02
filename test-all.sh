#!/bin/bash

# Print section header
print_header() {
    echo "================================================"
    echo "  $1"
    echo "================================================"
}

# Run frontend tests
print_header "Running Frontend Tests"
cd frontend/gephiltephish
npm test
FRONTEND_STATUS=$?
cd ../..

echo

# Run backend tests
print_header "Running Backend Tests"
cd backend
python -m pytest
BACKEND_STATUS=$?
cd ..

echo

# Run extension tests
print_header "Running Extension Tests"
cd extension
npm test
EXTENSION_STATUS=$?
cd ..

echo
print_header "Test Summary"

# Check and report status for each component
if [ $FRONTEND_STATUS -eq 0 ]; then
    echo "✅ Frontend tests passed"
else
    echo "❌ Frontend tests failed"
fi

if [ $BACKEND_STATUS -eq 0 ]; then
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed"
fi

if [ $EXTENSION_STATUS -eq 0 ]; then
    echo "✅ Extension tests passed"
else
    echo "❌ Extension tests failed"
fi

# Exit with error if any test suite failed
if [ $FRONTEND_STATUS -ne 0 ] || [ $BACKEND_STATUS -ne 0 ] || [ $EXTENSION_STATUS -ne 0 ]; then
    exit 1
fi

exit 0
