import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const [videos, setvideo] = useState<any>(null);
  const [video, setvide] = useState<any>(null);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchvideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        let allVideos = [];
        try {
          const res = await axiosInstance.get("/video/getall");
          allVideos = res.data || [];
        } catch (err) {
          console.log("Failed to fetch from backend, using mocks");
        }
        
        // Mock fallback if DB is empty
        if (allVideos.length === 0) {
          allVideos = [
            { _id: "111111111111111111111111", videotitle: "First Screen Recording", filepath: "/video/Screen Recording 2026-03-17 194808.mp4", videochanel: "Local Tester", views: 1200, createdAt: new Date().toISOString() },
            { _id: "222222222222222222222222", videotitle: "Second Screen Recording", filepath: "/video/Screen Recording 2026-07-04 192248.mp4", videochanel: "Local Tester", views: 23000, createdAt: new Date().toISOString() },
            { _id: "333333333333333333333333", videotitle: "Third Screen Recording", filepath: "/video/Screen Recording 2026-07-05 182954.mp4", videochanel: "Local Tester", views: 4000, createdAt: new Date().toISOString() },
            { _id: "444444444444444444444444", videotitle: "Sample VDO", filepath: "/video/vdo.mp4", videochanel: "Local Tester", views: 300, createdAt: new Date().toISOString() },
          ];
        }

        const video = allVideos.filter((vid: any) => vid._id === id);
        setvideo(video[0]);
        setvide(allVideos);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, [id]);
  // const relatedVideos = [
  //   {
  //     _id: "1",
  //     videotitle: "Amazing Nature Documentary",
  //     filename: "nature-doc.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/nature-doc.mp4",
  //     filesize: "500MB",
  //     videochanel: "Nature Channel",
  //     Like: 1250,
  //     Dislike: 50,
  //     views: 45000,
  //     uploader: "nature_lover",
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     _id: "2",
  //     videotitle: "Cooking Tutorial: Perfect Pasta",
  //     filename: "pasta-tutorial.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/pasta-tutorial.mp4",
  //     filesize: "300MB",
  //     videochanel: "Chef's Kitchen",
  //     Like: 890,
  //     Dislike: 20,
  //     views: 23000,
  //     uploader: "chef_master",
  //     createdAt: new Date(Date.now() - 86400000).toISOString(),
  //   },
  // ];
  if (loading) {
    return <div>Loading..</div>;
  }
  
  if (!videos) {
    return <div>Video not found</div>;
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videopplayer video={videos} />
            <VideoInfo video={videos} />
            <Comments videoId={id} />
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
