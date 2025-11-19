# OSMS Deployment Guide for Render

## Quick Deploy Steps

### Backend Deployment (Render)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `OSMS` folder (or root if OSMS is in root)
   - Configure:
     - **Name**: `osms-backend` (or your preferred name)
     - **Root Directory**: `backend` (if OSMS is in root, use `OSMS/backend`)
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

3. **Add Environment Variables** in Render:
   ```
   MONGO_URL=your_mongodb_atlas_connection_string
   JWT_SECRET=your-super-secret-jwt-key-change-this
   EMAIL_USER=kajaridhara@gmail.com (optional)
   EMAIL_PASS=oipb lfou zjlj frbb (optional)
   NODE_ENV=production
   ```

4. **Deploy**: Click "Create Web Service"

5. **Note your backend URL**: e.g., `https://osms-backend-xxxx.onrender.com`

### Frontend Deployment (Netlify/Vercel/GitHub Pages)

The frontend is auto-configured to detect the environment:
- **Local**: Uses `http://localhost:5000/api`
- **Production**: Uses `https://osms-suhn.onrender.com/api`

#### Option 1: Netlify (Drag & Drop)
1. Go to [Netlify](https://app.netlify.com/)
2. Drag the `frontend` folder to deploy
3. Done! ✅

#### Option 2: GitHub Pages
1. Push frontend to a `gh-pages` branch
2. Enable GitHub Pages in repository settings
3. Done! ✅

#### Option 3: Vercel
1. Import your repository on [Vercel](https://vercel.com/)
2. Set root directory to `frontend`
3. Deploy! ✅

### Update Frontend API URL

If your Render backend URL is different from `https://osms-suhn.onrender.com`, update line 783 in `frontend/index.html`:

```javascript
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : 'https://YOUR-RENDER-URL.onrender.com/api';  // ← Change this
```

## Post-Deployment Checklist

- [ ] Backend is running on Render
- [ ] MongoDB Atlas is connected
- [ ] Environment variables are set
- [ ] Frontend is deployed
- [ ] Frontend can connect to backend API
- [ ] Admin login works
- [ ] Student registration works
- [ ] Email sending works (if configured)

## Troubleshooting

### CORS Issues
The backend is configured to accept requests from any origin. If you face CORS issues, check that your frontend URL is accessible.

### Email Not Working
Email is optional. The system works without it. If you want email:
- Ensure `EMAIL_USER` and `EMAIL_PASS` are set in Render
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail and generate an App Password

### MongoDB Connection Failed
- Verify your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas (use `0.0.0.0/0` for all IPs)
- Check network access settings in MongoDB Atlas

## Production URLs

- **Backend**: `https://osms-suhn.onrender.com`
- **Frontend**: Deploy to your preferred hosting
- **API Docs**: `https://osms-suhn.onrender.com/api/test`

## Security Notes

- Never commit `.env` file to GitHub
- Use strong JWT_SECRET in production
- Rotate email passwords regularly
- Keep MongoDB credentials secure
- Use environment variables for all sensitive data

## Support

For issues, check the Render logs:
```
Dashboard → Your Service → Logs
```
