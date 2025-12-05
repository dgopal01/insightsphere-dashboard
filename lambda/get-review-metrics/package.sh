#!/bin/bash
# Package Lambda function for deployment

# Create a clean package directory
rm -rf package
mkdir -p package

# Copy function code
cp index.py package/

# Install dependencies (if any beyond boto3 which is provided by Lambda runtime)
# pip install -r requirements.txt -t package/

# Create deployment package
cd package
zip -r ../get-review-metrics.zip .
cd ..

echo "Lambda function packaged successfully: get-review-metrics.zip"
