import express from "express";
import { requestDownload, getDownloads, removedownload } from "../controllers/download.js";

const routes = express.Router();
routes.post("/request", requestDownload);
routes.get("/:userid", getDownloads);
routes.delete("/remove/:id", removedownload);

export default routes;
