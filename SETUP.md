# 🎵 Concert Sync - Complete Project Setup

## Project Overview
Concert Sync is a real-time synchronized music streaming application where users can create or join concert rooms, share a playlist, and chat together while listening to music.

## 🏗️ Project Structure

```
concert/
├── concert-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page (Create/Join options)
│   │   │   ├── CreateConcert.jsx  # Create new concert room
│   │   │   ├── JoinConcert.jsx    # Join existing concert
│   │   │   └── Concert.jsx        # Main concert room with player
│   │   ├── styles/
│   │   │   ├── Home.css
│   │   │   ├── CreateConcert.css
│   │   │   ├── JoinConcert.css
│   │   │   └── Concert.css        # Main player styling
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                    # Node.js + Express + Socket.io backend
    ├── server.js              # Main server file with Socket.io setup
    ├── .env                   # Environment variables (MONGO_URI, YOUTUBE_API_KEY, PORT)
    ├── controllers/
    │   └── concertControllers.js   # API logic
    ├── models/
    │   └── concert.js         # MongoDB Concert schema
    ├── routes/
    │   └── concertRoutes.js   # API routes
    ├── socket/
    │   └── socketHandler.js   # Socket.io event handlers
    ├── utils/
    │   └── youtube.js         # YouTube API integration
    └── src/config/
        └── db.js              # MongoDB connection
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account
- YouTube API key

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup `.env` file:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/concert
   YOUTUBE_API_KEY=your_youtube_api_key_here
   PORT=5000
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to concert-frontend directory:**
   ```bash
   cd concert-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🎯 Features

### 1. **Create Concert**
- Create a new concert room
- Add artists (comma-separated)
- Get a unique 6-character invite code
- YouTube songs fetched automatically for selected artists

### 2. **Join Concert**
- Enter invite code and name
- Invite code auto-converts to uppercase
- Joins Socket.io room for real-time sync

### 3. **Concert Room**
- **Music Player**: YouTube embedded player
- **Playlist**: All songs from selected artists
- **Host Controls**: Play/Pause/Next/Seek (host only)
- **Real-time Sync**: All users see same playback
- **Participants List**: See who's in the room
- **Chat**: Message with other participants
- **Auto-play Next**: Automatically plays next song when current ends

### 4. **Socket Events**
- `join-room`: User joins with invite code
- `participants-update`: Real-time participant list
- `send-message`: Chat messaging
- `play-song`: Host plays a song
- `hostPlayback`: Host controls play/pause/sync
- `seek-song`: Host seeks to position
- `song-ended`: Auto-play next song
- `host-changed`: New host when current leaves
- `syncPlayback`: Keep all clients in sync

## 🔧 Key Fixes Applied

### 1. **Invite Code Case Handling**
- Codes stored as UPPERCASE in database
- Frontend forces uppercase input and submission
- Backend normalizes all queries to uppercase

### 2. **API Route Fix**
- Fixed API endpoint: `/api/concerts/join/:code` (not `/concert/join/:code`)

### 3. **Frontend Architecture**
- Removed buggy client-side MongoDB queries
- All queries go through REST API + Socket.io
- Proper separation of concerns

## 📱 Usage Flow

1. **User opens app** → Lands on Home page
2. **Choose Option**:
   - **Create**: Fill form → Get invite code → Join as host
   - **Join**: Enter code + name → Join as guest
3. **In Concert Room**:
   - Host can control playback and song selection
   - All users see same song and sync
   - Chat and see participant list real-time

## 🐛 Troubleshooting

### "Room not found" Error
- ✅ Ensure backend is running on port 5000
- ✅ Verify MongoDB connection is working
- ✅ Check that MONGO_URI in .env is correct
- ✅ Invite code matches exactly (case-insensitive, normalized to uppercase)

### YouTube Player Not Working
- ✅ Check YouTube API key is valid in .env
- ✅ Ensure react-youtube package is installed
- ✅ Check if songs fetched from YouTube have valid video IDs

### Socket.io Connection Issues
- ✅ Verify backend server is running
- ✅ Check browser console for CORS errors
- ✅ Ensure socket endpoint is `http://localhost:5000`

### Database Issues
- ✅ Test connection with MongoDB Compass
- ✅ Verify MONGO_URI format is correct
- ✅ Check MongoDB user has proper permissions

## 📦 Dependencies

### Frontend
- React 19
- React Router DOM 7
- Axios 1.13
- Socket.io-client 4.8
- React-YouTube 10.1
- Vite 7

### Backend
- Express 5
- Socket.io 4.8
- Mongoose 9
- Axios 1.13
- Dotenv 17
- CORS 2.8

## 🎨 Design Features
- Gradient purple theme
- Responsive design (mobile & desktop)
- Smooth animations and transitions
- Real-time updates with Socket.io
- Clean, modern UI

## 📝 Future Enhancements
- User authentication
- Persistent user profiles
- Concert history
- Volume control sync
- Video controls sync
- Advanced playlist management
- Recording/Playback of sessions

---

**Happy listening with Friends! 🎵**
