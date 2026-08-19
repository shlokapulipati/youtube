import comment from "../Modals/comment.js";
import mongoose from "mongoose";

const BAD_WORDS = ["spam", "abuse", "fake", "scam", "stupid", "idiot", "badword", "hate", "motherfucker", "bitch", "fuck", "shit", "asshole", "bastard", "crap", "cunt", "dick", "pussy", "slut", "whore", "kill", "die", "nigger", "faggot", "retard"];

const detectSpamOrAbuse = (text) => {
  if (!text) return null;
  const lowerText = text.toLowerCase();
  
  const containsBadWords = BAD_WORDS.some(word => lowerText.includes(word));
  const repeatedCharsRegex = /([!@#$%^&*])\1{4,}/;
  const longWordsRegex = /[^\s]{25,}/;

  if (containsBadWords) return "Comment contains inappropriate language.";
  if (repeatedCharsRegex.test(text)) return "Avoid excessive special characters.";
  if (longWordsRegex.test(text)) return "Comment looks like spam.";
  
  return null;
};

export const postcomment = async (req, res) => {
  const commentdata = req.body;
  
  const spamError = detectSpamOrAbuse(commentdata.commentbody);
  if (spamError) {
    return res.status(400).json({ message: spamError });
  }

  const postcomment = new comment(commentdata);
  try {
    await postcomment.save();
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likeComment = async (req, res) => {
  const { id: _id } = req.params;
  const { userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");
  try {
    const c = await comment.findById(_id);
    if (!c) return res.status(404).send("Comment not found");
    if (!c.likes.some((id) => String(id) === String(userid))) {
      c.likes.push(userid);
      c.dislikes = c.dislikes.filter((id) => String(id) !== String(userid)); // Remove from dislikes if exists
      await c.save();
    }
    return res.status(200).json(c);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikeComment = async (req, res) => {
  const { id: _id } = req.params;
  const { userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");
  try {
    const c = await comment.findById(_id);
    if (!c) return res.status(404).send("Comment not found");
    if (!c.dislikes.some((id) => String(id) === String(userid))) {
      c.dislikes.push(userid);
      c.likes = c.likes.filter((id) => String(id) !== String(userid)); // Remove from likes if exists
      await c.save();
    }
    return res.status(200).json(c);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const reportComment = async (req, res) => {
  const { id: _id } = req.params;
  const { userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");
  try {
    const c = await comment.findById(_id);
    if (!c) return res.status(404).send("Comment not found");
    if (!c.reports.some((id) => String(id) === String(userid))) {
      c.reports.push(userid);
      c.status = "flagged_for_review";
      await c.save();
    }
    return res.status(200).json(c);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
