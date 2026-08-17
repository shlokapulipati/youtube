import subscribe from "../Modals/subscribe.js";

export const handleSubscribe = async (req, res) => {
  const { userId, channelName } = req.body;
  if (!userId || !channelName) return res.status(400).json({ message: "Invalid request" });

  try {
    const existing = await subscribe.findOne({ viewer: userId, channelName });
    if (existing) {
      // Unsubscribe
      await subscribe.findByIdAndDelete(existing._id);
      return res.status(200).json({ subscribed: false });
    } else {
      // Subscribe
      await subscribe.create({ viewer: userId, channelName });
      return res.status(200).json({ subscribed: true });
    }
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkSubscribe = async (req, res) => {
  const { userId, channelName } = req.body;
  if (!userId || !channelName) return res.status(200).json({ subscribed: false });
  try {
    const existing = await subscribe.findOne({ viewer: userId, channelName });
    return res.status(200).json({ subscribed: !!existing });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriberCount = async (req, res) => {
  const { channelName } = req.params;
  try {
    const count = await subscribe.countDocuments({ channelName });
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
