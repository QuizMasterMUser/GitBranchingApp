#!/bin/bash

# AWS CloudFormation Deployment Script for Git Branching App
# Usage: ./deploy.sh [environment] [stack-type]
# Example: ./deploy.sh dev artifact-bucket

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
STACK_TYPE=${2:-all}
REGION=${AWS_REGION:-us-east-1}
STACK_PREFIX="git-branching-app"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to validate environment
validate_environment() {
    case $ENVIRONMENT in
        dev|staging|prod)
            print_status "Environment: $ENVIRONMENT"
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT. Use dev, staging, or prod"
            exit 1
            ;;
    esac
}

# Function to deploy artifact bucket
deploy_artifact_bucket() {
    print_status "Deploying artifact bucket for $ENVIRONMENT environment..."
    
    STACK_NAME="${STACK_PREFIX}-artifact-bucket-${ENVIRONMENT}"
    TEMPLATE_FILE="infrastructure/cloudformation/templates/artifact-bucket.yml"
    PARAMS_FILE="infrastructure/cloudformation/parameters/${ENVIRONMENT}-params.json"
    
    if [ ! -f "$TEMPLATE_FILE" ]; then
        print_error "Template file not found: $TEMPLATE_FILE"
        exit 1
    fi
    
    if [ ! -f "$PARAMS_FILE" ]; then
        print_error "Parameters file not found: $PARAMS_FILE"
        exit 1
    fi
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" >/dev/null 2>&1; then
        print_status "Stack exists, updating..."
        aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://"$TEMPLATE_FILE" \
            --parameters file://"$PARAMS_FILE" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"
        
        print_status "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
    else
        print_status "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://"$TEMPLATE_FILE" \
            --parameters file://"$PARAMS_FILE" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"
        
        print_status "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
    fi
    
    # Get bucket name from stack outputs
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`ArtifactBucketName`].OutputValue' \
        --output text)
    
    print_success "Artifact bucket deployed: $BUCKET_NAME"
    echo "$BUCKET_NAME" > ".${ENVIRONMENT}-artifact-bucket"
}

# Function to deploy pipeline
deploy_pipeline() {
    print_status "Deploying pipeline for $ENVIRONMENT environment..."
    
    STACK_NAME="${STACK_PREFIX}-pipeline-${ENVIRONMENT}"
    TEMPLATE_FILE="infrastructure/cloudformation/templates/codepipeline.yml"
    PARAMS_FILE="infrastructure/cloudformation/parameters/pipeline-${ENVIRONMENT}-params.json"
    
    # Check if artifact bucket name file exists
    BUCKET_FILE=".${ENVIRONMENT}-artifact-bucket"
    if [ ! -f "$BUCKET_FILE" ]; then
        print_error "Artifact bucket not deployed. Run artifact-bucket deployment first."
        exit 1
    fi
    
    ARTIFACT_BUCKET=$(cat "$BUCKET_FILE")
    
    # Update parameters file with actual bucket name
    sed -i.bak "s/git-branching-artifacts-${ENVIRONMENT}/$ARTIFACT_BUCKET/g" "$PARAMS_FILE"
    
    if [ ! -f "$TEMPLATE_FILE" ]; then
        print_error "Template file not found: $TEMPLATE_FILE"
        exit 1
    fi
    
    if [ ! -f "$PARAMS_FILE" ]; then
        print_error "Parameters file not found: $PARAMS_FILE"
        exit 1
    fi
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" >/dev/null 2>&1; then
        print_status "Stack exists, updating..."
        aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://"$TEMPLATE_FILE" \
            --parameters file://"$PARAMS_FILE" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"
        
        print_status "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
    else
        print_status "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://"$TEMPLATE_FILE" \
            --parameters file://"$PARAMS_FILE" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"
        
        print_status "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
    fi
    
    # Get pipeline name from stack outputs
    PIPELINE_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`PipelineName`].OutputValue' \
        --output text)
    
    print_success "Pipeline deployed: $PIPELINE_NAME"
    print_warning "Remember to configure the CodeStar connection in the AWS Console"
}

# Function to deploy all stacks
deploy_all() {
    print_status "Deploying all stacks for $ENVIRONMENT environment..."
    deploy_artifact_bucket
    deploy_pipeline
    print_success "All stacks deployed successfully!"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [environment] [stack-type]"
    echo ""
    echo "Environments:"
    echo "  dev      - Development environment"
    echo "  staging  - Staging environment"
    echo "  prod     - Production environment"
    echo ""
    echo "Stack types:"
    echo "  artifact-bucket - Deploy only artifact bucket"
    echo "  pipeline        - Deploy only pipeline (requires artifact bucket)"
    echo "  all             - Deploy all stacks (default)"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Deploy all stacks for dev"
    echo "  $0 prod artifact-bucket   # Deploy only artifact bucket for prod"
    echo "  $0 staging pipeline       # Deploy only pipeline for staging"
}

# Main execution
main() {
    print_status "Starting deployment..."
    print_status "Region: $REGION"
    
    validate_environment
    
    case $STACK_TYPE in
        artifact-bucket)
            deploy_artifact_bucket
            ;;
        pipeline)
            deploy_pipeline
            ;;
        all)
            deploy_all
            ;;
        *)
            print_error "Invalid stack type: $STACK_TYPE"
            show_usage
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Run main function
main "$@" 