import { useState } from "react";
import axios from "axios";
import { config } from "../config.js";
import "../styles/CreateConcert.css";

const API_URL = config.API_URL;

export default function CreateConcert() {
  const [roomName, setRoomName] = useState("");
  const [artists, setArtists] = useState("");
  const [hostName, setHostName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState("");

  const handleCreateConcert = async () => {
    if (!roomName.trim() || !artists.trim() || !hostName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const artistList = artists
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const response = await axios.post(API_URL, {
        roomName,
        artists: artistList,
        host: hostName,
      });

      setCreatedCode(response.data.inviteCode);
      console.log("Concert created:", response.data);

      // Clear form
      setRoomName("");
      setArtists("");
      setHostName("");

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.href = `/concert/${response.data.inviteCode}?name=${hostName}`;
      }, 2000);
    } catch (error) {
      console.error("Error creating concert:", error);
      alert("Failed to create concert: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (createdCode) {
    return (
      <div className="create-concert-container">
        <div className="success-message">
          <h2>✅ Concert Created!</h2>
          <p>Invite Code: <strong>{createdCode}</strong></p>
          <p>Redirecting to your concert...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-concert-container">
      <div className="form-card">
        <h1>🎵 Create a Concert</h1>

        <div className="form-group">
          <label htmlFor="roomName">Concert Name</label>
          <input
            id="roomName"
            type="text"
            placeholder="e.g., Rock Night 2024"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="artists">Artists (comma-separated)</label>
          <input
            id="artists"
            type="text"
            placeholder="e.g., The Beatles, Pink Floyd, Led Zeppelin"
            value={artists}
            onChange={(e) => setArtists(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hostName">Your Name</label>
          <input
            id="hostName"
            type="text"
            placeholder="Your name"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
          />
        </div>

        <button
          onClick={handleCreateConcert}
          disabled={loading}
          className="create-btn"
        >
          {loading ? "Creating..." : "🎤 Create Concert"}
        </button>

        <div className="info">
          <p>Your friends can join using the invite code!</p>
        </div>
      </div>
    </div>
  );
}
