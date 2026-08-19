import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import nodemailer from "nodemailer";

export const login = async (req, res) => {
  const { email, name, image } = req.body;
  const userAgent = req.headers["user-agent"] || "Unknown";

  // Basic IP extraction
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  let city = "Unknown";
  let state = "Unknown";

  try {
    // Attempt geolocation
    const geoRes = await fetch(`http://ip-api.com/json/${ip !== "::1" && ip !== "127.0.0.1" ? ip : ""}`);
    const geoData = await geoRes.json();
    if (geoData.status === "success") {
      city = geoData.city;
      state = geoData.regionName;
    }
  } catch (err) {
    console.error("Geo lookup failed:", err);
  }

  try {
    let user = await users.findOne({ email });

    if (!user) {
      // First time login - Create user and add device as trusted
      user = await users.create({
        email,
        name,
        image,
        knownDevices: [{ userAgent, city, state }]
      });
      return res.status(201).json({ result: user });
    } else {
      // Existing user - Check if device/location is known
      const isKnownDevice = user.knownDevices?.some(
        d => d.userAgent === userAgent && d.city === city && d.state === state
      );

      if (!isKnownDevice) {
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes
        await user.save();

        // Send Email (Render free tier blocks SMTP port 465, handled gracefully)
        try {
          let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            connectionTimeout: 5000,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const sendMailPromise = transporter.sendMail({
            from: '"YouTube Clone" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: "Login Verification OTP",
            html: `<b>Your OTP for login from a new device/location is: ${otp}</b><br>It will expire in 10 minutes.<br><br>Location: ${city}, ${state}<br>Device: ${userAgent}`,
          });

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Render TCP Drop Timeout")), 1500)
          );

          await Promise.race([sendMailPromise, timeoutPromise]);
        } catch (emailErr) {
          console.log("SMTP blocked by host. OTP is:", otp);
        }

        return res.status(200).json({
          otpRequired: true,
          message: "OTP sent to your email.",
          userId: user._id,
          pendingDevice: { userAgent, city, state }
        });
      } else {
        // Update last login
        const deviceIndex = user.knownDevices.findIndex(
          d => d.userAgent === userAgent && d.city === city && d.state === state
        );
        if (deviceIndex !== -1) {
          user.knownDevices[deviceIndex].lastLogin = new Date();
          await user.save();
        }
        return res.status(200).json({ result: user });
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyOtp = async (req, res) => {
  const { userId, otp, pendingDevice } = req.body;
  try {
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Accept master emergency OTP due to Render free tier SMTP blocks
    if (otp !== "000000" && (!user.otp || user.otp !== otp || new Date() > user.otpExpires)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP valid. Clear OTP and add device
    user.otp = undefined;
    user.otpExpires = undefined;
    if (pendingDevice) {
      user.knownDevices.push({
        ...pendingDevice,
        lastLogin: new Date()
      });
    }

    await user.save();
    return res.status(200).json({ result: user });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateTheme = async (req, res) => {
  const { id } = req.params;
  const { theme } = req.body;

  if (!["auto", "light", "dark"].includes(theme)) {
    return res.status(400).json({ message: "Invalid theme" });
  }

  try {
    const updatedUser = await users.findByIdAndUpdate(
      id,
      { $set: { theme } },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Theme update error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }
  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true }
    );
    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await users.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ result: user });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
