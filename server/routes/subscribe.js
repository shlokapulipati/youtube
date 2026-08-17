import express from "express";
import { handleSubscribe, checkSubscribe, getSubscriberCount } from "../controllers/subscribe.js";

const routes = express.Router();

routes.post("/", handleSubscribe);
routes.post("/check", checkSubscribe);
routes.get("/count/:channelName", getSubscriberCount);

export default routes;
