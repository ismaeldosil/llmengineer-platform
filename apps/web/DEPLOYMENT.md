# Deployment Guide - Vercel

This guide provides step-by-step instructions for deploying the LLM Engineer web app to Vercel's free tier (Hobby plan).

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Configuration](#project-configuration)
- [Deployment Steps](#deployment-steps)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)
- [Vercel Free Tier Limits](#vercel-free-tier-limits)

## Prerequisites

1. **Vercel Account**: Sign up for a free account at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js**: Ensure you have Node.js 18+ installed locally for testing

## Project Configuration

The following files have been configured for Vercel deployment:

### 1. `vercel.json`
Contains the deployment configuration:
- Build command: `expo export --platform web`
- Output directory: `dist`
- SPA routing rewrites
- Environment variable references
- Security headers
- Cache control for static assets

### 2. `.vercelignore`
Excludes unnecessary files from deployment:
- `node_modules/`
- `.expo/`
- Test files and coverage
- Development configuration files

### 3. `package.json`
Includes the `build:vercel` script for deployment builds.

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Login to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your Git provider (GitHub, GitLab, or Bitbucket)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your Git repository
   - If using a monorepo, set the **Root Directory** to `apps/web`

3. **Configure Build Settings**
   - Framework Preset: Leave as "Other" or "Expo"
   - Build Command: `npm run build:vercel` (or `expo export --platform web`)
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Configure Environment Variables** (see section below)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the web app directory**
   ```bash
   cd /Users/admin/Projects/fun-projects/llmengineer/llmengineer-platform/apps/web
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (first time)
   - Project name? `llmengineer-web` (or your preferred name)
   - Directory location? `./` (current directory)

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables

### Required Environment Variables

Configure these in the Vercel Dashboard under "Settings" → "Environment Variables":

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | `https://api.llmengineer.com` or `http://localhost:3000` |

### Setting Environment Variables in Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable:
   - **Name**: `EXPO_PUBLIC_API_URL`
   - **Value**: Your API URL (e.g., `https://api.llmengineer.com`)
   - **Environment**: Select "Production", "Preview", and "Development" as needed

4. Click "Save"
5. **Redeploy** your application for changes to take effect

### Environment-Specific Variables

For different environments, you can set different values:

- **Production**: `https://api.llmengineer.com`
- **Preview** (staging branches): `https://staging-api.llmengineer.com`
- **Development**: `http://localhost:3000`

### Important Notes on Environment Variables

- All variables prefixed with `EXPO_PUBLIC_` are exposed to the client-side code
- Never store secrets or API keys in `EXPO_PUBLIC_` variables
- Variables are embedded at build time, so redeploy after changing them
- You can reference environment variables in `vercel.json` using `@variable_name`

## Post-Deployment

### 1. Verify Deployment

After deployment completes:
- Click on the deployment URL provided by Vercel
- Test navigation and routing
- Check browser console for errors
- Verify API connectivity

### 2. Custom Domain (Optional)

To add a custom domain:
1. Go to Project Settings → "Domains"
2. Click "Add"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

### 3. Configure DNS

For custom domains, add these DNS records:

```
Type: CNAME
Name: www (or your subdomain)
Value: cname.vercel-dns.com
```

### 4. HTTPS/SSL

Vercel automatically provisions SSL certificates for:
- All `.vercel.app` domains
- Custom domains (using Let's Encrypt)

No additional configuration needed.

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

- **Production**: Deploys from your main/master branch
- **Preview**: Deploys from pull requests and other branches

### Branch Deployment Settings

Configure in Vercel Dashboard:
1. Go to Settings → "Git"
2. Configure which branch is production
3. Enable/disable automatic deployments for PRs

## Troubleshooting

### Build Failures

**Issue**: Build fails with "expo command not found"
- **Solution**: Ensure `expo` is in `dependencies`, not `devDependencies`

**Issue**: Build fails with module errors
- **Solution**: Clear build cache in Vercel Dashboard → "Deployments" → Click on failed deployment → "Redeploy" → Check "Clear cache"

**Issue**: Build timeout
- **Solution**: Free tier has 45-second build time limit. Optimize dependencies or consider upgrading.

### Runtime Errors

**Issue**: Blank screen after deployment
- **Solution**: Check browser console for errors. Verify all assets are loading correctly.

**Issue**: Routes not working (404 on refresh)
- **Solution**: Verify `vercel.json` includes the SPA rewrite rule for `/(.*)`

**Issue**: Environment variables not working
- **Solution**: Ensure variables are prefixed with `EXPO_PUBLIC_` and redeploy after adding them

### Performance Issues

**Issue**: Slow initial load
- **Solution**:
  - Optimize bundle size
  - Enable caching headers (already configured in `vercel.json`)
  - Consider lazy loading routes

## Vercel Free Tier Limits

The Hobby (free) plan includes:

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Builds | 100 hours/month |
| Serverless Functions | 100 GB-hours |
| Image Optimization | 1000 source images |
| Edge Requests | Unlimited |
| Deployments | Unlimited |
| Team Members | 1 (personal account) |
| Custom Domains | Unlimited |

### Best Practices for Free Tier

1. **Optimize Assets**: Compress images and use appropriate formats
2. **Bundle Size**: Keep bundle size under 5MB for fast loads
3. **Caching**: Leverage the caching headers already configured
4. **Preview Deployments**: Use preview deployments for testing before production
5. **Monitor Usage**: Check Vercel Dashboard for bandwidth and build time usage

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

## Support

For issues specific to:
- **Vercel platform**: [Vercel Support](https://vercel.com/support)
- **Expo build issues**: [Expo Forums](https://forums.expo.dev/)
- **This project**: Create an issue in the repository

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured in Vercel Dashboard
- [ ] API backend is deployed and accessible
- [ ] Build succeeds locally with `npm run build:vercel`
- [ ] All tests pass with `npm test`
- [ ] Linting passes with `npm run lint`
- [ ] Type checking passes with `npm run typecheck`
- [ ] Critical user flows tested in preview deployment
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned
- [ ] Analytics/monitoring set up (optional)
- [ ] Error tracking configured (optional, e.g., Sentry)

## Next Steps After Deployment

1. **Set up monitoring**: Consider adding error tracking (Sentry, Bugsnag)
2. **Analytics**: Add analytics (Google Analytics, Vercel Analytics)
3. **Performance monitoring**: Use Vercel Speed Insights
4. **CI/CD**: Configure automated tests to run before deployment
5. **Staging environment**: Set up a preview branch for staging

---

Last updated: December 2025
