# Vercel Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Backend API deployed and accessible

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:

   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Add Environment Variable:

   - **Key:** `VITE_API_URL`
   - **Value:** Your backend API URL (e.g., `https://your-backend.railway.app/api`)

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd client

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - What's your project's name? msana-billing
# - In which directory is your code located? ./
# - Want to override settings? N

# For production deployment
vercel --prod
```

### 3. Configure Environment Variables in Vercel

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add the following:

| Variable       | Value                              | Environment |
| -------------- | ---------------------------------- | ----------- |
| `VITE_API_URL` | `https://your-backend-url.com/api` | Production  |

### 4. Configure Custom Domain (Optional)

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `app.msanabilling.com`)
4. Update DNS records as instructed by Vercel
5. SSL certificate will be automatically generated

### 5. Backend CORS Configuration

Make sure your backend allows requests from your Vercel domain:

```javascript
// server/server.js
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-app.vercel.app",
      "https://app.msanabilling.com", // Your custom domain
    ],
    credentials: true,
  })
);
```

## Automatic Deployments

Vercel automatically deploys:

- **Production:** Every push to `main` branch
- **Preview:** Every push to other branches or pull requests

## Environment Variables Reference

### Required

- `VITE_API_URL` - Backend API URL

### Optional (if used in your code)

- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key

## Troubleshooting

### Issue: 404 on page refresh

**Solution:** Already handled in `vercel.json` with rewrites

### Issue: Environment variables not working

**Solution:**

- Ensure variables are prefixed with `VITE_`
- Redeploy after adding variables
- Clear build cache: Settings → General → Clear Build Cache

### Issue: Build fails

**Solution:**

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

### Issue: CORS errors

**Solution:**

- Add Vercel domain to backend CORS whitelist
- Ensure `VITE_API_URL` is correct

## Performance Optimization

Your `vercel.json` already includes:

- ✅ SPA routing with rewrites
- ✅ Asset caching (1 year for `/assets/*`)
- ✅ Proper build configuration

## Monitoring

- **Analytics:** Vercel provides free analytics
- **Logs:** Available in deployment details
- **Performance:** Web Vitals tracking included

## Local Testing of Production Build

```bash
# Build the production version
npm run build

# Preview the production build locally
npm run preview
```

## Rollback

If a deployment has issues:

1. Go to Deployments in Vercel dashboard
2. Find the previous working deployment
3. Click "Promote to Production"

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
