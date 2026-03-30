import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("connected:", socket.id);

  // TEST FOR JOINED ROOM
  socket.emit("join-room", {
        inviteCode: "P9FYEO",
        name: "Tanuja",
    });

  // TEST FOR MESSAGE
  setTimeout(() => {
    socket.emit("send-message", {
      inviteCode: "P9FYEO",
      message: "Hello from test client 🎤",
    });
  }, 2000);

  // EMIT PLAY EVENT WITH TIMESTAMP
  setTimeout(() => {
    socket.emit("play-song", {
      inviteCode: "P9FYEO",
      song: {
        songName: "Perfect",
        artist: "Ed Sheeran",
      },
      currentTime: 42, // THIS IS THE NEW PART
    });
  }, 4000);
});

// CHAT RECEIVE
socket.on("receive-message", (msg) => {
  console.log("message from room:", msg);
});


// 🎶 SONG SYNC RECEIVE
socket.on("play-song", (data) => {
    console.log("SYNC SONG RECEIVED:", data);
});

socket.on("syncPlayback", (data) => {
  console.log("🎧 ROOM SYNC STATE:", data);
});

//PARTICIPANTS 
socket.on("participants-update", (list) => {
  console.log("👥 LIVE PARTICIPANTS:", list);
});

// SEEK RECEIVE
socket.on("seek-song", (data) => {
  console.log("⏩ SEEK SYNC RECEIVED:", data);
});

//HOST CHANGE 
socket.on("host-changed", (newHost) => {
  console.log("👑 NEW HOST:", newHost);
});

// HOST PLAYBACK TEST
setTimeout(() => {
  socket.emit("hostPlayback", {
    inviteCode: "P9FYEO",
    currentTime: 65,
    isPlaying: true
  });
}, 6000);

setTimeout(() => {
  socket.emit("song-ended", {
    inviteCode: "P9FYEO",
    playlist: [
      { songName: "Perfect", artist: "Ed Sheeran" },
      { songName: "Shape of You", artist: "Ed Sheeran" },
      { songName: "Photograph", artist: "Ed Sheeran" }
    ]
  });
}, 8000);

// SEEK TEST
setTimeout(() => {
  socket.emit("seek-song", {
    inviteCode: "P9FYEO",
    currentTime: 120
  });
}, 10000);