import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { config } from "../config.js";
import "../styles/JoinConcert.css";

export default function JoinConcert() {

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  const joinRoom = async () => {
    if (!name.trim() || !inviteCode.trim()) {
      alert("Please enter both name and invite code");
      return;
    }

    setLoading(true);
    try {
      // FORCE UPPERCASE
      const upperInviteCode = inviteCode.toUpperCase();

      await axios.post(
        `${config.API_URL}/join/${upperInviteCode}`,
        { name }
      );
      console.log("Invite code received:", upperInviteCode);

      // redirect to concert page
      window.location.href = `/concert/${upperInviteCode}?name=${name}`;

    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="join-concert-container">
      <div className="form-card">
        <h1>🎧 Join Concert</h1>
        <p className="form-subtitle">Enter your details to join the concert</p>

        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="form-group">
          <label htmlFor="inviteCode">Invite Code</label>
          <input
            id="inviteCode"
            type="text"
            placeholder="e.g., P9FYEO"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            maxLength="6"
          />
        </div>

        <button onClick={joinRoom} disabled={loading} className="join-btn">
          {loading ? "Joining..." : "🎵 Join Concert"}
        </button>

        <div className="footer-links">
          <p>
            Don't have a code? <button className="link-btn" onClick={() => navigate("/create")}>Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
}