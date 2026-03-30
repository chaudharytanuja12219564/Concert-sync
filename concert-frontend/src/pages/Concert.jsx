import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import YouTube from "react-youtube";
import axios from "axios";
import { config } from "../config.js";
import "../styles/Concert.css";

const SOCKET_URL = config.SOCKET_URL;
const API_URL = config.API_URL;

export default function Concert() {
  const { inviteCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userName = searchParams.get("name");

  // State
  const [concert, setConcert] = useState(null);
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const [error, setError] = useState(null);

  // Initialize socket and fetch concert data
  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const res = await axios.get(`${API_URL}/room/${inviteCode}`);
        setConcert(res.data);
        // ✅ SET HOST STATUS BASED ON CONCERT DATA
        setIsHost(res.data.host === userName);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching concert:", error);
        setError("Room not found. This concert may have been deleted.");
        setLoading(false);
      }
    };

    fetchConcert();

    // Connect to socket
    const newSocket = io(SOCKET_URL);

    newSocket.on("connect", () => {
      console.log("Connected to socket");
      newSocket.emit("join-room", { inviteCode, name: userName });
    });

    newSocket.on("participants-update", (updatedParticipants) => {
      console.log("Participants updated:", updatedParticipants);
      setParticipants(updatedParticipants);
      // Check if current user is host based on concert data
      if (concert) {
        setIsHost(concert.host === userName);
      }
    });

    // ✅ HANDLE ROOM DELETED EVENT
    newSocket.on("room-deleted", ({ inviteCode: deletedCode }) => {
      console.log(`Room ${deletedCode} was deleted because all participants left`);
      setRoomDeleted(true);
      setSocket(null);
    });

    newSocket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("play-song", (song, time) => {
      console.log("Playing song:", song);
      setCurrentSong(song);
      setCurrentTime(time || 0);
      setIsPlaying(true);
    });

    newSocket.on("syncPlayback", ({ song, currentTime, isPlaying }) => {
      if (song) {
        setCurrentSong(song);
      }
      if (currentTime !== undefined) {
        setCurrentTime(currentTime);
      }
      if (isPlaying !== undefined) {
        setIsPlaying(isPlaying);
      }
    });

    newSocket.on("seek-song", ({ currentTime }) => {
      setCurrentTime(currentTime);
    });

    newSocket.on("host-changed", (newHostName) => {
      console.log("New host:", newHostName);
      setIsHost(newHostName === userName);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [inviteCode, userName]);

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim() || !socket) return;

    const message = {
      sender: userName,
      text: messageInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    socket.emit("send-message", { inviteCode, message });
    setMessageInput("");
    // ✅ DON'T add message here - let the server broadcast it to everyone including sender
  };

  // YouTube player ready
  const onPlayerReady = (event) => {
    setYoutubePlayer(event.target);
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (!youtubePlayer || !isHost) return;

    if (youtubePlayer.getPlayerState() === 1) {
      youtubePlayer.pauseVideo();
      setIsPlaying(false);
      socket?.emit("hostPlayback", {
        inviteCode,
        currentTime: youtubePlayer.getCurrentTime(),
        isPlaying: false,
      });
    } else {
      youtubePlayer.playVideo();
      setIsPlaying(true);
      socket?.emit("hostPlayback", {
        inviteCode,
        currentTime: youtubePlayer.getCurrentTime(),
        isPlaying: true,
      });
    }
  };

  // Handle seek
  const handleSeek = (e) => {
    if (!youtubePlayer || !isHost) return;
    const newTime = parseFloat(e.target.value);
    youtubePlayer.seekTo(newTime);
    setCurrentTime(newTime);
    socket?.emit("seek-song", { inviteCode, currentTime: newTime });
  };

  // Get video ID from YouTube URL
  const getVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Play next song
  const playNextSong = () => {
    if (!isHost || !concert) return;
    socket?.emit("song-ended", { inviteCode, playlist: concert.playlist });
  };

  // Play specific song from playlist
  const playSongFromPlaylist = (song, index) => {
    if (!isHost || !socket) return;
    setCurrentSongIndex(index);
  // ✅ SHOW ROOM NOT FOUND UI
  if (roomDeleted || error) {
    return (
      <div className="concert-container room-not-found">
        <div className="error-card">
          <h1>🎵 Oops! Concert Ended</h1>
          <p>{error || "This concert room was deleted because all participants left."}</p>
          
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/create")}>
              🎤 Create New Concert
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/join")}>
              🎧 Join Existing Concert
            </button>
            <button className="btn btn-tertiary" onClick={() => navigate("/")}>
              🏠 Go Home
            </button>
          </div>

          <div className="info-box">
            <p><strong>💡 Tip:</strong> Concert rooms are automatically cleaned up when all participants leave to save space.</p>
          </div>
        </div>
      </div>
    );
  }

    socket.emit("play-song", { inviteCode, song, currentTime: 0 });
  };

  if (loading) {
    return <div className="concert-container">Loading concert...</div>;
  }

  if (!concert) {
    return <div className="concert-container">Concert not found</div>;
  }

  const videoId = currentSong ? getVideoId(currentSong.previewUrl) : null;

  return (
    <div className="concert-container">
      <header className="concert-header">
        <div>
          <h1>🎤 {concert.roomName}</h1>
          <p className="code">Code: {inviteCode}</p>
          <p className="user-info">
            Welcome, <strong>{userName}</strong>
            {isHost && <span className="host-badge">👑 HOST</span>}
          </p>
        </div>
        <div className="artists">
          <strong>Artists:</strong> {concert.artists.join(", ")}
        </div>
      </header>

      <div className="concert-content">
        {/* Player Section */}
        <div className="player-section">
          {videoId ? (
            <div className="player-wrapper">
              <YouTube
                videoId={videoId}
                onReady={onPlayerReady}
                opts={{
                  height: "350",
                  width: "100%",
                  playerVars: {
                    autoplay: isPlaying ? 1 : 0,
                    controls: 0,
                  },
                }}
              />
              <div className="song-info">
                <p className="song-title">{currentSong?.songName}</p>
                <p className="song-artist">{currentSong?.artist}</p>
              </div>

              {/* Controls - Only for host */}
              {isHost && (
                <div className="player-controls">
                  <button onClick={togglePlayPause}>
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                  </button>
                  <button onClick={playNextSong}>⏭ Next</button>
                  <input
                    type="range"
                    min="0"
                    max={youtubePlayer?.getDuration() || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="progress-bar"
                  />
                </div>
              )}

              {!isHost && (
                <div className="guest-notice">Only the host can control playback</div>
              )}
            </div>
          ) : (
            <div className="no-song">
              <p>🎵 No song is playing. {isHost ? "Select a song to start!" : "Waiting for host to play..."}</p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Playlist */}
          <div className="playlist-section">
            <h3>📋 Playlist</h3>
            <div className="playlist">
              {concert.playlist && concert.playlist.length > 0 ? (
                concert.playlist.map((song, idx) => (
                  <div
                    key={idx}
                    className={`playlist-item ${
                      currentSongIndex === idx ? "active" : ""
                    }`}
                    onClick={() => playSongFromPlaylist(song, idx)}
                    style={{ cursor: isHost ? "pointer" : "default" }}
                  >
                    <img src={song.coverImage} alt={song.songName} />
                    <div className="song-details">
                      <p className="name">{song.songName}</p>
                      <p className="artist">{song.artist}</p>
                    </div>
                    {isHost && (
                      <span className="play-icon">▶</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty">No songs in playlist</p>
              )}
            </div>
          </div>

          {/* Chat & Participants */}
          <div className="sidebar">
            {/* Participants */}
            <div className="participants-section">
              <h3>👥 Participants ({participants.length})</h3>
              <div className="participants">
                {participants.map((p, idx) => (
                  <div key={idx} className="participant">
                    {p === concert?.host ? "👑" : "🎧"} {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="chat-section">
              <h3>💬 Chat</h3>
              <div className="messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className="message">
                    <strong>{msg.sender}</strong>
                    <span className="time">{msg.timestamp}</span>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
