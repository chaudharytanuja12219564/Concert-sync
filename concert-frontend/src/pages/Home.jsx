import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="title">🎵 Concert Sync</h1>
        <p className="subtitle">Enjoy music with your friends, together!</p>

        <div className="cards-grid">
          <div className="card create-card" onClick={() => navigate("/create")}>
            <div className="icon">🎤</div>
            <h2>Create Concert</h2>
            <p>Start a new concert session and invite your friends</p>
            <button className="card-btn">Get Started</button>
          </div>

          <div className="card join-card" onClick={() => navigate("/join")}>
            <div className="icon">🎧</div>
            <h2>Join Concert</h2>
            <p>Enter the invite code and join your friends</p>
            <button className="card-btn">Join Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
