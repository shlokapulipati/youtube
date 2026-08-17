import download from "../Modals/download.js";
import User from "../Modals/Auth.js";
import mongoose from "mongoose";

export const requestDownload = async (req, res) => {
  const { userid, videoid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userid) || !mongoose.Types.ObjectId.isValid(videoid)) {
    return res.status(404).send("Invalid details");
  }

  try {
    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const downloadsToday = await download.countDocuments({
      userid: userid,
      downloadedAt: { $gte: startOfDay }
    });

    let limit = 1;
    if (user.plan === "Bronze") limit = 5;
    else if (user.plan === "Silver") limit = 10;
    else if (user.plan === "Gold") limit = Infinity; // Unlimited

    if (downloadsToday >= limit) {
      return res.status(403).json({ 
        message: `${user.plan} users can only download ${limit} videos per day. Please upgrade your plan.` 
      });
    }
    
    const alreadyDownloaded = await download.findOne({ userid, videoid });
    if (alreadyDownloaded) {
      return res.status(400).json({ message: "Video already downloaded" });
    }

    const newDownload = new download({ userid, videoid });
    await newDownload.save();

    return res.status(200).json({ message: "Download successful" });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getDownloads = async (req, res) => {
  const { userid } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(404).send("User unavailable");
  }

  try {
    const downloads = await download.find({ userid: userid })
      .populate("videoid")
      .sort({ downloadedAt: -1 });
    return res.status(200).json(downloads);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const removedownload = async (req, res) => {
  const { id } = req.params;
  try {
    await download.findByIdAndDelete(id);
    return res.status(200).json({ message: "Download removed successfully" });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
