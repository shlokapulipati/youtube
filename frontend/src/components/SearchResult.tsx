import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchVideos } from "@/lib/youtubeApi";

const SearchResult = ({ query }: any) => {
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          Enter a search term to find videos and channels.
        </p>
      </div>
    );
  }
  const [video, setvideos] = useState<any>(null);
  const videos = async () => {
    try {
      const allVideos = await searchVideos(query);
      setvideos(allVideos || []);
    } catch (err) {
      console.error(err);
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
  const hasResults = video ? video.length > 0 : true;
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
          {video.map((video: any) => {
            const isYouTube = !!video?.snippet;
            const videoId = isYouTube ? (typeof video.id === 'string' ? video.id : video.id.videoId) : (video?._id || "");
            const title = isYouTube ? video.snippet?.title : video?.videotitle;
            const channelTitle = isYouTube ? video.snippet?.channelTitle : video?.videochanel;
            const views = isYouTube ? (video.statistics?.viewCount || 0) : (video?.views || 0);
            const publishedAt = isYouTube ? video.snippet?.publishedAt || video.snippet?.publishTime : video?.createdAt;
            const thumbnail = isYouTube 
              ? (video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url) 
              : "";

            return (
            <div key={videoId} className="flex gap-4 group">
              <Link href={`/watch/${videoId}`} className="flex-shrink-0">
                <div className="relative w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {isYouTube ? (
                    <img src={thumbnail} alt={title} className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">No Image</div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                    API Result
                  </div>
                </div>
              </Link>

              <div className="flex-1 min-w-0 py-1">
                <Link href={`/watch/${videoId}`}>
                  <h3 className="font-medium text-lg line-clamp-2 group-hover:text-blue-600 mb-2">
                    {title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>{Number(views).toLocaleString()} views</span>
                  <span>•</span>
                  <span>
                    {publishedAt ? formatDistanceToNow(new Date(publishedAt)) : "Just Now"} ago
                  </span>
                </div>

                <Link
                  href={`/channel/${video.snippet?.channelId || video.uploader}`}
                  className="flex items-center gap-2 mb-2 hover:text-blue-600"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {channelTitle?.[0] || "Y"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    {channelTitle}
                  </span>
                </Link>

                <p className="text-sm text-gray-700 line-clamp-2">
                  Sample video description that would show search-relevant
                  content and help users understand what the video is about
                  before clicking.
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
          <p className="text-gray-600">
            Showing {videos.length} results for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
