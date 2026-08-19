import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  const [channelData, setChannelData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!id) return;
      try {
        const [videosRes, userRes] = await Promise.all([
           axiosInstance.get(`/video/channel/${id}`).catch(() => ({ data: [] })),
           axiosInstance.get(`/user/${id}`).catch(() => ({ data: { result: null } }))
        ]);
        setVideos(videosRes.data);
        setChannelData(userRes.data.result);
      } catch (error) {
        console.error("Failed to fetch channel data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [id]);

  if (loading) {
    return <div className="flex-1 min-h-screen flex items-center justify-center">Loading channel...</div>;
  }

  try {
    let channel = channelData || {};
    return (
      <div className="flex-1 min-h-screen bg-white">
        <div className="max-w-full mx-auto">
          <ChannelHeader channel={channel} user={user} />
          <Channeltabs />
          <div className="px-4 pb-8">
            <VideoUploader channelId={id} channelName={channel?.channelname} />
          </div>
          <div className="px-4 pb-8">
            {loading ? <div>Loading videos...</div> : <ChannelVideos videos={videos} />}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching channel data:", error);
   
  }
};

export default index;
