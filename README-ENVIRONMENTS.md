# Environment Setup and Deployment Guide

## Overview

The Git Branching App supports multiple environments with different configurations and feature flags. This guide explains how to work with different environments and deploy the application.

## Environment Structure

### Web Deployment Structure
```
S3 Bucket Root/
├── index.html          # Landing page with environment selection
├── staging/           # Staging environment
│   └── index.html    
└── production/        # Production environment
    └── index.html    
```

### Available Environments

1. **Development** (Local)
   - API URL: `http://localhost:3000`
   - All features enabled
   - Used for local development

2. **Staging** 
   - API URL: `https://staging-api.gitbranchingapp.com`
   - All features enabled including beta features
   - Deployed from `develop` branch

3. **Production**
   - API URL: `https://api.gitbranchingapp.com`
   - Beta features disabled
   - Deployed from `main` branch

## Running the App in Different Environments

### React Native App

```bash
# Development (default)
npm start
npm run android
npm run ios

# Staging
npm run start:staging
npm run android:staging
npm run ios:staging

# Production
npm run start:prod
npm run android:prod
npm run ios:prod
```

### Web Build

```bash
# Build for staging
npm run build:staging

# Build for production
npm run build:prod
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Landing Page Deployment**
   - Deploys `landing-page.html` to the S3 bucket root as `index.html`
   - Runs on both `main` and `develop` branches
   - Configures S3 bucket for static website hosting

2. **Staging Deployment**
   - Triggered on push to `develop` branch
   - Builds and deploys to `/staging/` subdirectory
   - URL: `http://your-bucket.s3-website-us-east-1.amazonaws.com/staging/`

3. **Production Deployment**
   - Triggered on push to `main` branch
   - Builds and deploys to `/production/` subdirectory
   - URL: `http://your-bucket.s3-website-us-east-1.amazonaws.com/production/`

## Feature Flags

Feature flags are automatically configured based on the environment:

| Feature | Development | Staging | Production |
|---------|------------|---------|------------|
| Payment Integration | ✅ | ✅ | ✅ |
| Advanced Analytics | ✅ | ✅ | ❌ |
| Beta Features | ✅ | ✅ | ❌ |

## Environment Configuration

The environment configuration is located in `src/config/environment.ts`. To add new environment-specific settings:

1. Update the `EnvironmentConfig` interface
2. Add the configuration to each environment in the `environments` object
3. Access the configuration using `config.yourSetting`

## Testing Environment Switching

1. Start the app with different environment scripts
2. Check the environment badge in the top-right corner
3. Verify the API and Web URLs displayed in the app
4. Confirm feature flags are working as expected

## Deployment Prerequisites

1. AWS credentials configured as GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET_NAME`

2. S3 bucket configured for static website hosting

3. Proper branch protection rules for `main` and `develop`

## Troubleshooting

### Environment not switching
- Ensure you're using the correct npm script
- Check that environment variables are properly set
- Restart Metro bundler if changes aren't reflected

### S3 deployment issues
- Verify AWS credentials are correctly set
- Check S3 bucket permissions
- Ensure bucket name is correctly configured

### Feature flags not working
- Verify the environment configuration in `src/config/environment.ts`
- Check that feature flags are correctly mapped in `src/config/featureFlags.ts` 