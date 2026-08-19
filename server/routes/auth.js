import express from "express";
import { login, updateprofile, verifyOtp, updateTheme, getUser } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.post("/verify-otp", verifyOtp);
routes.patch("/theme/:id", updateTheme);
routes.patch("/update/:id", updateprofile);
routes.get("/:id", getUser);
export default routes;
