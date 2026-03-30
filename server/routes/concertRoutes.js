import express from "express";
import { createConcert, getConcerts, getConcertById, updateConcert, deleteConcert, joinConcert , getConcertByInviteCode, updatePlayback } from "../controllers/concertControllers.js";

const router = express.Router();

router.post("/", createConcert);
router.get("/", getConcerts); 

router.post("/join/:inviteCode", joinConcert);
router.get("/room/:inviteCode", getConcertByInviteCode); ////THIS API IS MY ACTUAL CONCERT PAGE LOADER

router.get("/:id", getConcertById);
router.put("/:id", updateConcert);
router.delete("/:id", deleteConcert);
//host playback control
router.put("/:id", updatePlayback);

export default router;
