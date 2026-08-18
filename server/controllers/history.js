import video from "../Modals/video.js";
import history from "../Modals/history.js";
import mongoose from "mongoose";

export const handlehistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existingHistory = await history.findOne({ viewer: userId, videoid: videoId });
    if (!existingHistory) {
      await history.create({ viewer: userId, videoid: videoId });
      if (mongoose.Types.ObjectId.isValid(videoId)) {
         await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
      }
    } else {
      existingHistory.updatedAt = new Date();
      await existingHistory.save();
    }
    return res.status(200).json({ history: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const handleview = async (req, res) => {
  const { videoId } = req.params;
  try {
    if (mongoose.Types.ObjectId.isValid(videoId)) {
       await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    }
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getallhistoryVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const historyvideo = await history
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .sort({ updatedAt: -1 })
      .exec();
    return res.status(200).json(historyvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const removehistory = async (req, res) => {
  const { id } = req.params;
  try {
    await history.findByIdAndDelete(id);
    return res.status(200).json({ history: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
