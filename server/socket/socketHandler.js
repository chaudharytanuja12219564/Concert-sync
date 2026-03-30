//ROOM STATE
const roomStates = {};

//PARTICIPANTS
const roomParticipants ={};

//HOST 
const roomHosts = {};

//SONG INDEX STORAGE
const roomSongIndex = {};

// Import Concert model for database cleanup
import Concert from "../models/concert.js";

export const initSocket = (io) => {
    // SOCKET CONNECTION
    io.on("connection", (socket) => {
        console.log("User connected", socket.id);

        //JOIN ROOM CONSOLE
        socket.on("join-room", async ({ inviteCode , name}) => {
            socket.join(inviteCode);
            socket.username =  name;
            
            // ✅ INITIALIZE ROOM DATA IF FIRST USER
            if (!roomHosts[inviteCode]) {
                // Fetch from database to get the real host
                try {
                    const concert = await Concert.findOne({ inviteCode });
                    if (concert) {
                        roomHosts[inviteCode] = concert.host;
                        
                        // Initialize participants if not already done
                        if (!roomParticipants[inviteCode]) {
                            roomParticipants[inviteCode] = concert.participants || [];
                        }
                        
                        console.log(`✅ Room initialized - Host: ${concert.host}, Participants: ${roomParticipants[inviteCode].length}`);
                    }
                } catch (error) {
                    console.error(`❌ Error fetching concert ${inviteCode}:`, error.message);
                }
            }
            
            console.log("User joined room:", inviteCode);

            if (!roomParticipants[inviteCode]) {
                roomParticipants[inviteCode] = [];
            }
            
            // Only add if not already in participants list
            if (!roomParticipants[inviteCode].includes(name)) {
                roomParticipants[inviteCode].push(name);
            }

            // ✅ EMIT UPDATED PARTICIPANTS TO ALL USERS AND SEND INITIAL STATE
            io.to(inviteCode).emit("participants-update", roomParticipants[inviteCode]);
            
            // Send initial playback state to newly joined user
            const state = roomStates[inviteCode];
            if (state) {
                socket.emit("syncPlayback", {
                    song: state.song,
                    currentTime: state.currentTime,
                    isPlaying: state.isPlaying
                });
            }

            console.log(`${name} joined ${inviteCode} (Host: ${roomHosts[inviteCode]}, Total Participants: ${roomParticipants[inviteCode].length})`);
        });

        //MESSAGE CONSOLE
        socket.on("send-message", ({ inviteCode, message }) => {
            console.log("📨 message received:", message);
            io.to(inviteCode).emit("receive-message", message);
        });
        
        //SYNC SONG FEATURE GOES HERE
        socket.on("play-song", ({ inviteCode, song , currentTime}) => {

            if(socket.username !== roomHosts[inviteCode]){
                console.log("Not host -- blocked");
                return;
            }

            roomStates[inviteCode] = { song , currentTime, isPlaying: true };

            if(!roomSongIndex[inviteCode]){
                roomSongIndex[inviteCode] = 0;
            }
            // console.log("play request:", song.songName);

            io.to(inviteCode).emit("play-song", song, currentTime);
        });

       //HOST PLAY / PAUSE / TIMESTAMP SYNC
        socket.on("hostPlayback", ({ inviteCode, currentTime, isPlaying }) => {

            if(socket.username !== roomHosts[inviteCode]){
                console.log("Not host -- blocked");
                return;
            }

            console.log("⏯ HOST PLAYBACK UPDATE:", currentTime, isPlaying);

            if(roomStates[inviteCode]){
                roomStates[inviteCode].currentTime = currentTime;
                roomStates[inviteCode].isPlaying = isPlaying;
            }

            io.to(inviteCode).emit("syncPlayback", {
                currentTime,
                isPlaying
            });

        });

        //HOST SEEK SYNC
        socket.on("seek-song", ({ inviteCode, currentTime }) => {

            if(socket.username !== roomHosts[inviteCode]){
                console.log("Not host -- blocked");
                return;
            }

            console.log("⏩ HOST SEEK:", currentTime);

            if(roomStates[inviteCode]){
                roomStates[inviteCode].currentTime = currentTime;
            }

            io.to(inviteCode).emit("seek-song", {
                currentTime
            });

        });

        //SONG END EVENT
        socket.on("song-ended", ({ inviteCode, playlist }) => {

            if(socket.username !== roomHosts[inviteCode]){
                console.log("Not host -- blocked");
                return;
            }

            roomSongIndex[inviteCode]++;

            if(roomSongIndex[inviteCode] >= playlist.length){
                roomSongIndex[inviteCode] = 0; // restart playlist
            }

            const nextSong = playlist[roomSongIndex[inviteCode]];

            console.log("▶ AUTO PLAY NEXT SONG:", nextSong.songName);

            roomStates[inviteCode] = {
                song: nextSong,
                currentTime: 0,
                isPlaying: true
            };

            io.to(inviteCode).emit("play-song", nextSong, 0);

        });

        //USER CONNECTION STATUS
        socket.on("disconnect", async () => {

            for (const inviteCode in roomParticipants) {

                roomParticipants[inviteCode] = roomParticipants[inviteCode].filter(
                    (n) => n !== socket.username
                );

                io.to(inviteCode).emit(
                    "participants-update",
                    roomParticipants[inviteCode]
                );

                console.log(`${socket.username} left ${inviteCode}`);

                // 🚀 HOST TRANSFER
                if(roomHosts[inviteCode] === socket.username){

                    const newHost = roomParticipants[inviteCode][0];

                    if(newHost){
                        roomHosts[inviteCode] = newHost;

                        console.log(`👑 New host: ${newHost}`);

                        io.to(inviteCode).emit("host-changed", newHost);
                    }
                }

                io.to(inviteCode).emit(
                    "participants-update",
                    roomParticipants[inviteCode]
                );

                // 🚀 CLEANUP IF ROOM EMPTY
                if (roomParticipants[inviteCode].length === 0) {

                    console.log(`🧹 Cleaning empty room: ${inviteCode}`);

                    delete roomParticipants[inviteCode];
                    delete roomStates[inviteCode];
                    delete roomHosts[inviteCode];
                    delete roomSongIndex[inviteCode];

                    // 🗑️ DELETE FROM DATABASE
                    try {
                        await Concert.deleteOne({ inviteCode });
                        console.log(`✅ Room ${inviteCode} deleted from database`);
                        
                        // Notify all users in the room that it's deleted
                        io.to(inviteCode).emit("room-deleted", { inviteCode });
                    } catch (error) {
                        console.error(`❌ Error deleting room ${inviteCode}:`, error.message);
                    }
                }
            }
            console.log("User disconnected");
        });
    });

};