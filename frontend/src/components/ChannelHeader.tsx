import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);

  useEffect(() => {
    const fetchSubData = async () => {
      if (!channel?.channelname) return;
      try {
        const countRes = await axiosInstance.get(`/subscribe/count/${channel.channelname}`);
        setSubCount(countRes.data.count);

        if (user) {
          const checkRes = await axiosInstance.post("/subscribe/check", {
            userId: user._id,
            channelName: channel.channelname
          });
          setIsSubscribed(checkRes.data.subscribed);
        }
      } catch (err) {
        console.error("Error fetching subscribe data", err);
      }
    };
    fetchSubData();
  }, [channel, user]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }
    try {
      const res = await axiosInstance.post("/subscribe", {
        userId: user._id,
        channelName: channel.channelname
      });
      setIsSubscribed(res.data.subscribed);
      setSubCount(prev => res.data.subscribed ? prev + 1 : prev - 1);
      toast.success(res.data.subscribed ? "Subscribed!" : "Unsubscribed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update subscription");
    }
  };
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden"></div>

      {/* Channel Info */}
      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="w-20 h-20 md:w-32 md:h-32">
            <AvatarFallback className="text-2xl">
              {channel?.channelname[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">{channel?.channelname}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>@{channel?.channelname.toLowerCase().replace(/\s+/g, "")}</span>
              <span>{subCount} subscribers</span>
            </div>
            {channel?.description && (
              <p className="text-sm text-gray-700 max-w-2xl">
                {channel?.description}
              </p>
            )}
          </div>

          {user && user?._id !== channel?._id && (
            <div className="flex gap-2">
              <Button
                onClick={handleSubscribe}
                variant={isSubscribed ? "outline" : "default"}
                className={
                  isSubscribed ? "bg-gray-100" : "bg-red-600 hover:bg-red-700 text-white"
                }
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
