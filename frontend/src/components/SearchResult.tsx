import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axiosInstance from "@/lib/axiosinstance";

const SearchResult = ({ query }: any) => {
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Enter a search term to find videos and channels.
        </p>
      </div>
    );
  }
  const [video, setvideos] = useState<any>(null);
  
  const videos = async () => {
    try {
      const res = await axiosInstance.get('/video/getall');
      const allVideos = res.data || [];
      const filtered = allVideos.filter((v: any) => 
        (v.videotitle?.toLowerCase().includes(query.toLowerCase())) || 
        (v.videochanel?.toLowerCase().includes(query.toLowerCase()))
      );
      setvideos(filtered);
    } catch (err) {
      console.error("Failed to fetch videos from server", err);
      setvideos([]);
    }
  };
  
  useEffect(() => {
    videos();
  }, [query]);
  
  if (!video) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-600">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }
  
  const hasResults = video.length > 0;
  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-600">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Video Results */}
      {video.length > 0 && (
        <div className="space-y-4">
          {video.map((v: any) => {
            const videoId = v._id || "";
            const title = v.videotitle;
            const channelTitle = v.videochanel;
            const views = v.views || 0;
            const publishedAt = v.createdAt;
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
            const normalizedPath = v.filepath?.replace(/\\/g, '/');
            let videoSrc = v.filepath?.startsWith("http") 
              ? v.filepath 
              : (v.filepath?.startsWith("/video/") 
                  ? v.filepath 
                  : `${backendUrl}/${normalizedPath}`);

            return (
            <div key={videoId} className="flex gap-4 group">
              <Link href={`/watch/${videoId}`} className="flex-shrink-0">
                <div className="relative w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden bg-secondary">
                  <video
                    src={videoSrc}
                    className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
                    preload="metadata" crossOrigin="anonymous"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0 py-1">
                <Link href={`/watch/${videoId}`}>
                  <h3 className="font-medium text-lg line-clamp-2 group-hover:text-blue-600 mb-2">
                    {title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{Number(views).toLocaleString()} views</span>
                  <span>•</span>
                  <span>
                    {publishedAt ? formatDistanceToNow(new Date(publishedAt)) : "Just Now"} ago
                  </span>
                </div>

                <Link
                  href={`/channel/${v.uploader}`}
                  className="flex items-center gap-2 mb-2 hover:text-blue-600"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {channelTitle?.[0] || "Y"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {channelTitle}
                  </span>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {v.description || "Video from standard local databases."}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Load More Results */}
      {hasResults && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Showing {video.length} results for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
