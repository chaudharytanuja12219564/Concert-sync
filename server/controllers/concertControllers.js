import Concert from "../models/concert.js";
import { getSongsFromYouTube } from "../utils/youtube.js";
//to create concert 
export const createConcert = async (req, res) => {

  try {
    //DECONSTRUCTOR
    const { roomName, artists,  host } = req.body;

    // generate random 6 character invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 🎵 generate playlist 
    let playlist = [];

    for (const artist of artists) {
      const songs = await getSongsFromYouTube(artist);
      playlist.push(...songs);
    }

    const concert = await Concert.create({
      roomName,
      artists,
      inviteCode,
      host,
      playlist,
      participants: [], // good practice to initialize
    });

    res.status(201).json(concert);
  }
  
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//CONTROLLER TO LET USERS JOIN WITH THE SAME INVITE CODE
export const joinConcert = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { name } = req.body;

    //DEBUG PRINTS
    console.log("Invite code received:", inviteCode);
    console.log("Name received:", name);
    //DEBUG PRINTS ENDS

    const concert = await Concert.findOne({ 
      inviteCode: inviteCode.toUpperCase() 
    });
    
    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    await Concert.updateOne(
      { inviteCode: inviteCode.toUpperCase() },
      { $push: { participants: name } }
    );

    const updatedConcert = await Concert.findOne({ inviteCode: inviteCode.toUpperCase() });

    res.json(updatedConcert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//to GET ALL THE CONCERTS
export const getConcerts = async (req, res) => {
  try {
    const concerts = await Concert.find();
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//TO GET CONCERTS AFTER PUTTING IN THE INVITE CODE 
//THIS API IS MY ACTUAL CONCERT PAGE LOADER
export const getConcertByInviteCode = async (req, res) => {
  try {
    const concert = await Concert.findOne({
      inviteCode: req.params.inviteCode.toUpperCase(),
    });

    if (!concert) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(concert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//TO GET CONCERTS BY ID 
export const getConcertById = async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);

    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    res.json(concert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE CONCERT DETAILS
export const updateConcert = async (req, res) => {
  try {
    const updatedConcert = await Concert.findByIdAndUpdate(
      req.params.id,     // which concert
      req.body,          // new data
      { new: true }      // return updated value
    );

    if (!updatedConcert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    res.json(updatedConcert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE THE DETAILS
export const deleteConcert = async (req, res) => {
  try {
    const deletedConcert = await Concert.findByIdAndDelete(req.params.id);

    if (!deletedConcert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    res.json({ message: "Concert deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//HOST CONTROL API
export const updatePlayback = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { currentSongIndex, isPlaying, timestamp, userName } = req.body;

    const concert = await Concert.findById(roomId);

    if (!concert) {
      return res.status(404).json({ message: "Room not found" });
    }

    // ✅ host check
    if (concert.host !== userName) {
      return res.status(403).json({ message: "Only host can control playback" });
    }

    concert.currentSongIndex = currentSongIndex;
    concert.isPlaying = isPlaying;
    concert.timestamp = timestamp;

    await concert.save();

    res.status(200).json(concert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};