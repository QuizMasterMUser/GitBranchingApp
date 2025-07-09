# AWS Infrastructure Setup for Git Branching App

This document describes the complete AWS infrastructure setup using CloudFormation for the Git Branching App CI/CD pipeline.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │  CodePipeline   │    │   CodeBuild     │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   Source  │──┼───▶│   Source    │──┼───▶│   Build     │  │
│  │   Stage   │  │    │   Stage     │  │    │   Project   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    │                 │    └─────────────────┘
                       │  ┌───────────┐  │
                       │  │   Deploy  │  │
                       │  │   Stage   │  │
                       │  └───────────┘  │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Artifact S3    │
                       │     Bucket      │
                       │                 │
                       │  ┌───────────┐  │
                       │  │ Temporary │  │
                       │  │ Artifacts │  │
                       │  └───────────┘  │
                       └─────────────────┘
```

## Infrastructure Components

### 1. Artifact Bucket Stack (`artifact-bucket.yml`)

**Purpose**: Temporary storage for build artifacts with automatic cleanup

**Features**:
- **Lifecycle Management**: Automatic deletion after configurable retention period
- **Encryption**: Server-side encryption with AES256
- **Versioning**: Enabled for artifact recovery
- **Notifications**: Lambda function for artifact upload tracking
- **Security**: Blocked public access, proper IAM roles

**Retention Periods**:
- **Dev**: 3 days
- **Staging**: 7 days  
- **Production**: 14 days

### 2. CodePipeline Stack (`codepipeline.yml`)

**Purpose**: Complete CI/CD pipeline with source, build, and deploy stages

**Components**:
- **CodeStar Connection**: GitHub repository integration
- **CodeBuild Project**: Build environment with Node.js 18
- **S3 Deploy Stage**: Automatic deployment to environment-specific folders
- **IAM Roles**: Proper permissions for pipeline execution

## Environment Configuration

### Development Environment
- **Branch**: `develop`
- **Retention**: 3 days
- **Pipeline**: Automatic deployment on push to develop

### Staging Environment  
- **Branch**: `develop` (same as dev for testing)
- **Retention**: 7 days
- **Pipeline**: Manual approval before deployment

### Production Environment
- **Branch**: `main`
- **Retention**: 14 days
- **Pipeline**: Manual approval required

## Deployment Instructions

### Prerequisites

1. **AWS CLI Installation**:
   ```bash
   # macOS
   brew install awscli
   
   # Ubuntu/Debian
   sudo apt-get install awscli
   ```

2. **AWS Credentials Configuration**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-east-1)
   ```

3. **GitHub Token**:
   - Create a GitHub Personal Access Token
   - Grant repo and workflow permissions
   - Update parameter files with your token

### Deployment Steps

1. **Update Parameter Files**:
   ```bash
   # Edit these files with your values:
   infrastructure/cloudformation/parameters/pipeline-dev-params.json
   infrastructure/cloudformation/parameters/pipeline-prod-params.json
   ```

2. **Deploy Artifact Buckets**:
   ```bash
   # Deploy dev artifact bucket
   ./infrastructure/deploy.sh dev artifact-bucket
   
   # Deploy staging artifact bucket
   ./infrastructure/deploy.sh staging artifact-bucket
   
   # Deploy prod artifact bucket
   ./infrastructure/deploy.sh prod artifact-bucket
   ```

3. **Deploy Pipelines**:
   ```bash
   # Deploy dev pipeline
   ./infrastructure/deploy.sh dev pipeline
   
   # Deploy prod pipeline
   ./infrastructure/deploy.sh prod pipeline
   ```

4. **Configure CodeStar Connections**:
   - Go to AWS Console → Developer Tools → Settings → Connections
   - Find your connection and click "Pending"
   - Complete the GitHub authorization

### Complete Deployment

Deploy all infrastructure for an environment:
```bash
# Deploy everything for dev
./infrastructure/deploy.sh dev all

# Deploy everything for prod
./infrastructure/deploy.sh prod all
```

## CloudFormation Templates

### Artifact Bucket Template (`artifact-bucket.yml`)

