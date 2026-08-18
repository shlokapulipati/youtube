import video from "../Modals/video.js";
import like from "../Modals/like.js";
import mongoose from "mongoose";

export const handlelike = async (req, res) => {
  const { userId, action } = req.body; // action can be 'like' or 'dislike'
  const { videoId } = req.params;
  
  try {
    const existingAction = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });

    if (existingAction) {
      if (existingAction.action === action) {
        // Toggle off the same action
        await like.findByIdAndDelete(existingAction._id);
        if (action === 'like') {
          if (mongoose.Types.ObjectId.isValid(videoId)) await video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });
        } else {
          if (mongoose.Types.ObjectId.isValid(videoId)) await video.findByIdAndUpdate(videoId, { $inc: { Dislike: -1 } });
        }
        return res.status(200).json({ status: 'removed' });
      } else {
        // Switch action
        existingAction.action = action;
        await existingAction.save();
        if (action === 'like') {
          if (mongoose.Types.ObjectId.isValid(videoId)) await video.findByIdAndUpdate(videoId, { $inc: { Like: 1, Dislike: -1 } });
        } else {
          if (mongoose.Types.ObjectId.isValid(videoId)) await video.findByIdAndUpdate(videoId, { $inc: { Dislike: 1, Like: -1 } });
        }
        return res.status(200).json({ status: 'switched', action });
      }
    } else {
      // Create new action
      await like.create({ viewer: userId, videoid: videoId, action });
      if (action === 'like') {
        if (mongoose.Types.ObjectId.isValid(videoId)) await video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });
      } else {
        if (mongoose.Types.ObjectId.isValid(videoId)) await video.findByIdAndUpdate(videoId, { $inc: { Dislike: 1 } });
      }
      return res.status(200).json({ status: 'added', action });
    }
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallLikedVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const likevideo = await like
      .find({ viewer: userId, action: 'like' })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(likevideo);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkLike = async (req, res) => {
  const { userId, videoId } = req.body;
  if (!userId || !videoId) return res.status(200).json({ liked: false, disliked: false });
  try {
    const existing = await like.findOne({ viewer: userId, videoid: videoId });
    if (!existing) return res.status(200).json({ liked: false, disliked: false });
    
    return res.status(200).json({ 
      liked: existing.action === 'like',
      disliked: existing.action === 'dislike'
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
