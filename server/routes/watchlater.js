import express from "express";
import {
  getallwatchlater,
  handlewatchlater,
  checkWatchLater,
} from "../controllers/watchlater.js";

const routes = express.Router();
routes.post("/check", checkWatchLater);
routes.get("/:userId", getallwatchlater);
routes.post("/:videoId", handlewatchlater);
export default routes;
