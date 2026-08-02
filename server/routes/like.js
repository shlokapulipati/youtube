import express from "express";
import { handlelike, getallLikedVideo, checkLike } from "../controllers/like.js";

const routes = express.Router();
routes.post("/check", checkLike);
routes.get("/:userId", getallLikedVideo);
routes.post("/:videoId", handlelike);
export default routes;
