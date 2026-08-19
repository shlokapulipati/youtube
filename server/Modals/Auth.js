import mongoose from "mongoose";
const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  plan: { type: String, enum: ["Free", "Bronze", "Silver", "Gold"], default: "Free" },
  theme: { type: String, enum: ["auto", "light", "dark"], default: "auto" },
  shareLocation: { type: Boolean, default: true },
  knownDevices: [
    {
      userAgent: { type: String },
      city: { type: String },
      state: { type: String },
      lastLogin: { type: Date, default: Date.now }
    }
  ],
  otp: { type: String },
  otpExpires: { type: Date }
});

export default mongoose.model("user", userschema);
