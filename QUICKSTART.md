# ⚡ Quick Start Guide - Concert Sync

## 1️⃣ Setup Backend

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file with:
MONGO_URI=your_mongodb_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
PORT=5000

# Start server
npm run dev
```

✅ Backend running on: `http://localhost:5000`

## 2️⃣ Setup Frontend

```bash
# Navigate to frontend
cd concert-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running on: `http://localhost:5173`

## 3️⃣ Test the App

1. Open http://localhost:5173 in your browser
2. Click **"Create Concert"**
3. Fill the form:
   - Concert Name: "My Party"
   - Artists: "The Beatles, Drake, Taylor Swift"
   - Your Name: "John"
4. Click **"🎤 Create Concert"**
5. You'll see your **Invite Code** (e.g., `P9FYEO`)
6. In another browser/tab:
   - Go to http://localhost:5173
   - Click **"Join Concert"**
   - Enter code: `P9FYEO`
   - Enter name: "Jane"
   - Click **"Join"**

🎉 **You're now synced!** Both users see the same music!

## 🎵 What You Can Do

### As Host (Creator)
- ▶️ Play/Pause music
- ⏭️ Skip to next song
- 📊 Seek to any position
- 🎧 Everyone stays in perfect sync

### All Users
- 👥 See participant list
- 💬 Send chat messages
- 📋 Browse full playlist
- 🎧 Listen together in real-time

## ❌ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Room not found" | Check MONGO_URI in .env, ensure server running |
| YouTube player blank | Verify YOUTUBE_API_KEY is valid |
| Can't join concert | Check invite code matches exactly (auto-uppercase) |
| Socket not connecting | Ensure both frontend & backend running on correct ports |
| No songs in playlist | YouTube API free tier has rate limits |

## 📁 Project Files You Need to Know

```
✅ concert-frontend/src/pages/
   └── Home.jsx (landing)
   └── CreateConcert.jsx
   └── JoinConcert.jsx
   └── Concert.jsx (main player)

✅ concert-frontend/src/styles/
   └── *.css (all styling)

✅ server/
   └── server.js (main server)
   └── controllers/concertControllers.js (API logic)
   └── socket/socketHandler.js (real-time events)
```

## 🚀 Deploy Ready?

See `SETUP.md` for production deployment guide!

---

**Enjoy your synchronized concerts! 🎵🎧**
