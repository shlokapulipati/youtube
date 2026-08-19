import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video?.Like || 0);
  const [dislikes, setDislikes] = useState(video?.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [subscribers, setSubscribers] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  useEffect(() => {
    setlikes(video?.Like || 0);
    setDislikes(video?.Dislike || 0);
    
    const checkStatus = async () => {
      const videoId = video?._id;
      if (user && videoId) {
        try {
          const [likeRes, watchRes] = await Promise.all([
            axiosInstance.post('/like/check', { userId: user._id, videoId: videoId }),
            axiosInstance.post('/watch/check', { userId: user._id, videoId: videoId })
          ]);
          setIsLiked(likeRes.data.liked);
          setIsDisliked(likeRes.data.disliked);
          setIsWatchLater(watchRes.data.watchlater);
        } catch (error) {
          console.error("Failed to check status", error);
        }
      }
    };
    
    const fetchSubData = async () => {
      const channelTitle = video?.videochanel;
      if (channelTitle) {
        try {
          const subCountRes = await axiosInstance.get(`/subscribe/count/${encodeURIComponent(channelTitle)}`);
          setSubscribers(subCountRes.data.count || 0);
          
          if (user) {
             const subCheckRes = await axiosInstance.post('/subscribe/check', { userId: user._id, channelName: channelTitle });
             setIsSubscribed(subCheckRes.data.subscribed);
          }
        } catch (error) { console.error("Sub fetch failed", error); }
      }
    };

    checkStatus();
    fetchSubData();
  }, [video, user]);

  useEffect(() => {
    const handleviews = async () => {
      const videoId = video?._id;
      if (user) {
        try {
          return await axiosInstance.post(`/history/${videoId}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        try {
          return await axiosInstance.post(`/history/views/${videoId}`);
        } catch (error) {
          return console.log(error);
        }
      }
    };
    handleviews();
  }, [user]);
  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like videos");
      return;
    }
    try {
      const videoId = video?._id;
      const res = await axiosInstance.post(`/like/${videoId}`, {
        userId: user?._id,
        action: 'like'
      });
      if (res.status === 200) {
        const { status } = res.data;
        if (status === 'added') {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
        } else if (status === 'removed') {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else if (status === 'switched') {
          setlikes((prev: any) => prev + 1);
          setDislikes((prev: any) => prev - 1);
          setIsLiked(true);
          setIsDisliked(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleWatchLater = async () => {
    if (!user) {
      toast.error("Please sign in to save videos");
      return;
    }
    try {
      const videoId = video?._id;
      const res = await axiosInstance.post(`/watch/${videoId}`, {
        userId: user?._id,
      });
      setIsWatchLater(res.data.watchlater);
      toast.success(res.data.watchlater ? "Added to Watch Later" : "Removed from Watch Later");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update Watch Later");
    }
  };
  const handleDislike = async () => {
    if (!user) {
      toast.error("Please sign in to dislike videos");
      return;
    }
    try {
      const videoId = video?._id;
      const res = await axiosInstance.post(`/like/${videoId}`, {
        userId: user?._id,
        action: 'dislike'
      });
      if (res.status === 200) {
        const { status } = res.data;
        if (status === 'added') {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
        } else if (status === 'removed') {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else if (status === 'switched') {
          setDislikes((prev: any) => prev + 1);
          setlikes((prev: any) => prev - 1);
          setIsDisliked(true);
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please sign in to download videos");
      return;
    }
    
    try {
      toast.loading("Requesting download...", { id: "download" });
      const videoId = video?._id;
      const res = await axiosInstance.post(`/download/request`, {
        userid: user._id,
        videoid: videoId
      });
      toast.success(res.data.message || "Video downloaded successfully", { id: "download" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download video", { id: "download" });
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }
    try {
      const channelTitle = video?.videochanel;
      const res = await axiosInstance.post('/subscribe', { userId: user._id, channelName: channelTitle });
      if (res.data.subscribed) {
         setIsSubscribed(true);
         setSubscribers(prev => prev + 1);
         toast.success("Subscribed successfully!");
      } else {
         setIsSubscribed(false);
         setSubscribers(prev => prev > 0 ? prev - 1 : 0);
         toast.success("Unsubscribed.");
      }
    } catch (err) {
      toast.error("Failed to update subscription");
    }
  };

  const title = video?.videotitle;
  const channelTitle = video?.videochanel;
  const views = video?.views || 0;
  const publishedAt = video?.createdAt;
  const description = video?.description || "Sample video description from standard database structures.";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
        <div className="flex items-center gap-4 shrink-0">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{channelTitle?.[0] || 'Y'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-foreground">{channelTitle}</h3>
            <p className="text-sm text-muted-foreground">{subscribers.toLocaleString()} subscribers</p>
          </div>
          <Button 
            className={`ml-4 ${isSubscribed ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            onClick={handleSubscribe}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <div className="flex flex-nowrap items-center bg-secondary text-secondary-foreground rounded-full shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-5 h-5 mr-2 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`bg-secondary text-secondary-foreground rounded-full ${
              isWatchLater ? "text-primary font-semibold" : ""
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-secondary text-secondary-foreground rounded-full"
            onClick={handleShare}
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-secondary text-secondary-foreground rounded-full"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-secondary text-secondary-foreground rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="bg-secondary text-secondary-foreground rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2 opacity-80">
          <span>{views.toLocaleString()} views</span>
          <span>{publishedAt ? formatDistanceToNow(new Date(publishedAt)) : ""} ago</span>
        </div>
        <div className={`text-sm ${showFullDescription ? "whitespace-pre-wrap" : "line-clamp-3"}`}>
          <p>
            {description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