**Parameters**:
- `EnvironmentName`: Environment identifier (dev/staging/prod)
- `RetentionDays`: Number of days to retain artifacts

**Resources**:
- S3 Bucket with lifecycle policies
- Lambda function for notifications
- IAM roles for CI/CD access
- CloudWatch log group

**Outputs**:
- Bucket name and ARN
- IAM role ARNs
- Lambda function ARN

### Pipeline Template (`codepipeline.yml`)

**Parameters**:
- `EnvironmentName`: Environment identifier
- `GitHubOwner`: GitHub username/organization
- `GitHubRepo`: Repository name
- `GitHubBranch`: Branch to monitor
- `GitHubToken`: GitHub personal access token
- `ArtifactBucketName`: Name of artifact bucket

**Resources**:
- CodePipeline with source, build, deploy stages
- CodeBuild project with Node.js environment
- CodeStar connection for GitHub
- IAM roles for pipeline execution

**Outputs**:
- Pipeline name
- Build project name
- CodeStar connection ARN

## Security Features

### IAM Roles and Policies
- **Least Privilege**: Minimal permissions for each service
- **Service-Specific**: Separate roles for CodeBuild, CodePipeline, Lambda
- **Environment Isolation**: Different roles per environment

### S3 Security
- **Encryption**: Server-side encryption with AES256
- **Public Access**: Blocked for all buckets
- **Versioning**: Enabled for artifact recovery
- **Lifecycle**: Automatic cleanup to reduce costs

### Network Security
- **VPC Isolation**: Resources in default VPC with security groups
- **Private Subnets**: Internal resources in private subnets
- **NAT Gateway**: For outbound internet access

## Monitoring and Logging

### CloudWatch Integration
- **Build Logs**: CodeBuild logs in CloudWatch
- **Pipeline Logs**: CodePipeline execution logs
- **Lambda Logs**: Artifact notification logs
- **Metrics**: Custom metrics for deployment tracking

### S3 Notifications
- **Lambda Triggers**: Automatic notifications on artifact upload
- **Event Tracking**: Log all artifact operations
- **Audit Trail**: Complete history of deployments

## Cost Optimization

### S3 Lifecycle Policies
- **Automatic Cleanup**: Remove old artifacts based on retention
- **Storage Classes**: Use appropriate storage classes
- **Version Management**: Clean up old versions

### CodeBuild Optimization
- **Compute Types**: Use appropriate instance sizes
- **Caching**: Enable build cache where possible
- **Timeout Settings**: Prevent runaway builds

## Troubleshooting

### Common Issues

1. **Stack Creation Fails**:
   ```bash
   # Check CloudFormation events
   aws cloudformation describe-stack-events --stack-name <stack-name>
   ```

2. **Pipeline Stuck**:
   - Check CodeStar connection status
   - Verify GitHub token permissions
   - Review build logs in CloudWatch

3. **Permission Errors**:
   ```bash
   # Verify IAM roles
   aws iam get-role --role-name <role-name>
   ```

4. **S3 Access Issues**:
   ```bash
   # Test bucket access
   aws s3 ls s3://<bucket-name>
   ```

### Debug Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name <stack-name>

# View stack outputs
aws cloudformation describe-stacks --stack-name <stack-name> --query 'Stacks[0].Outputs'

# Check pipeline status
aws codepipeline get-pipeline-state --name <pipeline-name>

# View build logs
aws logs describe-log-groups --log-group-name-prefix "/aws/codebuild"
```

## Best Practices

### Security
- Use IAM roles instead of access keys
- Enable CloudTrail for audit logging
- Regularly rotate GitHub tokens
- Use least privilege principle

### Reliability
- Enable CloudFormation drift detection
- Use stack policies for critical resources
- Implement proper error handling
- Set up monitoring and alerting

### Cost Management
- Monitor S3 storage usage
- Clean up unused resources
- Use appropriate instance sizes
- Implement proper retention policies

## Next Steps

1. **Set up monitoring**: Configure CloudWatch alarms
2. **Add testing**: Integrate automated testing in pipeline
3. **Security scanning**: Add code security scanning
4. **Backup strategy**: Implement disaster recovery plan
5. **Documentation**: Keep infrastructure docs updated 