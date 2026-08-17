import mongoose from "mongoose";

const subscribeSchema = mongoose.Schema(
  {
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
    channelName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only subscribe to a channel once
subscribeSchema.index({ viewer: 1, channelName: 1 }, { unique: true });

export default mongoose.model("subscribe", subscribeSchema);
