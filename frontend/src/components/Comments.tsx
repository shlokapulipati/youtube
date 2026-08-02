import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown, Flag, Globe2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  usercommented: string;
  commentbody: string;
  commentedon: string;
  location?: string;
  likes?: string[];
  dislikes?: string[];
  reports?: string[];
  status?: string;
  isTranslated?: boolean;
  translatedText?: string;
}

const BAD_WORDS = ["spam", "abuse", "fake", "scam"]; 

const detectSpamOrAbuse = (text: string) => {
  const lowerText = text.toLowerCase();
  
  const containsBadWords = BAD_WORDS.some(word => lowerText.includes(word));
  const repeatedCharsRegex = /([!@#$%^&*])\1{4,}/;
  const longWordsRegex = /[^\s]{25,}/;

  if (containsBadWords) return "Your comment contains inappropriate language.";
  if (repeatedCharsRegex.test(text)) return "Please avoid excessive special characters.";
  if (longWordsRegex.test(text)) return "Your comment looks like spam.";
  
  return null; 
};

const Comments = ({ videoId }: { videoId: string }) => {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (videoId) {
      axiosInstance.get(`/comment/${videoId}`)
        .then(res => setComments(res.data))
        .catch(err => console.error("Error fetching comments", err));
    }
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to comment.");
      return;
    }

    const spamError = detectSpamOrAbuse(newComment);
    if (spamError) {
      setError(spamError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        usercommented: user.name || "Anonymous",
        commentbody: newComment,
        location: showLocation ? "Shared Location" : undefined,
      });

      // Refetch comments
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
      setNewComment("");
      setShowLocation(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async (commentId: string, text: string) => {
    const comment = comments.find(c => c._id === commentId);
    if (!comment) return;

    if (comment.isTranslated) {
      setComments(comments.map(c => c._id === commentId ? { ...c, isTranslated: false } : c));
      return;
    }

    if (comment.translatedText) {
      setComments(comments.map(c => c._id === commentId ? { ...c, isTranslated: true } : c));
      return;
    }

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|en`);
      const data = await res.json();
      const translated = data.responseData.translatedText;
      
      setComments(comments.map(c => c._id === commentId ? { 
        ...c, 
        isTranslated: true, 
        translatedText: translated 
      } : c));
    } catch (err) {
      console.error("Translation failed", err);
    }
  };

  const handleAction = async (commentId: string, action: "like" | "dislike" | "report") => {
    if (!user) return toast.error("Please login to " + action);
    try {
      const res = await axiosInstance.post(`/comment/${action}/${commentId}`, { userid: user._id });
      setComments(comments.map(c => c._id === commentId ? { ...c, ...res.data } : c));
      if (action === "report") {
        toast.success("Comment reported for review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-xl font-bold">{comments.length} Comments</h3>
      
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.image} />
          <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:ring-0 resize-none min-h-[40px] px-0 pb-1"
              rows={1}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            
            <div className="flex justify-between items-center mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showLocation} 
                  onChange={(e) => setShowLocation(e.target.checked)} 
                />
                <MapPin className="w-4 h-4" /> Share rough location
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setNewComment("")}>Cancel</Button>
                <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                  Comment
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{comment.usercommented?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">@{comment.usercommented}</span>
                <span className="text-xs text-gray-500">
                  {comment.commentedon ? formatDistanceToNow(new Date(comment.commentedon)) : "recently"} ago
                </span>
                {comment.location && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    📍 {comment.location}
                  </span>
                )}
                {comment.status === "flagged_for_review" && (
                  <span className="text-xs text-red-500 font-medium">
                    (Flagged for review)
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm">
                {comment.isTranslated ? comment.translatedText : comment.commentbody}
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                <button onClick={() => handleAction(comment._id, "like")} className={`flex items-center gap-1 hover:text-black ${comment.likes?.includes(user?._id) ? "text-blue-600" : "text-gray-500"}`}>
                  <ThumbsUp className="w-4 h-4" /> <span className="text-xs">{comment.likes?.length || ""}</span>
                </button>
                <button onClick={() => handleAction(comment._id, "dislike")} className={`flex items-center gap-1 hover:text-black ${comment.dislikes?.includes(user?._id) ? "text-red-600" : "text-gray-500"}`}>
                  <ThumbsDown className="w-4 h-4" /> <span className="text-xs">{comment.dislikes?.length || ""}</span>
                </button>
                <button onClick={() => handleTranslate(comment._id, comment.commentbody)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-black font-medium">
                  <Globe2 className="w-3 h-3" /> {comment.isTranslated ? "Show original" : "Translate"}
                </button>
                <button onClick={() => handleAction(comment._id, "report")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 font-medium ml-auto">
                  <Flag className="w-3 h-3" /> Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;

