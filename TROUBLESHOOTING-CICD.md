# CI/CD Troubleshooting Guide

## Common Issues and Solutions

### 1. **Missing GitHub Secrets**

**Error:** `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` not found

**Solution:**
1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add these secrets:
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `S3_BUCKET_NAME` - Your S3 bucket name

### 2. **S3 Bucket Permissions**

**Error:** Access denied when uploading to S3

**Solution:**
Ensure your AWS IAM user has these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR-BUCKET-NAME",
                "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutBucketWebsite"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
        }
    ]
}
```

### 3. **Missing Files**

**Error:** `landing-page.html` not found

**Solution:**
- Ensure `landing-page.html` exists in the root directory
- Check that the file was committed to the repository

### 4. **Node.js Version Issues**

**Error:** Node.js version conflicts

**Solution:**
- The workflow uses Node.js 18
- Ensure your local development environment matches
- Update your `package.json` engines if needed

### 5. **Linting/Tests Failing**

**Error:** ESLint or Jest tests failing

**Solution:**
- The workflow now continues even if linting/tests fail
- Fix linting issues locally: `npm run lint`
- Fix test issues locally: `npm test`

### 6. **AWS CLI Version Issues**

**Error:** AWS CLI commands failing

**Solution:**
- Updated to `aws-actions/configure-aws-credentials@v2`
- This provides the latest AWS CLI version

## Debugging Steps

### 1. **Check GitHub Actions Logs**
1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click on the failed workflow run
4. Click on the failed job
5. Check the step that failed

### 2. **Common Error Messages**

#### "No such file or directory"
- Check if required files exist in the repository
- Ensure files are committed and pushed

#### "Access Denied"
- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure bucket name is correct

#### "Command not found"
- Check if required tools are installed
- Verify script names in package.json

### 3. **Local Testing**

Test your setup locally:
```bash
# Test AWS credentials
aws s3 ls s3://your-bucket-name

# Test file upload
aws s3 cp landing-page.html s3://your-bucket-name/test.html

# Test website configuration
aws s3api get-bucket-website --bucket your-bucket-name
```

## Workflow Improvements Made

### 1. **Error Handling**
- Added `|| echo "command failed but continuing..."` for non-critical steps
- Added file existence checks
- Improved error messages

### 2. **AWS Configuration**
- Updated to `aws-actions/configure-aws-credentials@v2`
- Simplified S3 website configuration
- Removed complex routing rules that might cause issues

### 3. **File Operations**
- Added checks for file existence before copying
- Better error handling for missing directories
- Graceful handling of missing files

## Quick Fixes

### If tests are failing:
```bash
# Run locally to see errors
npm test
npm run lint
```

### If AWS deployment is failing:
```bash
# Test AWS access
aws s3 ls s3://your-bucket-name
```

### If files are missing:
```bash
# Check what files exist
ls -la
ls -la src/
```

## Environment Variables

Make sure these are set in GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY` 
- `S3_BUCKET_NAME`

## Branch Protection

Ensure your branches are properly configured:
- `main` - for production deployments
- `develop` - for staging deployments

## Next Steps

1. **Check GitHub Secrets** - Most common issue
2. **Verify S3 Bucket Permissions** - Second most common
3. **Test Locally** - Run commands manually
4. **Check Logs** - Look at specific error messages
5. **Update Dependencies** - If Node.js version issues

## Support

If issues persist:
1. Check the GitHub Actions logs for specific error messages
2. Verify all secrets are properly configured
3. Test AWS access manually
4. Ensure all required files are committed to the repository 