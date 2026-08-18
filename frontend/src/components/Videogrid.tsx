import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import { fetchTrendingVideos } from "@/lib/youtubeApi";

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await fetchTrendingVideos();
        setvideo(data || []);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setloading(false);
      }
    };
    
    fetchVideos();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading ? (
        <>Loading..</>
      ) : (
        videos.map((video: any) => <Videocard key={video.id || video._id} video={video} />)
      )}
    </div>
  );
};

export default Videogrid;
