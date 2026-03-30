import mongoose from "mongoose";

const concertSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },

    artists: [
      {
        type: String,
        required: true,
      },
    ],

    inviteCode: {
      type: String,
      unique: true, // no duplicate rooms with same code
    },

    participants: [
      {
        type: String, // later we can convert this to User reference
      },
    ],
    host: {
      type: String,
      required: true,
    },
    playlist: [
      {
        songName: String,
        artist: String,
        coverImage: String,
        previewUrl: String,
      },
    ],
    currentSongIndex: {
      type: Number,
      default: 0,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Number,
      default: 0,
    }
  },

  { timestamps: true }
  
);

export default mongoose.model("Concert", concertSchema);