import express from "express";
import {
  getallhistoryVideo,
  handlehistory,
  handleview,
  removehistory,
} from "../controllers/history.js";

const routes = express.Router();
routes.get("/:userId", getallhistoryVideo);
routes.post("/views/:videoId", handleview);
routes.post("/:videoId", handlehistory);
routes.delete("/remove/:id", removehistory);
export default routes;
