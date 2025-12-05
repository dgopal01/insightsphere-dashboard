# Lambda Functions

This directory contains AWS Lambda functions for the Chat Logs Review System.

## Functions

### GetReviewMetrics

Located in `get-review-metrics/`

Calculates review metrics by scanning both DynamoDB tables and returning aggregated statistics.

**Purpose**: Provide dashboard metrics showing review progress for both chat logs and feedback logs.

**Requirements Implemented**: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6

See [get-review-metrics/README.md](get-review-metrics/README.md) for detailed documentation.

## Deployment

Lambda functions are deployed as part of the CloudFormation stack. The function code is embedded inline in the CloudFormation template for simplicity and to avoid S3 dependencies.

For production deployments with larger functions or external dependencies, consider:
1. Packaging the function code
2. Uploading to S3
3. Referencing the S3 location in CloudFormation

## Local Development

Each function directory contains:
- `index.py` - Main function code
- `test_index.py` - Unit tests
- `requirements.txt` - Python dependencies
- `README.md` - Function-specific documentation
- `package.sh` / `package.ps1` - Packaging scripts

### Running Tests

```bash
# From the function directory
python test_index.py -v
```

### Packaging for Deployment

```bash
# Linux/Mac
./package.sh

# Windows
.\package.ps1
```

## Best Practices

1. **Keep functions small**: Lambda functions should do one thing well
2. **Use environment variables**: For configuration that changes between environments
3. **Handle errors gracefully**: Return appropriate status codes and error messages
4. **Log important events**: Use print() statements which go to CloudWatch Logs
5. **Optimize cold starts**: Minimize dependencies and initialization code
6. **Use projection expressions**: Only fetch the data you need from DynamoDB
7. **Handle pagination**: Always handle DynamoDB pagination for large datasets

## Monitoring

Lambda functions are monitored through:
- CloudWatch Logs: Function execution logs
- CloudWatch Metrics: Invocation count, duration, errors
- X-Ray: Distributed tracing (if enabled)

## Security

- Functions run with least-privilege IAM roles
- Environment variables for sensitive configuration
- No hardcoded credentials
- VPC configuration (if needed for private resources)
