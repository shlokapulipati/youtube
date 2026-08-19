import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import WatchPartyManager from "@/components/WatchPartyManager";
import axiosInstance from "@/lib/axiosinstance";

import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

const index = () => {
  const router = useRouter();
  const { id, partyId } = router.query;
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [allVideosList, setAllVideosList] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [remoteSyncState, setRemoteSyncState] = useState<{ isPlaying: boolean; time: number; timestamp: number } | null>(null);
  const [localSyncState, setLocalSyncState] = useState<{ isPlaying: boolean; time: number; timestamp: number } | null>(null);
  useEffect(() => {
    const fetchvideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        try {
          const res = await axiosInstance.get('/video/getall');
          const allvids = res.data || [];
          setAllVideosList(allvids);
          const found = allvids.find((v: any) => v._id === id);
          setCurrentVideo(found);
        } catch (err) {
          console.log("Failed to fetch videos from server");
        }
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
    return (
      <div className="flex-1 min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-500 font-medium">Loading...</div>
      </div>
    );
  }
  
  if (!currentVideo) {
    return (
      <div className="flex-1 min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Video not found</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">The video you're looking for isn't available anymore, or the URL is incorrect.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }
  const handleStartWatchParty = () => {
    const newPartyId = Math.random().toString(36).substring(2, 10);
    router.push(`/watch/${id}?partyId=${newPartyId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 flex flex-col gap-6">
        
        {/* Watch Party Header & Manager */}
        {partyId ? (
          <div className="min-h-[400px]">
            <WatchPartyManager 
              roomId={partyId as string} 
              onVideoSync={(state) => setRemoteSyncState(state)}
              syncStateFromVideo={localSyncState}
            />
          </div>
        ) : (
          <div className="flex justify-end">
            <button 
              onClick={handleStartWatchParty}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition font-medium"
            >
              <Users className="w-5 h-5" /> Start Watch Party
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videopplayer 
              video={currentVideo} 
              externalSyncState={remoteSyncState}
              onPlayPauseSync={(isPlaying, time) => setLocalSyncState({ isPlaying, time, timestamp: Date.now() })}
              onNext={() => {
                if (allVideosList.length > 0) {
                  const currentIndex = allVideosList.findIndex(v => (v.id || v.id?.videoId || v._id) === id);
                  const nextIndex = (currentIndex + 1) % allVideosList.length;
                  const nextId = allVideosList[nextIndex].id || allVideosList[nextIndex].id?.videoId || allVideosList[nextIndex]._id;
                  router.push(`/watch/${nextId}`);
                }
              }} 
            />
            <VideoInfo video={currentVideo} />
            <Comments videoId={id as string} />
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={allVideosList} />
          </div>
        </div> 
      </div>
    </div>
  );
};

export default index;
