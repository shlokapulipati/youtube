import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    // Using the local videos you placed in the public/video folder
    const mockVideos = [
      {
        _id: "111111111111111111111111",
        videotitle: "First Screen Recording",
        filename: "Screen Recording 2026-03-17 194808.mp4",
        filetype: "video/mp4",
        filepath: "/video/Screen Recording 2026-03-17 194808.mp4",
        filesize: "5MB",
        videochanel: "Local Tester",
        Like: 150,
        views: 1200,
        uploader: "user_local",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "222222222222222222222222",
        videotitle: "Second Screen Recording",
        filename: "Screen Recording 2026-07-04 192248.mp4",
        filetype: "video/mp4",
        filepath: "/video/Screen Recording 2026-07-04 192248.mp4",
        filesize: "50MB",
        videochanel: "Local Tester",
        Like: 890,
        views: 23000,
        uploader: "user_local",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: "333333333333333333333333",
        videotitle: "Third Screen Recording",
        filename: "Screen Recording 2026-07-05 182954.mp4",
        filetype: "video/mp4",
        filepath: "/video/Screen Recording 2026-07-05 182954.mp4",
        filesize: "44MB",
        videochanel: "Local Tester",
        Like: 300,
        views: 4000,
        uploader: "user_local",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        _id: "444444444444444444444444",
        videotitle: "Sample VDO",
        filename: "vdo.mp4",
        filetype: "video/mp4",
        filepath: "/video/vdo.mp4",
        filesize: "1MB",
        videochanel: "Local Tester",
        Like: 50,
        views: 300,
        uploader: "user_local",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    setvideo(mockVideos);
    setloading(false);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading ? (
        <>Loading..</>
      ) : (
        videos.map((video: any) => <Videocard key={video._id} video={video} />)
      )}
    </div>
  );
};

export default Videogrid;
