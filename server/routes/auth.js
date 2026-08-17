import express from "express";
import { login, updateprofile, verifyOtp, updateTheme } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.post("/verify-otp", verifyOtp);
routes.patch("/theme/:id", updateTheme);
routes.patch("/update/:id", updateprofile);
export default routes;
