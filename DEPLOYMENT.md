# 🚀 Vercel Deployment Guide - Concert Sync

Deploy both frontend and backend to Vercel with these step-by-step instructions.

---

## 📋 Prerequisites

- **GitHub account** (free tier ok)
- **Vercel account** (free tier ok) — https://vercel.com
- **MongoDB Atlas account** (free tier ok) — https://www.mongodb.com/cloud/atlas
- **YouTube API key** — https://console.cloud.google.com

---

## ✅ Part 1: Prepare Your Project

### 1.1 Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Concert Sync app"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/concert-sync.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.2 Create `.env.production` File (Root)

```bash
# In the root concert folder, create:
MONGODB_URI=your_mongodb_atlas_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
```

### 1.3 Verify Backend Structure

**Note:** Vercel's free tier runs Node.js as **serverless functions**. Your backend needs to export an Express app as a handler.

Create `/server/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

Update `/server/server.js` to export the HTTP server:

```javascript
// At the END of server.js, add:
export default server;
```

---

## 🌐 Part 2: Deploy Backend to Vercel

### 2.1 Import Backend Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. **Import Git Repository**
4. Search for your `concert-sync` repo and click **Import**
5. Select **Node.js** as framework
6. In the **Root Directory**, set to: `server`

### 2.2 Add Environment Variables

In the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Key:** `MONGODB_URI` | **Value:** Your MongoDB Atlas connection string
   - **Key:** `YOUTUBE_API_KEY` | **Value:** Your YouTube API key
   - **Key:** `PORT` | **Value:** `5000` (optional, Vercel assigns automatically)

3. Click **Save**

### 2.3 Deploy

1. Click **Deploy**
2. Wait for build to complete ✅
3. Copy your **Backend URL** (e.g., `https://concert-sync-backend.vercel.app`)

---

## 🎨 Part 3: Deploy Frontend to Vercel

### 3.1 Update API URL in Frontend

In `/concert-frontend/src/pages/Concert.jsx`, change:

```javascript
// OLD:
const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api/concerts";

// NEW:
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/concerts";
```

Create `/concert-frontend/.env.production`:

```
REACT_APP_SOCKET_URL=https://your-backend-url.vercel.app
REACT_APP_API_URL=https://your-backend-url.vercel.app/api/concerts
```

Replace `your-backend-url` with your actual Vercel backend URL from Part 2.

### 3.2 Import Frontend Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. **Import Git Repository** (same repo)
4. Select **Other** as framework
5. In the **Root Directory**, set to: `concert-frontend`
6. In **Build Command**, set to: `npm run build`
7. In **Output Directory**, set to: `dist`

### 3.3 Add Environment Variables

In the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Key:** `REACT_APP_SOCKET_URL` | **Value:** Your backend Vercel URL
   - **Key:** `REACT_APP_API_URL` | **Value:** Your backend Vercel URL + `/api/concerts`

3. Click **Save**

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build to complete ✅
3. Your frontend is now live! 🎉

---

## 🔗 Part 4: Connect Frontend & Backend

After both are deployed:

1. **Test the connection:**
   - Visit your frontend URL (e.g., `https://concert-sync-frontend.vercel.app`)
   - Try creating a concert
   - Check browser console (F12) for any connection errors

2. **If you get CORS errors:**

In `/server/server.js`, update the CORS configuration:

```javascript
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Add this
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
```

Add to backend environment variables on Vercel:

- **Key:** `FRONTEND_URL` | **Value:** Your frontend Vercel URL

---

## 🧪 Part 5: Testing

### Test Backend

```bash
curl https://your-backend-url.vercel.app/health
```

### Test Socket Connection

1. Open frontend: `https://your-frontend-url.vercel.app`
2. Open DevTools (F12)
3. Go to **Console**
4. Create a concert
5. Look for: `✅ Connected to socket`

### Test Full Flow

1. **Host Side (Browser 1):**
   - Create concert
   - Note invite code

2. **Guest Side (Browser 2 or Incognito):**
   - Join with code
   - Verify participant appears
   - Select a song
   - Both should play synchronized

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Cannot GET /"** on backend | Ensure `vercel.json` is in `/server` folder |
| **CORS errors** | Add `FRONTEND_URL` env var, update server CORS config |
| **Socket connection fails** | Check `REACT_APP_SOCKET_URL` matches backend URL |
| **Songs not playing** | Verify `YOUTUBE_API_KEY` is set in backend env vars |
| **Build fails on frontend** | Run `npm run build` locally first to debug |

---

## 📊 Project Structure After Deployment

```
concert-sync/ (GitHub)
├── server/
│   ├── server.js
│   ├── vercel.json              ← Tells Vercel how to run backend
│   ├── socket/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.production          ← Backend env vars (local reference)
│   └── package.json
│
├── concert-frontend/
│   ├── vite.config.js
│   ├── src/
│   │   ├── pages/Concert.jsx    ← Uses REACT_APP_SOCKET_URL
│   │   └── ...
│   ├── .env.production          ← Frontend env vars (local reference)
│   └── package.json
│
└── README.md
```

---

## 🎯 Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel
3. ✅ Test the full application
4. 📱 Share your frontend URL with friends to use the app
5. 🚀 (Optional) Set up production database monitoring

---

## 🔐 Security Notes

- **Never commit `.env` files** — they're in `.gitignore`
- **Use Vercel Environment Variables** for sensitive keys
- **Enable GitHub branch protection** to prevent accidental deployments
- **Use MongoDB IP whitelist** to allow only Vercel IPs

---

## 📞 Support

If you encounter issues:

1. Check Vercel build logs: **Vercel Dashboard** → **Project** → **Deployments**
2. Check backend logs: Click **frontend name** → **Logs**
3. Check browser console (F12) for frontend errors
4. Verify environment variables are set in Vercel dashboard

